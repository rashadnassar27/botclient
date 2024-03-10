import React, { useState, useEffect } from "react";
import "./Mugan.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

// Button component
const Button = ({ title, avatar, language, onClick }) => {
  return (
    <div className="button" onClick={onClick}>
      <img src={avatar} alt="Avatar" />
      <div className="button-text-container">
        <h3>{title}</h3>
        <h4>{language}</h4>
      </div>
    </div>
  );
};

// AgentMenu component
const AgentMenu = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      const updateConnectionType = () =>
        setConnectionType(connection.effectiveType);
      updateConnectionType();
      connection.addEventListener("change", updateConnectionType);

      return () => {
        connection.removeEventListener("change", updateConnectionType);
      };
    }
  }, []);

  const onclick_mugan_en = () => {
    console.log("onclick_mugan_en called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget-mugan", {
      state: {
        displayName: "Mugan",
        customer:"mugan-en",
        language:"en-US",
        voice:"en-US-EmmaNeural",
        sttprovider:"google",
        ttsprovider:"azure",
        gender: "female",
        name: "Alex",
        rate: 1.0
      },
    });
  };

  return (
    <div className="call-button-container"> {/* Container for centering */}
      <button className="call-button" onClick={() => onclick_mugan_en()}>
        <FontAwesomeIcon icon={faPhone} />
      </button>
    </div>
  );
};

export default AgentMenu;
