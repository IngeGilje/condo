// Maintenance of users

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');

let isEventsCreated = false;

objCondo.menu();
objCondo.markSelectedMenu('Leilighet');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('user-login');
} else {

  let isEventsCreated = false;

  objUser.menu();
  objUser.markSelectedMenu('Bruker');

  // Send a message to the server
  socket.onopen = () => {

    // Send a request to the server to get all condos
    const SQLquery = `
    SELECT * FROM condo
    ORDER BY condoId;
  `;
    socket.send(SQLquery);
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let message = event.data;

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      // condo table
      console.log('condoTable');

      // array including objects with condo information
      condoArray = JSON.parse(message);

      // Send a request to the server to get all users
      const SQLquery =
        `
          SELECT * FROM user
          ORDER BY userId;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"user"')) {

      // user table
      console.log('userTable');

      // array including objects with user information
      userArray = JSON.parse(message);

      // Show leading texts
      let userId = objUser.getSelectedUserId('select-user-userId');
      showLeadingText(userId);

      // Show all values for all user
      showValues(userId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');

      // Sends a request to the server to get all users
      const SQLquery = `
        SELECT * FROM user
        ORDER BY userId;
      `;
      socket.send(SQLquery);
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
}

// Make events for users
function createEvents() {

  // Select User
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-user-userId')) {

      let userId = Number(document.querySelector('.select-user-userId').value);
      userId = (userId !== 0) ? userId : userArray.at(-1).userId;
      if (userId) {
        showValues(userId);
      }
    }
  });

  // Update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-update')) {

      // user id
      let userId =
        Number(document.querySelector('.select-user-userId').value);
      updateUser(userId);
    }
  });

  // New user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-new')) {

      resetValues();
    }
  });

  // Delete user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-delete')) {

      const userId =
        Number(document.querySelector('.select-user-userId').value);
      //objUser.getSelectedUserId('select-user-userId');
      deleteUserRow(userId);

      // Sends a request to the server to get all users
      const SQLquery = `
        SELECT * FROM user
        ORDER BY userId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-cancel')) {

      // Sends a request to the server to get all user
      //objUser.getUsers(socket);
      const SQLquery = `
        SELECT * FROM user
        ORDER BY userId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateUser(userId) {

  let isUpdated = false;

  if (validateValues(userId)) {

    // e-mail
    const email =
      document.querySelector('.input-user-email').value;

    // condo id
    const condoId =
      Number(document.querySelector('.select-user-condoId').value);

    // first name
    const firstName =
      document.querySelector('.input-user-firstName').value;

    // last name
    const lastName =
      document.querySelector('.input-user-lastName').value;

    // phone
    const phone =
      document.querySelector('.input-user-phone').value;

    // securityLevel
    const securityLevel =
      Number(document.querySelector('.select-user-securityLevel').value);

    // password
    const password =
      document.querySelector('.input-user-password').value;

    let SQLquery = '';
    const now = new Date();
    const lastUpdate = now.toISOString();

    const objectNumberUser = userArray.findIndex(user => user.userId === userId);

    // Check if first name exist
    if (objectNumberUser >= 0) {

      // Update table
      SQLquery = `
          UPDATE user
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            email = '${email}',
            condoId = ${condoId},
            firstName = '${firstName}',
            lastName = '${lastName}',
            phone = '${phone}',
            securityLevel = ${securityLevel},
            password = '${password}'
          WHERE userId = ${userId}
          ;
        `;
    } else {

      // Insert new record
      SQLquery = `
        INSERT INTO user (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          email,
          condoId,
          firstName,
          lastName,
          phone,
          securityLevel,
          password) 
        VALUES (
          'user',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${email}',
          ${condoId},
          '${firstName}',
          '${lastName}',
          '${phone}',
          ${securityLevel},
          '${password}'
        );
      `;
    }

    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-user-userId').disabled =
      false;
    document.querySelector('.button-user-delete').disabled =
      false;
    document.querySelector('.button-user-new').disabled =
      false;
    //document.querySelector('.button-user-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteUserRow(userId) {

  let SQLquery = "";

  //const userId = Number(document.querySelector('.select-user-userId').value);
  if (userId > 1) {

    // Check if user exist
    const objectNumberUser = userArray.findIndex(user => user.userId === userId);
    if (objectNumberUser >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM user
        WHERE userId = ${userId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    // Get user
    SQLquery = `
      SELECT * FROM user
      ORDER BY userId;
    `;
    socket.send(SQLquery);

    resetValues();
  }
}

// Show leading text for user
function showLeadingText(userId) {

  // Show all users
  objUser.showAllUsers('user-userId', userId);

  // email
  objUser.showInput('user-email', '* E-mail(Bruker)', 50, '');

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('user-condoId', condoId);

  // Show first name
  objUser.showInput('user-firstName', '* Fornavn', 50, '');

  // Show last name
  objUser.showInput('user-lastName', '* Etternavn', 50, '');

  // Phone
  objUser.showInput('user-phone', 'Telefonnummer', 20, '');

  // Select securityLevel
  objUser.selectNumber('user-securityLevel', 1, 9, 5, 'Sikkerhetsnivå');

  // passord
  objUser.showInput('user-password', '* Passord', 50, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objUser.showButton('user-update', 'Oppdater');

    // new button
    objUser.showButton('user-new', 'Ny');

    // delete button
    objUser.showButton('user-delete', 'Slett');

    // cancel button
    objUser.showButton('user-cancel', 'Avbryt');
  }
}

// Show all values for user
function showValues(userId) {

  // Check for valid user Id
  if (userId > 1) {

    // find object number for selected user Id 
    const objectNumberUser = userArray.findIndex(user => user.userId === userId);
    if (objectNumberUser >= 0) {

      // Show email
      document.querySelector('.input-user-email').value =
        userArray[objectNumberUser].email;

      // Select condoId
      document.querySelector('.select-user-condoId').value =
        userArray[objectNumberUser].condoId;

      // first name
      document.querySelector('.input-user-firstName').value =
        userArray[objectNumberUser].firstName;

      // last name
      document.querySelector('.input-user-lastName').value =
        userArray[objectNumberUser].lastName;

      // Show phone number
      document.querySelector('.input-user-phone').value =
        userArray[objectNumberUser].phone;

      // show securityLevel
      document.querySelector('.select-user-securityLevel').value =
        userArray[objectNumberUser].securityLevel;

      // password
      document.querySelector('.input-user-password').value =
        userArray[objectNumberUser].password;
    }
  }
}

// Check for valid values
function validateValues(userId) {

  // Check email
  const eMail = document.querySelector('.input-user-email').value;
  const validEmail = objUser.validateEmail(eMail, "label-user-email", "E-mail(Bruker)");

  // Check condo Id
  const condoId =
    Number(document.querySelector('.select-user-condoId').value);
  const validCondoId =
    validateNumber(condoId, 1, 99999, "user-condoId", "Vis leilighet");

  // Check first name
  const firstName = document.querySelector('.input-user-firstName').value;
  const validFirstName = objUser.validateText(firstName, "label-user-firstName", "Fornavn");

  // Check last name
  const lastName = document.querySelector('.input-user-lastName').value;
  const validLastName = objUser.validateText(lastName, "label-user-lastName", "Etternavn");

  const securityLevel =
    Number(document.querySelector('.select-user-securityLevel').value);
  const validSecuritylevel =
    validateNumber(securityLevel, 1, 9, "user-securityLevel", "Sikkerhetsnivå");

  // Check password
  const password = document.querySelector('.input-user-password').value;
  const validpassword = objUser.validateText(password, "label-user-password", "Passord");

  return (validEmail && validCondoId && validpassword && validFirstName && validLastName && validSecuritylevel) ? true : false;
}

function resetValues() {

  // user Id
  document.querySelector('.select-user-userId').value =
    0;

  // reset e-mail
  document.querySelector('.input-user-email').value =
    '';

  // reset condo Id
  document.querySelector('.select-user-condoId').value =
    0;

  // reset first name
  document.querySelector('.input-user-firstName').value =
    '';

  // reset last name
  document.querySelector('.input-user-lastName').value =
    '';

  // reset phone number
  document.querySelector('.input-user-phone').value =
    '';

  // securityLevel
  document.querySelector('.select-user-securityLevel').value =
    0;

  // reset password
  document.querySelector('.input-user-password').value =
    '';

  document.querySelector('.select-user-userId').disabled =
    true;
  document.querySelector('.button-user-delete').disabled =
    true;
  document.querySelector('.button-user-new').disabled =
    true;
}
