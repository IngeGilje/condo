// Login

// Activate classes
const objUsers = new Users('users');
const objLogIn = new Login('login');

sessionStorage.clear();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    const condominiumId = objLogIn.nineNine;
    const resident = 'Y';
    await objUsers.loadUsersTable(condominiumId, resident, objLogIn.nineNine);

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

  document.querySelector('.showLogIn').innerHTML = `
  <h2>Logg inn</h2>
  <div 
    class="field"
  >
    <label
      class="center" 
      style="padding-left:0px;"
    >
      Brukernavn
    </label>
    <input 
      type="text" 
      class="email one-line center"
      autocomplete="off"
    >
  </div>

  <p>&nbsp</p>

  <div 
    class="field"
  >
    <label
      class="center"  
    >
      Passord
    </label>
    <input
      type="password"
      class="password one-line center">
  </div>

   <p>&nbsp</p>

  <button 
    class="login-btn LogIn"
  >
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
  const email = document.querySelector('.email').value;

  // validate password
  const password = document.querySelector('.password').value;

  // get userId
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  if (rowNumberUser !== -1) {

    // Check user and password 
    //password = "12345";
    //userId = 2;
    if (await objUsers.validateUser(Number(objUsers.arrayUsers[rowNumberUser].userId), password)) {

      // The sessionStorage object stores data for only one session
       window.sessionStorage.setItem("condominiumId", objUsers.arrayUsers[rowNumberUser].condominiumId);
      window.sessionStorage.setItem("user", objUsers.arrayUsers[rowNumberUser].user);
      window.sessionStorage.setItem("securityLevel", objUsers.arrayUsers[rowNumberUser].securityLevel);
      window.sessionStorage.setItem("userId", objUsers.arrayUsers[rowNumberUser].userId);

      // Start to show news
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-shownews.html'
        : 'http://localhost/condo-shownews.html';
      window.location.href = URL;
      return true;
    }
  }

  // password/ user is not OK
  showMessageNew('Ugyldig brukernavn/passord');

  resetValues();
  return false;
}