import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import "./CallPage.css";
import { v4 as uuidv4 } from 'uuid';
import RecordRTC, {StereoAudioRecorder} from 'recordrtc';

const CallPage = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [hubConnection, setHubConnection] = useState(null);
  const mediaRecorderRef = useRef(null);

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
        .withUrl("https://localhost:4000/callhub", {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .build();

      connection.on("SendAudioDataToClient", (audioChunk) => {
        console.log("Received audio chunk");
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
                mediaRecorderRef.current = new RecordRTC(stream, {
                type: 'audio',
                recorderType: StereoAudioRecorder,
                mimeType: 'audio/wav',
                numberOfAudioChannels: 1,
                desiredSampRate: 16000,
                timeSlice: 200,
                ondataavailable: (blob) => {
                    audioProcessEventHandler(blob, newHubConnection);
                  },
            });
            mediaRecorderRef.current.startRecording();
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
    if( mediaRecorderRef.current){
        mediaRecorderRef.current.stopRecording();
        mediaRecorderRef.current.reset();
        mediaRecorderRef.current.destroy();
        console.log("RTC media recorder Closed");
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      console.log("Microphone Closed");
    }

    if (hubConnection) {
      hubConnection.stop();
      setHubConnection(null);
      console.log("Signalr connection Closed");
    }
  };

  const audioProcessEventHandler = (event, connection) => {

    if (connection.state === "Connected") {
        if (event && event.size > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(event);
            reader.onloadend = () => {
              const base64AudioMessage = reader.result.split(",")[1];
              connection.send("SendAudioDataToServer", base64AudioMessage);
            };
          }
    } else {
      console.warn(
        "Connection not in the 'Connected' state. Unable to send data."
      );
    }
  };

  useEffect(() => {
    const handleConnectionStateChange = (state) => {
      console.log(`Connection state changed to: ${state}`);
      if(state == 'Closed'){
        endCall();
      }
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

