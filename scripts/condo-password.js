// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');
const objPassword = new Password('password');

const enableChanges = (objPassword.securityLevel > 5);
const applicationName = "condo-password";

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
      let html = showHorizontalMenu(objPassword.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = showHorizontalMenu(objPassword.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;
      objPassword.markActivatedApplication(objPassword.arrayMenuNews, applicationName);

      const resident = 'A';

      // Verify whether the user has permission to change all passwords
      // or only their own password
      (enableChanges)
        ? await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine)
        : await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.userId);
      await objCondominium.loadCondominiumsTable(objPassword.condominiumId);
      await objCondo.loadCondoTable(objPassword.condominiumId, objPassword.nineNine);

      // Show header
      //showHeader();

      // Show filter
      showFilter(objPassword.userId);

      // Show result
      showUser(objPassword.userId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      await updateUserRow(userId);
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
    await objCondo.deleteCondoTable(userId, user);
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

  // Password, securitylevel
  html += startLine();

  // password
  const password = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].password.trim();
  html += showTextNew('Passord', 'password', password, enableChanges, "Passord");
  html += "</div>";

  // security level
  const securityLevel = (rowNumberUser === -1)
    ? ''
    : objUser.arrayUsers[rowNumberUser].securityLevel;
  html += showSelectedNumbersNew('Sikkerhetsnivå', 'securityLevel', '', 1, 9, 1, enableChanges)
  html += "</div>";

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
  document.querySelector('.result').innerHTML = html;
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = validateIntervalNew('userId',   '', 'Ugyldig Bruker', true, userId, -1, objUser.nineNine);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = validateIntervalNew('securityLevel',    '', 'Ugyldig sikkerhetsnivå', true, securityLevel, 1, 9);
 
  // validate password
  let password = document.querySelector('.password').value;
  /*
  let password = (password === '')
    ? objUser.arrayUsers[rowNumberUser].password
    : document.querySelector('.password').value;
  */
  const validPassword = ((password.length >= 5) || (password === ''));


  if (validUserId && validSecurityLevel && validPassword) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update the users row
      await objUser.updateUserPassword(objPassword.user, userId, securityLevel, password);

      // Verify whether the user has permission to change all passwords
      // or only personal password
      const resident = 'A';

       if (enableChanges) await objUser.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine);
    }

    // Show filter
    //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
    showFilter(userId);
    showUser(userId);

    document.querySelector('.filterUserId').disabled = false;
  } else {

    showMessageNew('Ugyldig passord.');
  }
  */

    document.querySelector('.showMessage').style.display = "none";

    // Check if the userId exist
    const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update a accounts row
      await objAccounts.updateAccountsTable(objAccount.user, accountId, fixedCost, name);
    } else {

      // Insert a accounts row
      await objAccount.insertAccountsTable(objAccount.condominiumId, objAccount.user, year, priceKilowattHour);
      await objAccount.getHighestAccountId(objAccount.condominiumId);
      accountId = objAccount.arrayAccounts[0].accountId;
    }

    await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterAccountId', false);
    }

    // Show filter
    showFilter(accountId);

    // Show account
    showAccount(accountId);
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