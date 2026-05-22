PetAdopt Haven Server
Backend API server for the PetAdopt Haven pet adoption platform. It handles pet listings, adoption requests, owner listing management, request approval/rejection, JWT cookie support, and MongoDB data storage.

Live Links
Server API: https://pet-adoption-server-two-beryl.vercel.app
Pets API: https://pet-adoption-server-two-beryl.vercel.app/pets
Client Site: https://pet-adopt-client-xi.vercel.app
Purpose
This server powers a full-stack pet adoption platform where users can browse pets, submit adoption requests, and manage their requests. Pet owners can add pets, update listings, delete listings, and approve or reject adoption requests.

Features
REST API for pets and adoption requests.
MongoDB database integration.
Search pets by name using $regex.
Filter pets by species using $in.
Add, update, delete, and view pet listings.
Submit and cancel adoption requests.
Approve one request and mark other requests as rejected.
Mark approved pets as adopted.
JWT cookie generation and verification helper route.
CORS configured for local and deployed client URLs.
Vercel-ready Express deployment configuration.
Tech Stack
Node.js
Express.js
MongoDB
JSON Web Token
Cookie Parser
CORS
Dotenv
Vercel
NPM Packages
express
mongodb
cors
cookie-parser
dotenv
jsonwebtoken
nodemon
API Endpoints
Base
GET /
Returns a server running message.

Pets
GET /pets
GET /pets?search=tom
GET /pets?species=Dog,Cat
POST /pets
GET /pets/:id
PUT /pets/:id
PATCH /pets/:id
DELETE /pets/:id
GET /my-pets?email=user@example.com
Adoption Requests
POST /adoptions
GET /adoptions?email=user@example.com
GET /adoptions?petId=pet_id
GET /adoptions/pet/:petId
PATCH /adoptions/:id
DELETE /adoptions/:id
Auth Helpers
POST /jwt
POST /logout
GET /protected-check
Environment Variables
Create a .env file locally:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
For Vercel, add:

MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CLIENT_URL=https://pet-adopt-client-xi.vercel.app
NODE_ENV=production
PORT is only needed for local development.

Run Locally
npm install
npm run dev
Server runs on:

http://localhost:5000
Deployment
This server includes vercel.json, so Vercel routes all API requests to index.js.

Vercel settings:

Framework Preset: Other
Build Command: leave empty or default
Output Directory: leave empty
Install Command: npm install
Start Command: npm start
After deployment, test:

https://pet-adoption-server-two-beryl.vercel.app/
https://pet-adoption-server-two-beryl.vercel.app/pets
The /pets route should return a JSON array.
