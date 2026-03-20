// Maintenance of users

// Activate objects
const today = new Date();
const objCondos = new Condo('condo');
const objUsers = new User('user');
const objPassword = new Password('password');

let condominiumId = 0;
let user = "";
let securityLevel = 0;
const tableWidth = "width:600px;";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    user = sessionStorage.getItem("user");
        securityLevel = sessionStorage.getItem("securityLevel");
    securityLevel = sessionStorage.getItem("securityLevel");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUsers.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      await objCondos.loadCondoTable(condominiumId);

      // Show header
      showHeader();

      const userId = objUsers.arrayUsers.at(-1).userId;

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(userId, menuNumber);

      // Show result
      menuNumber = showResult(userId, menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, '', 'condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      let menuNumber = 0;
      menuNumber = showResult(userId, menuNumber);
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

      let url = (objUsers.serverStatus === 1)
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
  const rowNumberCondo = objCondos.arrayCondo.findIndex(condo => condo.userId === userId);
  if (rowNumberCondo !== -1) {

    // delete condo row


    objCondos.deleteCondoTable(userId, user);
  }
}

// Show header
function showHeader() {

  // Start table
  html = objUsers.startTable(tableWidth);

  // start table body
  html += objUsers.startTableBody();

  // show main header
  html += objUsers.showTableHeaderLogOut('width:175px;', '', '', 'Passord', '');
  html += "</tr>";

  // end table body
  html += objUsers.endTableBody();

  // The end of the table
  html += objUsers.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(userId, rowNumber) {

  // Start table
  html = objUsers.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objUsers.showTableHeaderMenu('width:175px;', rowNumber, 'Velg bruker', '');

  // start table body
  html += objUsers.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objUsers.insertTableColumns('', rowNumber);

  // user
  html += objUsers.showSelectedUsers('filterUserId', 'width:175px;', userId, '')

  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objUsers.insertTableColumns('', rowNumber, '', '');

  // end table body
  html += objUsers.endTableBody();

  // The end of the table
  html += objUsers.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(userId, rowNumber) {

  // start table
  let html = objUsers.startTable(tableWidth);

  // Check if users row exist
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // password, securityLevel,
    html += "<tr>";
    rowNumber++;
    html += objUsers.showTableHeaderMenu("width:175px;", rowNumber, 'Passord', 'Sikkerhetsnivå');

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    // password
    html += objUsers.inputTablePassword('password', '', '**********', 45);

    // securityLevel
    html += objUsers.showSelectedNumbers('securityLevel', "width:175px;", 1, 9,objUsers.arrayUsers[rowNumberUser].securityLevel);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += "</tr>";

    // show buttons

    // insert table columns in start of a row
    rowNumber++;
    html += objUsers.insertTableColumns('', rowNumber);

    html += objUsers.showButton('width:175px;', 'update', 'Oppdater');
    html += "</tr>";

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
  const validUserId = objUsers.validateNumber('userId', userId, -1, objUsers.nineNine);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = objUsers.validateNumber('securityLevel', securityLevel, 1, 9);

  // validate password
  let password = document.querySelector('.password').value;
  password = (password === '**********')
    ? objUsers.arrayUsers[rowNumberUser].password
    : password;
  const validPassword = (password.length >= 5);

  if (validUserId && validSecurityLevel && validPassword) {

    // Check if the userId exist
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUsers.updateUserPassword(user, userId, securityLevel, password);
      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
    }

    // Show filter
    let menuNumber = 0;
    menuNumber = showFilter(userId, menuNumber,);
    menuNumber = showResult(userId, menuNumber);

    document.querySelector('.filterUserId').disabled = false;
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, '', 'Ugyldig passord.');
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


    await objUsers.deleteUsersTable(userId, user);
  }
}