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
import { BTCEvidence, BTCEvidenceObject } from '../test/fixtures/evidences';
import {
  SimpleLink,
  SimpleLinkObject,
  SimpleSegmentObject
} from '../test/fixtures/simpleSegment';
import { StoreHttpClient } from './httpClient';
import { Pagination } from './pagination';
import { SegmentsFilter } from './segmentsFilter';

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
      expect(axiosMock).toHaveBeenCalledWith('https://store.stratumn.com', {
        timeout: 10000,
        validateStatus: undefined
      });
      expect(res).toBe(info);
    });
  });

  describe('create link', () => {
    it('throws if status code is not ok', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({ status: 400, statusText: 'Bad Request' });

      const [err] = await to(client.createLink(SimpleLink));
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 400: Bad Request'));
    });

    it('serializes the link', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        data: SimpleSegmentObject,
        status: 200
      });

      const segment = await client.createLink(SimpleLink);

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/links',
        SimpleLinkObject,
        { timeout: 10000, validateStatus: undefined }
      );
      expect(segment.linkHash()).toEqual(SimpleLink.hash());
    });
  });

  describe('get segment', () => {
    it('throws in case of error', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 502, statusText: 'Bad Gateway' });

      const [err] = await to(
        client.getSegment(
          'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
        )
      );
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 502: Bad Gateway'));
    });

    it('returns null if not found', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 404, statusText: 'Not Found' });

      const segment = await client.getSegment(
        'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
      );
      expect(axiosMock).toHaveBeenCalled();
      expect(segment).toBeNull();
    });

    it('returns the segment', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: SimpleSegmentObject,
        status: 200
      });

      const segment = await client.getSegment(
        'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
      );

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/segments/d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
        { timeout: 10000, validateStatus: undefined }
      );
      expect(segment).toEqual(SimpleLink.segmentify());
    });
  });

  describe('find segments', () => {
    it('sets default pagination', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: {
          segments: [SimpleSegmentObject],
          totalCount: 15
        },
        status: 200
      });

      const s = await client.findSegments();

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/segments',
        {
          params: {
            limit: 20,
            offset: 0
          },
          timeout: 10000,
          validateStatus: undefined
        }
      );
      expect(s.totalCount).toEqual(15);
      expect(s.segments).toEqual([SimpleLink.segmentify()]);
    });

    it('encodes complex filters', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: {
          segments: [SimpleSegmentObject],
          totalCount: 5
        },
        status: 200
      });

      const s = await client.findSegments(
        new SegmentsFilter('p')
          .withStep('s')
          .withoutParent()
          .withLinkHashes('l1', 'l2')
          .withMapIDs('m1')
          .withTags('t1', 't2'),
        new Pagination(6, 3)
      );

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/segments',
        {
          params: {
            limit: 3,
            linkHashes: ['l1', 'l2'],
            mapIds: ['m1'],
            offset: 6,
            process: 'p',
            step: 's',
            tags: ['t1', 't2'],
            withoutParent: true
          },
          timeout: 10000,
          validateStatus: undefined
        }
      );
      expect(s.totalCount).toEqual(5);
      expect(s.segments).toEqual([SimpleLink.segmentify()]);
    });

    it('throws in case of error', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 503, statusText: 'Unavailable' });

      const [err] = await to(client.findSegments());
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 503: Unavailable'));
    });

    it('returns empty list if not found', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({ status: 404, statusText: 'Not Found' });

      const segments = await client.findSegments();

      expect(axiosMock).toHaveBeenCalled();
      expect(segments.totalCount).toEqual(0);
      expect(segments.segments).toEqual([]);
    });
  });

  describe('get map IDs', () => {
    it('accepts empty process', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: ['map1', 'map2'],
        status: 200
      });

      const mapIDs = await client.getMapIDs('', new Pagination(10, 10));
      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/maps',
        {
          params: { offset: 10, limit: 10 },
          timeout: 10000,
          validateStatus: undefined
        }
      );
      expect(mapIDs).toEqual(['map1', 'map2']);
    });

    it('uses default pagination', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: ['map1'],
        status: 200
      });

      const mapIDs = await client.getMapIDs();
      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/maps',
        {
          params: { offset: 0, limit: 20 },
          timeout: 10000,
          validateStatus: undefined
        }
      );
      expect(mapIDs).toEqual(['map1']);
    });

    it('accepts process and pagination', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        data: ['awesome_map'],
        status: 200
      });

      const mapIDs = await client.getMapIDs(
        'test_process',
        new Pagination(5, 10)
      );
      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/maps',
        {
          params: {
            limit: 10,
            offset: 5,
            process: 'test_process'
          },
          timeout: 10000,
          validateStatus: undefined
        }
      );
      expect(mapIDs).toEqual(['awesome_map']);
    });

    it('returns empty array if not found', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        status: 404
      });

      const mapIDs = await client.getMapIDs();
      expect(axiosMock).toHaveBeenCalled();
      expect(mapIDs).toEqual([]);
    });

    it('throws in case of error', async () => {
      axiosMock = jest.spyOn(axios, 'get');
      axiosMock.mockResolvedValue({
        status: 500,
        statusText: 'BSOD'
      });

      const [err] = await to(client.getMapIDs());
      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 500: BSOD'));
    });
  });

  describe('add evidence', () => {
    it('adds valid evidence', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({ status: 200 });

      await client.addEvidence('l1', BTCEvidence);

      expect(axiosMock).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledWith(
        'https://store.stratumn.com/evidences/l1',
        BTCEvidenceObject,
        { timeout: 10000, validateStatus: undefined }
      );
    });

    it('throws in case of error', async () => {
      axiosMock = jest.spyOn(axios, 'post');
      axiosMock.mockResolvedValue({
        status: 500,
        statusText: 'Server is on fire'
      });

      const [err] = await to(client.addEvidence('42', BTCEvidence));

      expect(axiosMock).toHaveBeenCalled();
      expect(err).toEqual(new Error('HTTP 500: Server is on fire'));
    });
  });
});
