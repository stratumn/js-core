import { StoreHttpClient } from '@stratumn/store-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { MapExplorer } from './MapExplorer';

it('renders without crashing', () => {
  // TODO: mock store client
  const client = new StoreHttpClient('http://localhost:5000');

  const div = document.createElement('div');
  ReactDOM.render(<MapExplorer mapId={'123'} storeClient={client} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
