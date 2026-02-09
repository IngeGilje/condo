// Maintenance of users

// Activate objects
const today = new Date();
const objCondos = new Condo('condo');
const objUsers = new User('user');

// let isEventsCreated

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      await objCondos.loadCondoTable(objUserPassword.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      const userId = objUsers.arrayUsers.at(-1).userId;

      // Show filter
      showFilter(userId);

      // Show result
      menuNumber = showResult(userId, menuNumber);

      // Events
      events();
    }
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
        let menuNumber = 0;
        menuNumber = showResult(userId, menuNumber);
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

        let menuNumber = 0;
        menuNumber = showResult(userId, menuNumber);
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

        let menuNumber = 0;
        menuNumber = showResult(userId, menuNumber);
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
    
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
 
    // Check if user exist
    if (rowNumberUser !== -1) {
 
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
    const rowNumberUser =
      objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {
 
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
// Show all values for user
function showValues(userId) {
 
  // Check for valid user Id
  if (userId >= 0) {
 
    // find object number for selected user Id 
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {
 
      // Show email
      document.querySelector('.input-users-email').value = objUsers.arrayUsers[rowNumberUser].email;
 
      // Select condoId
      document.querySelector('.select-users-condoId').value = objUsers.arrayUsers[rowNumberUser].condoId;
 
      // first name
      document.querySelector('.input-users-firstName').value = objUsers.arrayUsers[rowNumberUser].firstName;
 
      // last name
      document.querySelector('.input-users-lastName').value = objUsers.arrayUsers[rowNumberUser].lastName;
 
      // Show phone number
      document.querySelector('.input-users-phone').value = objUsers.arrayUsers[rowNumberUser].phone;
 
      // show securityLevel
      document.querySelector('.select-users-securityLevel').value = objUsers.arrayUsers[rowNumberUser].securityLevel;
 
      // password
      document.querySelector('.input-users-password').value = objUsers.arrayUsers[rowNumberUser].password;
    }
  }
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
// Show header
function showHeader() {
 
  // Start table
  let html = startHTMLTable('width:750px;');
 
  // Main header
  html += objUsers.showTableHeader('width:250px;', 'Bruker');
 
  // The end of the table
  html += endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objUsers.startTable('width:750px;');

  // show main header
  html += objUsers.showTableHeader('width:250px;', 'Bruker');

  // The end of the table
  html += objUsers.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(userId) {

  // Start table
  html = objUsers.startTable('width:750px;');

  // Header filter
  html += objUsers.showTableHeader('width:250px;', '', 'Velg bruker', '');

  // start table body
  html += objUsers.startTableBody();

  // insert table columns in start of a row
  html += objUsers.insertTableColumns('', 0, '');

  // user
  html += objUsers.showSelectedUsersNew('filterUserId', 'width:100px;', userId, '', '')

  html += "</tr>";

  // insert table columns in start of a row
  html += objUsers.insertTableColumns('', 0, '');

  // end table body
  html += objUsers.endTableBody();

  // The end of the table
  html += objUsers.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(userId, rowNumber) {

  // start table
  let html = objUsers.startTable('width:750px;');

  // table header
  html += objUsers.showTableHeader('width:250px;', '', '', '');

  // Check if users row exist
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // Start table
    //html = startHTMLTable('width:750px;');

    // Main header
    //html += objUsers.showTableHeader('width:250px;', '', '', '');

    // email,condoId
    html += "<tr>";
    rowNumber++;
    html += objUsers.showTableHeaderMenu("width:250px;", rowNumber, 'E-mail', 'Leilighet');

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    // email
    html += objUsers.inputTableColumn('email', objUsers.arrayUsers[rowNumberUser].email, 45);

    // condoId
    html += objCondos.showSelectedCondos('condoId', "width:170px;", objUsers.arrayUsers[rowNumberUser].condoId, '', '');

    html += "</tr>";

    // firstName, lastName
    html += "<tr>";
    rowNumber++;
    html += objUsers.showTableHeaderMenu("width:250px;", rowNumber, 'Fornavn', 'Etternavn');

    // firstName, lastName
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    // firstName
    html += objUsers.inputTableColumn('firstName', objUsers.arrayUsers[rowNumberUser].firstName, 45);

    // lastName
    html += objUsers.inputTableColumn('lastName', objUsers.arrayUsers[rowNumberUser].lastName, 45);

    html += "</tr>";

    // securityLevel,password
    html += "<tr>";
    rowNumber++;
    html += objUsers.showTableHeaderMenu("width:250px;", rowNumber, 'Passord', 'Sikkerhetsnivå');

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    // password
    html += objUsers.inputTableColumn('password', objUsers.arrayUsers[rowNumberUser].password, 45);

    // securityLevel
    html += objUsers.showSelectedNumbersNew('securityLevel', "width:100px;", 1, 9, objUsers.arrayUsers[rowNumberUser].securityNumber);

    html += "</tr>";

    // phone
    html += "<tr>";
    rowNumber++;
    html += objUsers.showTableHeaderMenu("width:250px;", rowNumber, 'Telefonnummer', 'Beboer');

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    // phone
    html += objUsers.inputTableColumn('phone', objUsers.arrayUsers[rowNumberUser].phone, 15);

    // Activ user
    html += objUsers.showYesNo('resident', objUsers.arrayUsers[rowNumberUser].resident);

    html += "</tr>";

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);
    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += "</tr>";

    // show buttons
 
    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += objUsers.showButton('width:170px;', 'update', 'Oppdater');
    html += objUsers.showButton('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

        // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += objUsers.showButton('width:170px;', 'delete', 'Slett');
    html += objUsers.showButton('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    /*
    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += "</tr>";

    // show buttons
    //html += "<tr>";
    // Show menu
    //rowNumber++;
    //html += objUsers.verticalMenu(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += objUsers.showButton('width:170px;', 'delete', 'Slett');
    html += objUsers.showButton('width:170px;', 'insert', 'Ny');
    html += "</tr>";
    */

    // Show the rest of the menu
    rowNumber++;
    html += objUsers.showRestMenu(rowNumber);

    // The end of the table
    html += objUsers.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = validateNumberNew(userId, -1, objUsers.nineNine);

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
  const validCondoId = objUsers.validateNumberNew(condoId, 0, objUsers.nineNine);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = objUsers.validateText(firstName, 3, 50);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = objUsers.validateText(lastName, 3, 50);

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
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

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

    let menuNumber = 0;
    menuNumber = showResult(userId, menuNumber);

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
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // delete a user row
    const user = objUserPassword.email;

    await objUsers.deleteUsersTable(userId, user);
  }
}