import Emitter from './Emitter'
import MediaDevice from './MediaDevice'
import socket from './socket'
import {RTCIceCandidate, RTCPeerConnection, RTCSessionDescription} from 'react-native-webrtc'

const CONFIG = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: "turn:relay1.expressturn.com:3478",
            username: "ef238ZHYV5YA3ND0H2",
            credential: "GpyIpSclVoKFLzgs"
        },
    ]
}

class PeerConnection extends Emitter {
    constructor(remoteId, security) {
        super()
        this.remoteId = remoteId
        this.security = security;

        this.pc = new RTCPeerConnection(CONFIG)
        this.pc.onicecandidate = ({candidate}) => {
            socket.emit('call', {
                to: this.remoteId,
                candidate
            })
        }
        this.pc.ontrack = ({streams}) => {
            this.emit('remoteStream', streams[0])
        }

        this.mediaDevice = new MediaDevice();
        this.getDescription = this.getDescription.bind(this)
    }

    start(isCaller, config) {
        this.createChannel();
        this.mediaDevice
            .on('stream', (stream) => {
                stream.getTracks().forEach((t) => {
                    this.pc.addTrack(t, stream)
                })

                this.emit('localStream', stream)

                isCaller
                    ? socket.emit('request', {to: this.remoteId})
                    : this.createOffer()
            })
            .start(config)

        return this
    }

    stop(isCaller) {
        if (isCaller) {
            socket.emit('end', {to: this.remoteId})
        }

        this.mediaDevice.stop()

        try{
            this.pc?.restartIce()
            this.pc?.close();
        } catch (e) {
            console.error(e)
        }
        this.pc = null;
        this.off()

        return this
    }

    createOffer() {
        this.pc.createOffer().then(this.getDescription).catch(console.error)

        return this
    }

    createAnswer() {
        try{
            this.pc.createAnswer().then(this.getDescription).catch(console.error)
        } catch (e) {
            console.log(e)
        }

        return this
    }

    async getDescription(desc) {
        await this.pc.setLocalDescription(desc)

        socket.emit('call', {to: this.remoteId, sdp: desc})

        return this
    }

    createChannel() {
        console.log('[INFO] create channel');
        try {
            this.channel = this.pc.createDataChannel('channel');
            this.channel.onclose = () => {
                console.log('[CLOSE] DataChannel')
            }
        } catch (e) {
            console.error('[ERROR Fail to create a data channel: ', e)
        }
    }

    listenMessages(cb) {
        this.pc.addEventListener('datachannel', event => {
            const channel = event.channel;
            channel.addEventListener('message', data => {
                cb(JSON.parse(this.security.decryptObject(data.data)));
            })
        })
    }

    sendMessage(message) {
        this.channel.send(this.security.encryptObject(JSON.stringify(message)));
    }

    async setRemoteDescription(desc) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(desc))
        } catch (e) {
            console.log(e)
        }

        return this
    }

    async addIceCandidate(candidate) {
        if (candidate) {
            try {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (e) {
                console.log('[ERROR] ', e);
            }
        }

        return this
    }
}

export default PeerConnection