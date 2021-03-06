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

import { Evidence, Link, Segment } from '@stratumn/js-chainscript';
import { Pagination } from './pagination';
import { Segments } from './segments';
import { SegmentsFilter } from './segmentsFilter';

/**
 * IStoreClient provides access to the Stratumn Chainscript Store API.
 * It lets your application store and retrieve Chainscript segments.
 */
export interface IStoreClient {
  /**
   * Returns unstructured information about the store like its name,
   * description, commit hash, etc.
   */
  info(): Promise<any>;

  /**
   * Create a new link in the Chainscript store.
   * @param link new link that should be stored.
   * @returns the segment encapsulating this link.
   */
  createLink(link: Link): Promise<Segment>;

  /**
   * Create a collection of links atomically in the Chainscript store.
   * Will throw an error if any of the links could not be created.
   * @param links links that should be stored.
   * @returns the segments encapsulating the input links.
   */
  createLinkBatch(links: Link[]): Promise<Segment[]>;

  /**
   * Get a segment from its link hash.
   * @param linkHash hex-encoded link hash.
   * @returns the segment with its evidences (if any).
   */
  getSegment(linkHash: string): Promise<Segment | null>;

  /**
   * Find segments that match a set of filters.
   * @param filters (Optional) segments filtering options.
   * @param pagination (Optional) pagination options.
   * @returns a list of segments with pagination details.
   */
  findSegments(
    filters?: SegmentsFilter,
    pagination?: Pagination
  ): Promise<Segments>;

  /**
   * List existing map IDs.
   * @param process (Optional) filter map IDs for this process.
   * @param pagination (Optional) pagination options.
   * @returns a list of map IDs (if any).
   */
  getMapIDs(process?: string, pagination?: Pagination): Promise<string[]>;

  /**
   * Add an evidence to a given link.
   * Evidences are stored inside the segment's meta field.
   * An evidence is an external proof of existence of the link (for example a
   * proof of inclusion on the Bitcoin blockchain via a fossilizer).
   * @param linkHash hex-encoded hash of the link to add evidence to.
   * @param evidence to add to the link's segment.
   */
  addEvidence(linkHash: string, evidence: Evidence): Promise<void>;
}
