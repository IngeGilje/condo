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
  <h2>Logg inn 1.1</h2>
  <div 
    class="field center"
  >
    <label
      class="center"  
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
    class="field center"
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
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  if (rowNumberUser !== -1) {

    // Check user and password 
    //password = "12345";
    //userId = 2;
    if (await objUser.validateUser(Number(objUser.arrayUsers[rowNumberUser].userId), password)) {

      // The sessionStorage object stores data for only one session
      //window.sessionStorage.setItem("condominiumId", 2);
      //window.sessionStorage.setItem("user", "inge.gilje@gmail.com");
      //window.sessionStorage.setItem("securityLevel", 9);
      //window.sessionStorage.setItem("userId", 2);

      window.sessionStorage.setItem("condominiumId", objUser.arrayUsers[rowNumberUser].condominiumId);
      window.sessionStorage.setItem("user", objUser.arrayUsers[rowNumberUser].user);
      window.sessionStorage.setItem("securityLevel", objUser.arrayUsers[rowNumberUser].securityLevel);
      window.sessionStorage.setItem("userId", objUser.arrayUsers[rowNumberUser].userId);

      // Start to show news
      const URL = (objUser.serverStatus === 1)
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