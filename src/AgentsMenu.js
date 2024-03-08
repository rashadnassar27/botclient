import React, { useState, useEffect } from "react";
import "./AgentsMenu.css";
import callerAvatar from "./assets/images/agent.png";
import { useNavigate } from "react-router-dom";

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

  const onclick_pizza_en = () => {
    console.log("onclick_pizza_he called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "Pizza",
        customer:"pizza",
        language:"en-US",
        voice:"shimmer",
        sttprovider:"google",
        ttsprovider:"openai",
        gender: "female",
        name: "Alex",
        rate: 1.0
      },
    });
  };

  const onclick_pizza_he = () => {
    console.log("onclick_pizza_he called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "Pizza",
        customer: "Pizza",
        language: "he-IL",
        voice: "he-IL-AvriNeural",
        sttprovider:"azure",
        ttsprovider:"azure",
        gender: "male",
        name: "Avri",
        rate: 1.0
      },
    });
  };

  const onclick_room_servise_en = () => {
    console.log("onclick_room_servise_en called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "Room Service",
        customer:"room-service-en",
        language:"en-US",
        voice:"en-US-MonicaNeural",
        sttprovider:"azure",
        ttsprovider:"azure",
        gender: "female",
        name: "Alex",
        rate: 1.0
      },
    });
  };

  const onclick_room_servise_he = () => {
    console.log("onclick_room_servise_he called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "Room Service",
        customer:"room-service-en",
        language: "he-IL",
        voice: "he-IL-AvriNeural",
        sttprovider:"azure",
        ttsprovider:"azure",
        gender: "male",
        name: "Avri",
        rate: 1.0
      },
    });
  };

  const onclick_mugan_en = () => {
    console.log("onclick_mugan_en called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
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

  const onclick_mugan_he = () => {
    console.log("onclick_mugan_he called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "Mugan",
        customer:"mugan",
        language: "he-IL",
        voice: "he-IL-AvriNeural",
        sttprovider:"azure",
        ttsprovider:"azure",
        gender: "male",
        name: "Avri",
        rate: 1.0
      },
    });
  };

  const onclick_epaper_en = () => {
    console.log("onclick_mugan_en called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "ePaper LTD",
        customer:"epaper-en",
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

  const onclick_epaper_he = () => {
    console.log("onclick_mugan_he called");
    if (!isOnline) {
      alert("Check your connection please.");
      return;
    }

    navigate("/call-widget", {
      state: {
        displayName: "ePaper LTD",
        customer:"epaper-he",
        language: "he-IL",
        voice: "he-IL-AvriNeural",
        sttprovider:"azure",
        ttsprovider:"azure",
        gender: "male",
        name: "Avri",
        rate: 1.0
      },
    });
  };

  return (
    <div className="agent-menu">
      <h1>Call Agent</h1>
      <div className="button-container">
        <Button
          title="Pizza"
          avatar={callerAvatar}
          language="English"
          onClick={() => onclick_pizza_en()}
        />
        {/* <Button title="Pizza" avatar={callerAvatar} language="Hebrew"  onClick={() => onclick_pizza_he()}/> */}
      </div>
      <div className="button-container">
        <Button
          title="Hotel Room Service"
          avatar={callerAvatar}
          language="English"
          onClick={() => onclick_room_servise_en()}
        />
        {/* <Button
          title="Hotel Room Service"
          avatar={callerAvatar}
          language="Hebrew"
          onClick={() => onclick_room_servise_he()}
        /> */}
      </div>
      <div className="button-container">
        <Button title="Epaper LTD" avatar={callerAvatar} language="English" onClick={() => onclick_epaper_en()}/>
        {/* <Button title="Epaper LTD" avatar={callerAvatar} language="Hebrew" onClick={() => onclick_epaper_he()}/> */}
      </div>
      <div className="button-container">
        <Button title="Mugan" avatar={callerAvatar} language="English" onClick={() => onclick_mugan_en()}/>
        <Button title="Mugan" avatar={callerAvatar} language="Hebrew" onClick={() => onclick_mugan_he()}/>
      </div>
    </div>
  );
};

export default AgentMenu;
