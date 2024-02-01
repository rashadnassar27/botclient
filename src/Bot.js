import React from 'react';
import CallButton from './CallButton'; // Adjust the path accordingly
import './Bot.css'; // Import the CSS file for styling

const Bot = () => {
  return (
    <div className="bot-container">
      <div className="top-bar">
        <h2>ePaper Support</h2>
        {/* Add any other top bar content here */}
      </div>
      <div className="chat-container">
        {/* Chat messages go here */}
      </div>
      <CallButton />
    </div>
  );
};

export default Bot;
