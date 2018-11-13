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
import { ILogger } from './logger';

/**
 * FossilizerHttpClient provides access to the Chainscript fossilizer API
 * via HTTP requests.
 * Your application should use a single instance of this client, because it
 * opens a websocket with the fossilizer server to receive notifications.
 */
export class FossilizerHttpClient implements IFossilizerClient {
  private fossilizerUrl: string;
  private socket?: WebSocket;

  private reqConfig: AxiosRequestConfig;
  private logger?: ILogger;

  /**
   * Create an http client to interact with a fossilizer.
   * If you provide an eventHandler, a websocket connection will be opened
   * with the fossilizer and events will be forwarded to your handler.
   * Since fossilization is done asynchronously, this is useful when you want
   * to be notified when your data has been successfully fossilized.
   * @param url of the fossilizer API.
   * @param eventHandler (optional) event handler for fossilizer notifications.
   * @param logger (optional) logger for internal events. If you don't set a
   * logger events will be dropped.
   */
  constructor(
    url: string,
    eventHandler?: (e: FossilizedEvent) => void,
    logger?: ILogger
  ) {
    if (url.endsWith('/')) {
      this.fossilizerUrl = url.substring(0, url.length - 1);
    } else {
      this.fossilizerUrl = url;
    }

    this.logger = logger;
    this.reqConfig = {
      timeout: 10000,
      // We want to handle http errors ourselves.
      validateStatus: undefined
    };

    if (eventHandler) {
      this.socket = new WebSocket(this.fossilizerUrl + '/websocket');
      this.socket.on('open', () => {
        if (this.logger) {
          this.logger.info({
            component: 'fossilizerClient',
            name: 'socketOpen'
          });
        }

        (this.socket as WebSocket).on('message', (jsonPayload: string) => {
          if (this.logger) {
            this.logger.info({
              component: 'fossilizerClient',
              message: jsonPayload,
              name: 'socketMessage'
            });
          }

          try {
            const message = JSON.parse(jsonPayload);
            if (message.type === DID_FOSSILIZE_LINK_EVENT) {
              const event = new FossilizedEvent(message.data);
              eventHandler(event);
            }
          } catch (err) {
            if (this.logger) {
              this.logger.error(err);
            }
          }
        });
      });
    }
  }

  /**
   * Set the request timeout value.
   * @param timeoutMS timeout in milliseconds.
   */
  public setRequestTimeout(timeoutMS: number) {
    if (timeoutMS <= 0) {
      throw new Error('Timeout should be a strictly positive value');
    }

    this.reqConfig.timeout = timeoutMS;
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
      if (this.logger) {
        this.logger.error(response);
      }

      if (response.data && response.data.error) {
        throw response.data.error;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
