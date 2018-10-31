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

import {
  fromEvidenceObject,
  fromLinkObject,
  Link
} from '@stratumn/js-chainscript';
import { LinkEvidence } from './evidence';

// Websocket event type for store link notifications.
export const SAVED_LINKS_EVENT = 'SavedLinks';

// Websocket event type for store evidence notifications.
export const SAVED_EVIDENCES_EVENT = 'SavedEvidences';

export class StoreEvent {
  public type: string;
  public links: Link[];
  public evidences: LinkEvidence[];

  /**
   * Create a structured event object.
   * @param message the parsed JSON websocket message.
   */
  constructor(message: any) {
    if (
      message.type !== SAVED_LINKS_EVENT &&
      message.type !== SAVED_EVIDENCES_EVENT
    ) {
      throw new Error('Invalid message type: ' + message.type);
    }

    if (!message.data) {
      throw new Error('Missing message data: ' + JSON.stringify(message));
    }

    this.type = message.type;
    this.links = [];
    this.evidences = [];

    if (this.type === SAVED_LINKS_EVENT) {
      this.links = message.data.map(fromLinkObject);
    }

    if (this.type === SAVED_EVIDENCES_EVENT) {
      for (const linkHash of Object.keys(message.data)) {
        this.evidences.push(
          new LinkEvidence(linkHash, fromEvidenceObject(message.data[linkHash]))
        );
      }
    }
  }
}
