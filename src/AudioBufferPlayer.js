import Queue from "./Queue.js";

class AudioBufferPlayer extends EventTarget {
  constructor() {
    super();
    this.audioContext = new AudioContext();
    this.queue = new Queue();
    this._isRunning = false;
    this.source = null;
  }

  get isRunning() {
    return this._isRunning;
  }

  set isRunning(value) {
    if (this._isRunning !== value) {
      this._isRunning = value;
      this.dispatchEvent(new Event('isRunningChanged'));
    }
  }

  toBlob(base64, contentType) {
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
  }

  playAudio(audioData) {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      if(this.audioContext == undefined){
        console.error("audioContext is undefined. operation cancelled.");
        return;
      }
      this.audioContext.decodeAudioData(arrayBuffer, (decodedData) => {
        this.playBuffer(decodedData); 
      }, function(error) {
        console.error("decodeAudioData error", error);
      });
    };
    reader.readAsArrayBuffer(this.toBlob(audioData, 'audio/mpeg'));
  }

  playBuffer(audioBuffer) {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.connect(this.audioContext.destination);
    this.source.start();

    this.source.onended = async () => {
      await new Promise(r => setTimeout(r, 200)); // some gap between sentences
      this.playNextBuffer();
      console.log("Audio buffer played successfully");
    };
  }

  reset(){
    if (this.source) {
      this.source.stop();
      this.source = null;
      console.log("source resetted.");
    }else{
      console.log("source not resetted it's seems undefined!");
    }

    if(this.queue){
      this.queue.clear();
    }
    this.queue = new Queue();
    this.isRunning = false;
    console.log("Audio player resetted.");
  }

  addBufferAndPlay(base64Chunk) {
    if(base64Chunk == undefined){
      console.log('base64Chunk input is undefined!');
      return;
    }

    this.queue.enqueue(base64Chunk);

    if (!this.isRunning) {
      console.log('Start a new audio sequence');
      this.isRunning = true;
      this.playNextBuffer();
    }
  }

  getSlice(){
    let byteArray = [];
    let length = this.queue.length;
    var i = 0;
    for (i = 0; i < length; i++) {
      let d = this.queue.dequeue();
      var b = atob(d);
      byteArray = byteArray.concat(b);
    }

    if(i > 1){
      console.log('getSlice return a slice of ' + i + ' chunks.')
    }
    return btoa(byteArray);
  }

  playNextBuffer(){
    if(this.queue.isEmpty){
      this.isRunning = false;
      console.log("Speech done.")
      return;
    }

    var buffer = this.getSlice();
    //var buffer = this.queue.dequeue();
    //console.log("buffer to play: " + buffer)
    this.playAudio(buffer);
  }
}

export default AudioBufferPlayer;
