import crypto from 'react-native-crypto-js';

export default class Security {
    constructor(secretKey, iv) {
        this.secretKey = secretKey ? secretKey : this.genRandString(32);
        this.iv = iv ? iv : this.genRandString(32);
    }

    genRandString(bytes = 128) {
        return crypto.lib.WordArray.random(bytes).toString()
    }

    encryptObject(payload) {
        return crypto.AES.encrypt(payload, this.secretKey, { iv: this.iv }).toString();
    }

    decryptObject(payload) {
        const bytes = crypto.AES.decrypt(payload, this.secretKey, { iv: this.iv });
        return bytes.toString(crypto.enc.Utf8);
    }
}