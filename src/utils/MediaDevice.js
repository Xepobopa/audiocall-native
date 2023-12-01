import Emitter from './Emitter'
import {mediaDevices} from "react-native-webrtc";

class MediaDevice extends Emitter {
    start() {
        mediaDevices
            .getUserMedia({
                audio: true,
                video: false
            })
            .then((stream) => {

                this.stream = stream
                this.emit('stream', stream)
            })
            .catch(console.error)

        console.log('[INFO] start media devices');

        return this
    }

    toggle(type, on) {
        if (this.stream) {
            this.stream[`get${type}Tracks`]().forEach((t) => {
                t.enabled = on ? on : !t.enabled
            })
        }

        return this
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach((t) => {
                t.stop()
            })
        }
        this.off()
        console.log('[INFO] stop');
        return this
    }
}

export default MediaDevice