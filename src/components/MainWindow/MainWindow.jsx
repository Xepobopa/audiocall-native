import React, {useEffect, useState} from 'react'

import socket from '../../utils/socket'

import {Clipboard, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {
    MainWindowButtonIcon, MainWindowError,
    MainWindowLocalId,
    MainWindowLocalIdText,
    MainWindowRemoteId,
    MainWindowTextInput,
    MainWindowTitle,
    MainWindowView
} from "./styled";
import {Svg} from "../../../assets/icons";
// import Clipboard from "@react-native-clipboard/clipboard";

export const MainWindow = ({startCall}) => {
    const [localId, setLocalId] = useState('')
    const [remoteId, setRemoteId] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        console.log('useEffect');
        socket
            .on('init', ({id}) => {
                console.log("[EVENT] INIT, id: ", id);
                setLocalId(id)
            })
            .emit('init')
    }, [])

    const  callWithVideo = (video) => {
        console.log('callback')
        if (!remoteId.trim() || remoteId.length < 5) {
            return setError('Friend id is not valid');
        }
        const config = {audio: true, video}
        startCall(true, remoteId, config)
    }

    const copyToClipboard = () => {
        Clipboard.setString(localId);
    };

    return (
        <MainWindowView>
            <MainWindowLocalId>
                <MainWindowTitle>Your ID is</MainWindowTitle>
                <TouchableOpacity onPress={copyToClipboard} on>
                    <MainWindowLocalIdText style={styles.localIdUnderline}>{localId}</MainWindowLocalIdText>
                </TouchableOpacity>
            </MainWindowLocalId>
            <MainWindowRemoteId>
                <Text style={{fontSize: 18, color: '#000'}}>Your friend ID</Text>
                <MainWindowTextInput
                    type='text'
                    spellCheck={false}
                    placeholder='Enter friend ID'
                    style={styles.inputUnderline}
                    maxLength={5}
                    onChangeText={(newText) => {
                        setError('')
                        setRemoteId(newText)
                    }}
                />
                <MainWindowError>{error}</MainWindowError>
                <View>
                    <MainWindowButtonIcon style={styles.buttonShadow} onPress={() => callWithVideo(false)} title={''}>
                        <Svg.Smartphone fill={'#e0e0e0'}/>
                    </MainWindowButtonIcon>
                </View>
            </MainWindowRemoteId>
        </MainWindowView>
    )
}

const styles = StyleSheet.create({
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
    inputUnderline: {
        borderBottomColor: '#000',
        borderBottomWidth: 1,
    },
    localIdUnderline: {
        borderStyle: 'dashed',
        borderBottomColor: '#000',
        borderBottomWidth: 1,
    }
})