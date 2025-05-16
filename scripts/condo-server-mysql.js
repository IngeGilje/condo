// Start the inactivity timer
// backup: >mysqldump -u Inge -p condos > e:\backup.sql

// Import the backup:
//mysql -u [username] -p [database_name] < backup.sql
let inactivityTimer;
//resetTimer();

/*
// Reset timer on any user interaction
process.stdin.on("data", resetTimer);

// Reset timer on any user interaction
process.stdin.on("data", resetTimer);
*/
const localServer = true;

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

// Constants for database handling
let messageToClient = undefined; // Message to send to client
let connected2MySQL = false; // Not connected to mysql database

// Connecting to mySQL
const mysql = require('mysql2');
let connection;
if (localServer) {
  connection = mysql.createConnection(
    {
      host: 'localhost',
      user: 'Inge',
      password: 'Vinter-2025',
      database: "condos"
    }
  );
}
if (!localServer) {
  connection = mysql.createConnection(
    {
      host: '127.0.0.1',
      user: 'Inge',
      password: 'Sommer--2025',
      database: "condos"
    }
  );
}

server.on('connection', (socket) => {

  // Connect to MySQL
  if (!connected2MySQL) {
    connectToMySql();
  }

  // Listen for messages from the client
  socket.on('message', (message) => {

    // Received message from server
    const sqlQuery = message.toString();
    console.log(sqlQuery);

    // SQL querying
    queryingSQL(sqlQuery);

    // Send a message to the client
    setTimeout(() => {
      if (messageToClient) {
        socket.send(messageToClient);
      }
    }, 100);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

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

/*
// Close the application after 1 hour with no user activity
function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {

      // Close the application
      process.exit(); 
  }, 10 * 60 * 60 * 1000); // 10 hours
}
*/