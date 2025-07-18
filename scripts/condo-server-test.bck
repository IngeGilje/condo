// Test server

let WebSocket;
let server;

// Test server/ local test server
WebSocket = require('ws');
server = new WebSocket.Server({ port: 1234 }, () => {
  console.log('WebSocket server is listening on port 1234');
});

server.on('connection', (socket) => {

  console.log('Client connected');
  socket.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

// Constants for database handling
let connected2MySQL = 
false; // Not connected to mysql database

// Connecting to mySQL
const mysql = require('mysql2');
let connection;

// MySql database
connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'Inge',
    password: 'Vinter-2025',
    database: "condos"
  }
);
console.log('Connected to webserver localhost');

server.on('connection', (socket) => {

  // Connect to MySQL
  if (!connected2MySQL) {
    connectToMySql();
  }

  // Listen for messages from the client
  socket.on('message', (message) => {

    // Received message from client
    const messageFromClient =
     JSON.parse(message);
    console.log('message from client:', messageFromClient);
    console.log('database:',messageFromClient.database);
    console.log('payload:',messageFromClient.payload);
    console.log(typeof messageFromClient.payload);
    console.log(messageFromClient.payload.SQLquery);
  });
});

// Connect to MySQL
function connectToMySql() {
  connection.connect((err) => {
    if (err) {
      console.error('Error when connecting to MySQL: ', err.message);
      connected2MySQL = false;
    } else {
      connected2MySQL = true;
    }
  });
}

// Close a database
function closeDatabase() {
  if (connected2MySQL) {
    connection.end();
    connected2MySQL = false;
  }
  return connected2MySQL;
}

// Querying the database
function queryingSQL(query) {

  let numberOfRecords = 0;
  (connected2MySQL) ? '' : connectToMySql();

  if (connected2MySQL) {
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
      } else {
        messageToClient = JSON.stringify(results);
      }
    });
  }
}