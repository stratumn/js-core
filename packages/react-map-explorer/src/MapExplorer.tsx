import React, { Component } from 'react';

/**
 * Props expected by the MapExplorer component.
 */
// tslint:disable-next-line:interface-name
export interface Props {
  mapId: string;
}

/**
 * A component to load and display Chainscript process maps.
 */
export class MapExplorer extends Component<Props, object> {
  public render() {
    const { mapId } = this.props;
    return <h1>{mapId}</h1>;
  }
}
