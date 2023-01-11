### instruction to install

(uses "express-draft" module for initial setup start command: "exp .")

1.  for one private key unique public key exist. for unique private key and payload multiple different token exists.

2.  generate rsa private key with key length written at end you can choose (min standard 2048) but higher is better here
    "openssl genrsa -out ./certs/private.pem 4096"

3.  I can also generate public key from above generated private key
    "openssl rsa -in ./certs/private.pem -pubout -out ./certs/public.pem"

4.  I want to use rsa public key as json web ke set hence I will use 'rsa-pem-to-jwk' module
    run: "node convertPemtoJwk.js" then paste the output in public/.well-known/jwks.json

5.  Method to add private.pem file to .env file

    > -   Copy your content from your pem file to the browser's console (add ``):
    > -   `-----BEGIN RSA PRIVATE KEY-----

        Copy your content from your pem file to the browser's console (add ``):

    loremipsum...
    -----END RSA PRIVATE KEY-----`

    > -   Copy the log from the browser (notice \ns were added)
    > -   Add it to your env file (notice the ""):
    >     PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nloremipsum...\n-----END RSA PRIVATE KEY----"

6.  in cookie Secure inside .env epmty string for false non empty string for true
