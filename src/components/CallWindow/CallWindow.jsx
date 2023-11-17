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
import randNickname from "../../utils/randNickname";

export const CallWindow = ({
                               remoteSrc,
                               localSrc,
                               config,
                               mediaDevice,
                               finishCall,
                               chat,
                               onNewMessage,
                               nickname
                           }) => {
    const remoteVideo = useRef()
    const localVideo = useRef()
    const localVideoSize = useRef()
    const [audio, setAudio] = useState(config?.audio)
    const [newMessage, setNewMessage] = useState('');

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
        setNewMessage('');
        console.log('[INFO] send new Message: ', {from: nickname, text: newMessage})
        onNewMessage({from: nickname, text: newMessage});
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
                            onPress={() => toggleMediaDevice('audio')}
                        >
                            <Svg.Smartphone fill={'#fff'}/>
                        </ButtonIcon>
                        <ButtonIconDisable className='reject' onPress={() => finishCall(true)}>
                            <Svg.PhoneDisable fill={'#fff'}/>
                        </ButtonIconDisable>
                    </ButtonContainer>
                </Header>

                <MessagesArea>
                    {chat.map(message => {
                        return (
                            message.from === nickname ?
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
                    <TextInputArea>
                        <RowContainer>
                            <StyledTextInput type="text" placeholder="Message..."
                                             placeholderTextColor={'rgba(255, 255, 255, 0.35)'}
                                             onChangeText={onHandleChange}
                                             value={newMessage}/>
                            <ButtonIconSend style={{borderRadius: 13}} onPress={onHandleSend}>
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