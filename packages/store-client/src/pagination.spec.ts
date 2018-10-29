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

import { Pagination } from './pagination';

describe('pagination', () => {
  it('creates pagination options', () => {
    const p = new Pagination(10, 25);
    expect(p.offset).toBe(10);
    expect(p.limit).toBe(25);
    expect(p.reverse).toBeFalsy();
  });

  it('sets reverse order', () => {
    const p = new Pagination(10, 10, true);
    expect(p.reverse).toBeTruthy();
  });

  it('rejects invalid offset', () => {
    expect(() => new Pagination(-1, 25)).toThrow();
  });

  it('rejects invalid limit', () => {
    expect(() => new Pagination(10, 0)).toThrow();
  });

  it('hides default reverse', () => {
    const o = new Pagination(0, 10).toObject();
    expect(o).toEqual({
      limit: 10,
      offset: 0
    });
  });
});
