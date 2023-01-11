# Adventure Tour Web Application

### [Live App Demo](https://adventure.up.railway.app/)

### [Authentication Server Repo](https://github.com/yashgupta1299/Central-Authentication.git)

### [Resource Server Repo](https://github.com/yashgupta1299/Adventure-Resources.git)

<hr />

### A Adventure Tour booking website with the following Techstack

> -   NodeJS and ExpressJS
> -   MongoDB and Mongoose
> -   PUG JavaScript and CSS

### Models and Architecture of the Web App

> -   Utilized Node, Express, and Mongoose to construct the REST API.
> -   PUG is the view engine on this server-side rendered website.
> -   Additionally, WebApp uses the Model-View-Controller (MVC) architecture.
> -   Central authentication system for resources, which is based on public-private key verification.

### Modules and methods used for Security purposes

```javascript
const jwt = require('jsonwebtoken');
const rsaPemToJwk = require('rsa-pem-to-jwk');
const jwksClient = require('jwks-rsa');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
```

> -   JWTs or JSON Web Tokens are used to identify authenticated users with expiration times.
> -   Generated JSON Web Key Set with openssl for authenticating a user with asymmetric keys.
> -   Refresh tokens are implemented with 4096-bit and access tokens with 2048-bit encryption
> -   Implemented Google OAuth 2.0 to verify user identity on signup and forgot password routes.
> -   BCrypt Algorithm is used to hash and salt passwords securely before saving them in a database.
> -   Cross-Origin Resource Sharing (CORS) is used which is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.
> -   Rate limiting prevents the same IP address from making too many requests which will help us prevent attacks like brute force.
> -   Mongo Sanitize is used which sanitizes user-supplied data to prevent MongoDB Operator Injection.
> -   XSS module prevents Cross-site scripting (XSS) attacks.
> -   hpp module used to prevent HTTP Parameter Pollution (HPP).
> -   Helmet helps you secure your Express.js apps by setting various HTTP headers.
> -   A complete and secure payment system is implemented with Stripe webhooks.

### Features of the Web App

> -   Email facility after successful signup for uploading user photos and collecting user data with SendGrid and nodemailer.
> -   User can book a tour with real-time payments with a credit or debit card.
> -   Admin can perform create, edit and delete operations for a tour, review, booking, or a user.
> -   Compression of data and user photos implemented using multer.
> -   The user can create, edit and delete a review for a tour that was purchased by him.
> -   The user can update his profile settings including passwords.
> -   The user can keep a track of all his reviews and bookings of a tour.
