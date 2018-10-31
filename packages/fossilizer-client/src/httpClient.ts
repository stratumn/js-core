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

import axios, { AxiosRequestConfig } from 'axios';
import WebSocket from 'isomorphic-ws';
import { IFossilizerClient } from './client';
import { DID_FOSSILIZE_LINK_EVENT, FossilizedEvent } from './events';

/**
 * FossilizerHttpClient provides access to the Chainscript fossilizer API
 * via HTTP requests.
 * Your application should use a single instance of this client, because it
 * opens a websocket with the fossilizer server to receive notifications.
 */
export class FossilizerHttpClient implements IFossilizerClient {
  private fossilizerUrl: string;
  private reqConfig: AxiosRequestConfig;
  private socket?: WebSocket;

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
    if (url.endsWith('/')) {
      this.fossilizerUrl = url.substring(0, url.length - 1);
    } else {
      this.fossilizerUrl = url;
    }

    this.reqConfig = {
      timeout: 10000,
      // We want to handle http errors ourselves.
      validateStatus: undefined
    };

    if (eventHandler) {
      this.socket = new WebSocket(this.fossilizerUrl + '/websocket');
      this.socket.on('open', () => {
        (this.socket as WebSocket).on('message', (jsonPayload: string) => {
          try {
            const message = JSON.parse(jsonPayload);
            if (message.type === DID_FOSSILIZE_LINK_EVENT) {
              const event = new FossilizedEvent(message.data);
              eventHandler(event);
            }
          } catch {
            // We currently ignore event errors.
            // We will log them once we have a logging infrastructure.
          }
        });
      });
    }
  }

  public async info(): Promise<any> {
    const response = await axios.get(this.fossilizerUrl, this.reqConfig);
    this.handleHttpErr(response);

    return response.data.adapter;
  }

  public async fossilize(data: string, meta: string | object): Promise<void> {
    const fossil =
      typeof meta === 'string'
        ? { data, meta }
        : { data, meta: JSON.stringify(meta) };

    const response = await axios.post(
      this.fossilizerUrl + '/fossils',
      fossil,
      this.reqConfig
    );
    this.handleHttpErr(response);
  }

  /**
   * Handle potential http errors and throw accordingly.
   * @param response http response.
   */
  private handleHttpErr(response: any) {
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
