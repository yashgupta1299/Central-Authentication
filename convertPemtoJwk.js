const fs = require('fs');
const { promisify } = require('util');
const rsaPemToJwk = require('rsa-pem-to-jwk');

(async () => {
    try {
        const PRIVATEKEY = await promisify(fs.readFile)(
            `${__dirname}/certs/private.pem`
        );
        // intantion is sig means signature select only public
        // to extract public key from private key
        const jwk = rsaPemToJwk(
            PRIVATEKEY,
            { use: 'sig', kid: 'abcdef' },
            'public'
        );
        console.log({ keys: [jwk] });
    } catch (err) {
        console.log('error 🔥🔥', err);
    }
})();
