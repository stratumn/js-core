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

import { Link, Segment } from '@stratumn/js-chainscript';
import axios from 'axios';
import { IStoreClient } from './client';

/**
 * StoreHttpClient provides access to the Chainscript Store API via HTTP
 * requests.
 * Your application should use a single instance of this client, because it
 * opens a websocket with the store server to receive notifications.
 */
export class StoreHttpClient implements IStoreClient {
  private storeUrl: string;

  /**
   * Create an http client to interact with a Chainscript Store.
   * @param url of the store API.
   */
  constructor(url: string) {
    if (url.endsWith('/')) {
      this.storeUrl = url.substring(0, url.length - 1);
    } else {
      this.storeUrl = url;
    }
  }

  public async info(): Promise<void> {
    const response = await axios.get(this.storeUrl);
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.data.adapter;
  }

  public async createLink(link: Link): Promise<Segment> {
    return link.segmentify();
  }

  public getSegment(linkHash: string): Promise<Segment> {
    throw new Error('not implemented: ' + linkHash);
  }
}
