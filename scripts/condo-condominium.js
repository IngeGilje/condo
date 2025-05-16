// Condominium maintenance

// Activate Condominium class
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');

objUserPassword = JSON.parse(localStorage.getItem('savedUser'));

// Connection to a server
let socket;
(objUser.localServer)
  ? socket = new WebSocket('ws://localhost:8080')
  : socket = new WebSocket('ws://ingegilje.no:8080');

let isEventsCreated = false;

menu();
objCondominium.markSelectedMenu('Sameie');

/*
// Send a message to the server
socket.onopen = () => {

  //objAccount.getAccounts(socket);
  const SQLquery = `
    SELECT * FROM account
    ORDER BY accountId;
  `;
  socket.send(SQLquery);
};
*/
// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all users
  const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
  socket.send(SQLquery);
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let message = event.data;

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    console.log('userTable');

    // user array including objects with user information
    userArray = JSON.parse(message);

    // Check user/password
    (objUser.validateUser(objUserPassword.user, objUserPassword.password)) ? '' : window.location.href('condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all accounts
    const SQLquery = `
    SELECT * FROM account
    ORDER BY accountId;
  `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    // account table
    console.log('accountTable');

    // array including objects with condominium information
    accountArray = JSON.parse(message);

    //objBankAccount.getBankAccounts(socket);
    const SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY name;
    `;
    socket.send(SQLquery);
  }

  // Create bank account array including objets
  if (message.includes('"tableName":"bankaccount"')) {

    // bankaccount table
    console.log('bankaccountTable');

    // array including objects with condominium information
    bankAccountArray = JSON.parse(message);

    objCondominium.getCondominiums(socket);
  }

  // Create condominium array including objets
  if (message.includes('"tableName":"condominium"')) {

    // condominium table
    console.log('condominiumTable');

    // array including objects with condominium information
    condominiumArray = JSON.parse(message);

    const condominiumId = objCondominium.getSelectedCondominiumId('condominiumId');

    // Show all leading text
    showLeadingText(condominiumId);

    // Show all values for condominium
    showValues(condominiumId);

    // Make events
    if (!isEventsCreated) {
      condoEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Sends a request to the server to get all condos
    objCondominium.getCondominiums(socket);
  }
};

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make events for condominium
function condoEvents() {

  // Select condominium
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condominium-condominiumId')) {
      showValues(Number(event.target.value));
    }
  });

  // Update condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-update')) {

      const condominiumId = Number(document.querySelector('.select-condominium-condominiumId').value);
      if (updateCondominium(condominiumId)) {
        showValues(condominiumId);
      }
    }
  });

  // New condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-new')) {
      resetValues();
    }
  });

  // Delete condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-delete')) {

      deleteCondominiumRow();

      // Sends a request to the server to get all condos
      objCondominium.getCondominiums(socket);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-cancel')) {

      // Sends a request to the server to get all condos
      objCondominium.getCondominiums(socket);
    }
  });
}

function updateCondominium(condominiumId) {

  let SQLquery = "";
  let isUpdated = false;

  // Check values
  //const condominiumId = Number(document.querySelector('.select-condominium-condominiumId').value);
  if (validateValues()) {

    const condominiumName =
      document.querySelector('.input-condominium-condominiumName').value;
    const street =
      document.querySelector('.input-condominium-street').value;
    const postalCode =
      document.querySelector('.input-condominium-postalCode').value;
    const city =
      document.querySelector('.input-condominium-city').value;
    const address2 =
      document.querySelector('.input-condominium-address2').value;
    const phoneNumber =
      document.querySelector('.input-condominium-phoneNumber').value;
    const email =
      document.querySelector('.input-condominium-email').value;
    const organizationNumber =
      document.querySelector('.input-condominium-organizationNumber').value;
    const bankAccount =
      document.querySelector('.select-bankaccount-bankAccountId').value;

    // current date
    const now = new Date();
    const lastUpdate = now.toISOString();

    // Check if condominium id exist
    const objectNumberCondominium = condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objectNumberCondominium >= 0) {

      // Update condominium table
      SQLquery = `
        UPDATE condominium
        SET 
          user = '${objUserPassword.user}',
          lastUpdate = '${lastUpdate}',
          condominiumName = '${condominiumName}',
          street = '${street}',
          address2 = '${address2}',
          postalCode = '${postalCode}', 
          city = '${city}',
          phoneNumber = '${phoneNumber}',
          email = '${email}',
          organizationNumber = ${organizationNumber},
          bankAccount = ${bankAccount}
        WHERE condominiumId = ${condominiumId};
      `;

    } else {

      SQLquery = `
        INSERT INTO condominium (
          tableName,
          user,
          lastUpdate,
          condominiumName,
          street,
          address2,
          postalCode,
          city,
          phoneNumber,
          email,
          organizationNumber,
          bankAccount)
        VALUES (
          'condominium',
          '${objUserPassword.user}',
          '${lastUpdate}',
          '${condominiumName}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}',
          '${phoneNumber}',
          '${email}',
          '${organizationNumber}',
          '${bankAccount}'
        );
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-condominium-condominiumId').disabled =
      false;
    document.querySelector('.button-condominium-delete').disabled =
      false;
    document.querySelector('.button-condominium-new').disabled =
      false;
    //document.querySelector('.button-condominium-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

// Show all leading text for condominium
function showLeadingText(condominiumId) {

  // Show all condominiums
  objCondominium.showAllCondominiums('condominiumId', condominiumId);

  // Show condominium name
  objCondominium.showInput('condominium-condominiumName', '* Navn', 50, '');

  // Show street name
  objCondominium.showInput('condominium-street', '* Gatenavn', 50, '');

  // Show address 2
  objCondominium.showInput('condominium-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondominium.showInput('condominium-postalCode', '* Postnummer', 4, '4 siffer');

  // City
  objCondominium.showInput('condominium-city', '* Poststed', 50, '');

  // phoneNumber
  objCondominium.showInput('condominium-phoneNumber', 'Telefonnummer', 20, '');

  // email
  objCondominium.showInput('condominium-email', '* eMail', 50, '');

  // organization Number
  objCondominium.showInput('condominium-organizationNumber', '* Organisasjonsnummer', 9, '');

  // bank account number

  const bankAccountId = bankAccountArray.at(-1).bankAccountId;
  objBankAccount.showAllBankAccounts('bankAccountId', bankAccountId);

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objCondominium.showButton('condominium-update', 'Oppdater');

    // show new button
    objCondominium.showButton('condominium-new', 'Ny');

    // show delete button
    objCondominium.showButton('condominium-delete', 'Slett');

    // cancel button
    objCondominium.showButton('condominium-cancel', 'Avbryt');
  }
}

// Show all values for condominium
function showValues(condominiumId) {

  // Check for valid condominium Id
  if (condominiumId > 1) {

    // find object number for selected condominium id
    const objectNumberCondominium = condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objectNumberCondominium >= 0) {

      // Condominium id
      document.querySelector('.select-condominium-condominiumId').value =
        condominiumArray[objectNumberCondominium].condominiumId;

      // Condominium name
      document.querySelector('.input-condominium-condominiumName').value =
        condominiumArray[objectNumberCondominium].condominiumName;

      // Show street
      document.querySelector('.input-condominium-street').value =
        condominiumArray[objectNumberCondominium].street;

      // Show address 2
      document.querySelector('.input-condominium-address2').value =
        condominiumArray[objectNumberCondominium].address2;

      // Show postal code
      document.querySelector('.input-condominium-postalCode').value =
        condominiumArray[objectNumberCondominium].postalCode;

      // Show city
      document.querySelector('.input-condominium-city').value =
        condominiumArray[objectNumberCondominium].city;

      // Show phoneNumber number
      document.querySelector('.input-condominium-phoneNumber').value =
        condominiumArray[objectNumberCondominium].phoneNumber;

      // Show email
      document.querySelector('.input-condominium-email').value =
        condominiumArray[objectNumberCondominium].email;

      // Show organization number
      document.querySelector('.input-condominium-organizationNumber').value =
        condominiumArray[objectNumberCondominium].organizationNumber;

      // Show bank account number
      const bankAccountId = condominiumArray[objectNumberCondominium].bankAccountId;
      objCondominium.selectBankAccountId(bankAccountId, 'bankaccount-bankAccountId');
    }
  }
}

// Reset all values for condominium
function resetValues() {

  document.querySelector('.select-condominium-condominiumId').value =
    '';

  document.querySelector('.input-condominium-condominiumName').value =
    '';

  // Show street
  document.querySelector('.input-condominium-street').value =
    '';

  // Show address 2
  document.querySelector('.input-condominium-address2').value =
    '';

  // Show postal code
  document.querySelector('.input-condominium-postalCode').value =
    '';

  // Show city
  document.querySelector('.input-condominium-city').value =
    '';

  // Show phoneNumber number
  document.querySelector('.input-condominium-phoneNumber').value =
    '';

  // Show email
  document.querySelector('.input-condominium-email').value =
    '';

  // Show organization number
  document.querySelector('.input-condominium-organizationNumber').value =
    '';

  // Show bankaccount number
  document.querySelector('.select-bankaccount-bankAccountId').value =
    '';

  document.querySelector('.select-condominium-condominiumId').disabled =
    true;
  document.querySelector('.button-condominium-delete').disabled =
    true;
  document.querySelector('.button-condominium-new').disabled =
    true;
  //document.querySelector('.button-condominium-cancel').disabled =
  //  true;
}

// Delete a row in condominium table
function deleteCondominiumRow() {

  let SQLquery = "";

  // Check for valid condominium Id
  const condominiumId = Number(document.querySelector('.select-condominium-condominiumId').value);
  if (condominiumId > 1) {

    // Check if condominium exist
    const objectNumberCondominium = condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objectNumberCondominium >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM condominium
        WHERE condominiumId = ${condominiumId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Show updated condos
    objCondominium.getCondominiums(socket);
  }
}

// Check for valid condominium number
function validateValues() {

  // Check condominium name
  const condominiumName = document.querySelector('.input-condominium-condominiumName').value;
  const validCondominiumName = objCondominium.validateText(condominiumName, "label-condominium-condominiumName", "Navn");

  // Check street name
  const street = document.querySelector('.input-condominium-street').value;
  const validStreet = objCondominium.validateText(street, "label-condominium-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condominium-postalCode').value;
  const validPostalCode = objCondominium.validatePostalCode(postalCode, "label-condominium-postalCode", "Postnummer");

  // Check city
  const city = document.querySelector('.input-condominium-city').value;
  const validCity = objCondominium.validateText(city, "label-condominium-city", "Poststed");

  // Check email
  const eMail = document.querySelector('.input-condominium-email').value;
  const validEmail = objCondominium.validateEmail(eMail, "label-condominium-email", "E-mail");

  // Check organization number
  const organizationNumber = document.querySelector('.input-condominium-organizationNumber').value;
  const validOrganizationNumber = checkOrganizationNumber(organizationNumber, "condominium-organizationNumber", "organisasjonsnummer");

  // Check bankaccount number
  const bankAccount = document.querySelector('.select-bankaccount-bankAccountId').value;
  const validbankAccount = checkBankAccount(bankAccount, "condominium-bankAccountId", "kontonummer");

  if (validCondominiumName
    && validStreet
    && validPostalCode
    && validCity
    && validEmail
    && validOrganizationNumber
    && validbankAccount
  ) {
    return true;
  } else {
    return false;
  }
}

/*
DROP TABLE condominium;
CREATE TABLE condominium (
  condominiumId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50),
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condominiumName VARCHAR(50) NOT NULL,
  street VARCHAR(50) NOT NULL,
  address2 VARCHAR(50),
  postalCode VARCHAR(4) NOT NULL,
  city VARCHAR(50) NOT NULL,
  phoneNumber VARCHAR(20),
  email VARCHAR(50),
  organization VARCHAR(9),
  bankAccount VARCHAR(11)
);
INSERT INTO condominium (
  tableName,
  user,
  lastUpdate,
  condominiumName,
  street,
  address2,
  postalCode,
  city,
  phoneNumber,
  email,
  organization,
  bankAccountId)
VALUES (
  'condominium',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
);
*/