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

import {
  Evidence,
  fromSegmentObject,
  Link,
  Segment
} from '@stratumn/js-chainscript';
import axios, { AxiosRequestConfig } from 'axios';
import WebSocket from 'isomorphic-ws';
import { IStoreClient } from './client';
import { StoreEvent } from './events';
import { ILogger } from './logger';
import { Pagination } from './pagination';
import { Segments } from './segments';
import { SegmentsFilter } from './segmentsFilter';

/**
 * StoreHttpClient provides access to the Chainscript Store API via HTTP
 * requests.
 * Your application should use a single instance of this client, because it
 * opens a websocket with the store server to receive notifications.
 */
export class StoreHttpClient implements IStoreClient {
  private storeUrl: string;
  private socket?: WebSocket;

  private reqConfig: AxiosRequestConfig;
  private logger?: ILogger;

  /**
   * Create an http client to interact with a Chainscript Store.
   * If you provide an eventHandler, a websocket connection will be opened
   * with the store and events will be forwarded to your handler.
   * @param url of the store API.
   * @param eventHandler (optional) event handler for store notifications.
   * The store will send notifications when links are created and new evidence
   * is added.
   * @param logger (optional) logger for internal events. If you don't set a
   * logger events will be dropped.
   */
  constructor(
    url: string,
    eventHandler?: (e: StoreEvent) => void,
    logger?: ILogger
  ) {
    if (url.endsWith('/')) {
      this.storeUrl = url.substring(0, url.length - 1);
    } else {
      this.storeUrl = url;
    }

    this.logger = logger;
    this.reqConfig = {
      timeout: 10000,
      // We want to handle http errors ourselves.
      validateStatus: undefined
    };

    if (eventHandler) {
      this.socket = new WebSocket(this.storeUrl + '/websocket');
      this.socket.on('open', () => {
        if (this.logger) {
          this.logger.info({ component: 'storeClient', name: 'socketOpen' });
        }

        (this.socket as WebSocket).on('message', (jsonPayload: string) => {
          if (this.logger) {
            this.logger.info({
              component: 'storeClient',
              message: jsonPayload,
              name: 'socketMessage'
            });
          }

          try {
            const message = JSON.parse(jsonPayload);
            const event = new StoreEvent(message);
            eventHandler(event);
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
    const response = await axios.get(this.storeUrl, this.reqConfig);
    this.handleHttpErr(response);

    return response.data.adapter;
  }

  public async createLink(link: Link): Promise<Segment> {
    const response = await axios.post(
      this.storeUrl + '/links',
      link.toObject({ bytes: String }),
      this.reqConfig
    );
    this.handleHttpErr(response);

    const segment = fromSegmentObject(response.data);
    return segment;
  }

  public async getSegment(linkHash: string): Promise<Segment | null> {
    const response = await axios.get(
      this.storeUrl + '/segments/' + linkHash,
      this.reqConfig
    );
    if (response.status === 404) {
      return null;
    }
    this.handleHttpErr(response);

    const segment = fromSegmentObject(response.data);
    return segment;
  }

  public async findSegments(
    filters?: SegmentsFilter,
    pagination?: Pagination
  ): Promise<Segments> {
    // Add default pagination and filters if not provided.
    if (!pagination) {
      pagination = new Pagination(0, 20);
    }
    if (!filters) {
      filters = new SegmentsFilter();
    }

    const response = await axios.get(this.storeUrl + '/segments', {
      ...this.reqConfig,
      params: {
        ...filters.toObject(),
        ...pagination.toObject()
      }
    });
    if (response.status === 404) {
      return new Segments(0, []);
    }
    this.handleHttpErr(response);

    return new Segments(response.data.totalCount, response.data.segments);
  }

  public async getMapIDs(
    process?: string,
    pagination?: Pagination
  ): Promise<string[]> {
    if (!pagination) {
      pagination = new Pagination(0, 20);
    }

    const params = {
      ...pagination.toObject()
    };

    if (process) {
      params.process = process;
    }

    const response = await axios.get(this.storeUrl + '/maps', {
      ...this.reqConfig,
      params
    });
    if (response.status === 404) {
      return [];
    }
    this.handleHttpErr(response);

    return response.data;
  }

  public async addEvidence(
    linkHash: string,
    evidence: Evidence
  ): Promise<void> {
    const response = await axios.post(
      this.storeUrl + '/evidences/' + linkHash,
      evidence.toObject({ bytes: String }),
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

      if (response.data.error) {
        throw response.data.error;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
