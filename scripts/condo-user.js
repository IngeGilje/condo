// Maintenance of users

// Activate objects
const objCondo =
  new Condo('condo');
const objUser =
  new User('user');

let isEventsCreated

testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

objUser.menu();
objUser.markSelectedMenu('Bruker');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    let SQLquery;

    // Sends a request to the server to get condos
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY name;
      `;

    updateMySql(SQLquery, 'condo', 'SELECT');

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;


    //Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'condo':

          // condo table
          console.log('condoTable');

          condoArray =
            objInfo.tableArray;
          break;

        case 'user':

          // user table
          console.log('userTable');

          // array including objects with user information
          userArray =
            objInfo.tableArray;

          // Find selected user id
          const userId =
            objUser.getSelectedUserId('select-user-userId');

          // Show leading text
          showLeadingText(userId);

          // Show all values for user
          showValues(userId);

          // Make events
          isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'user':

          // Sends a request to the server to get users one more time
          SQLquery =
            `
              SELECT * FROM user
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY userId;
            `;
          updateMySql(SQLquery, 'user', 'SELECT');
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }
}

// Make events for users
function createEvents() {

  // Select User
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-user-userId')) {

      let userId = Number(document.querySelector('.select-user-userId').value);
      userId =
        (userId !== 0) ? userId : userArray.at(-1).userId;
      if (userId) {
        showValues(userId);
      }
    }
  });

  /*
  // Select condominium
  document.addEventListener('change', (event) => {
 
    if (event.target.classList.contains('select-user-condominiumId')) {
 
    }
  });
  */

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
    if (event.target.classList.contains('button-user-insert')) {

      resetValues();
    }
  });

  // Delete user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-delete')) {

      const userId =
        Number(document.querySelector('.select-user-userId').value);
      deleteUserRow(userId);

      // Sends a request to the server to get all users
      const SQLquery =
        `
          SELECT * FROM user
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userId;
        `;
      updateMySql(SQLquery, 'user', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-user-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery =
        `
          SELECT * FROM user
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userId;
        `;
      updateMySql(SQLquery, 'user', 'SELECT');
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

    const objUserRowNumber =
      userArray.findIndex(user => user.userId === userId);

    // Check if object exist
    if (objUserRowNumber !== -1) {

      // Update table
      SQLquery =
        `
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
            WHERE 
              userId = ${userId};
        `;
      updateMySql(SQLquery, 'user', 'UPDATE');
    } else {

      // Insert new record
      SQLquery =
        `
          INSERT INTO user(
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
            password
          )
          VALUES(
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
      updateMySql(SQLquery, 'user', 'INSERT');
    }

    document.querySelector('.select-user-userId').disabled =
      false;
    document.querySelector('.button-user-delete').disabled =
      false;
    document.querySelector('.button-user-insert').disabled =
      false;
    //document.querySelector('.button-user-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteUserRow(userId) {

  let SQLquery = "";

  if (userId >= 0) {

    // Check if user exist
    const objUserRowNumber =
      userArray.findIndex(user => user.userId === userId);
    if (objUserRowNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM user
        WHERE userId = ${userId};
    `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'user', 'DELETE');
    }

    // Get user
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

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
  const condoId =
    condoArray.at(-1).condoId;
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
    objUser.showButton('user-insert', 'Ny');

    // delete button
    objUser.showButton('user-delete', 'Slett');

    // cancel button
    objUser.showButton('user-cancel', 'Avbryt');
  }
}

// Show all values for user
function showValues(userId) {

  // Check for valid user Id
  if (userId >= 0) {

    // find object number for selected user Id 
    const objUserRowNumber =
      userArray.findIndex(user => user.userId === userId);
    if (objUserRowNumber !== -1) {

      // Show email
      document.querySelector('.input-user-email').value =
        userArray[objUserRowNumber].email;

      // Select condoId
      document.querySelector('.select-user-condoId').value =
        userArray[objUserRowNumber].condoId;

      // first name
      document.querySelector('.input-user-firstName').value =
        userArray[objUserRowNumber].firstName;

      // last name
      document.querySelector('.input-user-lastName').value =
        userArray[objUserRowNumber].lastName;

      // Show phone number
      document.querySelector('.input-user-phone').value =
        userArray[objUserRowNumber].phone;

      // show securityLevel
      document.querySelector('.select-user-securityLevel').value =
        userArray[objUserRowNumber].securityLevel;

      // password
      document.querySelector('.input-user-password').value =
        userArray[objUserRowNumber].password;
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
  const validFirstName =
    objUser.validateText(firstName, "label-user-firstName", "Fornavn");

  // Check last name
  const lastName =
    document.querySelector('.input-user-lastName').value;
  const validLastName =
    objUser.validateText(lastName, "label-user-lastName", "Etternavn");

  const securityLevel =
    Number(document.querySelector('.select-user-securityLevel').value);
  const validSecuritylevel =
    validateNumber(securityLevel, 1, 9, "user-securityLevel", "Sikkerhetsnivå");

  // Check password
  const password =
    document.querySelector('.input-user-password').value;
  const validpassword =
    objUser.validateText(password, "label-user-password", "Passord");

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
  document.querySelector('.button-user-insert').disabled =
    true;
}
