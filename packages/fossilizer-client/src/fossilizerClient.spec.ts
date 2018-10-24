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

import { to } from 'await-to-js';
import axios from 'axios';
import { FossilizerHttpClient } from './fossilizerClient';

jest.mock('axios');

describe('fossilizer http client', () => {
  const client = new FossilizerHttpClient('https://fossilize.stratumn.com');
  let axiosMock: jest.SpyInstance;

  afterEach(() => {
    axiosMock.mockRestore();
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

    it('returns fossilizer info', async () => {
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

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith('https://fossilize.stratumn.com');
      expect(res).toBe(fossInfo);
    });
  });

  describe('fossilize', () => {
    it('throws in case of network error', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockRejectedValue('network failure');

      const [err] = await to(client.fossilize('42', 'batman'));
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toBe('network failure');
    });

    it('throws if status code is not ok', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({ status: 400, statusText: 'Bad Request' });

      const [err] = await to(client.fossilize('not hex data', ''));
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 400: Bad Request'));
    });

    it('fossilizes data', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        data: 'ok',
        status: 200
      });

      await client.fossilize('4242', 'batman');

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://fossilize.stratumn.com/fossils',
        { data: '4242', meta: 'batman' }
      );
    });
  });
});
