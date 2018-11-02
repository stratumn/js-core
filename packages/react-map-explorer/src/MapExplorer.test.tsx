import React from 'react';
import ReactDOM from 'react-dom';
import { MapExplorer } from './MapExplorer';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MapExplorer mapId={'123'} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
