/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';

import PeerConnection from './src/utils/PeerConnection';
import socket from './src/utils/socket';
import {Animated, StyleSheet, Text, View} from "react-native";
import {LinearGradient} from "react-native-linear-gradient";
import Calling from "./src/components/Calling/Calling";
import {CallModal, CallWindow, MainWindow} from "./src/components";
import randNickname from "./src/utils/randNickname";

export default function App() {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const [callFrom, setCallFrom] = useState('');
    const [calling, setCalling] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [localSrc, setLocalSrc] = useState(null);
    const [remoteSrc, setRemoteSrc] = useState(null);

    const [pc, setPc] = useState(null);
    const [config, setConfig] = useState(null);

    const [chat, setChat] = useState([]);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        console.log('App.jsx UseEffect #1: socket request');
        socket.on('request', ({from}) => {
            console.log('User', from, "is calling!");
            setCallFrom(from)
            setShowModal(true)
        })
    }, [])

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

    const startCall = (isCaller, remoteId, config) => {
        console.log('Nickname: ', nickname)
        if (!nickname){
            setNickname(randNickname());
            console.log('New nickname: ', nickname)
        }

        setShowModal(false)
        setCalling(true)
        setConfig(config)

        const _pc = new PeerConnection(remoteId)
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
        console.log('[INFO] onNewMessage: ', message);
        console.log('[INFO] setChat');
        setChat(prevState => [...prevState, message]);
        const stringMessage = JSON.stringify(message);
        console.log('[INFO] Send message: ', stringMessage);
        pc.sendMessage(stringMessage);
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
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        // backgroundColor: "rgba(255, 255, 255, 0.5)",
        // padding: "2rem 4rem",
        // borderRadius: 6,
        // boxShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
        // textAlign: "center"
    }
});