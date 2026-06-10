// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');

const enableChanges = (objUser.securityLevel > 5);

const columnWidths = [175, 175, 175];

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

      // Show main menu
      let html = objUser.ShowHorizontalMenu(objUser.arrayMainMenu);
      document.querySelector('.mainMenu').innerHTML = html;

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
      
      showFilter( objUser.condominiumId, objUser.userId);

      // Show result
      showUser( objUser.userId);

      // Events
      events();
    }
  } else {

    objUser.showMessageNew(columnWidths, '', 'condo-server.js er ikke startet.');
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

      
      showFilter( condominiumId, userId);
      showUser( userId);
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
      showUser(3, userId);
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
      
      showFilter( condominiumId, objUser.userId);
      showUser( objUser.userId);
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
      
      showFilter( condominiumId, userId);
      showUser( userId);
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
  let html = objUser.initializeTable(columnWidths);

  // start table body
  html += objUser.startTableBody();

  // show main header
  html += objUser.showTableHeaderLogOut('', 'Bruker');
  html += "</tr>";

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter( condominiumId, userId) {

  // Start table
  let html = objUser.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  
  html += objUser.showTableHeaderMenu('', 'centrum', 'Bruker', '');

  // start table body
  html += objUser.startTableBody();

  // insert a table row (<tr></td>)
  
  html += objUser.insertTableRow('');

  // Condominium
  if (objUser.securityLevel >= 9) html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '', true)

  // user
  html += objUser.showSelectedUsers('filterUserId', 'width:175px;', userId, '', '', enableChanges)

  html += "</tr>";

  // insert a table row (<tr></td>)
  
  html += objUser.insertTableRow('', '', '');
  html += "</tr>";

  // end table body
  html += objUser.endTableBody();

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.editFilter').innerHTML = html;

  
}

// Show result
function showUser( userId) {

  // start table
  let html = objUser.initializeTable(columnWidths);

  // Check if users row exist
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUser !== -1) {

    // email,condoId
    //html += "<tr>";
    
    html += objUser.showTableHeaderMenu('', 'centrum', 'E-mail', 'Leilighet');

    // insert a table row (<tr></td>)
    
    html += objUser.insertTableRow('');

    // email
    html += objUser.editTableCell('email', '', objUser.arrayUsers[rowNumberUser].email, 45, enableChanges);

    // condoId
    html += objCondo.showSelectedCondos('condoId', 'width:175px;', objUser.arrayUsers[rowNumberUser].condoId, '', '', enableChanges);

    html += "</tr>";

    // firstName, lastName
    //html += "<tr>";
    
    html += objUser.showTableHeaderMenu('', 'centrum', 'Fornavn', 'Etternavn');

    // insert a table row (<tr></td>)
    
    html += objUser.insertTableRow('');

    // firstName
    html += objUser.editTableCell('firstName', '', objUser.arrayUsers[rowNumberUser].firstName, 45, enableChanges);

    // lastName
    html += objUser.editTableCell('lastName', '', objUser.arrayUsers[rowNumberUser].lastName, 45, enableChanges);

    html += "</tr>";

    // phone, activ user
    //html += "<tr>";
    
    html += objUser.showTableHeaderMenu('', 'centrum', 'Telefonnummer', 'Beboer');

    // insert a table row (<tr></td>)
    
    html += objUser.insertTableRow('');

    // phone
    html += objUser.editTableCell('phone', '', objUser.arrayUsers[rowNumberUser].phone, 15, enableChanges);

    // Activ user
    resident = (objUser.arrayUsers[rowNumberUser].resident === 'Y') ? 'Ja' : 'Nei';
    html += objUser.showSelectedValues('resident', 'width:175px;', enableChanges, resident, 'Ja', 'Nei')

    html += "</tr>";

    // insert a table row (<tr></td>)
    
    html += objUser.insertTableRow('', '', '');
    html += "</tr>";

    // Show buttons (<tr></td>)
    if (enableChanges) {

      // insert a table row (<tr></td>)
      
      html += objUser.insertTableRow('');

      html += objUser.showButton('update', 'Oppdater');
      html += objUser.showButton('cancel', 'Angre');
      html += "</tr>";

      // insert a table row (<tr></td>)
      
      html += objUser.insertTableRow('');

      html += objUser.showButton('delete', 'Slett');
      html += objUser.showButton('insert', 'Ny');
      html += "</tr>";
    }

    // The end of the table
    html += objUser.endTable();
    document.querySelector('.result').innerHTML = html;
    if (enableChanges) document.querySelector('.cancel').disabled = true;

    
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1;
  userId = Number(userId);
  const validUserId = objUser.validateInterval('userId', columnWidths, '', 'Ugyldig bruker', true, userId, -1, objUser.nineNine);

  // resident
  let resident = document.querySelector('.resident').value;
  if (resident === 'Ja') resident = 'Y';
  if (resident === 'Nei') resident = 'N';
  const validResident = objUser.validateValues('resident', columnWidths, '', 'Ugyldig beboertype', true, resident, 'Y', 'N')

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

    objUser.showMessageNew(columnWidths, '', 'Ugyldig email.');
  }

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = objUser.validateInterval('condoId', columnWidths, '', 'Ugyldig leilighet', true, condoId, 0, objUser.nineNine);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = objUser.validateText('firstName', columnWidths, '', 'Ugyldig fornavn', true, firstName, 3, 45);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = objUser.validateText('lastName', columnWidths, '', 'Ugyldig etternavn', true, lastName, 3, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUser.validatePhone('phone', phone);

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
    
    showFilter( condominiumId, userId);
    showUser( userId);
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