// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');

const enableChanges = (objUser.securityLevel > 5);

const tableWidth = "width:600px;";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objUser.condominiumId === 0) || (objUser.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      if (enableChanges) {

        const resident = 'A';
        await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
        await objCondominium.loadCondominiumsTable(objUser.condominiumId);
        await objCondo.loadCondoTable(objUser.condominiumId, objUser.nineNine);
      } else {

        const resident = 'Y';
        await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.userId);
        await objCondominium.loadCondominiumsTable(objUser.condominiumId);
        await objCondo.loadCondoTable(objUser.condominiumId, objUser.nineNine);
      }

      // Show header
      showHeader();

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, objUser.condominiumId, objUser.userId);

      // Show result
      menuNumber = showResult(menuNumber, objUser.userId);

      // Events
      events();
    }
  } else {

    objUser.showMessage(objUser, '', 'condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter condomium Id
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      const resident = 'A';
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value)
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);

      //const userId = Number(document.querySelector('.filterUserId').value);
      const userId = objUser.arrayUsers.at(-1).userId;

      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId, userId);
      menuNumber = showResult(menuNumber, userId);
    };
  });

  // Filter user
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const resident = 'A';
      const condominiumId = (enableChanges)
        ? Number(document.querySelector('.filterCondominiumId').value)
        : objUser.condominiumId;
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);

      const userId = Number(document.querySelector('.filterUserId').value);
      showResult(3, userId);
    };
  });

  // update/insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Because of check of unique email
      await objUser.loadAllUsersTable();

      const userId = document.querySelector('.filterUserId').value;
      updateUserRow(userId);
    };
  });

  // Delete users row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteUserRow();

      const resident = 'A';
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);

      // Show filter
      const userId = objUser.arrayUsers.at(-1).userId;

      // Show filter
      const condominiumId = Number(document.querySelector('.filterCondominium').value);
      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId, objUser.userId);
      menuNumber = showResult(menuNumber, objUser.userId);
    };
  });

  // Insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload users table
      const resident = 'A';
      const condominiumId = objUser.condominiumId;
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);

      const userId = objUser.userId;
      if (userId === 0) userId = objUser.arrayUsers.at(-1).userId;

      // Show filter
      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId, userId);
      showResult(menuNumber, userId);
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

function resetValues() {

  // conmdominium Id
  //document.querySelector('.filterCondominiumId').value = 0;

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

  // resident
  document.querySelector('.resident').value = '';


  document.querySelector('.filterUserId').disabled = true;
  
  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objUser.startTable(tableWidth);

  // start table body
  html += objUser.startTableBody();

  // show main header
  html += objUser.showTableHeaderLogOut('width:175px;', '', '', 'Bruker', '');
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
  html += objUser.showTableHeaderMenu('width:175px;', menuNumber, 'Bruker', '');

  // start table body
  html += objUser.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objUser.insertTableColumns('', menuNumber);

  // Condominium
  if (objUser.securityLevel >= 9) html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '', true)

  // user
  html += objUser.showSelectedUsers('filterUserId', 'width:175px;', userId, '', '', enableChanges)

  html += "<td></td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objUser.insertTableColumns('', menuNumber, '', '');
  html += "</tr>";

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show result
function showResult(menuNumber, userId) {

  // start table
  let html = objUser.startTable(tableWidth);

  // Check if users row exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // email,condoId
    html += "<tr>";
    menuNumber++;
    html += objUser.showTableHeaderMenu("width:175px;", menuNumber, 'email', 'Leilighet');

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    // email
    html += objUser.inputTableColumn('email', '', objUser.arrayUsers[rowNumberUser].email, 45, enableChanges);

    // condoId
    html += objCondo.showSelectedCondos('condoId', "width:175px;", objUser.arrayUsers[rowNumberUser].condoId, '', '', enableChanges);

    html += "</tr>";

    // firstName, lastName
    html += "<tr>";
    menuNumber++;
    html += objUser.showTableHeaderMenu("width:175px;", menuNumber, 'Fornavn', 'Etternavn');

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    // firstName
    html += objUser.inputTableColumn('firstName', '', objUser.arrayUsers[rowNumberUser].firstName, 45, enableChanges);

    // lastName
    html += objUser.inputTableColumn('lastName', '', objUser.arrayUsers[rowNumberUser].lastName, 45, enableChanges);

    html += "</tr>";

    // phone, activ user
    html += "<tr>";
    menuNumber++;
    html += objUser.showTableHeaderMenu("width:175px;", menuNumber, 'Telefonnummer', 'Beboer');

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber);

    // phone
    html += objUser.inputTableColumn('phone', '', objUser.arrayUsers[rowNumberUser].phone, 15, enableChanges);

    // Activ user
    resident = (objUser.arrayUsers[rowNumberUser].resident === 'Y') ? 'Ja' : 'Nei';
    html += objUser.showSelectedValues('resident', '', enableChanges, resident, 'Ja', 'Nei')

    html += "</tr>";

    // insert table columns in start of a row
    menuNumber++;
    html += objUser.insertTableColumns('', menuNumber, '', '');
    html += "</tr>";

    // Show buttons
    if (enableChanges) {

      // insert table columns in start of a row
      menuNumber++;
      html += objUser.insertTableColumns('', menuNumber);

      html += objUser.showButton('width:175px;', 'update', 'Oppdater');
      html += objUser.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      menuNumber++;
      html += objUser.insertTableColumns('', menuNumber);

      html += objUser.showButton('width:175px;', 'delete', 'Slett');
      html += objUser.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    menuNumber++;
    html += objUser.showRestMenu(menuNumber);

    // The end of the table
    html += objUser.endTable();
    document.querySelector('.result').innerHTML = html;
    if (enableChanges) document.querySelector('.cancel').disabled = true;

    return menuNumber;
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1;
  userId = Number(userId);
  const validUserId = objUser.validateNumber('userId', userId, -1, objUser.nineNine, objUser, '', 'Ugyldig bruker');

  // resident
  let resident = document.querySelector('.resident').value;
  resident = (resident === 'Ja') ? 'Y' : 'N';

  // email
  const email = document.querySelector('.email').value;
  let validEmail = objUser.validateEmail('email', email, objUser, '', 'Ugyldig mail');

  if (validEmail) {

    // Check for duplicate email
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser === -1) {

      // user does not exist
      // check if email exist
      validEmail = objUser.checkUiqueEmail(email, objUser, '', 'Ugyldig e-mail. Finnes fra før.')
    } else {

      // user exist
      // Check if email is changed
      //if (objUser.arrayUsers[rowNumberUser].email !== email) {
      if (objUser.arrayUsers[rowNumberUser].email.toLowerCase() !== email.toLowerCase()) {
        // check if email exist
        validEmail = objUser.checkUiqueEmail(email, objUser, '', 'Ugyldig e-mail. Finnes fra før.');
      }
    }
  } else {

    objUser.showMessage(objUser, '', 'Ugyldig email.');
  }

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = objUser.validateNumber('condoId', condoId, 0, objUser.nineNine, objUser, '', 'Ugyldig leilighet');

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = objUser.validateText('firstName', firstName, 3, 45, objUser, '', 'Ugyldig fornavn');

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = objUser.validateText('lastName', lastName, 3, 45, objUser, '', 'Ugyldig etternavn');

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUser.validatePhone('phone', phone);

  // validate condominium
  //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
  //const validCondominiumId = objUser.validateNumber('condominium', condominiumId, 0, objUser.nineNine, objUser, '', 'Ugyldig sameie');

  //if (validUserId && validEmail && validCondoId && validFirstName && validLastName
  //&& validPhone && validCondominiumId) {
  if (validUserId && validEmail && validCondoId && validFirstName && validLastName
    && validPhone) {

    document.querySelector('.message').style.display = "none";

    const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUsersTable(condominiumId, resident, objUser.user, email, userId, condoId, firstName, lastName, phone);
      resident = 'A';
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);
    } else {

      // user does not exist
      // Insert the user row in users table
      const securityLevel = 1;
      const password = "12345";
      await objUser.insertUsersTable(resident, condominiumId, objUser.user, email, condoId, firstName, lastName, phone, securityLevel, password);
      resident = 'A';
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);
      userId = objUser.arrayUsers.at(-1).userId;
      document.querySelector('.filterUserId').value = userId;
    }

    // Show filter
    let menuNumber = 0;
    menuNumber = showFilter(menuNumber, condominiumId, userId);
    menuNumber = showResult(menuNumber, userId);
    objUser.removeMessage();

    document.querySelector('.filterUserId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}


// Delete a users row
async function deleteUserRow() {

  // userId
  const userId = Number(document.querySelector('.filterUserId').value);

  // Check if user exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // delete a user row
    await objUser.deleteUsersTable(userId, objUser.user);
  }
}