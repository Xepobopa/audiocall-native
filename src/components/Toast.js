import React from 'react';
import {TouchableOpacity, View} from "react-native";

const Toast = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => Toast.info('Lorem ipsum info', 'bottom')}
                style={styles.buttonStyle}
            >
                <Text>SHOW SOME AWESOMENESS!</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonStyle: {
        marginTop: 10,
        backgroundColor: 'white',
        borderColor: 'green',
        borderWidth: 2,
        padding: 10,
    },
})

export default Toast;