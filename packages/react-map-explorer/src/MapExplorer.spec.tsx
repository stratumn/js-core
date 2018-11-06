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

import { shallow } from 'enzyme';
import React from 'react';
import { MapWithoutRefs, TestMapId, TestProcess } from '../test/fixtures/maps';
import { MapExplorer, State } from './MapExplorer';

describe('map explorer', () => {
  const mapLoader = {
    load: jest.fn()
  };
  const testProps = {
    mapId: TestMapId,
    mapLoader,
    process: TestProcess
  };

  beforeEach(() => {
    mapLoader.load.mockClear();
  });

  it('renders a loading spinner', () => {
    const wrapper = shallow(<MapExplorer {...testProps} />);

    expect(wrapper.html()).toEqual(
      '<div><h1>test_map</h1><p>Loading...</p></div>'
    );
  });

  it('renders an error', () => {
    mapLoader.load.mockImplementationOnce(() => {
      throw new Error('Network Failure');
    });

    const wrapper = shallow(<MapExplorer {...testProps} />);

    expect(mapLoader.load).toHaveBeenCalled();
    expect(wrapper.html()).toEqual(
      '<div><h1>test_map</h1><p>Network Failure</p></div>'
    );
  });

  it('loads the map segments', () => {
    shallow(<MapExplorer {...testProps} />);

    expect(mapLoader.load).toHaveBeenCalled();
    expect(mapLoader.load).toHaveBeenCalledWith(
      testProps.process,
      testProps.mapId
    );
  });

  it('renders map segments count', () => {
    mapLoader.load.mockImplementation(async () => {
      return MapWithoutRefs;
    });

    const wrapper = shallow(<MapExplorer {...testProps} />);

    const loadedState: State = {
      isLoaded: true,
      segments: MapWithoutRefs
    };
    wrapper.setState(loadedState);

    expect(wrapper.html()).toEqual(
      '<div><h1>test_map</h1><p>2 segments found</p></div>'
    );
  });
});
