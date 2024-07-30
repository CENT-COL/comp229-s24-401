// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
const { server: WebSocketServer } = require('websocket');
const dotenv = require('dotenv');

const projectRoutes = require('./routes/project');
const userRoutes = require('./routes/user');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('Connected to MongoDB') });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ httpServer: server });

const clients = {};
const getUniqueId = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

wss.on('request', (request) => {
  const userID = getUniqueId();
  console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');

  try {
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

    connection.on('message', (message) => {
      if (message.type === 'utf8') {
        console.log('Received Message: ', message.utf8Data);
        for (let key in clients) {
          clients[key].sendUTF(message.utf8Data);
          console.log('sent Message to: ', clients[key]);
        }
      }
    });

    connection.on('close', (reasonCode, description) => {
      delete clients[userID];
      console.log(`Client ${userID} disconnected: ${reasonCode} - ${description}`);
      if (reasonCode === 1006) {
        console.error('Socket Error: read ECONNRESET');
      }
    });
  } catch (error) {
    console.log('Error accepting connection: ', error);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});