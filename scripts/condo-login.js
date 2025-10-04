// Login
// Activate user class
const objUsers = new Users('users');
const objLogIn = new Login('login');

sessionStorage.removeItem("user");


// Call main when script loads
main();

// Main entry point
async function main() {

  const condominiumId = 999999999;
  await objUsers.loadUsersTable(condominiumId);

  // Show leading text
  showLeadingText();

  // Make events
  createEvents();
}

// Make events for users
function createEvents() {

  console.log('createEvents');

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-link')) {

      // validate password
      const email = document.querySelector('.input-email').value;
      const password = document.querySelector('.input-password').value;

      // Security level
      const userRowNumber = objUsers.arrayUsers.findIndex(userRow => userRow.email === email);
      if (userRowNumber !== -1) {

        const securityLevel = objUsers.arrayUsers[userRowNumber].securityLevel;

        const condominiumId = objUsers.arrayUsers[userRowNumber].condominiumId;

        // Save email/user, password and security level
        sessionStorage.setItem('user', JSON.stringify({ email, password, securityLevel, condominiumId }));

        switch (objUsers.serverStatus) {

          // web server
          case 1:
            (objLogIn.validateUser(email, password))
              ? window.location.href = 'http://localhost/condo-bankaccountmovements.html'
              : resetValues();
            break
          // Test web server/ local web server
          case 2:

          // Test server/ local test server
          case 3: {

            (objLogIn.validateUser(email, password))
              ? window.location.href = 'condo-bankaccountmovements.html'
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
}

// Show leading text for login
function showLeadingText() {

  // email
  // Show leading text forinput
  objUsers.showLeadingTextInput('email', 'E-mail(Bruker)', 50, '💁 Bruker');

  // password
  objUsers.showLeadingTextInput('password', 'Passord', 50, '🔑 Passord');

  // login button
  objLogIn.showPageButton('program', 'program');
}

// reset values
function resetValues() {

  // user
  document.querySelector('.input-email').value = '';

  // password
  document.querySelector('.input-password').value = '';

  sessionStorage.removeItem("user");
}