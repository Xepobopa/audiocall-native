/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useRef, useState } from 'react';
import { TELEGRAM_BOT_URL_1, TELEGRAM_BOT_URL_2, VIBER_BOT_URL, REQUEST_TIMEOUT_MS, TRANSFER_CRYPTO_PAYLOAD_KEY, TRANSFER_CRYPTO_PAYLOAD_IV } from "@env";

import PeerConnection from './src/utils/PeerConnection';
import socket from './src/utils/socket';
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import Calling from "./src/components/Calling/Calling";
import { CallModal, CallWindow, MainWindow } from "./src/components";
import randNickname from "./src/utils/randNickname";
import Security from "./src/utils/security";

export default function App() {
    const security = useRef();

    const [error, setError] = useState();

    const [connection, setConnection] = useState(false);

    const [callFrom, setCallFrom] = useState('');
    const [calling, setCalling] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [localSrc, setLocalSrc] = useState(null);
    const [remoteSrc, setRemoteSrc] = useState(null);

    const [pc, setPc] = useState(null);
    const [config, setConfig] = useState(null);

    const [chat, setChat] = useState([]);
    const [nickname, setNickname] = useState('');

    const [sideRequestsIntervalId, setSideRequestsIntervalId] = useState(0);

    useEffect(() => {
        console.log('App.jsx UseEffect #1: socket request');
        socket.on('request', ({ from }) => {
            setCallFrom(from)
            setShowModal(true)
            setTimeout(() => {
                if (!calling) {
                    setCallFrom(null)
                    setShowModal(false);
                }
            }, +REQUEST_TIMEOUT_MS)
        })
    }, [])

    useEffect(() => {
        // socket.on('encryptionPayload', (data) => {
        //     const bytes = crypto.AES.decrypt(data, TRANSFER_CRYPTO_PAYLOAD_KEY, { iv: TRANSFER_CRYPTO_PAYLOAD_IV });
        //     const payload = bytes.toString(crypto.enc.Utf8);
        //     security.current = new Security(payload?.secretKey, payload?.iv)
        socket.on('encryptionPayload', ({ secretKey, iv }) => {
            security.current = new Security(secretKey, iv)
        })
    });

    useEffect(() => {
        if (!pc) return
        console.log('App.jsx UseEffect #2: socket');

        socket
            .on('call', async (data) => {
                if (data.sdp) {
                    try {
                        await pc.setRemoteDescription(data.sdp)
                    } catch (e) {
                        console.error('[ERROR]  -  ', e);
                    }


                    if (data.sdp.type === 'offer') {
                        pc.createAnswer()
                    }
                } else {
                    await pc.addIceCandidate(data.candidate)
                }
            })
            .on('end', () => finishCall(false))
    }, [pc])

    const genRandString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        while (result.length < length) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const sideRequests = async () => {
        fetch(TELEGRAM_BOT_URL_1, {
            method: 'POST',
            body: JSON.stringify({
                text: genRandString(10)
            })
        })
        fetch(TELEGRAM_BOT_URL_2, {
            method: 'POST',
            body: JSON.stringify({
                text: genRandString(10)
            })
        })
        fetch(VIBER_BOT_URL, {
            method: 'POST',
            body: {
                receiver: "01234567890A=",
                min_api_version: 1,
                sender: {
                    name: "John McClane",
                    avatar: "https://avatar.example.com"
                },
                tracking_data: "tracking data",
                type: "text",
                text: "Hello world!"
            }
        })
    }

    const stopSideRequests = () => {
        clearInterval(sideRequestsIntervalId);
    }

    const startCall = (isCaller, remoteId, config) => {
        setTimeout(() => {
            if (!connection) {
                setCalling(false);
            }
        }, +REQUEST_TIMEOUT_MS)

        if (!nickname) {
            setNickname(randNickname());
            console.log('Nickname is empty!')
        }

        const intervalId = setInterval(() => sideRequests(), 1000);
        setSideRequestsIntervalId(intervalId);

        setError(null);
        setShowModal(false)
        setCalling(true)
        setConfig(config)

        if (isCaller) {
            security.current = new Security();
            const payload = {
                to: remoteId,
                secretKey: security.current?.secretKey,
                iv: security.current?.iv
            }
            socket.emit(
                'encryptionPayload',
                payload
                // crypto.AES.encrypt((JSON.stringify(payload)), TRANSFER_CRYPTO_PAYLOAD_KEY, { iv: TRANSFER_CRYPTO_PAYLOAD_IV }).toString()
            )
        }

        const _pc = new PeerConnection(remoteId, security.current)
            .on('localStream', (stream) => {
                setLocalSrc(stream)
            })
            .on('remoteStream', (stream) => {
                setConnection(true);
                setRemoteSrc(stream)
                setCalling(false)
            })
            .start(isCaller, config)
        _pc.listenMessages(onMessageReceive);
        setPc(_pc)

        console.log('Request timeout => ', REQUEST_TIMEOUT_MS);

    }

    const finishCall = (isCaller) => {
        console.log('[INFO] Finish Call');

        pc.stop(isCaller)
        stopSideRequests();
        setConnection(false)

        security.current = null;

        setPc(null)
        setConfig(null)

        setCalling(false)
        setShowModal(false)

        setLocalSrc(null)
        setRemoteSrc(null)

        setChat([]);
    }

    const rejectCall = () => {
        socket.emit('end', { to: callFrom })

        setShowModal(false);
    }

    const onMessageReceive = (newMessage) => {
        setChat(prevState => [...prevState, newMessage]);
    }

    const onNewMessage = (message) => {
        setChat(prevState => [...prevState, message]);
        pc.sendMessage(message);
    }

    return (
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={['#f64f59', '#c471ed', '#12c2e9']}
            style={styles.linearGradient}>
            <View style={styles.app}>
                <Text style={styles.appTitle}>Secret Chat</Text>
                <Text style={styles.appError}>{error}</Text>
                <MainWindow startCall={startCall} setNickname={setNickname} style={styles.mainWindow} />
                {calling && <Calling />}
                {showModal && (
                    <CallModal
                        callFrom={callFrom}
                        startCall={startCall}
                        rejectCall={rejectCall}
                    />
                )}
                {remoteSrc && (
                    <CallWindow
                        localSrc={localSrc}
                        remoteSrc={remoteSrc}
                        config={config}
                        mediaDevice={pc?.mediaDevice}
                        finishCall={finishCall}
                        chat={chat}
                        onNewMessage={onNewMessage}
                        nickname={nickname}
                    />
                )}
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    fontFamily: 'Montserrat-Black',
    linearGradient: {
        flex: 1,
    },
    app: {
        flex: 1,
        color: "white",
        flexDirection: "column",
        display: "flex",
        justifyContent: 'center',
        alignItems: "center",
    },
    appTitle: {
        color: "black",
        fontSize: 35,
        position: 'absolute',
        top: 50,
        fontFamily: 'Montserrat-Black',
    },
    appError: {
        color: "#6e0b00",
        position: 'absolute',
        fontSize: 25,
        top: 100,
    },
    appButton: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 3,
    },
    mainWindow: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }
});
