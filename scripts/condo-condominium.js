// Condominium maintenance

// Activate classes
const today =
  new Date();
const objUser =
  new User('user');
const objAccount =
  new Account('account');
const objBankAccount =
  new BankAccount('bankaccount');
const objCondominium =
  new Condominium('condominium');

testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

let isEventsCreated

objCondominium.menu();
objCondominium.markSelectedMenu('Sameie');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    let SQLquery;

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;

    updateMySql(SQLquery, 'user', 'SELECT');

    // Sends a request to the server to get bankaccounts
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountId;
      `;
    updateMySql(SQLquery, 'bankaccount', 'SELECT');

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get condominiums
    SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY condominiumId;
      `;

    updateMySql(SQLquery, 'condominium', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    //Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'user':

          // user table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          break;

        case 'bankaccount':

          // bankaccount table
          console.log('bankaccountTable');

          bankaccountArray =
            objInfo.tableArray;
          break;

        case 'condominium':

          // condominium table
          console.log('condominiumTable');

          // array including objects with condominium information
          condominiumArray =
            objInfo.tableArray;

          // Find selected condominium id
          const condominiumId =
            objCondominium.getSelectedCondominiumId('select-condominium-condominiumId');

          // Show leading text
          showLeadingText(condominiumId);

          // Show all values for condominium
          showValues(condominiumId);

          // Make events
          isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'condominium':

          // Sends a request to the server to get condominiums one more time
          SQLquery =
            `
              SELECT * FROM condominium
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY condominiumId;
            `;
          updateMySql(SQLquery, 'condominium', 'SELECT');
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }
}

// Make events for condominium
function condominiumEvents() {

  // Select condominium
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condominium-condominiumId')) {
      showValues(Number(event.target.value));
    }
  });

  // Update condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-update')) {

      const condominiumId =
        Number(document.querySelector('.select-condominium-condominiumId').value);
      updateCondominium(condominiumId);
    }
  });

  // New condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-insert')) {
      resetValues();
    }
  });

  // Delete condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-delete')) {

      deleteCondominiumRow();

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condominium
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY name;
        `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominium-cancel')) {

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condominium
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY condominiumId;
        `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
    }
  });
  return true;
}

function updateCondominium(condominiumId) {

  let SQLquery =
    "";
  let isUpdated =
    false;

  // Check values
  if (validateValues()) {

    const condominiumName =
      document.querySelector('.input-condominium-name').value;
    const street =
      document.querySelector('.input-condominium-street').value;
    const postalCode =
      document.querySelector('.input-condominium-postalCode').value;
    const city =
      document.querySelector('.input-condominium-city').value;
    const address2 =
      document.querySelector('.input-condominium-address2').value;
    const phone =
      document.querySelector('.input-condominium-phone').value;
    const email =
      document.querySelector('.input-condominium-email').value;
    const accountId =
      Number(document.querySelector('.select-condominium-accountId').value);
    const monthlyRentAccountId =
      Number(document.querySelector('.select-condominium-monthlyRentAccountId').value);
    const organizationNumber =
      document.querySelector('.input-condominium-organizationNumber').value;
    const importPath =
      document.querySelector('.input-condominium-importPath').value;

    // current date
    const lastUpdate =
      today.toISOString();

    // Check if condominium id exist
    const objCondominimuRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominimuRowNumber !== -1) {

      // Update condominium table
      SQLquery = `
        UPDATE condominium
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          name = '${condominiumName}',
          street = '${street}',
          address2 = '${address2}',
          postalCode = '${postalCode}', 
          city = '${city}',
          phone = '${phone}',
          email = '${email}',
          accountId = ${accountId},
          monthlyRentAccountId = ${monthlyRentAccountId},
          organizationNumber = '${organizationNumber}',
          importPath = '${importPath}'
        WHERE condominiumId = ${condominiumId};
      `;

      updateMySql(SQLquery, 'condominium', 'UPDATE');
    } else {

      SQLquery = `
        INSERT INTO condominium (
          tableName,
          user,
          lastUpdate,
          name,
          street,
          address2,
          postalCode,
          city,
          phone,
          email,
          accountId,
          monthlyRentAccountId,
          organizationNumber,
          importPath)
        VALUES (
          'condominium',
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${condominiumName}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}',
          '${phone}',
          '${email}',
          ${accountId},
          ${monthlyRentAccountId},
          '${organizationNumber}',
          '${importPath}'
        );
      `;
      updateMySql(SQLquery, 'condominium', 'INSERT');
    }

    document.querySelector('.select-condominium-condominiumId').disabled =
      false;
    document.querySelector('.button-condominium-delete').disabled =
      false;
    document.querySelector('.button-condominium-insert').disabled =
      false;
    //document.querySelector('.button-condominium-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

// Show leading text for condominium
function showLeadingText(condominiumId) {

  // Show all condominiums
  objCondominium.showAllCondominiums('condominium-condominiumId', condominiumId);

  // Show condominium name
  objCondominium.showInput('condominium-name', '* Navn', 50, '');

  // Show street name
  objCondominium.showInput('condominium-street', '* Gateadresse', 50, '');

  // Show address 2
  objCondominium.showInput('condominium-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondominium.showInput('condominium-postalCode', '* Postnummer', 4, '4 siffer');

  // City
  objCondominium.showInput('condominium-city', '* Poststed', 50, '');

  // phone
  objCondominium.showInput('condominium-phone', 'Telefonnummer', 20, '');

  // email
  objCondominium.showInput('condominium-email', '* eMail', 50, '');

  // show all account Ids for remote heating
  objAccount.showAllAccounts('condominium-accountId', 0, "", "Ingen");

  // show all account Ids for monthly rent accounts
  objAccount.showAllAccounts('condominium-monthlyRentAccountId', 0, "", "Ingen");

  // organization Number
  objCondominium.showInput('condominium-organizationNumber', '* Organisasjonsnummer', 9, '');

  // import path
  objCondominium.showInput('condominium-importPath', '* Navn på importfile', 50, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objCondominium.showButton('condominium-update', 'Oppdater');

    // show new button
    objCondominium.showButton('condominium-insert', 'Ny');

    // show delete button
    objCondominium.showButton('condominium-delete', 'Slett');

    // cancel button
    objCondominium.showButton('condominium-cancel', 'Avbryt');
  }
}

// Show all values for condominium
function showValues(condominiumId) {

  // Check for valid condominium Id
  if (condominiumId >= 0) {

    // find object number for selected condominium id
    const objCondominimuRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominimuRowNumber !== -1) {

      // Condominium id
      document.querySelector('.select-condominium-condominiumId').value =
        condominiumArray[objCondominimuRowNumber].condominiumId;

      // Condominium name
      document.querySelector('.input-condominium-name').value =
        condominiumArray[objCondominimuRowNumber].name;

      // Show street
      document.querySelector('.input-condominium-street').value =
        condominiumArray[objCondominimuRowNumber].street;

      // Show address 2
      document.querySelector('.input-condominium-address2').value =
        condominiumArray[objCondominimuRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condominium-postalCode').value =
        condominiumArray[objCondominimuRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condominium-city').value =
        condominiumArray[objCondominimuRowNumber].city;

      // Show phone
      document.querySelector('.input-condominium-phone').value =
        condominiumArray[objCondominimuRowNumber].phone;

      // Show email
      document.querySelector('.input-condominium-email').value =
        condominiumArray[objCondominimuRowNumber].email;

      // account id
      document.querySelector('.select-condominium-accountId').value =
        (condominiumArray[objCondominimuRowNumber].accountId) ? condominiumArray[objCondominimuRowNumber].accountId : 0;
      document.querySelector('.label-condominium-accountId').innerHTML =
        'Velg konto for fjernvarme';

      // account id
      document.querySelector('.select-condominium-monthlyRentAccountId').value =
        (condominiumArray[objCondominimuRowNumber].monthlyRentAccountId) ? condominiumArray[objCondominimuRowNumber].monthlyRentAccountId : 0;
      document.querySelector('.label-condominium-monthlyRentAccountId').innerHTML =
        'Velg konto for månedsleie';

      // Show organization number
      document.querySelector('.input-condominium-organizationNumber').value =
        condominiumArray[objCondominimuRowNumber].organizationNumber;

      // Show file import path
      document.querySelector('.input-condominium-importPath').value =
        condominiumArray[objCondominimuRowNumber].importPath;
    }
  }
}

// Reset all values for condominium
function resetValues() {

  document.querySelector('.select-condominium-condominiumId').value =
    '';

  document.querySelector('.input-condominium-name').value =
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

  // Show phone number
  document.querySelector('.input-condominium-phone').value =
    '';

  // Show email
  document.querySelector('.input-condominium-email').value =
    '';

  // account id for remote heating
  document.querySelector('.select-condominium-accountId').value =
    0;

  // account id for monthly rent
  document.querySelector('.select-condominium-monthlyRentAccountId').value =
    0;

  // Show organization number
  document.querySelector('.input-condominium-organizationNumber').value =
    '';

  // Show path for file to import
  document.querySelector('.input-condominium-importPath').value =
    '';

  document.querySelector('.select-condominium-condominiumId').disabled =
    true;
  document.querySelector('.button-condominium-delete').disabled =
    true;
  document.querySelector('.button-condominium-insert').disabled =
    true;
  //document.querySelector('.button-condominium-cancel').disabled =
  //  true;
}

// Delete a row in condominium table
function deleteCondominiumRow() {

  let SQLquery = "";

  // Check for valid condominium Id
  const condominiumId = Number(document.querySelector('.select-condominium-condominiumId').value);
  if (condominiumId >= 0) {

    // Check if condominium exist
    const objCondominimuRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominimuRowNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM condominium
        WHERE condominiumId = ${condominiumId};
      `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
    }

    // Get all condominiums from MySQL database
    const SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY name;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');
  }
}

// Check for valid condominium number
function validateValues() {

  // Check condominium name
  const condominiumName =
    document.querySelector('.input-condominium-name').value;
  const validCondominiumName =
    objCondominium.validateText(condominiumName, "label-condominium-name", "Navn");

  // Check street name
  const street =
    document.querySelector('.input-condominium-street').value;
  const validStreet =
    objCondominium.validateText(street, "label-condominium-street", "Gateadresse");

  // Check postal code
  const postalCode =
    document.querySelector('.input-condominium-postalCode').value;
  const validPostalCode =
    objCondominium.validatePostalCode(postalCode, "label-condominium-postalCode", "Postnummer");

  // Validate city
  const city =
    document.querySelector('.input-condominium-city').value;
  const validCity =
    objCondominium.validateText(city, "label-condominium-city", "Poststed");

  // Check email
  const eMail =
    document.querySelector('.input-condominium-email').value;
  const validEmail =
    objCondominium.validateEmail(eMail, "label-condominium-email", "E-mail");

  // Check organization number
  const organizationNumber =
    document.querySelector('.input-condominium-organizationNumber').value;
  const validOrganizationNumber =
    validateOrganizationNumber(organizationNumber, "condominium-organizationNumber", "Organisasjonsnummer");

  // Check import path
  const importPath =
    document.querySelector('.input-condominium-importPath').value;
  const validImportPath =
    objCondominium.validateText(importPath, "condominium-importpath", "Navn på importfil");

  return (validCondominiumName
    && validStreet
    && validPostalCode
    && validCity
    && validEmail
    && validOrganizationNumber
    && validImportPath
  ) ? true : false;
}