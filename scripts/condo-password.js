// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');
const objPassword = new Password('password');

const enableChanges = (objPassword.securityLevel > 5);

const tableWidth = "width:600px;";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objPassword.condominiumId === 0) || (objPassword.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'A';

      // Verify whether the user has permission to change all passwords
      // or only their own password
      (enableChanges)
        ? await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine)
        : await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.userId);
      await objCondominium.loadCondominiumsTable(objPassword.condominiumId);
      await objCondo.loadCondoTable(objPassword.condominiumId);

      // Show header
      showHeader();

      //const userId = objUser.arrayUsers.at(-1).userId;

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, objPassword.condominiumId, objPassword.userId);

      // Show result
      menuNumber = showUser(menuNumber, objPassword.userId);

      // Events
      events();
    }
  } else {

    objPassword.showMessage(objPassword, '', 'condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      //showUser(3, userId);
      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId, userId);
      menuNumber = showUser(menuNumber, userId);
    };
  });

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      const resident = "A";
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objUser.loadUsersTable(condominiumId, resident, objPassword.nineNine);

      const userId = Number(document.querySelector('.filterUserId').value);
      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId, userId);
      menuNumber = showUser(menuNumber, userId);
    };
  });

  // update a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const userId = document.querySelector('.filterUserId').value;
      updateUserRow(userId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Delete condo
async function deleteCondo() {

  // Check for valid condo Id
  const userId = Number(document.querySelector('.select-condo-userId').value);

  // Check if condo id exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.userId === userId);
  if (rowNumberCondo !== -1) {

    // delete condo row


    objCondo.deleteCondoTable(userId, user);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objUser.startTable(tableWidth);

  // start table body
  html += objUser.startTableBody();

  // show main header
  html += objUser.showTableHeaderLogOut('width:175px;', '', '', 'Passord', '');
  html += "</tr>";

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condominiumId, userId) {

  // Start table
  let html = objUser.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objUser.showTableHeaderMenu('width:175px;', menuNumber, 'Sameie', 'Bruker');

  // start table body
  html += objUser.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objUser.insertTableColumns('', menuNumber);

  // Show selected condominiums 
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '');

  // user
  html += objUser.showSelectedUsers('filterUserId', 'width:175px;', userId, '', '', true)

  html += "</tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objUser.insertTableColumns('', menuNumber, '', '');

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show user
function showUser(menuNumber, userId) {

  // start table
  let html = objUser.startTable(tableWidth);

  // Check if users row exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // password, securityLevel,
    html += "<tr>";
    menuNumber++;
    html += objUser.showTableHeaderMenu("width:175px;", menuNumber, 'Passord', 'Sikkerhetsnivå');

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    // password
    html += objUser.inputTablePassword('password', '', '', 45);

    // securityLevel
    html += objUser.showSelectedNumbers('securityLevel', "width:175px;", 1, 9, objUser.arrayUsers[rowNumberUser].securityLevel, enableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    html += "</tr>";

    // show buttons

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    html += objUser.showButton('width:175px;', 'update', 'Oppdater');
    html += "</tr>";

    // Show the rest of the menu
    menuNumber++;
    html += objUser.showRestMenu(menuNumber);

    // The end of the table
    html += objUser.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = objUser.validateNumber('userId', userId, -1, objUser.nineNine);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = objUser.validateNumber('securityLevel', securityLevel, 1, 9, objUser, '', 'Ugyldig sikkerhetsnivå');

  // validate password
  let password = document.querySelector('.password').value;
  /*
  let password = (password === '')
    ? objUser.arrayUsers[rowNumberUser].password
    : document.querySelector('.password').value;
  */
  const validPassword = ((password.length >= 5) || (password === ''));

  if (validUserId && validSecurityLevel && validPassword) {

    document.querySelector('.message').style.display = "none";

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUserPassword(objPassword.user, userId, securityLevel, password);

      // Verify whether the user has permission to change all passwords
      // or only personal password
      const resident = 'A';
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      /*
      (enableChanges)
        ? await objUser.loadUsersTable(condominiumId, resident, objPassword.userId)
        : await objUser.loadUsersTable(condominiumId, resident, objPassword.nineNine);
      */
      if (enableChanges) await objUser.loadUsersTable(condominiumId, resident, objPassword.nineNine);
    }

    // Show filter
    let menuNumber = 0;
    const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
    menuNumber = showFilter(menuNumber, condominiumId, userId);
    menuNumber = showUser(menuNumber, userId);

    document.querySelector('.filterUserId').disabled = false;
  } else {

    objPassword.showMessage(objPassword, '', 'Ugyldig passord.');
  }
}

// Delete a user row
async function deleteUserRow() {

  // userId
  const userId = Number(document.querySelector('.filterUserId').value);

  // Check if user exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // delete a user row


    await objUser.deleteUsersTable(userId, user);
  }
}