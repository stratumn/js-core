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
import React, { Component } from 'react';

/**
 * Props expected by the Segment component.
 */
// tslint:disable-next-line:interface-name
export interface Props {
  segment: Segment;
}

export class MapSegment extends Component<Props, any> {
  public render() {
    const { segment } = this.props;
    return (
      <div>
        <p>LinkHash: {Buffer.from(segment.linkHash()).toString('hex')}</p>
        <p>
          Parent:{' '}
          {segment.link().prevLinkHash()
            ? Buffer.from(segment.link().prevLinkHash()).toString('hex')
            : ''}
        </p>
        <p>Step: {segment.link().step()}</p>
      </div>
    );
  }
}
