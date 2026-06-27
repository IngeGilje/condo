// Login

// Activate classes
const objUser = new User('user');
const objLogIn = new Login('login');

const columnWidths = [175];

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

    showMessageNew('Server er ikke startet.');
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

  /*
  // start table
  let html = objLogIn.startTable('width:250px;margin: 0 auto;');

  // Header for value
  html += objLogIn.showTableHeader('', 'Email');

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('margin: 0 auto;');

  // email
  const email = '';
  html += objLogIn.editTableCellCenter('email', email, 45, true);
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('', '');
  html += "</tr>";

  // password
  html += objLogIn.showTableHeader("width:250px;",  'Passord');

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('');

  // password
  password = '';
  html += objLogIn.inputTableCellPassword('password', password, 45, true);
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('', '');
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('');

  // Show buttons (<tr></td>)
  html += objLogIn.showButton('LogIn', 'LogIn');
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objLogIn.insertTableRow('',  '');

  html += "</tr>";

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.result').innerHTML = html;
  */

  document.querySelector('.showLogIn').innerHTML = `
  <h2>Logg inn</h2>
  <div class="field">
    <input type="text" class="one-line center" autocomplete="off">
    <label>Brukernavn</label>
  </div>

  <p>&nbsp</p>

  <div class="field">
    <input type="password" class="one-line center">
    <label>Passord</label>
  </div>

   <p>&nbsp</p>

  <button class="login-btn LogIn">
    Logg inn
  </button>`;
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
  //const email = document.querySelector('.email').value;

  // validate password
  //const password = document.querySelector('.password').value;

  // get userId
  //const rowNumberUser = objUser.arrayUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  //if (rowNumberUser !== -1) {

  // Check user and password 
  //userId = objUser.arrayUsers[rowNumberUser].userId;
  password = "12345";
  userId = 2;
  if (await objUser.validateUser(userId, password)) {

    // The sessionStorage object stores data for only one session
    /*
    window.sessionStorage.setItem("condominiumId", objUser.arrayUsers[rowNumberUser].condominiumId);
    window.sessionStorage.setItem("user", objUser.arrayUsers[rowNumberUser].email);
    window.sessionStorage.setItem("securityLevel", objUser.arrayUsers[rowNumberUser].securityLevel);
    window.sessionStorage.setItem("userId", objUser.arrayUsers[rowNumberUser].userId);
    */
    window.sessionStorage.setItem("condominiumId", 2);
    window.sessionStorage.setItem("user", "inge.gilje@gmail.com");
    window.sessionStorage.setItem("securityLevel", 9);
    window.sessionStorage.setItem("userId", 2);

    // Start news display
    const URL = (objUser.serverStatus === 1)
      ? 'http://ingegilje.no/condo-shownews.html'
      : 'http://localhost/condo-shownews.html';
    window.location.href = URL;
    return true;
  }
  //}

  // password/ user is not OK
  showMessageNew(columnWidths, 'width:250px;margin: 0 auto;', 'Ugyldig email/passord');

  resetValues();
  return false;
}