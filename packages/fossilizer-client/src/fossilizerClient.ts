/*
  Copyright 2018 Stratumn SAS. All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import axios from 'axios';
import WebSocket from 'isomorphic-ws';
import { DID_FOSSILIZE_LINK_EVENT, FossilizedEvent } from './events';

/**
 * IFossilizerClient provides access to the Stratumn fossilizer API.
 *
 * A fossilizer will take your data and provide an externally-verifiable proof
 * of existence for that data.
 * It will also provide a relative ordering of the events that produced that
 * data.
 *
 * Stratumn provides multiple fossilizer implementations and anyone can build a
 * new fossilizer that meets their trust/scalability requirements.
 *
 * For example, if you use a Bitcoin fossilizer, a merkle tree will be built
 * from a batch of data and will be included in a Bitcoin transaction.
 * Since the Bitcoin blockchain is immutable, you'll have a record that your
 * data existed at block N.
 * Since Bitcoin provides ordering, you will also be able to prove that some
 * data was produced before some other data.
 *
 * Another example is to use a trusted authority to act as a fossilizer.
 * It could be a bank, a government or a regulatory body.
 * It would sign your data with the timestamp at which it received it and send
 * back that signature.
 * If you trust that entity, you can trust its timestamp so it provides a
 * relative ordering for your events.
 */
export interface IFossilizerClient {
  /**
   * Returns unstructured information about the fossilizer like its name,
   * description, commit hash, etc.
   */
  info(): Promise<any>;

  /**
   * Send some data to fossilize.
   *
   * The fossilizer shouldn't know anything about your data, so you should
   * never send the raw data but rather a hash of it or a commitment.
   * It also makes it cheaper to store on a public blockchain.
   *
   * Fossilization is done asynchronously. You will receive a notification
   * once your data has been successfully fossilized. The mechanism used for
   * this notification depends on the actual client implementation.
   *
   * @param data hex-encoded bytes (hash/commitment of your data).
   * @param meta human-readable metadata.
   * Since a hash doesn't link back to the data it represents, adding a meta
   * field lets you link back to the actual data.
   * Depending on your needs, you can put a description of the hashed data,
   * an opaque ID that links back to the data in your systems, or anything
   * you feel would be useful.
   */
  fossilize(data: string, meta: string): Promise<void>;
}

/**
 * FossilizerHttpClient provides access to the Chainscript fossilizer API
 * via HTTP requests.
 * Your application should use a single instance of this client, because it
 * opens a websocket with the fossilizer server to receive notifications.
 */
export class FossilizerHttpClient implements IFossilizerClient {
  private fossilizerUrl: string;
  private socket: WebSocket | null;

  /**
   * Create an http client to interact with a fossilizer.
   * If you provide an eventHandler, a websocket connection will be opened
   * with the fossilizer and events will be forwarded to your handler.
   * Since fossilization is done asynchronously, this is useful when you want
   * to be notified when your data has been successfully fossilized.
   * @param url of the fossilizer API.
   * @param eventHandler (optional) event handler for fossilizer notifications.
   */
  constructor(url: string, eventHandler?: (e: FossilizedEvent) => void) {
    this.fossilizerUrl = url;
    this.socket = null;

    if (eventHandler) {
      const wsUrl = url.endsWith('/') ? url + 'websocket' : url + '/websocket';
      this.socket = new WebSocket(wsUrl);
      this.socket.on('open', () => {
        (this.socket as WebSocket).on('message', (jsonPayload: string) => {
          const message = JSON.parse(jsonPayload);
          if (message.type === DID_FOSSILIZE_LINK_EVENT) {
            try {
              const event = new FossilizedEvent(message.data);
              eventHandler(event);
            } catch {
              // We currently ignore event errors.
              // We will log them once we have a logging infrastructure.
            }
          }
        });
      });
    }
  }

  public async info(): Promise<any> {
    const response = await axios.get(this.fossilizerUrl);
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.data.adapter;
  }

  public async fossilize(data: string, meta: string): Promise<void> {
    const response = await axios.post(this.fossilizerUrl + '/fossils', {
      data,
      meta
    });
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
