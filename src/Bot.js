import React, { useState } from "react";
import CallButton from "./CallButton"; // Adjust the path accordingly
import "./Bot.css"; // Import the CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import epaperlogo from "./assets/images/epaper.png";
import { Helmet } from "react-helmet";

const Bot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    // setMessages([...messages, { text: input, sender: "me" }]);
    // setInput("");
  };

  return (
    <>
      {" "}
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <div className="chat-page">
        <div className="chat-header">
          <div className="logo-container">
            <epaperlogo />
          </div>

          <div className="call-button-container">
            <CallButton />
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
          />
          <button className="send-button" onClick={sendMessage}>
            <FontAwesomeIcon icon={faPaperPlane} size="2x" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Bot;
