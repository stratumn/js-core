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
