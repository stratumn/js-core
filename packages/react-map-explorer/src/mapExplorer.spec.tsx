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

  it('renders an error', async () => {
    mapLoader.load.mockRejectedValueOnce(new Error('Network Failure'));
    const wrapper = shallow(<MapExplorer {...testProps} />);

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

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

  it('renders map segments count', async () => {
    mapLoader.load.mockResolvedValueOnce(MapWithoutRefs);
    const wrapper = shallow(<MapExplorer {...testProps} />);

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    expect(
      wrapper
        .find('h2')
        .first()
        .text()
    ).toEqual('2 segments found');
  });

  it('renders a list of segments', async () => {
    const segmentSelected = jest.fn();
    mapLoader.load.mockResolvedValueOnce(MapWithoutRefs);
    const wrapper = shallow(
      <MapExplorer {...testProps} onSegmentSelected={segmentSelected} />
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    expect(wrapper.find('ul').children()).toHaveLength(2);

    wrapper
      .find('li')
      .first()
      .simulate('click');
    expect(segmentSelected).toHaveBeenCalled();
    expect(segmentSelected).toHaveBeenCalledWith(MapWithoutRefs[0]);
  });

  it('reloads when mapId changes', () => {
    mapLoader.load.mockResolvedValue(MapWithoutRefs);
    const wrapper = shallow(<MapExplorer {...testProps} />);
    expect(mapLoader.load).toHaveBeenCalled();

    wrapper.setProps({ mapId: 'other_map', process: 'other_process' });
    expect(mapLoader.load).toHaveBeenCalledWith('other_process', 'other_map');
  });

  it('reloads when segments where not loaded', async () => {
    mapLoader.load.mockResolvedValue([]);
    const wrapper = shallow(<MapExplorer {...testProps} />);
    expect(mapLoader.load).toHaveBeenCalledTimes(1);

    wrapper.setProps({ includeHash: '1234' });
    expect(mapLoader.load).toHaveBeenCalledTimes(2);
  });

  it('reloads when new segment should be included', async () => {
    mapLoader.load.mockResolvedValue(MapWithoutRefs);
    const wrapper = shallow(<MapExplorer {...testProps} />);
    expect(mapLoader.load).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    wrapper.setProps({ includeHash: '1234' });
    expect(mapLoader.load).toHaveBeenCalledTimes(2);
  });
});
