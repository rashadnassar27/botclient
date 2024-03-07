import './RectangleButton.css'; 
import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import "./CallButton.css";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import AudioBufferPlayer from "./AudioBufferPlayer.js";
import { azureRecgnizeStart, azureRecognizeStop } from "./AzureTTS.js";
import "./CallWidget.css";
import callerAvatar from "./assets/images/agent.png";
import { useLocation } from 'react-router-dom';

const RecognitionMode = {
  LOCALAZURE: "LocalAzure",
  BACKEND: "Backend",
};

const CallWidget = ({customer, lang, voice, sttprovider, ttsprovider, aiProvider }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [hubConnection, setHubConnection] = useState(null);
    const mediaRecorderRef = useRef(null);
    const mediaStrearRef = useRef(null);
    const audioRef = useRef(new AudioBufferPlayer());
    const recognitionMode = RecognitionMode.BACKEND;
    const callerName = useState(customer);
    const [callDuration, setCallDuration] = useState(0);
    const location = useLocation();
    const { param1, param2 } = location.state;
    
    useEffect(() => {
      const timer = setInterval(() => {
        setCallDuration(prevDuration => prevDuration + 1);
      }, 1000); // Update every second
  
      return () => clearInterval(timer);
    }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


    const handleButtonClick = () => {
        if (isCallActive) {
          endCall();
        } else {
            var params = {
                customer: customer,
                language: lang,
                voice: voice,
                aiProvider: aiProvider,
                sttProvider: sttprovider,
                ttsProvider: ttsprovider
            };
    
            var url = buildUrl(params);
            console.log('url:' + url);

          startCall(url);
        }
      };

      const createHubConnection = (url) => {
        return new Promise((resolve, reject) => {
          const connection = new HubConnectionBuilder()
            .withUrl(url, {
              skipNegotiation: true,
              transport: HttpTransportType.WebSockets,
            })
            .build();
    
          connection.on("SendAudioDataToClient", (audioChunk) => {
            console.log("Received audio chunk");
            try {
              audioRef.current.addBufferAndPlay(audioChunk);
            } catch (error) {
              console.log(error);
            }
          });
    
          connection.on("StopSpeaking", () => {
            audioRef.current.reset();
            console.log("Received stop speaking request");
          });
    
          connection.on("SessionEnded", () => {
            console.log("EVENT: Received END session request");
    
            const timer = setInterval(() => {
              console.log("Still taliknag");
              if (!audioRef.current.isRunning) {
                clearInterval(timer);
                endCall();
              }
            }, 100);
          });
    
          connection
            .start()
            .then(() => {
              connection.invoke("Register", '');
              resolve(connection);
            })
            .catch((error) => {
              console.error("Error starting hub connection:", error);
              reject(error);
            });
        });
      };
    
      const startRecognition = async (connection) => {
        switch (recognitionMode) {
          case RecognitionMode.BACKEND:
            console.log("Opening microphone");
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                mediaStrearRef.current = stream;
                // Check if the connection is in the 'Connected' state before starting to send audio data
                if (connection.state === "Connected") {
                  mediaRecorderRef.current = new RecordRTC(stream, {
                    type: "audio",
                    recorderType: StereoAudioRecorder,
                    mimeType: "audio/wav",
                    numberOfAudioChannels: 1,
                    desiredSampRate: 16000,
                    timeSlice: 200,
                    ondataavailable: (blob) => {
                      audioProcessEventHandler(blob, connection);
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
            break;
          case RecognitionMode.LOCALAZURE:
            try {
              azureRecgnizeStart(connection);
            } catch (err) {
              console.error("Error accessing audio:", err);
            }
            break;
          default:
            console.log("Not implemented recognition mode: " + recognitionMode);
        }
      };
    
      const startCall = (url) => {
        try {
          setIsCallActive(true);
          audioRef.current.reset();
          console.log("Creating hub connection with url: " + url);
          createHubConnection(url)
            .then((newHubConnection) => {
              setHubConnection(newHubConnection);
              console.log("Recognition Started");
              startRecognition(newHubConnection);
            })
            .catch((error) => {
              console.error("Error creating hub connection:", error);
              endCall();
            });
        } catch (error) {
          console.log(error);
        }
      };
    
      const endCall = () => {
        try {
          setIsCallActive(false);
          azureRecognizeStop();
          audioRef.current.reset();
    
          if (mediaStrearRef.current) {
            mediaStrearRef.current.stop();
            mediaStrearRef.current = null;
            console.log("Microphone Closed");
          }
    
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stopRecording();
            mediaRecorderRef.current.reset();
            mediaRecorderRef.current.destroy();
            console.log("RTC media recorder Closed");
          }
    
          if (hubConnection) {
            hubConnection.stop();
            setHubConnection(null);
            console.log("Signalr connection Closed");
          }
        } catch (error) {
          console.log(error);
        }

        window.location.href = '/';

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
          if (state == "Closed") {
            endCall();
          }
        };
    
        audioRef.current.addEventListener('isRunningChanged', () => {
          console.log(`isRunning changed to: ${audioRef.current.isRunning}`);
          try {
            if (hubConnection) {
            if (hubConnection.state === "Connected") {
              hubConnection.send("OnClientBotSpeakingStatus", audioRef.current.isRunning);
              console.log(`ClientSpeaking Status sent to server: ${audioRef.current.isRunning}`);
    
            } else {
              console.log(
                `Cannot send the client bot speaking status due connection state: ` +
                hubConnection.state
              );
            }}else{
              console.log("Cannot send the client bot speaking status due hubConnection is null");
            }
          } catch (error) {
            console.log(error);
          }
        });
    
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
    

    function buildUrl(params) {
        var baseUrl = "https://localhost:4000/callhub"; 
        var queryString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
        return`${baseUrl}?${queryString}`;
    }
    return (
      <div className="iphone-call">
        <div className="iphone-body">
          <div className="caller-info">
            <img src={callerAvatar} alt={callerName} className="caller-avatar" />
            <span className="caller-name">{callerName}</span>
      
          </div>
          

          <div className="audio-equalizer">
          <span className="call-duration">{formatTime(callDuration)}</span>

          <div className="audio-bar1"></div>
          <div className="audio-bar2"></div>
          <div className="audio-bar3"></div>
          <div className="audio-bar4"></div>

          </div>
          <div className="call-actions">
            <button className="end-call-button" onClick={endCall}>End Call</button>
          </div>
        </div>
      </div>
    );
};

export default CallWidget;
