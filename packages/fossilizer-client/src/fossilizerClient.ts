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

/**
 * IFossilizerClient provides access to the Chainscript fossilizer API.
 */
export interface IFossilizerClient {
  /**
   * Returns unstructured information about the fossilizer.
   */
  info(): Promise<any>;

  /**
   * Send data to fossilize.
   * @param data hex-encoded bytes to fossilize.
   * @param meta human-readable metadata.
   */
  fossilize(data: string, meta: string): Promise<void>;
}

/**
 * FossilizerHttpClient provides access to the Chainscript fossilizer API
 * via HTTP requests.
 */
export class FossilizerHttpClient implements IFossilizerClient {
  private fossilizerUrl: string;

  constructor(url: string) {
    this.fossilizerUrl = url;
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
