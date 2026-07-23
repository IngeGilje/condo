// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');

const enableChanges = (objUser.securityLevel > 5);
const applicationName = "condo-user";

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
      let html = showHorizontalMenu(objUser.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = showHorizontalMenu(objUser.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;
      objUser.markActivatedApplication(objUser.arrayMenuUser, applicationName);

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
      //showHeader();

      // Show filter
      showFilter(objUser.userId);

      // Show result
      showUser(objUser.userId);

      // Events
      events();
    }
  } else {

    showMessageNew('condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter user
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      showUser(userId);
    };
  });

  // update/insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Because of check of unique email
      await objUser.loadAllUsersTable();

      const userId = document.querySelector('.filterUserId').value;
      await updateUserRow(userId);
    };
  });

  // Delete users row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      await deleteUserRow();

      const resident = 'A';
      await objUser.loadUsersTable(condominiumId, resident, objUser.nineNine);

      // Show filter
      const userId = objUser.arrayUsers.at(-1)?.userId ?? 0;

      // Show filter
      showFilter(userId);
      showUser(userId);
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
      if (userId === 0) userId = objUser.arrayUsers.at(-1)?.userId ?? 0;

      // Show filter
      showFilter(userId);
      showUser(userId);
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

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterUserId', true);
  }
}

// Show filter
function showFilter(userId) {

  // Start frame
  let html = startFrame();

  // show filter
  //html += startLine();

  // Show users
  html += objUser.showSelectedUsersNew('Bruker', 'filterUserId', '', userId, '', '', true);

  //html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show user
function showUser(userId) {

  // row number user
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);

  // Empty line
  let html = emptyLine();

  // email
  html += startLine();
  const email = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].email.trim();
  html += showTextNew('E-mail', 'email', email, enableChanges, "E-mail");
  html += "</div>";

  // condoId
  html += startLine();
  const condoId = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].condoId;
  html += objCondo.showSelectedCondosNew('Leilighet', 'condoId', '', condoId, '', 'Velg leilighet', enableChanges);
  html += "</div>";

  // first Name, last Name
  html += startLine();

  // first Name
  const firstName = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].firstName.trim();
  html += showTextNew('Fornavn', 'firstName', firstName, enableChanges, "Fornavn");

  // last Name
  const lastName = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].lastName.trim();
  html += showTextNew('Etternavn', 'lastName', lastName, enableChanges, "Etternavn");
  html += "</div>";

  // phone, activ user
  html += startLine();

  // phone
  const phone = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].phone.trim();
  html += showTextNew('Telefonnummer', 'phone', phone, enableChanges, "Telefonnummer");

  // Activ user?
  let resident = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].resident.trim();
  resident = (objUser.arrayUsers[rowNumberUser].resident === 'Y') ? 'Ja' : 'Nei';
  html += showSelectedValuesNew('Beboer', 'resident', '', enableChanges, resident, 'Nei', 'Ja');
  html += "</div>"

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showUser').innerHTML = html;

  //if (enableChanges) document.querySelector('.cancel').disabled = true;

  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterUserId', false, 'white');
  }
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1;
  userId = Number(userId);
  const validUserId = validateIntervalNew('userId', '', 'Ugyldig Bruker', true, userId, -1, objUser.nineNine);

  // resident
  let resident = document.querySelector('.resident').value;
  if (resident === 'Ja') resident = 'Y';
  if (resident === 'Nei') resident = 'N';
  const validResident = validateValuesNew('resident', 'Ugyldig beboertype', true, resident, 'Y', 'N')

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

    showMessageNew('Ugyldig email.');
  }

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', '', 'Ugyldig Leilighet', true, condoId, 0, objUser.nineNine);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = validateTextNew('firstName', '', 'Ugyldig fornavn', true, firstName, 3, 45);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = validateTextNew('lastName', '', 'Ugyldig etternavn', true, lastName, 3, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUser.validatePhone('phone', phone);

  if (validUserId && validEmail && validCondoId && validFirstName && validLastName
    && validPhone) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    const userId = Number(document.querySelector('.filterUserId').value);

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUsersTable(objUser.condominiumId, resident, objUser.user, email, userId, condoId, firstName, lastName, phone);
      resident = 'A';
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
    } else {

      // user does not exist
      // Insert the user row in users table
      const securityLevel = 1;
      const password = "12345";
      await objUser.insertUsersTable(resident, objUser.condominiumId, objUser.user, email, condoId, firstName, lastName, phone, securityLevel, password);
      resident = 'A';
      await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);
      userId = objUser.arrayUsers.at(-1)?.userId ?? 0;
      document.querySelector('.filterUserId').value = userId;
    }

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
                   disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterUserId', false, 'white');
    }

    // show filter
    showFilter(userId);

    // Show transaction
    showUser(userId);
  }
  */

    document.querySelector('.showMessage').style.display = "none";

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUsersTable(objUser.condominiumId, resident, objUser.user, email, userId, condoId, firstName, lastName, phone);
    } else {

      // Insert a accounts row
      await objUser.insertUsersTable(resident, objUser.condominiumId, objUser.user, email, condoId, firstName, lastName, phone, securityLevel, password);
      await objUser.getHighestUserId(objUser.condominiumId);
      userId = objUser.arrayUsers[0].userId;
    }

    resident = 'A';
    await objUser.loadUsersTable(objUser.condominiumId, resident, objUser.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterUserId', false);
    }

    // Show filter
    showFilter(userId);

    // Show user
    showUser(userId);
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