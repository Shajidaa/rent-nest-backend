RentNest 🏠

"Find & List Rental Properties with Ease"

RentNest is a high-performance, scalable backend API designed to facilitate a seamless rental marketplace. By decoupling the rental lifecycle—from listing discovery to payment verification—RentNest provides a robust architecture for Tenants, Landlords, and Administrators.

## System Architecture🛠 Tech StackCore:

Node.js,
TypeScript,
Express.jsDatabase: PostgreSQL with Prisma ORMSecurity: JWT-based authentication,
bcrypt for password hashingPayments: Stripe secure Webhook
integrationDeployment: Managed via Render

git clone
cd rent-nest-backend

# Install dependencies

npm install

# Setup environment variables

cp .env.example .env

# Edit .env with your credentials (see Configuration below)

DATABASE_URL=YOUR_CONNECTION_STRING_HERE

BCRYPT_SALT_ROUNDS=YOUR_BCRYPT_SALT_ROUNDS

JWT_ACCESS_SECRET=YOUR_JWT_ACCESS_SECRET
JWT_REFRESH_SECRET= YOUR_JWT_REFRESH_SECRET

JWT_ACCESS_EXPIRES_IN= YOUR_JWT_ACCESS_EXPIRES_IN

JWT_REFRESH_EXPIRES_IN=YOUR_JWT_REFRESH_EXPIRES_IN
COOKIE_REFRESH_MAX_AGE=YOUR_COOKIE_REFRESH_MAX_AGE

STRIPE_PRODUCT_ID=YOUR_STRIPE_PRODUCT_ID
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
FRONTEND_URL=YOUR_FRONTEND_URL
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Initialize Database

npx prisma generate
npx prisma db push

# package.json

{
"name": "rent-nest-backend",
"version": "1.0.0",
"description": "",
"license": "ISC",
"author": "",
"type": "module",
"main": "index.js",
"scripts": {
"dev": "tsx watch src/server.ts",
"build": "tsup",
"start": "node dist/server.js",
"prisma:generate": "prisma generate",
"stripe:webhook": "stripe listen --forward-to localhost:5000/api/payments/confirm",
"test": "echo \"Error: no test specified\" && exit 1"
},
"devDependencies": {
"@types/bcrypt": "^6.0.0",
"@types/cookie-parser": "^1.4.10",
"@types/cors": "^2.8.19",
"@types/express": "^5.0.6",
"@types/jsonwebtoken": "^9.0.10",
"@types/node": "^26.1.0",
"@types/pg": "^8.20.0",
"prisma": "^7.8.0",
"tsup": "^8.5.1",
"tsx": "^4.23.0",
"typescript": "^6.0.3"
},
"dependencies": {
"@prisma/adapter-pg": "^7.8.0",
"@prisma/client": "^7.8.0",
"bcrypt": "^6.0.0",
"cookie-parser": "^1.4.7",
"cors": "^2.8.6",
"dotenv": "^17.4.2",
"express": "^5.2.1",
"http-status": "^2.1.0",
"jsonwebtoken": "^9.0.3",
"pg": "^8.22.0",
"stripe": "^22.3.1"
}
}
