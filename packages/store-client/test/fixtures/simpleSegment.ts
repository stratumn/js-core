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

// A simple link without custom data or metadata.
const SimpleLink = new LinkBuilder('test_process', 'test_map').build();

// This is what the SimpleLink should look like after a link.toObject() call.
const SimpleLinkObject = {
  meta: {
    clientId: 'github.com/stratumn/js-chainscript',
    mapId: 'test_map',
    outDegree: -1,
    process: {
      name: 'test_process'
    }
  },
  version: '1.0.0'
};

// This is that the SimpleLink's segment should look like after a
// segment.toObject({ bytes: String }) call.
const SimpleSegmentObject = {
  link: SimpleLinkObject,
  meta: {
    linkHash: '9uqBhUfUEBi5KD28dBcPl2QoTrTbprf1wAUFxLk6Z6U'
  }
};

export { SimpleLink, SimpleLinkObject, SimpleSegmentObject };
