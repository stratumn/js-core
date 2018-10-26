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
import WebSocket from 'isomorphic-ws';
import { FossilizedEvent } from './events';
import { FossilizerHttpClient } from './fossilizerClient';

jest.mock('axios');
jest.mock('isomorphic-ws');

describe('fossilizer http client', () => {
  const client = new FossilizerHttpClient('https://fossilize.stratumn.com');
  let axiosMock: jest.SpyInstance;

  afterEach(() => {
    if (axiosMock) {
      axiosMock.mockRestore();
    }
  });

  describe('ctor', () => {
    // Mock the WebSocket.on() method to accept an 'open' call and return a
    // custom websocket message once.
    const mockSocketOn = (message: string) => {
      return (event: string, callback: any) => {
        if (event === 'open') {
          callback();
        } else if (event === 'message') {
          callback(message);
        }
      };
    };

    it('opens a websocket with the fossilizer', done => {
      (WebSocket as any).mockImplementationOnce(() => {
        return {
          on: (event: string) => {
            expect(event).toBe('open');
            done();
          }
        };
      });

      const wsClient = new FossilizerHttpClient('http://localhost:6000', () => {
        // This handler shouldn't be invoked in this test.
        expect(true).toBeFalsy();
      });

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalled();
    });

    it('receives fossilizer events', done => {
      (WebSocket as any).mockImplementationOnce(() => {
        return {
          on: mockSocketOn(
            JSON.stringify({
              data: {
                Data: 'YmF0bWFu',
                Evidence: {
                  backend: 'dummyfossilizer',
                  proof: 'eyJ0aW1lc3RhbXAiOjE1NDAzOTM3MzV9',
                  provider: 'dummyfossilizer',
                  version: '1.0.0'
                },
                Meta: 'YmF0bWFu'
              },
              type: 'DidFossilizeLink'
            })
          )
        };
      });

      const wsClient = new FossilizerHttpClient(
        'http://localhost:6000',
        (e: FossilizedEvent) => {
          expect(e.data).toBe('6261746d616e');
          expect(e.meta).toBe('batman');
          expect(e.evidence.proof).toBe('eyJ0aW1lc3RhbXAiOjE1NDAzOTM3MzV9');
          done();
        }
      );

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalled();
    });

    it('ignores unknown event type', () => {
      (WebSocket as any).mockImplementationOnce(() => {
        return {
          on: mockSocketOn(JSON.stringify({ type: 'DidSaveLink' }))
        };
      });

      const wsClient = new FossilizerHttpClient('http://localhost:6000', () => {
        // This handler shouldn't be invoked in this test.
        expect(true).toBeFalsy();
      });

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalled();
    });

    it('ignores invalid events', () => {
      (WebSocket as any).mockImplementationOnce(() => {
        return {
          on: mockSocketOn(
            JSON.stringify({
              data: { Meta: 'some stuff is missing...' },
              type: 'DidFossilizeLink'
            })
          )
        };
      });

      const wsClient = new FossilizerHttpClient('http://localhost:6000', () => {
        // This handler shouldn't be invoked in this test.
        expect(true).toBeFalsy();
      });

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalled();
    });
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
