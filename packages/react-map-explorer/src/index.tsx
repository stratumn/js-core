import { StoreHttpClient } from '@stratumn/store-client';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { MapExplorer } from './MapExplorer';

const storeClient = new StoreHttpClient('http://localhost:5000');

ReactDOM.render(
  <MapExplorer mapId={'123'} storeClient={storeClient} />,
  document.getElementById('root')
);
