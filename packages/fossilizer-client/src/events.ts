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

import { Evidence } from '@stratumn/js-chainscript';
import { Buffer } from 'buffer';

// Websocket event type for fossilized link notifications.
export const DID_FOSSILIZE_LINK_EVENT = 'DidFossilizeLink';

export class FossilizedEvent {
  public data: string;
  public meta: string | object;
  public evidence: Evidence;

  constructor(message: any) {
    this.data = Buffer.from(message.Data, 'base64').toString('hex');
    this.meta = Buffer.from(message.Meta, 'base64').toString();

    // If meta is a JSON object, parse it.
    try {
      const meta = JSON.parse(this.meta);
      this.meta = meta;
    } catch {
      // Simply keep the string version.
    }

    this.evidence = new Evidence(
      message.Evidence.version,
      message.Evidence.backend,
      message.Evidence.provider,
      message.Evidence.proof
    );
  }
}
