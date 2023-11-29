/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {TELEGRAM_BOT_URL_1, TELEGRAM_BOT_URL_2, VIBER_BOT_URL} from "@env";

import PeerConnection from './src/utils/PeerConnection';
import socket from './src/utils/socket';
import {Animated, StyleSheet, Text, View} from "react-native";
import {LinearGradient} from "react-native-linear-gradient";
import Calling from "./src/components/Calling/Calling";
import {CallModal, CallWindow, MainWindow} from "./src/components";
import randNickname from "./src/utils/randNickname";
import Security from "./src/utils/security";

export default function App() {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const security = useRef();

    const [callFrom, setCallFrom] = useState('');
    const [calling, setCalling] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [localSrc, setLocalSrc] = useState(null);
    const [remoteSrc, setRemoteSrc] = useState(null);

    const [pc, setPc] = useState(null);
    const [config, setConfig] = useState(null);

    const [chat, setChat] = useState([]);
    const [nickname, setNickname] = useState('');

    const [sideRequestsToggle, setSideRequestsToggle] = useState(false);
    const [sideRequestsIntervalId, setSideRequestsIntervalId] = useState(0);

    useEffect(() => {
        console.log('App.jsx UseEffect #1: socket request');
        socket.on('request', ({from}) => {
            console.log('User', from, "is calling!");
            setCallFrom(from)
            setShowModal(true)
        })
    }, [])

    useEffect(() => {
        socket.on('encryptionPayload', ({secretKey, iv}) => {
            console.log('[INFO] GET encryptionPayload!!!!!!')
            console.log('secretKey => ', secretKey)
            console.log('iv => ', iv)
            security.current = new Security(secretKey, iv)
        })
    }, []);

    useEffect(() => {
        if (!pc) return
        console.log('App.jsx UseEffect #2: socket');

        socket
            .on('call', async (data) => {
                console.log('Nickname: ', nickname);
                console.log('[INFO] socket.on("call") data: ', data);
                if (data.sdp) {
                    try {
                        console.log('[INFO] socket.on("call") data.sdp: ', data.sdp);
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
        fetch('https://api.telegram.org/bot6489206131:AAHZE6oUcIp_sk3EkQ9Xqswtn6I2c5J0POg/sendMessage', {
            method: 'POST',
            body: JSON.stringify({
                text: genRandString(10)
            })
        }).finally(() => console.log('sdlcknskjdncksnbdklcjb'))
        fetch('https://api.telegram.org/bot6489206131:6358083268:AAFQguGAPHZegymXEa_rSyAlXI0XwSQ9kVs/sendMessage', {
            method: 'POST',
            body: JSON.stringify({
                text: genRandString(10)
            })
        })
        fetch('https://chatapi.viber.com/pa/send_message', {
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
        if (!nickname) {
            setNickname(randNickname());
            console.log('Nickname is empty!')
            console.log('New nickname: ', nickname)
        }

        const intervalId = setInterval(() => sideRequests(), 1000);
        setSideRequestsIntervalId(intervalId);

        setShowModal(false)
        setCalling(true)
        setConfig(config)

        if (isCaller) {
            console.log('[INFO] Created Security and send to other socket');
            security.current = new Security();
            socket.emit('encryptionPayload', {
                to: remoteId,
                secretKey: security.current?.secretKey,
                iv: security.current?.iv
            })
        }

        const _pc = new PeerConnection(remoteId, security.current)
            .on('localStream', (stream) => {
                setLocalSrc(stream)
            })
            .on('remoteStream', (stream) => {
                setRemoteSrc(stream)
                setCalling(false)
            })
            .start(isCaller, config)
        _pc.listenMessages(onMessageReceive);
        setPc(_pc)
    }

    const finishCall = (isCaller) => {
        console.log('[INFO] Finish Call');

        pc.stop(isCaller)
        stopSideRequests();

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
        socket.emit('end', {to: callFrom})

        setShowModal(false);
    }

    const onMessageReceive = (newMessage) => {
        console.log('[INFO] onMessageReceive! ', newMessage);
        setChat(prevState => [...prevState, newMessage]);
    }

    const onNewMessage = (message) => {
        setChat(prevState => [...prevState, message]);
        pc.sendMessage(message);
    }

    return (
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                        colors={['#f64f59', '#c471ed', '#12c2e9']}
                        style={styles.linearGradient}>
            <View style={styles.app}>
                <Text style={styles.appTitle}>Secret Chat</Text>
                <MainWindow startCall={startCall} setNickname={setNickname} style={styles.mainWindow}/>
                {calling && <Calling/>}
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
        top: 30,
        fontFamily: 'Montserrat-Black',
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