import React, {useEffect, useRef, useState} from 'react'
import {StyleSheet} from "react-native";
import {Svg} from "../../../assets/icons";
import {
    ButtonContainer,
    ButtonIcon,
    ButtonIconDisable,
    ButtonIconSend,
    Footer,
    From,
    Header,
    MainContainer,
    MessagesArea,
    MessageText,
    MyMessage,
    OtherMessage,
    RowContainer,
    StyledTextInput,
    TextInputArea,
    Title,
    Window
} from "./styled";
import {RTCView} from "react-native-webrtc";

export const CallWindow = ({
                               remoteSrc,
                               localSrc,
                               config,
                               mediaDevice,
                               finishCall,
                               chat,
                               onNewMessage
                           }) => {
    const remoteVideo = useRef()
    const localVideo = useRef()
    const localVideoSize = useRef()
    const [audio, setAudio] = useState(config?.audio)
    const [newMessage, setNewMessage] = useState('');
    const [from, setFrom] = useState('');
    chat = [
        {
            from: 'me',
            text: "Hello from Chat!"
        },
        {
            from: 'Nikita',
            text: "Zdarova hohly"
        },
        {
            from: 'me',
            text: "ZOV Peremoga"
        },
        {
            from: 'Vlad',
            text: "卐卐卐卐卐卐卐"
        },
    ]

    useEffect(() => {
        if (remoteVideo.current && remoteSrc) {
            remoteVideo.current.srcObject = remoteSrc
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc
        }
    }, [remoteSrc, localSrc])

    useEffect(() => {
        if (mediaDevice) {
            //mediaDevice.toggle('Video', video)
            mediaDevice.toggle('Audio', audio)
        }
    }, [mediaDevice])

    const toggleMediaDevice = (deviceType) => {
        if (deviceType === 'audio') {
            setAudio(!audio)
            mediaDevice.toggle('Audio')
        }
    }

    const onHandleChange = (newText) => {
        setNewMessage(newText);
    }

    const onHandleSend = (e) => {
        console.log('[INFO] onHandleSend: ', newMessage)
        onNewMessage({from, text: newMessage});
    }

    return (

        <Window>
            <MainContainer>
                <Header>
                    <RTCView streamURL={remoteSrc.toURL()}/>
                    <RowContainer>
                        <Title style={{color: 'white'}}>CHAT</Title>
                        <Svg.ConnectionP2P fill={'#fff'}/>
                    </RowContainer>
                    <ButtonContainer>
                        <ButtonIcon
                            className={audio ? '' : 'reject'}
                            onClick={() => toggleMediaDevice('audio')}
                        >
                            <Svg.Smartphone fill={'#fff'}/>
                        </ButtonIcon>
                        <ButtonIconDisable className='reject' onClick={() => finishCall(true)}>
                            <Svg.PhoneDisable fill={'#fff'}/>
                        </ButtonIconDisable>
                    </ButtonContainer>
                </Header>

                <MessagesArea>
                    {chat.map(message => {
                        return (
                            message.from === 'me' ?
                                <MyMessage key={Math.random() * 1000}>
                                    <MessageText>{message.text}</MessageText>
                                </MyMessage>
                                :
                                <OtherMessage key={Math.random() * 1000}>
                                    <From>{message.from}</From>
                                    <MessageText>{message.text}</MessageText>
                                </OtherMessage>
                        )
                    })}
                </MessagesArea>

                <Footer>
                    {/*<StyledTextInput type="text" placeholder="From"*/}
                    {/*                 onChangeText={newText => setFrom(newText)}/>*/}
                    <TextInputArea>
                        <RowContainer>
                            <StyledTextInput type="text" placeholder="Message..."
                                             placeholderTextColor={'rgba(255, 255, 255, 0.35)'}
                                             onChangeText={onHandleChange}/>
                            <ButtonIconSend style={{borderRadius: 13}} onClick={onHandleSend}>
                                <Svg.Send fill={'#fff'}/>
                            </ButtonIconSend>
                        </RowContainer>
                    </TextInputArea>
                </Footer>

            </MainContainer>
        </Window>
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
    }
});