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
    if ((objUser.condominiumId === 0 || objUser.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
      await objCondominium.loadCondominiumsTable(objUser.condominiumId);
      await objCondo.loadCondoTable(objUser.condominiumId);

      // Show header
      showHeader();

      // Show filter
      let menuNumber = 0;
      const userId = objUser.arrayUsers.at(-1).userId;
      menuNumber = showFilter(userId, menuNumber);

      // Show result
      menuNumber = showResult(userId, menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      //let menuNumber = 0;
      showResult(userId, 3);
    };
  });

  // update/insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const userId = document.querySelector('.filterUserId').value;
      updateUserRow(userId);
    };
  });

  // Delete users row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteUserRow();

      const resident = 'Y';
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);

      // Show filter
      const userId = objUser.arrayUsers.at(-1).userId;
      showResult(userId, 3);
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
      const resident = 'Y';
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);

      let userId = Number(document.querySelector('.filterUserId').value);
      if (userId === 0) userId = objUser.arrayUsers.at(-1).userId;

      // Show filter
      //menuNumber = showFilter(userId, menuNumber);
      showResult(userId, 3);
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


    objCondo.deleteCondoTable(userId, objUser.user);
  }
}

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

  document.querySelector('.filterUserId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

// Show header
function showHeader() {

  // Start table
  html = objUser.startTable(tableWidth);

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
function showFilter(userId, menuNumber) {

  // Start table
  html = objUser.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objUser.showTableHeaderMenu('width:175px;', menuNumber, 'Velg bruker', '');

  // start table body
  html += objUser.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objUser.insertTableColumns('', menuNumber);

  // user
  html += objUser.showSelectedUsers('filterUserId', 'width:175px;', userId, '', '', true)
  html += "</tr>";

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
function showResult(userId, menuNumber) {

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
    html += objUser.showSelectedValues('resident', '', enableChanges, 'Nei', 'Nei', 'Ja')

    html += "</tr>";

    // condominium
    if (objUser.securityLevel >= 9) {

      html += "<tr>";
      menuNumber++;
      html += objUser.showTableHeaderMenu("width:175px;", menuNumber, 'Sameie', '');

      // insert table columns in start of a row
      menuNumber++;
      html += objUser.insertTableColumns('', menuNumber);

      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUser.condominiumId);

      // Show selected condominiums 
      if (rowNumberCondominium !== -1)
        html += objCondominium.showSelectedCondominiums('condominiumId', "width:175px;", objCondominium.arrayCondominiums[rowNumberCondominium].condominiumId, '', 'Nytt sameie', enableChanges);
       html += "</tr>";
    }

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

    return menuNumber;
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = objUser.validateNumber('userId', userId, -1, objUser.nineNine);

  // resident
  let resident = document.querySelector('.resident').value;
  resident = (resident === 'Ja') ? 'Y' : 'N';

  // email
  const email = document.querySelector('.email').value;
  let validEmail = objUser.validateEmail('email', email);
  if (validEmail) {

    validEmail = !objUser.checkUiqueEmail(userId, email);
  }

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = objUser.validateNumber('condoId', condoId, 0, objUser.nineNine);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = objUser.validateText(firstName, 3, 50);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = objUser.validateText(lastName, 3, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUser.validatePhone('phone', phone);

  if (validUserId && validEmail && validCondoId && validFirstName && validLastName && validPhone) {

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUsersTable(resident, objUser.user, email, userId, condoId, firstName, lastName, phone);
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
    } else {

      // check if user exist
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.email === objUser.user);
      if (rowNumberUser === -1) {

        // user does not exist
        // Insert the user row in users table
        const securityLevel = 1;
        const password = "";
        await objUser.insertUsersTable(resident, objUser.condominiumId, objUser.user, email, condoId, firstName, lastName, phone, securityLevel, password);
        await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
        userId = objUser.arrayUsers.at(-1).userId;
        document.querySelector('.filterUserId').value = userId;
      } else {

        objRemoteHeating.showMessage(objRemoteHeating, '', 'Ugyldig e-mail. Finnes fra før.');
      }
    }

    // Show filter
    menuNumber = showResult(userId, 3);

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
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // delete a user row


    await objUser.deleteUsersTable(userId, objUser.user);
  }
}