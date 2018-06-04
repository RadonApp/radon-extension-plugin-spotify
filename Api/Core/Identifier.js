import IsFunction from 'lodash-es/isFunction';


const characters = '0123456789abcdefghijklmnopqrstuvwxyz';

function hasCrypto() {
    return (
        IsFunction(window.Uint8Array) &&
        IsFunction(window.crypto) &&
        IsFunction(window.crypto.getRandomValues)
    );
}

function toHex(buf, size) {
    let scale = 255 / characters.length;
    let result = '';

    for(let i = 0; i < size; i++) {
        result += characters.charAt(Math.floor(buf[i] / scale));
    }

    return result;
}

function generateCrypto(size) {
    let buf = new Uint8Array(size);

    // Generate random values
    window.crypto.getRandomValues(buf);

    // Convert to hex string
    return toHex(buf, size);
}

function generateRandom(size) {
    let buf = new Array(size);

    // Generate random values
    for(let i = buf.length; i--;) {
        buf[i] = Math.floor(Math.random() * 255);
    }

    // Convert to hex string
    return toHex(buf, size);
}

export function generate(size) {
    if(hasCrypto()) {
        return generateCrypto(size);
    }

    return generateRandom(size);
}

export default {
    generate
};
