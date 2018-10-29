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
 * A set of filtering options for segments.
 */
export class SegmentsFilter {
  // Process of the target segments.
  public process: string;
  // Process step of the target segments.
  public step: string;
  // MapIDs that should contain the target segments.
  public mapIds: string[];
  // Tags that the target segments should have.
  public tags: string[];
  // Filter out segments that have a parent.
  public withoutParentArg: boolean;
  // Hex-encoded hash of the parent segment.
  public prevLinkHash: string;
  // Hex-encoded hashes of the target segments.
  public linkHashes: string[];

  constructor(process?: string) {
    if (!process) {
      this.process = '';
    } else {
      this.process = process;
    }

    this.step = '';
    this.mapIds = [];
    this.tags = [];
    this.withoutParentArg = false;
    this.prevLinkHash = '';
    this.linkHashes = [];
  }

  /**
   * Filter out segments that aren't in the given process step.
   * @param step of the target segments.
   */
  public withStep(step: string): SegmentsFilter {
    this.step = step;
    return this;
  }

  /**
   * Filter out segments that aren't in one of the given maps.
   * @param mapIDs of the target segments.
   */
  public withMapIDs(...mapIDs: string[]): SegmentsFilter {
    this.mapIds.push(...mapIDs);
    return this;
  }

  /**
   * Filter out segments that don't have the given tags.
   * @param tags of the target segments.
   */
  public withTags(...tags: string[]): SegmentsFilter {
    this.tags.push(...tags);
    return this;
  }

  /**
   * Filter out segments that have a parent.
   */
  public withoutParent(): SegmentsFilter {
    this.withoutParentArg = true;
    return this;
  }

  /**
   * Filter out segments that aren't children of the given segment.
   * @param parentHash hex-encoded hash of the parent.
   */
  public withParent(parentHash: string): SegmentsFilter {
    this.withoutParentArg = false;
    this.prevLinkHash = parentHash;
    return this;
  }

  /**
   * Filter out segments that don't have the given link hashes.
   * @param linkHashes hex-encoded link hashes of the target segments.
   */
  public withLinkHashes(...linkHashes: string[]): SegmentsFilter {
    this.linkHashes.push(...linkHashes);
    return this;
  }

  /**
   * Converts to a plain Javascript object with default values removed.
   * This is useful to avoid bloat when converting to url query parameters.
   */
  public toObject(): any {
    const plainObj = {
      linkHashes: this.linkHashes,
      mapIds: this.mapIds,
      prevLinkHash: this.prevLinkHash,
      process: this.process,
      step: this.step,
      tags: this.tags,
      withoutParent: this.withoutParentArg
    };

    if (!this.process) {
      delete plainObj.process;
    }
    if (!this.step) {
      delete plainObj.step;
    }
    if (!this.prevLinkHash) {
      delete plainObj.prevLinkHash;
    }
    if (!this.withoutParentArg) {
      delete plainObj.withoutParent;
    }
    if (this.mapIds.length === 0) {
      delete plainObj.mapIds;
    }
    if (this.tags.length === 0) {
      delete plainObj.tags;
    }
    if (this.linkHashes.length === 0) {
      delete plainObj.linkHashes;
    }

    return plainObj;
  }
}
