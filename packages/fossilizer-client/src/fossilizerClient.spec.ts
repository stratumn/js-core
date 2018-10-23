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
import { FossilizerHttpClient } from './fossilizerClient';

jest.mock('axios');

describe('fossilizer http client', () => {
  let axiosMock: jest.SpyInstance;

  afterEach(() => {
    axiosMock.mockRestore();
  });

  describe('info', () => {
    it('throws in case of network error', async () => {
      const client = new FossilizerHttpClient('http://127.0.0.1:6001');

      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockRejectedValue('network failure');

      try {
        await client.info();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(axiosMock).toHaveBeenCalled();
        expect(err).toBe('network failure');
      }
    });

    it('throws if status code is not ok', async () => {
      const client = new FossilizerHttpClient('http://localhost:6000');

      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 404, statusText: 'Not Found' });

      try {
        await client.info();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(axiosMock).toHaveBeenCalled();
        expect(err).toEqual(new Error('HTTP 404: Not Found'));
      }
    });

    it('returns fossilizer info', async () => {
      const client = new FossilizerHttpClient('https://fossilize.stratumn.com');
      const fossInfo = {
        description: 'Fossilizes data on the Bitcoin blockchain',
        name: 'BtcFossilizer'
      };

      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: {
          adapter: fossInfo
        },
        status: 200
      });

      const res = await client.info();
      expect(res).toBe(fossInfo);
    });
  });
});
