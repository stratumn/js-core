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

import { IStoreClient } from '@stratumn/store-client';
import { MapWithoutRefs } from '../test/fixtures/maps';
import { StoreMapLoader } from './mapLoader';

describe('store map loader', () => {
  it('finds segments with the right process and mapId', async () => {
    const mockStore = jest.fn<IStoreClient>(() => ({
      findSegments: jest.fn(() => ({
        segments: MapWithoutRefs,
        totalCount: 5
      }))
    }));

    const mock = new mockStore();
    const loader = new StoreMapLoader(mock);
    await loader.load('process1', 'map1');

    expect(mock.findSegments).toHaveBeenCalled();
    expect(mock.findSegments).toHaveBeenCalledWith(
      expect.objectContaining({
        mapIds: ['map1'],
        process: 'process1'
      })
    );
  });
});
