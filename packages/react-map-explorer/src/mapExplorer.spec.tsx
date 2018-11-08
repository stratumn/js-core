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
import { MapExplorer, State } from './mapExplorer';

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

    expect(
      wrapper
        .find('p')
        .first()
        .text()
    ).toEqual('Loading...');
  });

  it('renders an error', () => {
    mapLoader.load.mockRejectedValueOnce(new Error('Network Failure'));
    const wrapper = shallow(<MapExplorer {...testProps} />);

    const failedState: State = {
      error: new Error('Network Failure'),
      isLoaded: true
    };
    wrapper.setState(failedState);

    expect(mapLoader.load).toHaveBeenCalled();
    expect(
      wrapper
        .find('p')
        .first()
        .text()
    ).toEqual('Network Failure');
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
    mapLoader.load.mockReturnValueOnce(MapWithoutRefs);
    const wrapper = shallow(<MapExplorer {...testProps} />);

    const loadedState: State = {
      isLoaded: true,
      segments: MapWithoutRefs
    };
    wrapper.setState(loadedState);

    expect(
      wrapper
        .find('h2')
        .first()
        .text()
    ).toEqual('2 segments found');
  });

  it('renders a list of segments', () => {
    const segmentSelected = jest.fn();
    mapLoader.load.mockReturnValueOnce(MapWithoutRefs);
    const wrapper = shallow(
      <MapExplorer {...testProps} onSegmentSelected={segmentSelected} />
    );

    const loadedState: State = {
      isLoaded: true,
      segments: MapWithoutRefs
    };
    wrapper.setState(loadedState);

    expect(wrapper.find('ul').children()).toHaveLength(2);

    wrapper
      .find('li')
      .first()
      .simulate('click');
    expect(segmentSelected).toHaveBeenCalled();
    expect(segmentSelected).toHaveBeenCalledWith(MapWithoutRefs[0]);
  });
});
