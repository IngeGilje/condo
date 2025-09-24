// Maintenance of users

// Activate objects
const today = new Date();
const objCondos = new Condo('condo');
const objUsers = new Users('users');

let condoArrayCreated = false;
let userArrayCreated = false;

// let isEventsCreated

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objUsers.menu();
objUsers.markSelectedMenu('Bruker');

// let socket;
// socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);

    await objCondos.loadCondosTable(objUserPassword.condominiumId);

    // Find selected user id
    const userId = objUsers.getSelectedUserId('select-users-userId');

    // Show leading text
    showLeadingText(userId);

    // Show all values for user
    showValues(userId);

    // Make events
    createEvents();
  }
}

// Make events for users
function createEvents() {

  // Select User
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-users-userId')) {

      let userId = Number(document.querySelector('.select-users-userId').value);
      userId = (userId !== 0) ? userId : objUsers.usersArray.at(-1).userId;
      if (userId) {
        showValues(userId);
      }
    }
  });

  // Update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-users-update')) {

      // Update user and reload users
      updateUserSync();

      // Update user and reload users
      async function updateUserSync() {

        // Load users

        let userId;
        if (document.querySelector('.select-users-userId').value === '') {

          // Insert new row into users table
          userId = 0;
        } else {

          // Update existing row in users table
          userId = Number(bjUsers.getSelectedUserId('select-users-userId').value);
        }

        updateUser(userId);

        await objUsers.loadUsersTable(objUserPassword.condominiumId);

        // Select last user if userId is 0
        if (userId === 0) userId = objUsers.usersArray.at(-1).userId;

        // Show leading text
        showLeadingText(userId);

        // Show all values for account
        showValues(userId);
      }
    }
  });

  // New user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-users-insert')) {

      resetValues();
    }
  });

  // Delete user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-users-delete')) {

      // Delete user and reload users
      deleteUserSync();

      // Delete user and reload users
      async function deleteUserSync() {

        await deleteUser();

        // Load users
        await objUsers.loadUsersTable(objUserPassword.condominiumId);

        // Show leading text
        const userId = objUsers.usersArray.at(-1).userId;
        showLeadingText(userId);

        // Show all values for user
        showValues(userId);
      }
    }
  });
  /*
  const userId =
    Number(document.querySelector('.select-users-userId').value);
  deleteUserRow(userId);

  // Sends a request to the server to get all users
  const SQLquery =
    `
      SELECT * FROM users
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY userId;
    `;
  updateMySql(SQLquery, 'user', 'SELECT');
  userArrayCreated =
    false;
  */


  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-users-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery =
        `
          SELECT * FROM users
          WHERE condominiumId = ${objUserPassword.condominiumId}
            AND deleted <> 'Y'
          ORDER BY userId;
        `;
      updateMySql(SQLquery, 'user', 'SELECT');
      userArrayCreated =
        false;
    }
  });
  return true;
}

function updateUser(userId) {

  if (validateValues(userId)) {

    // user Id
    const user = objUserPassword.email;

    // condominium Id
    const condominiumId = objUserPassword.condominiumId;

    // e-mail
    const email = document.querySelector('.input-users-email').value;

    // condo id
    const condoId = Number(document.querySelector('.select-users-condoId').value);

    // first name
    const firstName = document.querySelector('.input-users-firstName').value;

    // last name
    const lastName = document.querySelector('.input-users-lastName').value;

    // phone
    const phone = document.querySelector('.input-users-phone').value;

    // securityLevel
    const securityLevel = Number(document.querySelector('.select-users-securityLevel').value);

    // password
    const password = document.querySelector('.input-users-password').value;

    const lastUpdate = today.toISOString();

    const objUserRowNumber = objUsers.usersArray.findIndex(user => user.userId === userId);

    // Check if user exist
    if (objUserRowNumber !== -1) {

      // update user
      objUsers.updateUsersTable(user, lastUpdate, email, condoId, firstName, lastName, phone, securityLevel, password);

    } else {

      // Insert user row in users table
      objUsers.insertUsersTable(condominiumId, user, lastUpdate, email, condoId, firstName, lastName, phone, securityLevel, password);
    }

    /*
    // Check if object exist
    if (objUserRowNumber !== -1) {

      /*
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
            deleted,
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
            'N',
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
    */

    document.querySelector('.select-users-userId').disabled =
      false;
    document.querySelector('.button-users-delete').disabled =
      false;
    document.querySelector('.button-users-insert').disabled =
      false;
    //document.querySelector('.button-users-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

/*
function deleteUserRow(userId) {

  let SQLquery = "";

  if (userId >= 0) {

    const lastUpdate =
      today.toISOString();

    // Check if user exist
    const objUserRowNumber =
      objUsers.usersArray.findIndex(user => user.userId === userId);
    if (objUserRowNumber !== -1) {

      // current date
      const lastUpdate =
        today.toISOString();

      // Delete table
      SQLquery =
        `
          UPDATE user
            SET 
              deleted = 'Y',
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}'
          WHERE userId = ${userId};
        `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'user', 'DELETE');
    }

    // Get user
    SQLquery =
      `
        SELECT * FROM users
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    resetValues();
  }
}
*/

// Show leading text for user
function showLeadingText(userId) {

  // Show all users
  objUsers.showAllUsers('users-userId', userId);

  // email
  objUsers.showInput('users-email', '* E-mail(Bruker)', 50, '');

  // Show all condos
  const condoId = objCondos.condosArray.at(-1).condoId;
  objCondos.showAllCondos('users-condoId', condoId);

  // Show first name
  objUsers.showInput('users-firstName', '* Fornavn', 50, '');

  // Show last name
  objUsers.showInput('users-lastName', '* Etternavn', 50, '');

  // Phone
  objUsers.showInput('users-phone', 'Telefonnummer', 20, '');

  // Select securityLevel
  objUsers.selectNumber('users-securityLevel', 1, 9, 5, 'Sikkerhetsnivå');

  // passord
  objUsers.showInput('users-password', '* Passord', 50, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objUsers.showButton('users-update', 'Oppdater');

    // new button
    objUsers.showButton('users-insert', 'Ny');

    // delete button
    objUsers.showButton('users-delete', 'Slett');

    // cancel button
    objUsers.showButton('users-cancel', 'Avbryt');
  }
}

// Show all values for user
function showValues(userId) {

  // Check for valid user Id
  if (userId >= 0) {

    // find object number for selected user Id 
    const objUserRowNumber = objUsers.usersArray.findIndex(user => user.userId === userId);
    if (objUserRowNumber !== -1) {

      // Show email
      document.querySelector('.input-users-email').value = objUsers.usersArray[objUserRowNumber].email;

      // Select condoId
      document.querySelector('.select-users-condoId').value = objUsers.usersArray[objUserRowNumber].condoId;

      // first name
      document.querySelector('.input-users-firstName').value = objUsers.usersArray[objUserRowNumber].firstName;

      // last name
      document.querySelector('.input-users-lastName').value = objUsers.usersArray[objUserRowNumber].lastName;

      // Show phone number
      document.querySelector('.input-users-phone').value = objUsers.usersArray[objUserRowNumber].phone;

      // show securityLevel
      document.querySelector('.select-users-securityLevel').value = objUsers.usersArray[objUserRowNumber].securityLevel;

      // password
      document.querySelector('.input-users-password').value = objUsers.usersArray[objUserRowNumber].password;
    }
  }
}

// Check for valid values
function validateValues(userId) {

  // Check email
  const eMail =
    document.querySelector('.input-users-email').value;
  const validEmail =
    objUsers.validateEmail(eMail, "label-users-email", "E-mail(Bruker)");

  // Check condo Id
  const condoId =
    Number(document.querySelector('.select-users-condoId').value);
  const validCondoId =
    validateNumber(condoId, 1, 99999, "users-condoId", "Vis leilighet");

  // Check first name
  const firstName = document.querySelector('.input-users-firstName').value;
  const validFirstName =
    objUsers.validateText(firstName, "label-users-firstName", "Fornavn");

  // Check last name
  const lastName =
    document.querySelector('.input-users-lastName').value;
  const validLastName =
    objUsers.validateText(lastName, "label-users-lastName", "Etternavn");

  const securityLevel =
    Number(document.querySelector('.select-users-securityLevel').value);
  const validSecuritylevel =
    validateNumber(securityLevel, 1, 9, "users-securityLevel", "Sikkerhetsnivå");

  // Check password
  const password =
    document.querySelector('.input-users-password').value;
  const validpassword =
    objUsers.validateText(password, "label-users-password", "Passord");

  return (validEmail && validCondoId && validpassword && validFirstName && validLastName && validSecuritylevel) ? true : false;
}

function resetValues() {

  // user Id
  document.querySelector('.select-users-userId').value =
    0;

  // reset e-mail
  document.querySelector('.input-users-email').value =
    '';

  // reset condo Id
  document.querySelector('.select-users-condoId').value =
    0;

  // reset first name
  document.querySelector('.input-users-firstName').value =
    '';

  // reset last name
  document.querySelector('.input-users-lastName').value =
    '';

  // reset phone number
  document.querySelector('.input-users-phone').value =
    '';

  // securityLevel
  document.querySelector('.select-users-securityLevel').value =
    0;

  // reset password
  document.querySelector('.input-users-password').value =
    '';

  document.querySelector('.select-users-userId').disabled =
    true;
  document.querySelector('.button-users-delete').disabled =
    true;
  document.querySelector('.button-users-insert').disabled =
    true;
}

// Delete user
async function deleteUser() {

  // Check for valid user number
  const userId = Number(document.querySelector('.select-users-userId').value);

  // Check if user number exist
  const objUserRowNumber = objUsers.usersArray.findIndex(user => user.userId === userId);
  if (objUserRowNumber !== -1) {

    // delete user row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objUsers.deleteUsersTable(userId, user, lastUpdate);
  }
}