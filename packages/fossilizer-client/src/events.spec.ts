import { FossilizedEvent } from './events';

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

describe('events', () => {
  const validMessage = () => {
    return {
      Data: 'YmF0bWFu',
      Evidence: {
        backend: 'dummy',
        proof: 'eyJ0aW1lc3RhbXAiOjE1NDAzOTYxMTV9',
        provider: 'dummy',
        version: '1.0.0'
      },
      Meta: 'YmF0bWFu'
    };
  };

  it('creates event with string meta', () => {
    const e = new FossilizedEvent(validMessage());

    expect(e.data).toBe('6261746d616e');
    expect(e.meta).toBe('batman');
    expect(e.evidence.version).toBe('1.0.0');
    expect(e.evidence.backend).toBe('dummy');
    expect(e.evidence.provider).toBe('dummy');
    expect(e.evidence.proof).toBe('eyJ0aW1lc3RhbXAiOjE1NDAzOTYxMTV9');
  });

  it('creates event with complex meta', () => {
    const message = validMessage();
    message.Meta = Buffer.from(
      JSON.stringify({
        age: 42,
        user: 'batman'
      })
    ).toString('base64');

    const e = new FossilizedEvent(message);

    expect(e.data).toBe('6261746d616e');
    expect(e.meta).toEqual({ user: 'batman', age: 42 });
    expect(e.evidence.version).toBe('1.0.0');
    expect(e.evidence.backend).toBe('dummy');
    expect(e.evidence.provider).toBe('dummy');
    expect(e.evidence.proof).toBe('eyJ0aW1lc3RhbXAiOjE1NDAzOTYxMTV9');
  });

  it('rejects missing data', () => {
    const m = validMessage();
    delete m.Data;

    expect(() => new FossilizedEvent(m)).toThrow();
  });

  it('rejects missing meta', () => {
    const m = validMessage();
    delete m.Meta;

    expect(() => new FossilizedEvent(m)).toThrow();
  });

  it('rejects missing evidence', () => {
    const m = validMessage();
    delete m.Evidence;

    expect(() => new FossilizedEvent(m)).toThrow();
  });

  it('rejects invalid evidence', () => {
    const m = validMessage();
    delete m.Evidence.backend;

    expect(() => new FossilizedEvent(m)).toThrow();
  });
});
