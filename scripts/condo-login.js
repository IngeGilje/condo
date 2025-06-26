// Login

// Activate user class
const objUser = new User('user');
const objLogIn = new Login('login');

let isEventsCreated = false;
let socket = connectingToServer();

localStorage.removeItem("user");

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

    // Show leading text
    showLeadingText();

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows"')) {

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

  console.log('createEvents');

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-link')) {

      // validate password
      const email =
        document.querySelector('.input-email').value;
      const password =
        document.querySelector('.input-password').value;

      // Security level
      const objUserRowNumber =
        userArray.findIndex(userRow => userRow.email === email);
      if (objUserRowNumber !== -1) {

        const securityLevel =
          userArray[objUserRowNumber].securityLevel;

        const condominiumId =
          userArray[objUserRowNumber].condominiumId;

        // Save email/user, password and security level
        localStorage.setItem('user', JSON.stringify({ email, password, securityLevel, condominiumId }));

        (objLogIn.validateUser(email, password))
          ? window.location.href = 'http://localhost/condo/condo-income.html'
          : resetValues();
      }
    }
  });
}

// Show leading text for login
function showLeadingText() {

  // email
  // Show leading text forinput
  objUser.showLeadingTextInput('email', 'E-mail(Bruker)', 50, '💁 Bruker');

  // password
  objUser.showLeadingTextInput('password', 'Passord', 50, '🔑 Passord');

  // login button
  objLogIn.showPageButton('program', 'program');
}

// reset values
function resetValues() {

  // user
  document.querySelector('.input-email').value =
    '';

  // password
  document.querySelector('.input-password').value =
    '';

  localStorage.removeItem("user");
}