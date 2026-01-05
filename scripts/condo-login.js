// Login
// Activate user class
const objUsers = new User('user');
const objLogIn = new Login('login');

sessionStorage.removeItem("user");


// Call main when script loads
main();

// Main entry point
async function main() {

  const condominiumId = 999999999;
  const resident = 'Y';
  await objUsers.loadUsersTable(condominiumId, resident);

  // Show header
  showHeader();

  // Show supplier
  showResult();

  // Events
  events();
}

// Events for users
function events() {

  /*
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-link')) {

      // validate password
      const email = document.querySelector('.email').value;
      const password = document.querySelector('.password').value;

      // Security level
      const rowNumberUser = objUsers.arrayUsers.findIndex(userRow => userRow.email === email);
      if (rowNumberUser !== -1) {

        const securityLevel = objUsers.arrayUsers[rowNumberUser].securityLevel;

        const condominiumId = objUsers.arrayUsers[rowNumberUser].condominiumId;

        // Save email/user, password and security level
        sessionStorage.setItem('user', JSON.stringify({ email, password, securityLevel, condominiumId }));

        switch (objUsers.serverStatus) {

          // web server
          case 1:
            (objLogIn.validateUser(email, password))
              ? window.location.href = 'http://localhost/condo-bankaccounttransaction.html'
              : resetValues();
            break
          // Test web server/ local web server
          case 2:

          // Test server/ local test server
          case 3: {

            (objLogIn.validateUser(email, password))
              ? window.location.href = 'condo-bankaccounttransaction.html'
              : resetValues();
            break
          }
          default: {

            break
          }
        }
      }
    }
  });
  */
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
  html += objLogIn.showTableHeader('width:250px;', '', '', '');

  // Header for value including menu
  html += objLogIn.showHTMLTableHeaderNew("width:250px;", 0, 'Email');

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('margin: 0 auto;', 0);

  // email
  html += objLogIn.inputTableColumn('email', '', 45);

  html += "</tr>";

  // password
  html += "<tr>";
  html += objLogIn.showHTMLTableHeaderNew("width:250px;", 0, 'Passord');

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
    html += objLogIn.showButtonNew('width:170px;', 'LogIn', 'LogIn');
    html += "</tr>";

  // insert table columns in start of a row
  html += objLogIn.insertTableColumns('', 0, '');

  html += "</tr>";

  // The end of the table
  html += objLogIn.endTable();
  document.querySelector('.result').innerHTML = html;
}