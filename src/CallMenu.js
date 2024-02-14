import React from "react";
import RectangleButton from "./RectangleButton";

const CallMenu = () => {
  return (
    <div>
<div style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{ marginRight: '10px' }}>
      <RectangleButton
        customer="ePaper"
        lang="he-IL"
        voice="he-IL-Wavenet-B"
        sttprovider="azure"
        ttsprovider="google"
        aiProvider="AzureOpenAi"
        bgcolor="#0056b3"
      />
    </div>
    <div>
      <RectangleButton
        customer="ePaper"
        lang="en-US"
        voice="en-US-Journey-F"
        sttprovider="google"
        ttsprovider="google"
        aiProvider="AzureOpenAi"
        bgcolor="red"
      />
    </div>
   
  </div>
  <br/>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{ marginRight: '10px' }}>
      <RectangleButton
        customer="Pizza"
        lang="he-IL"
        voice="he-IL-HilaNeural"
        sttprovider="azure"
        ttsprovider="azure"
        aiProvider="AzureOpenAi"
        bgcolor="green"
      />
    </div>
    <div>
      <RectangleButton
        customer="Pizza"
        lang="en-GB"
        voice="en-GB-Neural2-A"
        sttprovider="google"
        ttsprovider="google"
        aiProvider="AzureOpenAi"
        bgcolor="purple"
      />
    </div>
  </div>
  </div>
  );
};

export default CallMenu;
