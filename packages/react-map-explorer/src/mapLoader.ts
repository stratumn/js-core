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

import { Segment } from '@stratumn/js-chainscript';
import { IStoreClient, SegmentsFilter } from '@stratumn/store-client';

/**
 * Map loader loads all segments from a given map in a format suitable for
 * MapExplorer's display.
 */
export interface IMapLoader {
  /**
   * Load a map's segments and references.
   * @param mapId
   */
  load(process: string, mapId: string): Promise<Segment[]>;
}

/**
 * An implementation of IMapLoader from a store client.
 */
export class StoreMapLoader implements IMapLoader {
  private store: IStoreClient;

  constructor(store: IStoreClient) {
    this.store = store;
  }

  public async load(process: string, mapId: string): Promise<Segment[]> {
    // TODO: recursively load the whole map (pagination)
    // TODO: load references
    const filters = new SegmentsFilter(process).withMapIDs(mapId);
    const s = await this.store.findSegments(filters);
    return s.segments;
  }
}
