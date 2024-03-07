import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import CallWidget from './CallWidget';

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
   <CallWidget
                        customer="ePaper"
                        lang="he-IL"
                        voice="he-IL-Wavenet-B"
                        sttprovider="azure"
                        ttsprovider="google"
                        aiProvider="AzureOpenAi"
                    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
