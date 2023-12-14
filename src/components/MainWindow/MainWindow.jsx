import React, { useEffect, useRef, useState } from 'react'

import socket from '../../utils/socket'

import { Clipboard, Keyboard, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    MainWindowButtonIcon,
    MainWindowButtonText,
    MainWindowError,
    MainWindowLocalId,
    MainWindowLocalIdText,
    MainWindowRemoteId,
    MainWindowTextInput,
    MainWindowTitle,
    MainWindowView
} from "./styled";
import { Svg } from "../../../assets/icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import Clipboard from "@react-native-clipboard/clipboard";

export const MainWindow = ({ startCall, setNickname }) => {
    const [remoteId, setRemoteId] = useState('')
    const [localId, setLocalId] = useState('')
    const [localIdShow, setLocalIdShow] = useState(false)
    const [error, setError] = useState('')
    const scroll = useRef()

    useEffect(() => {
        console.log('useEffect');
        socket
            .on('init', ({ id }) => {
                setLocalId(id)
            })
            .emit('init')
    }, [])

    const callWithVideo = (video) => {
        if (!remoteId.trim() || remoteId.length < 5) {
            return setError('Friend id is not valid');
        }

        if (localId === remoteId) {
            return setError("You can't call to self!");
        }

        const config = { audio: true, video: false }
        startCall(true, remoteId, config)
    }

    const onLocalIdPress = () => {
        Clipboard.setString(localId);
        setLocalIdShow(!localIdShow)
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={{flex: 1, top: 200}} extraHeight={125}>
            <MainWindowView style={{flex: 1}}>
                <View style={{ position: 'absolute', top: 0, right: 0 }}>
                </View>
                <MainWindowLocalId>
                    <MainWindowTitle>Your ID is</MainWindowTitle>
                    {
                        localIdShow
                            ? <TouchableOpacity onPress={onLocalIdPress} on>
                                <MainWindowLocalIdText style={styles.localIdUnderline}>{localId}</MainWindowLocalIdText>
                            </TouchableOpacity>
                            :
                            <MainWindowButtonText onPress={() => setLocalIdShow(!localIdShow)}>
                                <Text style={{ color: "#f1f1f1", fontSize: 16, fontWeight: "bold" }}>Show</Text>
                            </MainWindowButtonText>
                    }
                </MainWindowLocalId>
                <MainWindowRemoteId>
                    <Text style={{ fontSize: 18, color: '#000' }}>Your friend ID</Text>
                    <MainWindowTextInput
                        type='text'
                        spellCheck={false}
                        autoCorrect={false}
                        placeholder='Enter friend ID'
                        maxLength={5}
                        onChangeText={(newText) => {
                            setError('')
                            setRemoteId(newText)
                        }}
                    />
                    <MainWindowTextInput
                        type='text'
                        spellCheck={true}
                        placeholder='Enter your nickname'
                        onChangeText={newText => {
                            setNickname(newText)
                        }}
                    />
                    <MainWindowError>{error}</MainWindowError>
                    <View>
                        <MainWindowButtonIcon style={styles.buttonShadow} onPress={() => callWithVideo(false)} title={''}>
                            <Svg.Smartphone fill={'#e0e0e0'} />
                        </MainWindowButtonIcon>
                    </View>
                </MainWindowRemoteId>
            </MainWindowView>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    buttonShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 3,
    },
    localIdUnderline: {
        borderStyle: 'dashed',
        borderBottomColor: '#000',
        borderBottomWidth: 1,
    }
})