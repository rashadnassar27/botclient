import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import "./CallPage.css";
import { v4 as uuidv4 } from 'uuid';
import RecordRTC, {StereoAudioRecorder} from 'recordrtc';
import Queue from "./Queue";

const CallPage = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [hubConnection, setHubConnection] = useState(null);
  const mediaRecorderRef = useRef(null);
  const queueRef = useRef(new Queue());
  const isPlayingRef = useRef(false);
  const audioBufferIsRunning = useRef(false);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);


  useEffect(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const toBlob = (base64, contentType) => {
    if(base64 == undefined){
      console.log('base64 input is undefined!');
      return;
    }

    base64 = base64.replace(/-/g, "+");
    base64 = base64.replace(/_/g, "/");
    const bytesArr = atob(base64);
    const byteNumbers = new Array(bytesArr.length);
    for (let i = 0; i < bytesArr.length; i++) {
      byteNumbers[i] = bytesArr.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  const playAudio = (audioData) => {
    const reader = new FileReader();
    reader.onload = function() {
      const arrayBuffer = this.result;
      audioContextRef.current.decodeAudioData(arrayBuffer, playBuffer, errorHandler);
    };
    reader.readAsArrayBuffer(toBlob(audioData, 'audio/mpeg'));
  };

  function playBuffer(audioBuffer) {
    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBuffer;
    sourceRef.current.connect(audioContextRef.current.destination);
    sourceRef.current.start();

    sourceRef.current.onended = () => {
      isPlayingRef.current = false;
      playNextBuffer();
      console.log("Audio played successfully");
    };
  }

  function errorHandler(e) {
    console.error("Error decoding audio data: " + e.err);
    isPlayingRef.current = false;
  }
  

  const resetPlayer = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      console.log("sourceRef resetted.");
    }else{
      console.log("sourceRef not resetted it's seems undefined!");
    }

    if(queueRef.current){
    queueRef.current.clear();
    }
    queueRef.current = new Queue();
    isPlayingRef.current = false;
    console.log("Audio player resetted.");
  }

  const bufferAndPlayAudio = (base64Chunk) => {
    if(base64Chunk == undefined){
      console.log('base64Chunk input is undefined!');
      return;
    }

    queueRef.current.enqueue(base64Chunk);
    if (!audioBufferIsRunning.current) {
      audioBufferIsRunning.current = true;
      playNextBuffer();
    }
  };


  const getSlice = () => {
    let byteArray = [];
    let length = queueRef.current.length;
    var i = 0;
    for (i = 0; i < length; i++) {
      let d = queueRef.current.dequeue();
      var b = atob(d);
      byteArray = byteArray.concat(b);
    }

    if(i > 1){
      console.log('getSlice return a slice of ' + i + ' chunks.')
    }
    return btoa(byteArray);
  };


  const playNextBuffer=() =>{
    
    if(queueRef.current.isEmpty){
      audioBufferIsRunning.current = false;
      console.log("Speech done.")
      return;
    }

    isPlayingRef.current = true;
    console.log("isPlayingRef>>: " + isPlayingRef.current)
    var buffer = getSlice();
    //var buffer = queueRef.current.dequeue();
    //console.log("buffer to play: " + buffer)
    playAudio(buffer);
  }

  const testQueue = () => {
    console.log("=== Current Queue Content ===");
    console.log("Queue:", queueRef.current.queue);
    console.log("Queue Size:", queueRef.current.length);
    console.log("=============================");
  };

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
        try {
          bufferAndPlayAudio(audioChunk);
        } catch (error) {
          console.log(error);
        }
      });

      connection.on("StopSpeaking", () => {
        resetPlayer();
        console.log("Received stop speaking request");
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
    resetPlayer();
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
    resetPlayer();
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

