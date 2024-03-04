import React, { useState } from "react";
import RectangleButton from "./RectangleButton";
import CallDialog from "./CallDialog";

const CallMenu = () => {
    const [callDialogVisible, setCallDialogVisible] = useState(false);

    const callStarted = () => {
        console.log('callStarted');
        setCallDialogVisible(true);
    }

    const onCloseDialog = () => {
        setCallDialogVisible(false);
    }

    return (
        <div>
            {callDialogVisible && <CallDialog onClose={onCloseDialog} />} {/* Render CallDialog if callDialogVisible is true */}
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
                        onCallStarted={callStarted}
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
                        onCallStarted={callStarted}
                    />
                </div>
            </div>
            <br />
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
                        onCallStarted={callStarted}
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
                        onCallStarted={callStarted}
                    />
                </div>
            </div>
        </div>
    );
};

export default CallMenu;
