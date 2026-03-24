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

    // Show header
    //showHeader();

    // Show login
    showResult();

    // Events
    events();
  } else {

    objUser.showMessage(objLogIn, 'width:250px;margin: 0 auto;', 'condo-server.js er ikke startet.');
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

// reset values
function resetValues() {

  // user
  document.querySelector('.email').value = '';

  // password
  document.querySelector('.password').value = '';

  sessionStorage.clear();
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objLogIn.startTable(tableWidth,'margin: 0 auto;');

  // show main header
  html += objLogIn.showTableHeader('width:250px;', 'LogIn');

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show result
function showResult() {

  // start table
  let html = objLogIn.startTable('width:250px;margin: 0 auto;');

  // Header for value including menu
  html += objLogIn.showTableHeader('', 'Email');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('margin: 0 auto;', 0);

  // email
  const email = 'inge.gilje@ig.no';
  html += objLogIn.inputTableColumn('email', '', email, 45, false, true);

  html += "</tr>";

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0, '');

  html += "</tr>";

  // password
  html += "<tr>";
  html += objLogIn.showTableHeader("width:250px;", 'Passord');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0);

  // password
  password = '12345';
  html += objLogIn.inputTableColumnPassword('password', '', password, 45);

  html += "</tr>";

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0, '');

  html += "</tr>";

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0);

  // Show buttons
  html += objLogIn.showButton('width:170px;', 'LogIn', 'LogIn');
  html += "</tr>";

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0, '');

  html += "</tr>";

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.result').innerHTML = html;
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

      // Start bank account transactions
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-bankaccounttransaction.html'
        : 'http://localhost/condo-bankaccounttransaction.html';
      window.location.href = URL;
      return true;
    }
  }

  // password/ user is not OK
  objUser.showMessage(objLogIn, 'width:250px;margin: 0 auto;', 'Ugyldig passord/email');

  resetValues();
  return false;
}