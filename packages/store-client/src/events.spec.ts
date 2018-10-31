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

import { BTCEvidence, BTCEvidenceObject } from '../test/fixtures/evidences';
import { SimpleLink, SimpleLinkObject } from '../test/fixtures/simpleSegment';
import { SAVED_EVIDENCES_EVENT, SAVED_LINKS_EVENT, StoreEvent } from './events';
import { LinkEvidence } from './evidence';

describe('store event', () => {
  it('rejects unknown event type', () => {
    expect(() => new StoreEvent({ type: 'unknown' })).toThrow();
  });

  it('rejects missing data', () => {
    expect(() => new StoreEvent({ type: SAVED_LINKS_EVENT })).toThrow();
  });

  it('parses links', () => {
    const e = new StoreEvent({
      data: [SimpleLinkObject],
      type: SAVED_LINKS_EVENT
    });

    expect(e.type).toEqual(SAVED_LINKS_EVENT);
    expect(e.evidences).toEqual([]);
    expect(e.links).toEqual([SimpleLink]);
  });

  it('parses evidences', () => {
    const e = new StoreEvent({
      data: {
        linkHash1: BTCEvidenceObject,
        linkHash2: BTCEvidenceObject
      },
      type: SAVED_EVIDENCES_EVENT
    });

    expect(e.type).toEqual(SAVED_EVIDENCES_EVENT);
    expect(e.links).toEqual([]);
    expect(e.evidences).toEqual([
      new LinkEvidence('linkHash1', BTCEvidence),
      new LinkEvidence('linkHash2', BTCEvidence)
    ]);
  });
});
