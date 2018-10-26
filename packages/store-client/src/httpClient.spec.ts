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

import to from 'await-to-js';
import axios from 'axios';
import { StoreHttpClient } from './httpClient';

jest.mock('axios');

describe('store http client', () => {
  const client = new StoreHttpClient('https://store.stratumn.com');
  let axiosMock: jest.SpyInstance;

  afterEach(() => {
    if (axiosMock) {
      axiosMock.mockRestore();
    }
  });

  describe('info', () => {
    it('throws in case of network error', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockRejectedValue('network failure');

      const [err] = await to(client.info());
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toBe('network failure');
    });

    it('throws if status code is not ok', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 404, statusText: 'Not Found' });

      const [err] = await to(client.info());
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 404: Not Found'));
    });

    it('returns store info', async () => {
      const info = {
        description: 'PostgreSQL Chainscript Storage',
        name: 'postgresstore'
      };

      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: {
          adapter: info
        },
        status: 200
      });

      const res = await client.info();

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith('https://store.stratumn.com');
      expect(res).toBe(info);
    });
  });
});
