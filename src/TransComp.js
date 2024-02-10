import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";

const TransComp = () => {
  const statusRef = useRef(null);
  const transcriptRef = useRef(null);
  const socketRef = useRef(null);
  const audioCtx = useRef(null);
  const [hubConnection, setHubConnection] = useState(null);

  const createHubConnection = () => {
    return new Promise((resolve, reject) => {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:4000/callhub?customer=", {
          //.withUrl("https://www.gptagent24.com/callhub?customer=" + getCustomer(), {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .build();

      connection.on("SendAudioDataToClient", (audioChunk) => {
        console.log("Received audio chunk");
        try {
        } catch (error) {
          console.log(error);
        }
      });

      connection.on("StopSpeaking", () => {
        console.log("Received stop speaking request");
      });

      connection.on("SessionEnded", () => {
        console.log("EVENT: Received END session request");

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

  const startRecording = () => {
    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }

    let mediaRecorder;

    const dest = audioCtx.current.createMediaStreamDestination();

    Promise.all([
      navigator.mediaDevices.getUserMedia({ audio: true }),
 
    ])
      .then(([micStream]) => {
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
          alert("Browser not supported");
          return;
        }

        [micStream].forEach((str) => {
          const src = audioCtx.current.createMediaStreamSource(str);
          src.connect(dest);
        });

        mediaRecorder = new MediaRecorder(dest.stream, {
          mimeType: "audio/webm",
        });

        mediaRecorder.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0) {
                console.log('SendAudioDataToServer');
                const reader = new FileReader();
                reader.readAsDataURL(event.data);
                reader.onloadend = () => {
                  const base64AudioMessage = reader.result.split(",")[1];
                  hubConnection.send("SendAudioDataToServer", base64AudioMessage);
                };
            }
          });
          mediaRecorder.start(500); //sending blobs of data every 250ms
    
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    audioCtx.current = new AudioContext();
    createHubConnection()
    .then((newHubConnection) => {
      setHubConnection(newHubConnection);
      console.log("Recognition Started");
   
    })
    .catch((error) => {
      console.error("Error creating hub connection:", error);
    });
  }, []);

  useEffect(() => {
    return () => {

    };
  }, []);

  return (
    <div>
      <button onClick={startRecording}>Start</button>
      <div id="status" ref={statusRef} />
      <div id="transcript" ref={transcriptRef} />
    </div>
  );
};

export default TransComp;