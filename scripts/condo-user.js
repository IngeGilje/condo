// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominiums = new Condominiums('condominiums');
const objUsers = new Users('users');

const enableChanges = (objUsers.securityLevel > 5);
const applicationName = "condo-user";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objUsers.condominiumId === 0) || (objUsers.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objUsers.showMenu(objUsers.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      await loadAllTables(objUsers.condominiumId);

      // Show filter
      showFilter(objUsers.condominiumId, objUsers.userId);

      // Show user
      showUser(objUsers.userId);

      // Events
      events();
    }
  } else {

    showMessageNew('condo-server.js er ikke startet.');
  }
}

// Events for users
async function events() {

  // Filter condominium
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

      await loadAllTables(condominiumId);

      // Show filter
      showFilter(condominiumId, 0);

      // Show user
      const userId = Number(document.querySelector('.filterUserId').value);
      showUser(userId);
    };
  });

  // Filter user
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      const userId = Number(document.querySelector('.filterUserId').value);

      // Show filter
      showFilter(condominiumId, userId)

      // Show user
      showUser(userId);
    };
  });

  // update/insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Because of check of unique email
      await objUsers.loadAllUsersTable();

      const userId = document.querySelector('.filterUserId').value;
      await updateUserRow(userId);
    };
  });

  // Delete users row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      await deleteUsersRow(userId);
    };
  });

  // Insert a user row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
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

// Show filter
function showFilter(condominiumId, userId) {

  // Start filter
  let html = startGridFilter("Bruker");

  // Show condominiums
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', 'Sameie', condominiumId, '', '', enableChanges);

  // New line
  html += " ";

  // Show users
  html += objUsers.showSelectedUsersNew('filterUserId', 'Bruker', userId, '', '', true);

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show user
function showUser(userId) {

  // row number user
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);

  // Empty line
  html = emptyLine();
  html += startGrid('Bruker');

  // email
  const email = objUsers.arrayUsers[rowNumberUser]?.email ?? '';
  html += inputText('email', 'E-mail', email, 45, enableChanges);
  html += "<div></div>";

  // condoId
  const condoId = objUsers.arrayUsers[rowNumberUser]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('condoId', 'Leilighet', condoId, '', 'Velg leilighet', enableChanges);

  // Activ user?
  let resident = objUsers.arrayUsers[rowNumberUser]?.resident ?? '';
  resident = (resident === 'Y') ? 'Ja' : 'Nei';
  html += inputValues('resident', 'Beboer', enableChanges, resident, 'Nei', 'Ja');

  // first Name
  const firstName = objUsers.arrayUsers[rowNumberUser]?.firstName ?? '';
  html += inputText('firstName', 'Fornavn', firstName, 45, enableChanges);

  // last Name
  const lastName = objUsers.arrayUsers[rowNumberUser]?.lastName ?? '';
  html += inputText('lastName', 'Etternavn', lastName, 45, enableChanges);

  // phone
  const phone = objUsers.arrayUsers[rowNumberUser]?.phone ?? '';
  html += inputText('phone', 'Telefonnummer', phone, 20, enableChanges);

  // security level
  const securityLevel = objUsers.arrayUsers[rowNumberUser]?.securityLevel ?? 0;
  html += showSelectedNumbers('securityLevel', 'Sikkerhetsnivå', Number(securityLevel), 1, 9, enableChanges);


  // password 
  const password = objUsers.arrayUsers[rowNumberUser]?.password ?? '';
  html += inputText('password', 'Passord', password, 45, enableChanges);
  html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showUser').innerHTML = html;
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1;
  userId = Number(userId);
  const validUserId = validateIntervalNew('userId', 'Ugyldig Bruker', userId, -1, objUsers.nineNine);

  // resident
  let resident = document.querySelector('.resident').value;
  if (resident === 'Ja') resident = 'Y';
  if (resident === 'Nei') resident = 'N';
  const validResident = validateValuesNew('resident', 'Ugyldig beboertype', resident, 'Y', 'N')

  // email
  const email = document.querySelector('.email').value;
  //let validEmail = validateEmail('email', email, objUser, 'Ugyldig mail');
  let validEmail = validateEmail('email', email, 'Ugyldig mail');

  if (validEmail) {

    // Check for duplicate email
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser === -1) {

      // user does not exist
      // check for unique email
      validEmail = objUsers.checkUiqueEmail(email, 'E-mail finnes fra før.')
    } else {

      // user exist
      // check for unique email
      if (objUsers.arrayUsers[rowNumberUser].email.toLowerCase() !== email.toLowerCase()) {
        // check if email exist
        validEmail = objUsers.checkUiqueEmail(email, objUser, '', 'Ugyldig e-mail. Finnes fra før.');
      }
    }
  } else {

    showMessageNew('Ugyldig email.');
  }

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', 'Ugyldig Leilighet', condoId, 0, objUsers.nineNine);

  // validate firstName
  const firstName = document.querySelector('.firstName').value;
  const validFirstName = validateTextNew('firstName', 'Ugyldig fornavn', firstName, 3, 45);

  // validate lastName
  const lastName = document.querySelector('.lastName').value;
  const validLastName = validateTextNew('lastName', 'Ugyldig etternavn', lastName, 3, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objUsers.validatePhone('phone', phone);

  // security level
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = validateIntervalNew('securityLevel', 'Ugyldig Sikkerhestnivå', securityLevel, 1, 9);

  // validate password
  const password = document.querySelector('.password').value;
  const validPassword = validateTextNew('password', 'Ugyldig passord', password, 5, 45);

  if (validUserId && validEmail && validCondoId && validFirstName && validLastName
    && validPhone && validSecurityLevel && validPassword) {

    document.querySelector('.showMessage').style.display = "none";
    const condominiumId = Number(document.querySelector(".filterCondominiumId").value)

    // Check if the userId exist
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUsers.updateUsersTable(condominiumId, resident, objUsers.user, email, userId, condoId, firstName, lastName, phone);
    } else {

      // Insert a accounts row
      await objUsers.insertUsersTable(resident, condominiumId, objUsers.user, email, condoId, firstName, lastName, phone, securityLevel, password);
      await objUsers.getHighestUserId(condominiumId);
      userId = objUsers.arrayUsers.at[-1].userId;
    }

    await objUsers.loadUsersTable(condominiumId, resident, objUsers.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(condominiumId, userId);

    // Show user
    showUser(userId);
  }
}

// Delete users row
async function deleteUsersRow(userId) {

  const condominiumId = Number(document.querySelector(".filterCondominiumId").value)

  // Check if users row exist
  const rowNumberUsers = objUsers.arrayUsers.findIndex(user => user.userId === userId);
  if (rowNumberUsers !== -1) {

    // delete users row
    await objUsers.deleteUsersTable(userId, objUsers.user);
    await objUsers.getHighestUserId(condominiumId);

    // Check for empty array
    userId = 0;
    if (objUsers.arrayUsers.length > 0) userId = objUsers.arrayUsers[0].userId;
  }

  const resident = (enableChanges)
    ? "A"
    : "Y";
  await objUsers.loadUsersTable(condominiumId, resident, objUsers.nineNine);

  // Show filter
  showFilter(condominiumId, userId);

  // Show user
  showUser(userId);
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

  // resident
  document.querySelector('.resident').value = '';

  // securityLevel
  document.querySelector('.securityLevel').value = 1;

  // password
  document.querySelector('.password').value = "";

  // Buttons
  if (enableChanges) {

    disableButton('delete', true);
  }
}

// load all tables 
async function loadAllTables(condominiumId) {

  const resident = (enableChanges)
    ? "A"
    : "Y";

  await objUsers.loadUsersTable(condominiumId, resident, objUsers.nineNine);
  await objCondominiums.loadCondominiumsTable(condominiumId);
  await objCondo.loadCondoTable(condominiumId);
};
