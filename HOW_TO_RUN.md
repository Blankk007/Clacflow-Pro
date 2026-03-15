# How to run CalcFlow Pro (Professional Setup)

## Setup (one time only)

1. Make sure your .env file has:
   ANTHROPIC_API_KEY=sk-ant-your-key-here

2. Install dependencies:
   npm install

## Every time you want to run it

You need TWO terminals open:

### Terminal 1 — Start the API server:
   node server.js

You'll see: ✅ CalcFlow Pro running at http://localhost:3001

### Terminal 2 — Start the app:
   npm run dev:app

Then open: http://localhost:5173

## Why two terminals?
- The server (port 3001) holds your API key safely
- Vite (port 5173) serves the app and forwards AI calls to the server
- Your API key NEVER reaches the browser — it's fully secure

## To build for production (deploy online):
   npm run build
   node server.js
Then open: http://localhost:3001
