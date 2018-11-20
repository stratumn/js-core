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
import { mocked } from 'ts-jest/utils';
import { FossilizedEvent } from './events';
import { FossilizerHttpClient } from './httpClient';

jest.mock('axios');
jest.mock('isomorphic-ws');

describe('fossilizer http client', () => {
  const client = new FossilizerHttpClient('https://fossilize.stratumn.com');
  const mockSocket = mocked(WebSocket);
  let axiosMock: jest.SpyInstance;

  afterEach(() => {
    if (axiosMock) {
      axiosMock.mockRestore();
    }

    mockSocket.mockReset();
  });

  describe('ctor', () => {
    it('rejects invalid url', () => {
      expect(() => new FossilizerHttpClient('localhost:1234')).toThrowError();
    });

    it('appends websocket path', () => {
      mockSocket.mockImplementationOnce((url: string) => {
        expect(url).toBe('ws://localhost:6000/websocket');
      });

      const wsClient = new FossilizerHttpClient(
        'http://localhost:6000/',
        () => {
          // This handler shouldn't be invoked in this test.
          expect(true).toBeFalsy();
        }
      );

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalled();
    });

    it('receives fossilizer events', done => {
      const socketInstance = new WebSocket('');
      mockSocket.mockImplementationOnce(() => {
        return socketInstance;
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
      expect(WebSocket).toHaveBeenCalledTimes(2);

      socketInstance.onopen({ target: socketInstance });
      socketInstance.onmessage({
        data: JSON.stringify({
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
        }),
        target: socketInstance,
        type: 'message'
      });
    });

    it('ignores unknown event type', () => {
      const socketInstance = new WebSocket('');
      mockSocket.mockImplementationOnce(() => {
        return socketInstance;
      });

      const wsClient = new FossilizerHttpClient('http://localhost:6000', () => {
        // This handler shouldn't be invoked in this test.
        expect(true).toBeFalsy();
      });

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalledTimes(2);

      socketInstance.onopen({ target: socketInstance });
      socketInstance.onmessage({
        data: `{ type: 'UNKNOWN_EVENT' }`,
        target: socketInstance,
        type: 'UNKNOWN_EVENT'
      });
    });

    it('ignores invalid events', () => {
      const socketInstance = new WebSocket('');
      mockSocket.mockImplementationOnce(() => {
        return socketInstance;
      });

      const wsClient = new FossilizerHttpClient('http://localhost:6000', () => {
        // This handler shouldn't be invoked in this test.
        expect(true).toBeFalsy();
      });

      expect(wsClient).not.toBeNull();
      expect(WebSocket).toHaveBeenCalledTimes(2);

      socketInstance.onopen({ target: socketInstance });
      socketInstance.onmessage({
        data: `{ type: '{ this is not: { json: content}' }`,
        target: socketInstance,
        type: 'UNKNOWN_EVENT'
      });
    });
  });

  describe('timeout', () => {
    it('rejects negative values', () => {
      const c = new FossilizerHttpClient('http://localhost');
      expect(() => c.setRequestTimeout(-1)).toThrow();
    });

    it('sets request timeout', () => {
      const c = new FossilizerHttpClient('http://localhost');
      c.setRequestTimeout(42);
      expect((c as any).reqConfig.timeout).toEqual(42);
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
      expect(axiosMock).toHaveBeenCalledWith('https://fossilize.stratumn.com', {
        timeout: 10000,
        validateStatus: undefined
      });
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

    it('throws server error if provided', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        data: { error: { message: 'Missing data' } },
        status: 400,
        statusText: 'Bad Request'
      });

      const [err] = await to(client.fossilize('', 'missing data'));
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual({ message: 'Missing data' });
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
        { data: '4242', meta: 'batman' },
        {
          timeout: 10000,
          validateStatus: undefined
        }
      );
    });

    it('accepts meta object', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        data: 'ok',
        status: 200
      });

      await client.fossilize('4242', { user: 'batman', age: 42 });

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://fossilize.stratumn.com/fossils',
        { data: '4242', meta: JSON.stringify({ user: 'batman', age: 42 }) },
        {
          timeout: 10000,
          validateStatus: undefined
        }
      );
    });
  });
});
