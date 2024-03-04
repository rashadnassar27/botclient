// CallDialog.js

import React, { useState, useEffect } from "react";
import "./CallDialog.css";

const CallDialog = ({ onClose }) => {
    const [callStartTime, setCallStartTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCallStartTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleEndCall = () => {
        onClose();
    };

    const calculateCallDuration = () => {
        const currentTime = Date.now();
        const durationInSeconds = Math.floor((currentTime - callStartTime) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div className="call-dialog">
            <h2>Call Duration: {calculateCallDuration()}</h2>
            <button onClick={handleEndCall}>End Call</button>
        </div>
    );
};

export default CallDialog;
