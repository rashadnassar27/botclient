import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import axios from "axios";
import Cookie from "universal-cookie";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";

export async function azureRecgnizeStart(connection) {
  const tokenObj = await getSpeechToken();
  const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
    tokenObj.authToken,
    tokenObj.region
  );
  speechConfig.speechRecognitionLanguage = "he-IL";

  const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

  console.log("Speak into your microphone...");

  recognizer.startContinuousRecognitionAsync();

  recognizer.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
  };

  recognizer.recognized = (s, e) => {
    try {
      const result = e.result;
      console.log(`RECOGNIZED: Text=${result.text}`);
      if(connection == null || connection == undefined){
        console.error("connection is undefined in azure stt.");
        return;
      }
      connection.send("OnSpeechRecgnized", result.text);
    } catch (error) {
      console.error(error);
    }
  };

  recognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);
  };
}

async function getSpeechToken() {
  const speechKey = "e719cdc5e04e444ca769dd50f1ee05f5";
  const speechRegion = "eastus";
  if (
    speechKey === "paste-your-speech-key-here" ||
    speechRegion === "paste-your-speech-region-here"
  ) {
    throw new Error(
      "You forgot to add your speech key or region to the .env file."
    );
  }

  const headers = {
    headers: {
      "Ocp-Apim-Subscription-Key": speechKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const tokenResponse = await axios.post(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      headers
    );
    return { authToken: tokenResponse.data, region: speechRegion };
  } catch (err) {
    throw new Error("There was an error authorizing your speech key.");
  }
}

export async function getTokenOrRefresh() {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined) {
    try {
      const res = await axios.get("/api/get-speech-token");
      const token = res.data.token;
      const region = res.data.region;
      cookie.set("speech-token", region + ":" + token, {
        maxAge: 540,
        path: "/",
      });

      console.log("Token fetched from back-end: " + token);
      return { authToken: token, region: region };
    } catch (err) {
      console.log(err.response.data);
      return { authToken: null, error: err.response.data };
    }
  } else {
    console.log("Token fetched from cookie: " + speechToken);
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
