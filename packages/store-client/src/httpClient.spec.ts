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

import { LinkBuilder } from '@stratumn/js-chainscript';
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

  describe('create link', () => {
    const testLink = new LinkBuilder('test_process', 'test_map').build();
    // This is what the testLink should look like after a link.toObject() call.
    const testLinkObject = {
      meta: {
        clientId: 'github.com/stratumn/js-chainscript',
        mapId: 'test_map',
        outDegree: -1,
        process: {
          name: 'test_process'
        }
      },
      version: '1.0.0'
    };

    it('throws if status code is not ok', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({ status: 400, statusText: 'Bad Request' });

      const [err] = await to(client.createLink(testLink));
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 400: Bad Request'));
    });

    it('serializes the link', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        data: {
          link: testLinkObject,
          meta: {
            linkHash: '9uqBhUfUEBi5KD28dBcPl2QoTrTbprf1wAUFxLk6Z6U='
          }
        },
        status: 200
      });

      const segment = await client.createLink(testLink);

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/links',
        testLinkObject
      );
      expect(segment.linkHash()).toEqual(testLink.hash());
    });
  });
});
