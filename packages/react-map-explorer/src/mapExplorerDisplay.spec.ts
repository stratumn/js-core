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

import { LinkBuilder } from '@stratumn/js-chainscript';
import { hashToString } from './hash';
import { prepareSegments } from './mapExplorerDisplay';

describe('map explorer display', () => {
  it('lays out simple tree', () => {
    const root = new LinkBuilder('p', 'm')
      .withStep('init')
      .build()
      .segmentify();

    const child1 = new LinkBuilder('p', 'm')
      .withParent(root.linkHash())
      .withData({ amount: 2 })
      .withStep('split')
      .build()
      .segmentify();

    const child2 = new LinkBuilder('p', 'm')
      .withParent(root.linkHash())
      .withData({ amount: 5 })
      .withStep('split')
      .build()
      .segmentify();

    const grandchild = new LinkBuilder('p', 'm')
      .withParent(child2.linkHash())
      .withStep('transfer')
      .build()
      .segmentify();

    const layout = prepareSegments([child1, grandchild, root, child2]);
    expect(layout.id).toEqual(hashToString(root.linkHash()));
    expect(layout.data.step).toEqual('init');
    expect(layout.data.isRef).toBeFalsy();
    expect(layout.height).toEqual(2);
    expect(layout.children).toHaveLength(2);

    const c2 = layout.children.find(
      c => c.id === hashToString(child2.linkHash())
    );
    expect(c2.parent.id).toEqual(hashToString(root.linkHash()));
    expect(c2.data.step).toEqual('split');
    expect(c2.depth).toEqual(1);
    expect(c2.height).toEqual(1);
    expect(c2.children).toHaveLength(1);
  });

  it('lays out tree with references', () => {
    const ref = new LinkBuilder('pp', 'mm')
      .withStep('freeze')
      .build()
      .segmentify();

    const root = new LinkBuilder('p', 'm')
      .withStep('init')
      .withRefs([{ linkHash: ref.linkHash(), process: 'pp' }])
      .build()
      .segmentify();

    const child = new LinkBuilder('p', 'm')
      .withParent(root.linkHash())
      .withStep('destroy')
      .build()
      .segmentify();

    const layout = prepareSegments([ref, child, root]);
    expect(layout.id).toEqual(hashToString(root.linkHash()));
    expect(layout.data.step).toEqual('init');
    expect(layout.height).toEqual(1);
    expect(layout.children).toHaveLength(2);

    const r = layout.children.find(c => c.id === hashToString(ref.linkHash()));
    expect(r.parent.id).toEqual(hashToString(root.linkHash()));
    expect(r.data.isRef).toBeTruthy();
  });
});
