// Login

// Activate user class
const objUser = new User('user');
const objLogIn = new Login('login');

// Connection to a server
let socket;
(objUser.localServer)
  ? socket = new WebSocket('ws://localhost:8080')
  : socket = new WebSocket('ws://ingegilje.no:8080');

let isEventsCreated = false;

localStorage.removeItem("savedUser");

// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all users
  const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
  socket.send(SQLquery);
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let message = event.data;

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    // user table
    console.log('userTable');

    // array including objects with user information
    userArray = JSON.parse(message);

    // Show all leading text
    showLeadingText();

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');
  }
};

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make events for users
function createEvents() {

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-link')) {

      // validate password
      const user =
        document.querySelector('.input-email').value;
      const password =
        document.querySelector('.input-password').value;

      const objectNumberUser = userArray.findIndex(userRow => userRow.user === user);
      if (objectNumberUser > 0) {

        const securityLevel =
          userArray[objectNumberUser].securityLevel;

        // Save user and password
        localStorage.setItem('savedUser', JSON.stringify({ user, password, securityLevel }));
        const objUserPassword = JSON.parse(localStorage.getItem('savedUser'));

        (objLogIn.validateUser(user, password))
          ? window.location.href = 'condo/condo-income.html'
          : resetValues();
      }
    }
  });
}

// Show all leading text for login
function showLeadingText() {

  // email
  // Show leading text forinput
  objUser.showLeadingTextInput('email', 'E-mail(Bruker)', 50, '💁 Bruker');

  // password
  objUser.showLeadingTextInput('password', 'Passord', 50, '🔑 Passord');

  // login button
  objLogIn.showPageButton('condo/condo-income.html', 'program');
}

// reset values
function resetValues() {

  // user
  document.querySelector('.input-email').value =
    '';

  // password
  document.querySelector('.input-password').value =
    '';

  localStorage.removeItem("savedUser");
}