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

import { StoreHttpClient } from '@stratumn/store-client';
import { shallow } from 'enzyme';
import React from 'react';
import { mocked } from 'ts-jest/utils';
import { MapExplorer, State } from './MapExplorer';

jest.mock('@stratumn/store-client');

describe('map explorer', () => {
  const mockGetInfo = jest.fn();
  const mockStore = mocked(StoreHttpClient);

  beforeEach(() => {
    mockStore.mockClear();
    mockGetInfo.mockClear();
    mockStore.mockImplementation(() => ({
      info: mockGetInfo
    }));
  });

  it('renders a loading placeholder', () => {
    const wrapper = shallow(
      <MapExplorer mapId={'123'} storeClient={new StoreHttpClient('')} />
    );

    expect(wrapper.html()).toEqual('<div><h1>123</h1><p>Loading...</p></div>');
  });

  it('renders error', () => {
    mockGetInfo.mockImplementation(() => {
      throw new Error('Network Failure');
    });

    const wrapper = shallow(
      <MapExplorer mapId={'456'} storeClient={new StoreHttpClient('')} />
    );

    expect(mockGetInfo).toHaveBeenCalled();
    expect(wrapper.html()).toEqual(
      '<div><h1>456</h1><p>Network Failure</p></div>'
    );
  });

  it('calls the store API', () => {
    shallow(
      <MapExplorer mapId={'456'} storeClient={new StoreHttpClient('')} />
    );

    expect(mockGetInfo).toHaveBeenCalled();
  });

  it('renders store information', () => {
    mockGetInfo.mockImplementation(() => {
      return { name: 'Amazing Store' };
    });

    const wrapper = shallow(
      <MapExplorer mapId={'456'} storeClient={new StoreHttpClient('')} />
    );

    const loadedState: State = {
      info: { name: 'Amazing Store' },
      isLoaded: true
    };
    wrapper.setState(loadedState);

    expect(wrapper.html()).toEqual(
      '<div><h1>456</h1><p>Amazing Store</p></div>'
    );
  });
});
