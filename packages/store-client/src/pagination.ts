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

/**
 * Pagination options for most APIs.
 */
export class Pagination {
  public offset: number;
  public limit: number;
  public reverse: boolean;

  constructor(offset: number, limit: number, reverse?: boolean) {
    if (offset < 0) {
      throw new Error('Invalid offset: should be a positive integer.');
    }
    if (limit <= 0) {
      throw new Error('Invalid limit: should be a strictly-positive integer.');
    }

    this.offset = offset;
    this.limit = limit;
    this.reverse = !!reverse;
  }

  /**
   * Converts to a plain Javascript object with default values removed.
   * This is useful to avoid bloat when converting to url query parameters.
   */
  public toObject(): any {
    const plainObj = {
      limit: this.limit,
      offset: this.offset,
      reverse: this.reverse
    };

    if (!this.reverse) {
      delete plainObj.reverse;
    }

    return plainObj;
  }
}
