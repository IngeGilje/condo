// Login
// Activate classes
const objUser = new User('user');
const objLogIn = new Login('login');

sessionStorage.clear();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    const condominiumId = objLogIn.nineNine;
    const resident = 'Y';
    await objUser.loadUsersTable(condominiumId, resident, objLogIn.nineNine);

    // Show login
    showLogin();

    // Events
    events();
  } else {

    objUser.showMessage(objLogIn, 'width:250px;margin: 0 auto;', 'Server er ikke startet.');
  }
}

// Events for users
async function events() {

  // check password
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('LogIn')) {
      checkLogin();
    };
  });
}

// Show login
function showLogin() {

  // start table
  let html = objLogIn.startTable('width:250px;margin: 0 auto;');

  // Header for value including menu
  html += objLogIn.showTableHeader('', objLogIn.accountMenu, 'Email');

  // insert a table row
  html += objLogIn.insertTableRow('margin: 0 auto;', 0, objLogIn.accountMenu);

  // email
  const email = '';
  html += objLogIn.inputTableColumn('email', '', email, 45, true);
  html += "</tr>";

  // insert a table row
  html += objLogIn.insertTableRow('', 0, objLogIn.accountMenu, '');
  html += "</tr>";

  // password
  html += objLogIn.showTableHeader("width:250px;", objLogIn.accountMenu, 'Passord');

  // insert a table row
  html += objLogIn.insertTableRow('', 0, objLogIn.accountMenu);

  // password
  password = '';
  html += objLogIn.inputTableColumnPassword('password', '', password, 45, true);
  html += "</tr>";

  // insert a table row
  html += objLogIn.insertTableRow('', 0, objLogIn.accountMenu, '');
  html += "</tr>";

  // insert a table row
  html += objLogIn.insertTableRow('', 0, objLogIn.accountMenu);

  // Show buttons
  html += objLogIn.showButton('width:170px;', 'LogIn', 'LogIn');
  html += "</tr>";

  // insert a table row
  html += objLogIn.insertTableRow('', 0, objLogIn.accountMenu, '');

  html += "</tr>";

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.result').innerHTML = html;
}

// reset values
function resetValues() {

  // user
  document.querySelector('.email').value = '';

  // password
  document.querySelector('.password').value = '';

  sessionStorage.clear();
}

// check user and password
async function checkLogin() {

  // validate email
  const email = document.querySelector('.email').value;

  // validate password
  const password = document.querySelector('.password').value;

  // get userId
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  if (rowNumberUser !== -1) {

    // Check user and password 
    userId = objUser.arrayUsers[rowNumberUser].userId;
    if (await objUser.validateUser(userId, password)) {

      // The sessionStorage object stores data for only one session
      window.sessionStorage.setItem("condominiumId", objUser.arrayUsers[rowNumberUser].condominiumId);
      window.sessionStorage.setItem("user", objUser.arrayUsers[rowNumberUser].email);
      window.sessionStorage.setItem("securityLevel", objUser.arrayUsers[rowNumberUser].securityLevel);
      window.sessionStorage.setItem("userId", objUser.arrayUsers[rowNumberUser].userId);

      // Start news display
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-shownews.html'
        : 'http://localhost/condo-shownews.html';
      window.location.href = URL;
      return true;
    }
  }

  // password/ user is not OK
  objUser.showMessage(objLogIn, 'width:250px;margin: 0 auto;', 'Ugyldig email/passord');

  resetValues();
  return false;
}