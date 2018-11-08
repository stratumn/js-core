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

import { LinkBuilder, LinkReference } from '@stratumn/js-chainscript';

const TestProcess = 'test_process';
const TestMapId = 'test_map';

const s1 = new LinkBuilder(TestProcess, TestMapId)
  .withStep('init')
  .build()
  .segmentify();
const s2 = new LinkBuilder(TestProcess, TestMapId)
  .withParent(s1.linkHash())
  .withStep('process')
  .build()
  .segmentify();

const MapWithoutRefs = [s1, s2];

const RefProcess = 'ref_process';
const RefMapId = 'ref_map';

const Ref = new LinkBuilder(RefProcess, RefMapId).build().segmentify();
const s3 = new LinkBuilder(TestProcess, TestMapId)
  .withParent(s1.linkHash())
  .withRefs([new LinkReference(Ref.linkHash(), RefProcess)])
  .build()
  .segmentify();

const MapWithRefs = [s1, s2, s3];

export { MapWithoutRefs, MapWithRefs, Ref, TestMapId, TestProcess };
