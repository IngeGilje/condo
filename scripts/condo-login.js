// Login

// Activate user class
const objUser =
  new User('user');
const objLogIn =
  new Login('login');

let isEventsCreated

let socket;
socket = connectingToServer();

localStorage.removeItem("user");

// Send a requests to the server
socket.onopen = () => {

  let SQLquery;

  // Sends a request to the server to get users
  SQLquery =
    `
      SELECT * FROM user
      ORDER BY userId;
    `;

  updateMySql(SQLquery, 'user', 'SELECT');
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let messageFromServer =
    event.data;
  console.log(':', messageFromServer);

  // Converts a JavaScript Object Notation (JSON) string into an object
  objInfo =
    JSON.parse(messageFromServer);

  if (objInfo.CRUD === 'SELECT') {
    switch (objInfo.tableName) {
      case 'user':

        // condo table
        console.log('userTable');

        userArray =
          objInfo.tableArray;

        // Show leading text
        showLeadingText();

        // Make events
          isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
        break;
    }
  }
  if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

    switch (objInfo.tableName) {
      case 'user':

        // Sends a request to the server to get accounts one more time
        SQLquery =
          `
              SELECT * FROM user
              ORDER BY userId;
            `;
        updateMySql(SQLquery, 'user', 'SELECT');
        break;
    };
  };

  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
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
          ? window.location.href = 'http://localhost/condo/condo-bankaccountmovement.html'
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