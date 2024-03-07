import React from "react";
import "./AgentsMenu.css";
import callerAvatar from "./assets/images/agent.png";
import { useNavigate } from 'react-router-dom';


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


    const onclick_pizza_he = () =>{
        console.log('onclick_pizza_he');
        navigate('/call-widget', { state: { customer:"ePaper", lang:"he-IL",  voice:"he-IL-Wavenet-B", sttprovider:"azure", ttsprovider:"google", aiProvider:"AzureOpenAi" }});
    }

  return (
    <div className="agent-menu">
      <h1>Call Agent</h1>
      <div className="button-container">
        <Button title="Pizza" avatar={callerAvatar} language="English" onClick={() => onclick_pizza_he()}/>
        <Button title="Pizza" avatar={callerAvatar} language="Hebrew" />
      </div>
      <div className="button-container">
        <Button title="Hotel Room Service" avatar={callerAvatar} language="English" />
        <Button title="Hotel Room Service" avatar={callerAvatar} language="Hebrew" />
      </div>
      <div className="button-container">
        <Button title="Epaper LTD" avatar={callerAvatar} language="English" />
        <Button title="Epaper LTD" avatar={callerAvatar}  language="Hebrew"/>
      </div>
      <div className="button-container">
        <Button title="Mugan" avatar={callerAvatar} language="English" />
        <Button title="Mugan" avatar={callerAvatar}  language="Hebrew"/>
      </div>
    </div>
  );
};

export default AgentMenu;
