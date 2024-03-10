import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AgentsMenu from './AgentsMenu.js';
import CallWidget from './CallWidget.js';
import Mugan from './Mugan.js';
import CallWidgetMugan from './CallWidgetMugan.js';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AgentsMenu />} />
        <Route path="/call-widget" element={
          <CallWidget/>
        } />
        <Route path="/mugan" element={
          <Mugan/>
        } />
        <Route path="/call-widget-mugan" element={
          <CallWidgetMugan/>
        } />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();