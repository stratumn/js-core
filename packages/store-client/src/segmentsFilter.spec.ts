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

import { SegmentsFilter } from './segmentsFilter';

describe('segments filter', () => {
  it('sets valid defaults', () => {
    const f = new SegmentsFilter();
    expect(f.process).toEqual('');
    expect(f.step).toEqual('');
    expect(f.mapIds).toEqual([]);
    expect(f.tags).toEqual([]);
    expect(f.withoutParentArg).toBeFalsy();
    expect(f.prevLinkHash).toEqual('');
    expect(f.linkHashes).toEqual([]);
  });

  it('sets process', () => {
    const f = new SegmentsFilter('p');
    expect(f.process).toEqual('p');
    expect(f.toObject().process).toEqual('p');
  });

  it('sets step', () => {
    const f = new SegmentsFilter().withStep('init');
    expect(f.step).toEqual('init');
    expect(f.toObject().step).toEqual('init');
  });

  it('sets map IDs', () => {
    const f = new SegmentsFilter().withMapIDs('m1').withMapIDs('m2', 'm3');
    expect(f.mapIds).toEqual(['m1', 'm2', 'm3']);
    expect(f.toObject().mapIds).toEqual(['m1', 'm2', 'm3']);
  });

  it('sets tags', () => {
    const f = new SegmentsFilter().withTags('t1', 't2').withTags('t3');
    expect(f.tags).toEqual(['t1', 't2', 't3']);
    expect(f.toObject().tags).toEqual(['t1', 't2', 't3']);
  });

  it('sets without parent', () => {
    const f = new SegmentsFilter().withoutParent();
    expect(f.withoutParentArg).toBeTruthy();
    expect(f.toObject().withoutParent).toBeTruthy();
  });

  it('sets parent hash', () => {
    const f = new SegmentsFilter().withParent('4224');
    expect(f.prevLinkHash).toEqual('4224');
    expect(f.toObject().prevLinkHash).toEqual('4224');
  });

  it('sets required link hashes', () => {
    const f = new SegmentsFilter().withLinkHashes('l1').withLinkHashes('l2');
    expect(f.linkHashes).toEqual(['l1', 'l2']);
    expect(f.toObject().linkHashes).toEqual(['l1', 'l2']);
  });

  it('removes empty defaults from object', () => {
    const f = new SegmentsFilter('proc').withMapIDs('m1').toObject();
    expect(f).toEqual({
      mapIds: ['m1'],
      process: 'proc'
    });
  });
});
