import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import "./CallPage.css";
import { v4 as uuidv4 } from 'uuid';

const CallPage = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [hubConnection, setHubConnection] = useState(null);
  const scriptProcessorNodeRef = useRef(null);
  const audioContextRef = useRef(null);


  const getOrCreateClientId = () => {
    const key = 'clientid';
    let storedGUID = localStorage.getItem(key);
    if (!storedGUID) {
      storedGUID = uuidv4();
      localStorage.setItem(key, storedGUID);
    }
    return storedGUID;
  };

  const handleButtonClick = () => {
    if (isCallActive) {
      endCall();
    } else {
      startCall();
    }
  };

  const createHubConnection = () => {
    return new Promise((resolve, reject) => {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7256/callhub", {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .build();

      connection.on("SendAudioStream", (receivedMessage) => {
        console.log("Received message data:", receivedMessage);
        // Handle received message as needed
      });

      connection
        .start()
        .then(() => {
          connection.invoke("Register", getOrCreateClientId());
          resolve(connection);
        })
        .catch((error) => {
          console.error("Error starting hub connection:", error);
          reject(error);
        });
    });
  };

  const startCall = () => {
    setIsCallActive(true);

    console.log("Creating hub connection");
    createHubConnection()
      .then((newHubConnection) => {
        setHubConnection(newHubConnection);

        console.log("Opening microphone");
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            setMediaStream(stream);

            // Check if the connection is in the 'Connected' state before starting to send audio data
            if (newHubConnection.state === "Connected") {
              startSendingAudioData(stream, newHubConnection);
            } else {
              console.warn(
                "Connection not in the 'Connected' state. Unable to start sending audio data."
              );
              alert("The call has failed.");
            }
          })
          .catch((error) => {
            console.error("Error opening microphone:", error);
            endCall();
          });
      })
      .catch((error) => {
        console.error("Error creating hub connection:", error);
        endCall();
      });
  };

  const endCall = () => {
    setIsCallActive(false);
    console.log("scriptProcessorNodeRef:" + scriptProcessorNodeRef.current);
    if (audioProcessEventHandler && scriptProcessorNodeRef.current) {
      console.log("Remove audio event listener");
      scriptProcessorNodeRef.current.removeEventListener(
        "audioprocess",
        audioProcessEventHandler
      );
      console.log("Disconnect scriptProcessorNodeRef");
      scriptProcessorNodeRef.current.disconnect();
    }

    // Close the AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      console.log("Closing audio context");
      audioContextRef.current.close().catch((error) => {
        console.error("Error closing AudioContext:", error);
      });
    }

    if (mediaStream) {
      console.log("Close the microphone");
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    if (hubConnection) {
      hubConnection.stop();
      setHubConnection(null);
    }
  };

  const audioProcessEventHandler = (e, connection) => {
    const buffer = e.inputBuffer.getChannelData(0);

    if (connection.state === "Connected") {
        console.log("Audio chunk sent to backend.");
        const base64String = arrayBufferToBase64(buffer.buffer);
      connection.send("SendAudioData",base64String);
    } else {
      console.warn(
        "Connection not in the 'Connected' state. Unable to send data."
      );
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
  
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  
    return btoa(binary);
  };

  const startSendingAudioData = (stream, connection) => {
    audioContextRef.current = new AudioContext();
    const mediaStreamSource =
      audioContextRef.current.createMediaStreamSource(stream);
    scriptProcessorNodeRef.current =
      audioContextRef.current.createScriptProcessor(4096, 1, 1);
    mediaStreamSource.connect(scriptProcessorNodeRef.current);
    scriptProcessorNodeRef.current.connect(audioContextRef.current.destination);
    scriptProcessorNodeRef.current.addEventListener("audioprocess", (e) =>
      audioProcessEventHandler(e, connection)
    );
  };

  useEffect(() => {
    const handleConnectionStateChange = (state) => {
      console.log(`Connection state changed to: ${state}`);
      // Optionally, you can add logic to handle state changes
    };

    if (hubConnection) {
      hubConnection.onclose((error) => {
        console.log("Hub connection closed. error:", error);
        handleConnectionStateChange("Closed");
      });

      hubConnection.onreconnecting(() => {
        console.log("Hub connection reconnecting...");
        handleConnectionStateChange("Reconnecting");
      });

      hubConnection.onreconnected(() => {
        console.log("Hub connection reconnected.");
        handleConnectionStateChange("Reconnected");
      });
    }

    return () => {
      // Cleanup and remove event listeners when the component unmounts
      if (hubConnection) {
        hubConnection.off("close");
        hubConnection.off("reconnecting");
        hubConnection.off("reconnected");
      }
    };
  }, [hubConnection]);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {isCallActive ? (
        <>
          <button className="end-botton" onClick={handleButtonClick}>
            End
          </button>
        </>
      ) : (
        <button className="call-botton" onClick={handleButtonClick}>
          Dial
        </button>
      )}
    </div>
  );
};

export default CallPage;
