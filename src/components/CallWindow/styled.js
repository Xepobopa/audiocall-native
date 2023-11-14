import styled from "styled-components";
import {View, Text, TextInput, TouchableOpacity, ScrollView} from "react-native";

export const Window = styled(View)`
  flex: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  background-color: rgba(24,25,29,255);
`

export const MainContainer = styled(View)`
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
`

export const Header = styled(View)`
  padding: 15px 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(40,46,51,255);
`

export const ButtonIcon = styled(TouchableOpacity)`
  background-color: #0275d8;
  padding: 13px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px;
`

export const ButtonIconSend = styled(ButtonIcon)`
  background-color: #0275d8;
  padding: 8px;
  border-radius: 25px;
`

export const ButtonIconDisable = styled(ButtonIcon)`
  background-color: #d9534f;
`

export const Title = styled(Text)`
  padding: 10px 5px;
  text-align: center;
  font-size: 27px;
`

export const StyledTextInput = styled(TextInput)`
  flex: 1;
  color: whitesmoke;
  padding: 5px 15px;
  margin-left: 5px;
  font-size: 16px;
  border-radius: 17px;
  background-color: rgba(7,7,7,255);
`

export const RowContainer = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

export const ButtonContainer = styled(View)`
  right: 0;
  position: absolute;
  display: flex;
  flex-direction: row;
`

export const Footer = styled(View)`
  background-color: rgba(255, 255, 255, 0.05);
`

export const TextInputArea = styled(View)`
`

export const MessagesArea = styled(ScrollView)`
  margin: 0 10px;
  flex: 1
`

export const Message = styled(View)`
  background-color: rgba(42,47,51,255);
  padding: 5px 10px;
  margin: 5px 0;
  display: flex;
  flex-direction: column;
  max-width: 90%;
`

export const MyMessage = styled(Message)`
  align-items: flex-end;
  align-self: flex-end;
  background-color: rgba(255, 255, 255, 0.2);
`

export const OtherMessage = styled(Message)`
  align-items: flex-start;
  align-self: flex-start;
`

export const From = styled(Text)`
  color: #9f83f3;
  font-size: 16px;
`

export const MessageText = styled(Text)`
  color: whitesmoke;
  font-size: 16px;
`