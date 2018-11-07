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
  IStoreClient,
  Pagination,
  SegmentsFilter
} from '@stratumn/store-client';
import { Buffer } from 'buffer';
import {
  MapWithoutRefs,
  MapWithRefs,
  Ref,
  TestMapId,
  TestProcess
} from '../test/fixtures/maps';
import { StoreMapLoader } from './mapLoader';

describe('store map loader', () => {
  it('finds segments with the right process and mapId', async () => {
    const mockStore = jest.fn<IStoreClient>(() => ({
      findSegments: jest.fn(() => ({
        segments: MapWithoutRefs,
        totalCount: MapWithoutRefs.length
      }))
    }));

    const mock = new mockStore();
    const loader = new StoreMapLoader(mock);
    const seg = await loader.load(TestProcess, TestMapId);

    expect(mock.findSegments).toHaveBeenCalled();
    expect(mock.findSegments).toHaveBeenCalledWith(
      expect.objectContaining({
        mapIds: [TestMapId],
        process: TestProcess
      }),
      expect.any(Pagination)
    );
    expect(seg).toEqual(MapWithoutRefs);
  });

  it('recursively loads map without references', async () => {
    const mockStore = jest.fn<IStoreClient>(() => ({
      findSegments: jest.fn(() => ({
        segments: MapWithoutRefs,
        // Since totalCount is twice the number of returned segments, we should
        // call findSegments twice.
        totalCount: 2 * MapWithoutRefs.length
      }))
    }));

    const mock = new mockStore();
    const loader = new StoreMapLoader(mock);
    const seg = await loader.load(TestProcess, TestMapId);

    expect(mock.findSegments).toHaveBeenCalledTimes(2);
    expect(mock.findSegments).toHaveBeenNthCalledWith(
      1,
      expect.any(SegmentsFilter),
      new Pagination(0, 25)
    );
    expect(mock.findSegments).toHaveBeenNthCalledWith(
      2,
      expect.any(SegmentsFilter),
      new Pagination(2, 25)
    );

    expect(seg).toHaveLength(2 * MapWithoutRefs.length);
    expect(seg).toEqual([...MapWithoutRefs, ...MapWithoutRefs]);
  });

  it('fetches references', async () => {
    const mockStore = jest.fn<IStoreClient>(() => ({
      findSegments: jest.fn(() => ({
        segments: MapWithRefs,
        totalCount: MapWithRefs.length
      })),
      getSegment: jest.fn(() => Ref)
    }));

    const mock = new mockStore();
    const loader = new StoreMapLoader(mock);
    const seg = await loader.load(TestProcess, TestMapId);

    expect(mock.getSegment).toHaveBeenCalled();
    expect(mock.getSegment).toHaveBeenCalledWith(
      Buffer.from(Ref.linkHash()).toString('hex')
    );
    expect(seg).toEqual([...MapWithRefs, Ref]);
  });
});
