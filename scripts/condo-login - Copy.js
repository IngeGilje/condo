// Login
// Activate classes
const objUsers = new User('user');
const objLogIn = new Login('login');

sessionStorage.clear();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    const condominiumId = objLogIn.nineNine;
    const resident = 'Y';
    await objUsers.loadUsersTable(condominiumId, resident);

    // Show header
    showHeader();

    // Show login
    showResult();

    // Events
    events();
  } else {

    objUsers.showMessage(objUsers, 'Server condo-server.js har ikke startet.');
  }
}

// Events for users
function events() {

  // check password
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('LogIn')) {

      checkLoginSync();

      // check password
      async function checkLoginSync() {

        checkLogin();
      }
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

// Show header
function showHeader() {

  // Start table
  let html = objLogIn.startTable('width:250px;margin: 0 auto;');

  // show main header
  html += objLogIn.showTableHeader('width:250px;', 'LogIn');

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show result
function showResult() {

  // start table
  let html = objLogIn.startTable('width:250px;margin: 0 auto;');

  // Header for value including menu
  html += objLogIn.showTableHeader('', 'Email');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('margin: 0 auto;', 0);

  // email
  html += objLogIn.inputTableColumn('email', '', '', 45, '');

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
  password = '';
  html += objLogIn.inputTableColumn('password', '', password, 45);

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
  const validEmail = objUsers.validateEmail('email', email);

  // validate password
  const password = document.querySelector('.password').value;
  const validPassword = objUsers.validateText(password, 5, 45)

  if (validEmail && validPassword) {

    // get userId
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.email === email);
    if (rowNumberUser !== -1) {

      // Check user and password 
      userId = objUsers.arrayUsers[rowNumberUser].userId;
      if (await objUsers.validateUser(userId, password)) {

        // Load users table
        const condominiumId = objLogIn.nineNine;
        const resident = 'Y';
        await objUsers.loadUsersTable(condominiumId, resident);

        // The sessionStorage object stores data for only one session
        window.sessionStorage.setItem("condominiumId", objUsers.arrayUsers[0].condominiumId);
        window.sessionStorage.setItem("user", objUsers.arrayUsers[0].email);

        // Start bank account transactions
        window.location.href = 'http://localhost/condo-bankaccounttransaction.html';
        return true;
      }
    }
  }

  // password/ user is not OK
  objUsers.showMessage(objUsers, 'Ugyldig passord/email');

  resetValues();
  return false;
}