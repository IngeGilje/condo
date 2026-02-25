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
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
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

/*
// check Log In
function checkLogin() {

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objUsers.validateEmail('email', email);

  // validate password
  const password = document.querySelector('.password').value;
  const validPassword = objUsers.validateText(password, 5, 45)

  if (validEmail && validPassword) {

    // Check user
    const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.email === email);
    if (rowNumberUser !== -1) {
      if (objUsers.arrayUsers[rowNumberUser].email === email && objUsers.arrayUsers[rowNumberUser].password === password) {

        // save user info
        const userInfo = `
        {
          " email":"${email}",
          " password":${objUsers.arrayUsers[rowNumberUser].securityLevel},
          " condominiumId":${objUsers.arrayUsers[rowNumberUser].condominiumId}
        }`;

        // Store data
        const objUserInfo = JSON.stringify(userInfo);
        localStorage.setItem("userInfo", objUserInfo);

        // Start bank account transactions
        window.location.href = 'http://localhost/condo-bankaccounttransaction.html';
        return true;
      }

    }
  } else {
    resetValues();
    return false;
  }
}
*/

// check user and password
function checkLogin() {

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objUsers.validateEmail('email', email);

  // validate password
  const password = document.querySelector('.password').value;
  const validPassword = objUsers.validateText(password, 5, 45)

  if (validEmail && validPassword) {

    checkUserPasswordSync();
    async function checkUserPasswordSync() {

      // Check user and password
      await objUsers.checkUserPassword(email, password);
      if (objUsers.arrayUsers.length === 1) {

        // The sessionStorage object stores data for only one session
        window.sessionStorage.setItem("condominiumId", objUsers.arrayUsers[0].condominiumId);
        window.sessionStorage.setItem("email", objUsers.arrayUsers[0].email);
        console.log('condominiumId: ', sessionStorage.getItem("condominiumId"));
        console.log('email: ', sessionStorage.getItem("email"));

        // Start bank account transactions
        window.location.href = 'http://localhost/condo-bankaccounttransaction.html';
        return true;
      } else {

        resetValues();
        return false;
      }
    }
  }
}