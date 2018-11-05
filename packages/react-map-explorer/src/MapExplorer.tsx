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

import { IStoreClient } from '@stratumn/store-client';
import React, { Component } from 'react';

/**
 * Props expected by the MapExplorer component.
 */
// tslint:disable-next-line:interface-name
export interface Props {
  mapId: string;
  storeClient: IStoreClient;
}

/**
 * The MapExplorer component manages its own state.
 */
// tslint:disable-next-line:interface-name
export interface State {
  error?: Error;
  isLoaded: boolean;
  info?: any;
}

/**
 * A component to load and display Chainscript process maps.
 */
export class MapExplorer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoaded: false
    };
  }

  public async componentDidMount() {
    try {
      const info = await this.props.storeClient.info();
      this.setState({
        info,
        isLoaded: true
      });
    } catch (err) {
      this.setState({
        error: err,
        isLoaded: true
      });
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

    return (
      <div>
        <h1>{mapId}</h1>
        <p>{this.state.info.name}</p>
      </div>
    );
  }
}
