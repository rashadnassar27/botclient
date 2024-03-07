import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AgentsMenu from './AgentsMenu.js';
import CallWidget from './CallWidget.js';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AgentsMenu />} />
        <Route path="/call-widget" element={
          <CallWidget
            customer="ePaper"
            lang="he-IL"
            voice="he-IL-Wavenet-B"
            sttprovider="azure"
            ttsprovider="google"
            aiProvider="AzureOpenAi"
          />
        } />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();