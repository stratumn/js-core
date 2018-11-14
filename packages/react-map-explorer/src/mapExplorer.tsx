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
import { IMapLoader } from './mapLoader';
import { MapSegment } from './segment';

/**
 * Props expected by the MapExplorer component.
 */
// tslint:disable-next-line:interface-name
export interface Props {
  /**
   * Map process.
   */
  process: string;

  /**
   * Id of the map you want to display.
   */
  mapId: string;

  /**
   * Hash of a known link that should be in the map.
   * If no link with this hash is currently loaded, the component will re-fetch
   * the map from the server.
   * You can use this prop to automatically refresh the map when creating new
   * links.
   */
  includeHash?: string;

  /**
   * Object that actually loads the whole map.
   */
  mapLoader: IMapLoader;

  /**
   * Callback when a segment is selected.
   */
  onSegmentSelected?: (s: Segment) => void;
}

/**
 * The MapExplorer component manages its own state.
 */
// tslint:disable-next-line:interface-name
export interface State {
  error?: Error;
  isLoaded: boolean;
  segments?: Segment[];
}

/**
 * A component to load and display Chainscript process maps.
 */
export class MapExplorer extends Component<Props, State> {
  public state: State = { isLoaded: false };

  public async componentDidMount() {
    await this.loadMap();
  }

  public async componentDidUpdate(prevProps: Props) {
    if (this.shouldReloadMap(prevProps)) {
      await this.loadMap();
    }
  }

  public render() {
    const { mapId } = this.props;
    if (!this.state.isLoaded) {
      return (
        <div>
          <h1>{mapId}</h1>
          <p>Loading...</p>
        </div>
      );
    }

    if (this.state.error) {
      return (
        <div>
          <h1>{mapId}</h1>
          <p>{this.state.error.message}</p>
        </div>
      );
    }

    const segments = this.state.segments as Segment[];
    const segmentItems = segments.map((s: Segment) => (
      <li
        key={Buffer.from(s.linkHash()).toString('hex')}
        onClick={() => {
          if (this.props.onSegmentSelected) {
            this.props.onSegmentSelected(s);
          }
        }}
      >
        <MapSegment segment={s} />
      </li>
    ));

    return (
      <div>
        <h1>{mapId}</h1>
        <h2>{(this.state.segments as Segment[]).length} segments found</h2>
        <ul>{segmentItems}</ul>
      </div>
    );
  }

  private shouldReloadMap = (prevProps: Props): boolean => {
    // If the map we want to display has changed, refresh.
    if (
      prevProps.process !== this.props.process ||
      prevProps.mapId !== this.props.mapId
    ) {
      return true;
    }

    // If an unknown link should be included, refresh.
    if (
      this.props.includeHash &&
      prevProps.includeHash !== this.props.includeHash
    ) {
      if (!this.state.segments) {
        return true;
      }

      if (
        !this.state.segments.some(
          (s: Segment) =>
            Buffer.from(s.linkHash()).toString('hex') === this.props.includeHash
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private loadMap = async () => {
    try {
      const segments = await this.props.mapLoader.load(
        this.props.process,
        this.props.mapId
      );
      this.setState({
        isLoaded: true,
        segments
      });
    } catch (err) {
      this.setState({
        error: err,
        isLoaded: true
      });
    }
  }
}
