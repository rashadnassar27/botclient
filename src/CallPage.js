import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";

const CallPage = () => {
  const [buttonColor, setButtonColor] = useState("green");
  const [isCallActive, setIsCallActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [hubConnection, setHubConnection] = useState(null);
  const scriptProcessorNodeRef = useRef(null);
  const audioContextRef = useRef(null);

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
        .withUrl("https://localhost:7256/bothub", {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .build();

      connection.on("ReceiveMessage", (receivedMessage) => {
        console.log("Received message data:", receivedMessage);
        // Handle received message as needed
      });

      connection
        .start()
        .then(() => {
          connection.invoke("SendMessage", "");
          resolve(connection);
        })
        .catch((error) => {
          console.error("Error starting hub connection:", error);
          reject(error);
        });
    });
  };

  const startCall = () => {
    setButtonColor("red");
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
    setButtonColor("green");
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
    console.log("Audio event");
    const buffer = e.inputBuffer.getChannelData(0);

    if (connection.state === "Connected") {
      connection.send("sendAudioData", buffer.buffer);
    } else {
      console.warn(
        "Connection not in the 'Connected' state. Unable to send data."
      );
    }
  };

  const startSendingAudioData = (stream, connection) => {
    audioContextRef.current = new AudioContext();
    const mediaStreamSource = audioContextRef.current.createMediaStreamSource(stream);
    scriptProcessorNodeRef.current = audioContextRef.current.createScriptProcessor(
      4096,
      1,
      1
    );
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
        console.log("Hub connection closed:", error);
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

  const buttonStyle = {
    backgroundColor: buttonColor,
    padding: "20px 20px",
    color: "white",
    cursor: "pointer",
    borderRadius: 50,
    height: 100,
    width: 100,
    position: "absolute",
    bottom: "50px",
    left: "50%",
    transform: "translateX(-50%)",
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <button style={buttonStyle} onClick={handleButtonClick}>
        {isCallActive ? "End" : "Dial"}
      </button>
    </div>
  );
};

export default CallPage;
