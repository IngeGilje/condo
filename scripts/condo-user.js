// Maintenance of users

// Activate objects
const today = new Date();
const objCondos = new Condo('condo');
const objUsers = new User('user');

// let isEventsCreated

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondos.loadCondoTable(objUserPassword.condominiumId);

    // Show header
    showHeader();

    const userId = objUsers.arrayUsers.at(-1).userId;

    // Show filter
    showFilter(userId);

    // Show result
    showResult(userId);

    // Events
    events();
  }
}

// Events for users
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterUserId')) {

      filterSync();

      async function filterSync() {

        const userId = Number(document.querySelector('.filterUserId').value);
        showResult(userId);
      }
    };
  });

  // update/insert a user row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateUserRowSync();

      // Update a users row
      async function updateUserRowSync() {

        const userId = document.querySelector('.filterUserId').value;
        updateUserRow(userId);
      }
    };
  });

  // Delete users row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      deleteUserSync();

      async function deleteUserSync() {

        deleteUserRow();

        const condominiumId = Number(objUserPassword.condominiumId);
        const resident = 'Y';
        await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);

        // Show filter
        const userId = objUsers.arrayUsers.at(-1).userId;
        showFilter(userId);

        showResult(userId);
      };
    };
  });

  // Insert a user row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload users table
      reloadUsersSync();
      async function reloadUsersSync() {

        const resident = 'Y';
        await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);

        let userId = Number(document.querySelector('.filterUserId').value);
        if (userId === 0) userId = objUsers.arrayUsers.at(-1).userId;

        // Show filter
        showFilter(userId);

        showResult(userId);
      };
    };
  });
}

// Delete condo
async function deleteCondo() {

  // Check for valid condo Id
  const userId = Number(document.querySelector('.select-condo-userId').value);

  // Check if condo id exist
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.userId === userId);
  if (condoRowNumber !== -1) {

    // delete condo row
    const user = objUserPassword.email;
    
    objCondos.deleteCondoTable(userId, user);
  }
}
/*
// Events for users
function events() {

  // Select User
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-users-userId')) {
      let userId = Number(document.querySelector('.select-users-userId').value);
      //userId = (userId !== 0) ? userId : objUsers.arrayUsers.at(-1).userId;
      if (userId === 0) userId = objUsers.arrayUsers.at(-1).userId;
      if (userId) {
        showValues(userId);
      };
    };
  });

  /*
  // Select User
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-users-userId')) {
 
      let userId = Number(document.querySelector('.select-users-userId').value);
      userId = (userId !== 0) ? userId : objUsers.arrayUsers.at(-1).userId;
      if (userId) {
        showValues(userId);
      }
    }
  });
  */
/*
// Update
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-users-update')) {

    // Update users and reload users
    updateUserSync();

    // Update user and reload users
    async function updateUserSync() {

      // Load user
      let userId;
      if (document.querySelector('.select-users-userId').value === '') {

        // Insert new row into user table
        userId = 0;
      } else {

        // Update existing row in users table
        userId = Number(document.querySelector('.select-users-userId').value);
      }

      if (validateValues()) {

        await updateUser(userId);
        await objUsers.loadUsersTable(objUserPassword.condominiumId);

        // Select last users if userId is 0
        if (userId === 0) userId = objUsers.arrayUsers.at(-1).userId;

        // Show leading text
        showLeadingText(userId);

        // Show all values for user
        showValues(userId);
      }
    }
  }
});
*/
/*
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
  if (userId === 0) userId = objUsers.arrayUsers.at(-1).userId;
 
  // Show leading text
  showLeadingText(userId);
 
  // Show all values for user
  showValues(userId);
}
*/

/*
// New user
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-users-insert')) {

    resetValues();
  }
});
*/

/*
// Delete user
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-users-delete')) {

    // Delete user and reload user
    deleteUserSync();

    // Delete user
    async function deleteUserSync() {

      await deleteUser();
      await objUsers.loadUsersTable(objUserPassword.condominiumId);

      // Show leading text
      const userId = objUsers.arrayUsers.at(-1).userId;
      showLeadingText(userId);

      // Show all values for user
      showValues(userId);
    };
  };
});
*/
/*
// Delete user and reload users
deleteUserSync();
 
// Delete user and reload users
async function deleteUserSync() {
 
  await deleteUser();
 
  // Load users
  await objUsers.loadUsersTable(objUserPassword.condominiumId);
 
  // Show leading text
  const userId = objUsers.arrayUsers.at(-1).userId;
  showLeadingText(userId);
 
  // Show all values for user
  showValues(userId);
}
*/

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


/*
// Cancel
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-users-cancel')) {

    // Reload user
    reloadUserSync();
    async function reloadUserSync() {

      let condominiumId = Number(objUserPassword.condominiumId);
      await objUsers.loadUsersTable(condominiumId);

      // Show leading text for maintenance
      // Select first user Id
      if (objUsers.arrayUsers.length > 0) {
        userId = objUsers.arrayUsers[0].userId;
        showLeadingText(userId);
      }

      // Show all selected user
      objUsers.showAllSelectedUsers('users-userId', userId);

      // Show user Id
      showValues(userId);
    }
  }
});
}
*/

/*
function updateUser(userId) {

  if (validateValues(userId)) {

    // user Id
    const user = objUserPassword.email;

    // condominium Id
    const condominiumId = Number(objUserPassword.condominiumId);

    // e-mail
    const email = document.querySelector('.input-users-email').value;

    // condo id
    const userId = Number(document.querySelector('.select-users-userId').value);

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
    
    const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);

    // Check if user exist
    if (userRowNumber !== -1) {

      // update user
      objUsers.updateUsersTable(user, email, userId, firstName, lastName, phone, securityLevel, password);

    } else {

      // Insert user row in users table
      objUsers.insertUsersTable(condominiumId, user, email, userId, firstName, lastName, phone, securityLevel, password);
    }
  }
}
*/

/*
function deleteUserRow(userId) {
 
  let SQLquery = "";
 
  if (userId >= 0) {
 
    const lastUpdate =
      today.toISOString();
 
    // Check if user exist
    const userRowNumber =
      objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (userRowNumber !== -1) {
 
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

/*
// Show leading text for user
function showLeadingText(userId) {

  // Show all users
  objUsers.showAllUsers('users-userId', userId);

  // email
  objUsers.showInput('users-email', '* E-mail(Bruker)', 50, '');

  // Show all condos
  const condoId = objCondos.arrayCondo.at(-1).condoId;
  objCondos.showSelectedCondos('users-condoId', condoId);

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
*/

/*
// Show all values for user
function showValues(userId) {

  // Check for valid user Id
  if (userId >= 0) {

    // find object number for selected user Id 
    const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (userRowNumber !== -1) {

      // Show email
      document.querySelector('.input-users-email').value = objUsers.arrayUsers[userRowNumber].email;

      // Select condoId
      document.querySelector('.select-users-condoId').value = objUsers.arrayUsers[userRowNumber].condoId;

      // first name
      document.querySelector('.input-users-firstName').value = objUsers.arrayUsers[userRowNumber].firstName;

      // last name
      document.querySelector('.input-users-lastName').value = objUsers.arrayUsers[userRowNumber].lastName;

      // Show phone number
      document.querySelector('.input-users-phone').value = objUsers.arrayUsers[userRowNumber].phone;

      // show securityLevel
      document.querySelector('.select-users-securityLevel').value = objUsers.arrayUsers[userRowNumber].securityLevel;

      // password
      document.querySelector('.input-users-password').value = objUsers.arrayUsers[userRowNumber].password;
    }
  }
}
*/

/*
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
*/


function resetValues() {

  // user Id
  document.querySelector('.filterUserId').value = 0;

  // reset e-mail
  document.querySelector('.email').value = '';

  // reset condo Id
  document.querySelector('.condoId').value = 0;

  // reset first name
  document.querySelector('.firstName').value = '';

  // reset last name
  document.querySelector('.lastName').value = '';

  // reset phone number
  document.querySelector('.phone').value = '';

  // securityLevel
  document.querySelector('.securityLevel').value = 0;

  // reset password
  document.querySelector('.password').value = '';

  document.querySelector('.filterUserId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

/*
// Delete user
async function deleteUser() {

  // Check for valid user number
  const userId = Number(document.querySelector('.select-users-userId').value);

  // Check if user number exist
  const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (userRowNumber !== -1) {

    // delete user row
    const user = objUserPassword.email;
    
    objUsers.deleteUsersTable(userId, user);
  }
}
*/

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objUsers.showHTMLMainTableHeaderNew('widht:250px;', 0, 'Bruker');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(userId) {

  // Start table
  html = startHTMLTable('width:750px;');

  // Header filter for search
  html += objUsers.showHTMLFilterHeader("width:250px;", '', '', '');
  html += objUsers.showHTMLFilterHeader("width:250px;", '', 'Velg bruker', '');

  // Filter for search
  html += "<tr>";

  html += "<td></td>";

  // user
  html += objUsers.showSelectedUsersNew('filterUserId', 'width:100px;', userId, '', '')
  html += "</tr>";

  // Header filter for search
  html += objUsers.showHTMLFilterHeader("width:750px;", '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(userId) {

  // Check if users row exist
  const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (userRowNumber !== -1) {

    let menuNumber = 0;

    // Start table
    html = startHTMLTable('width:750px;');

    // Main header
    html += objUsers.showHTMLMainTableHeaderNew('widht:250px;', 0, '', '', '');

    // email,condoId
    html += "<tr>";
    menuNumber++;
    html += objUsers.showHTMLTableHeaderNew("width:250px;", menuNumber, 'E-mail', 'Leilighet');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    // email
    html += objUsers.showInputHTMLNew('email', objUsers.arrayUsers[userRowNumber].email, 45);

    // condoId
    html += objCondos.showSelectedCondosNew('condoId', "width:170px;", objUsers.arrayUsers[userRowNumber].condoId, '', '');

    html += "</tr>";

    // firstName, lastName
    html += "<tr>";
    menuNumber++;
    html += objUsers.showHTMLTableHeaderNew("width:250px;", menuNumber, 'Fornavn', 'Etternavn');

    // firstName, lastName
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    // firstName
    html += objUsers.showInputHTMLNew('firstName', objUsers.arrayUsers[userRowNumber].firstName, 45);

    // lastName
    html += objUsers.showInputHTMLNew('lastName', objUsers.arrayUsers[userRowNumber].lastName, 45);

    html += "</tr>";

    // securityLevel,password
    html += "<tr>";
    menuNumber++;
    html += objUsers.showHTMLTableHeaderNew("width:250px;", menuNumber, 'Passord', 'Sikkerhetsnivå');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    // password
    html += objUsers.showInputHTMLNew('password', objUsers.arrayUsers[userRowNumber].password, 45);

    // securityLevel
    html += objUsers.showSelectedNumbersNew('securityLevel', "width:100px;", 1, 9, objUsers.arrayUsers[userRowNumber].securityNumber);

    html += "</tr>";

    // phone
    html += "<tr>";
    menuNumber++;
    html += objUsers.showHTMLTableHeaderNew("width:250px;", menuNumber, 'Telefonnummer', 'Beboer');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    // phone
    html += objUsers.showInputHTMLNew('phone', objUsers.arrayUsers[userRowNumber].phone, 15);

    // Activ user
    html += objUsers.showYesNo('resident', objUsers.arrayUsers[userRowNumber].resident);

    html += "</tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    html += objUsers.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objUsers.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objUsers.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objUsers.menuNew(menuNumber);

    html += objUsers.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objUsers.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    html += objUsers.showRestMenuNew(menuNumber);

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.result').innerHTML = html;
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = validateNumberNew(userId, -1, 999999999);

  const condominiumId = Number(objUserPassword.condominiumId);

  const user = objUserPassword.email;
  

  // resident
  let resident = document.querySelector('.resident').value;
  resident = (resident === 'Ja') ? 'Y' : 'N';

  // email
  const email = document.querySelector('.email').value;
  const validEmail = objUsers.validateEmailNew(email);

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = objUsers.validateNumberNew(condoId, 0, 999999999);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = objUsers.validateTextNew(firstName, 3, 50);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = objUsers.validateTextNew(lastName, 3, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUsers.validatePhoneNew(phone);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = validateNumberNew(securityLevel, 1, 9);

  // validate password
  const password = document.querySelector('.password').value;
  const validPassword = (password.length >= 5);

  if (validUserId && validEmail && validCondoId && validFirstName && validLastName && validPhone && validSecurityLevel && validPassword) {

    // Check if the userId exist
    const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (userRowNumber !== -1) {

      // update the users row
      await objUsers.updateUsersTable(resident, user, email, userId, condoId, firstName, lastName, phone, securityLevel, password);
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    } else {

      // Insert the user row in users table
      await objUsers.insertUsersTable(resident, condominiumId, user, email, condoId, firstName, lastName, phone, securityLevel, password);
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      userId = objUsers.arrayUsers.at(-1).userId;
      document.querySelector('.filterUserId').value = userId;
    }

    // Show filter
    showFilter(userId);

    showResult(userId);

    document.querySelector('.filterUserId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

// Delete a user row
async function deleteUserRow() {

  // userId
  const userId = Number(document.querySelector('.filterUserId').value);

  // Check if user exist
  const userRowNumber = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (userRowNumber !== -1) {

    // delete a user row
    const user = objUserPassword.email;
    
    await objUsers.deleteUsersTable(userId, user);
  }
}