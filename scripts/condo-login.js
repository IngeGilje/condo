// Login
// Activate user class
const objUsers = new User('user');
const objLogIn = new Login('login');

sessionStorage.removeItem("user");

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
  }
}

// Events for users
function events() {
}

// reset values
function resetValues() {

  // user
  document.querySelector('.email').value = '';

  // password
  document.querySelector('.password').value = '';

  sessionStorage.removeItem("user");
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

  // table header
  html += objLogIn.showTableHeader('', '', '');

  // Header for value including menu
  html += objLogIn.showTableHeaderMenu('', 0, 'Email');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('margin: 0 auto;', 0);

  // email
  html += objLogIn.inputTableColumn('email', '', 45, '');

  html += "</tr>";

  // password
  html += "<tr>";
  html += objLogIn.showTableHeaderMenu("width:250px;", 0, 'Passord');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0);

  // password
  password = '';
  html += objLogIn.inputTableColumn('street', password, 45);

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