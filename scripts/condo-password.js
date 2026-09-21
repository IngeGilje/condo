// Maintenance of users

// Activate objects
const today = new Date();
const objCondo = new Condo('condo');
const objCondominiums = new Condominiums('condominiums');
const objUsers = new Users('users');
const objPassword = new Password('password');

const enableChanges = (objPassword.securityLevel > 5);
const applicationName = "condo-password";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objPassword.condominiumId === 0) || (objPassword.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objPassword.showMenu(objPassword.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'A';

      // Verify whether the user has permission to change all passwords
      // or only their own password
      (enableChanges)
        ? await objUsers.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine)
        : await objUsers.loadUsersTable(objPassword.condominiumId, resident, objPassword.userId);
      await objCondominiums.loadCondominiumsTable(objPassword.condominiumId);
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

  /*
  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

      showFilter(userId);
      showUser(userId);
    };
  });
  */

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      const resident = "A";
      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objUsers.loadUsersTable(objPassword.condominiumId, resident, objPassword.nineNine);

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

      let url = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(userId) {

  // Start frame
  //let html = startTableFilter('filter-frame');

  // Start  frame
  let html = startGridFilter("Tømmekalender");

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

  let html = startGrid('Konto');

  // password
  /*
  const password = (rowNumberUser === -1)
    ? ''
    : objUsers.arrayUsers[rowNumberUser].password.trim();
  */
  const password = objUsers.arrayUsers[rowNumberUser]?.password ?? '';
  html += inputText('password', 'Passord', password, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // security level
  const securityLevel = objUsers.arrayUsers[rowNumberUser]?.securityLevel ?? 0;
  html += showSelectedNumbers('securityLevel', 'Sikkerhetsnivå', 1, 9, 1, enableChanges);
  html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    //html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");
    //html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }
  document.querySelector('.showPassword').innerHTML = html;
}

// Update a users row
async function updateUserRow(userId) {

  // UserId
  if (userId === '') userId = -1
  userId = Number(userId);
  const validUserId = validateIntervalNew('userId', 'Ugyldig Bruker', userId, -1, objUsers.nineNine);

  // securityLevel
  const securityLevel = Number(document.querySelector('.securityLevel').value);
  const validSecurityLevel = validateIntervalNew('securityLevel', 'Ugyldig sikkerhetsnivå',  securityLevel, 1, 9);

  // validate password
  let password = document.querySelector('.password').value;
  const validPassword = ((password.length >= 5) || (password === ''));

  if (validUserId && validSecurityLevel && validPassword) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the userId exist
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === userId);
    if (rowNumberUser !== -1) {

      // update a accounts row
      await objAccounts.updateAccountsTable(objAccount.user, accountId, fixedCost, name);
      await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

      // Show filter
      showFilter(accountId);

      // Show account
      showAccount(accountId);
    }

    removeMessage();
  }
}
