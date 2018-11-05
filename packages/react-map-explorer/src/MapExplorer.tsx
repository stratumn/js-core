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
