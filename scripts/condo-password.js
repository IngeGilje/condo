// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');
const objPassword = new Password('password');

const enableChanges = (objPassword.securityLevel > 5);

const columnWidths = [175, 175];

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

      // Show main menu
      let html = objPassword.showHorizontalMenu(objPassword.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = objPassword.showHorizontalMenu(objPassword.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;

      const resident = 'A';

      // Verify whether the user has permission to change all passwords
      // or only their own password
      (enableChanges)
        ? await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine)
        : await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.userId);
      await objCondominium.loadCondominiumsTable(objPassword.condominiumId);
      await objCondo.loadCondoTable(objPassword.condominiumId, objPassword.nineNine);

      // Show header
      showHeader();

      // Show filter
      showFilter(objPassword.userId);

      // Show result
      showUser(objPassword.userId);

      // Events
      events();
    }
  } else {

    objPassword.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

      showFilter(userId);
      showUser(userId);
    };
  });

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      const resident = "A";
      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine);

      const userId = Number(document.querySelector('.filterUserId').value);

      showFilter(userId);
      showUser(userId);
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
  let html = objUser.initializeTable(columnWidths);

  // start table body
  html += objUser.startTableBody();

  // show main header
  html += objUser.showTableHeaderLogOut('Passord');
  html += "</tr>";

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(userId) {

  /*
  // Start table
  let html = objUser.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  html += objUser.showTableHeaderMenu('', 'centrum', 'Sameie', 'Bruker');

  // start table body
  html += objUser.startTableBody();

  // insert a table row (<tr></td>)
  html += objPassword.insertTableRow('');

  // Show selected condominiums 
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', '', condominiumId, '', '', enableChanges);

  // user
  html += objUser.showSelectedUsers('filterUserId', '', userId, '', '', enableChanges)
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objPassword.insertTableRow('', '', '');

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.showFilter').innerHTML = html;
  */

  // show filter
  html = objPassword.startRow();

  // Show condominiums
  //html += objCondominium.showSelectedCondominiumsNew('Sameie', 'filterCondominiumId', '', condominiumId, '', '', true);

  // Show users
  html += objUser.showSelectedUsersNew('Bruker', 'filterUserId', '', userId, '', '', true);

  html += objPassword.endRow();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show user
function showUser(userId) {

  // start table
  let html = objUser.initializeTable(columnWidths);

  // Check if users row exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // password, securityLevel,
    //html += "<tr>";

    html += objUser.showTableHeaderMenu('', 'centrum', 'Passord', 'Sikkerhetsnivå');

    // insert a table row (<tr></td>)

    html += objUser.insertTableRow('');

    // password
    html += objUser.inputTablePassword('password', '', 45);

    // securityLevel (<td></td>)
    html += objUser.showSelectedNumbers('securityLevel', '', 1, 9, objUser.arrayUsers[rowNumberUser].securityLevel, enableChanges);

    html += "</tr>";

    // insert a table row (<tr></td>)

    html += objUser.insertTableRow('');
    html += "<td></td><td></td></tr>";

    // show buttons

    // insert a table row (<tr></td>)

    html += objUser.insertTableRow('');

    html += objUser.showButton('update', 'Oppdater');
    html += "<td></td></tr>";

    // The end of the table
    html += objUser.endTable();
    document.querySelector('.result').innerHTML = html;


  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = objUser.validateInterval('userId', columnWidths, '', 'Ugyldig bruker', true, userId, -1, objUser.nineNine);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = objUser.validateInterval('securityLevel', columnWidths, '', 'Ugyldig sikkerhetsnivå', true, securityLevel, 1, 9);

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

      /*
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

      (enableChanges)
        ? await objUser.loadUsersTable(condominiumId, resident, objPassword.userId)
        : await objUser.loadUsersTable(condominiumId, resident, objPassword.nineNine);
      */
      if (enableChanges) await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine);
    }

    // Show filter
    //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
    showFilter(userId);
    showUser(userId);

    document.querySelector('.filterUserId').disabled = false;
  } else {

    objPassword.showMessageNew(columnWidths, '', 'Ugyldig passord.');
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