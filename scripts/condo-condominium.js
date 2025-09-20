// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

let userArrayCreated = false;
let accountArrayCreated = false;
let bankAccountArrayCreate = false;
let condominiumArrayCreated = false;

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

let isEventsCreated;

objCondominium.menu();
objCondominium.markSelectedMenu('Banktransaksjoner');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    let SQLquery;

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userId;
      `;

    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    // Sends a request to the server to get bankaccounts
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY bankAccountId;
      `;
    updateMySql(SQLquery, 'bankaccount', 'SELECT');
    bankAccountArrayCreated =
      false;

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get condominiums
    SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY condominiumId;
      `;

    updateMySql(SQLquery, 'condominium', 'SELECT');
    condominiumArrayCreated =
      false;
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

          userArray = objInfo.tableArray;
          userArrayCreated =
            true;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray = objInfo.tableArray;
          accountArrayCreated =
            true
          break;

        case 'bankaccount':

          // bankaccount table
          console.log('bankAccountTable');

          bankAccountArray = objInfo.tableArray;
          bankAccountArrayCreated =
            true
          break;

        case 'condominium':

          // condominium table
          console.log('condominiumTable');

          // array including objects with condominium information
          condominiumArray = objInfo.tableArray;
          condominiumArrayCreated =
            true

          // if all tables are opened
          if (userArrayCreated
            && accountArrayCreated
            && bankAccountArrayCreated
            && condominiumArrayCreated) {

            // Find selected condominium id
            const condominiumId =
              objCondominium.getSelectedCondominiumId('select-condominium-condominiumId');

            // Show leading text
            showLeadingText(condominiumId);

            // Show all values for condominium
            showValues(condominiumId);

            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
          }
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
                AND deleted <> 'Y'
              ORDER BY condominiumId;
            `;
          updateMySql(SQLquery, 'condominium', 'SELECT');
          condominiumArrayCreated =
            false;
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
function createEvents() {

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
            AND deleted <> 'Y'
          ORDER BY name;
        `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
      condominiumArrayCreated =
        false;
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
            AND deleted <> 'Y'
          ORDER BY condominiumId;
        `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
      condominiumArrayCreated =
        false;
    }
  });
  return true;
}

function updateCondominium(condominiumId) {

  let SQLquery =
    "";

  // Check values
  if (validateValues()) {

    const condominiumName = document.querySelector('.input-condominium-name').value;
    const street = document.querySelector('.input-condominium-street').value;
    const postalCode = document.querySelector('.input-condominium-postalCode').value;
    const city = document.querySelector('.input-condominium-city').value;
    const address2 = document.querySelector('.input-condominium-address2').value;
    const phone = document.querySelector('.input-condominium-phone').value;
    const email = document.querySelector('.input-condominium-email').value;
    const incomeRemoteHeatingAccountId = Number(document.querySelector('.select-condominium-incomeRemoteHeatingAccountId').value);
    const paymentRemoteHeatingAccountId = Number(document.querySelector('.select-condominium-paymentRemoteHeatingAccountId').value);
    const commonCostAccountId = Number(document.querySelector('.select-condominium-commoncostAccountId').value);
    const organizationNumber = document.querySelector('.input-condominium-organizationNumber').value;
    const importPath = document.querySelector('.input-condominium-fileName').value;

    // current date
    const lastUpdate = today.toISOString();

    // Check if condominium id exist
    const objCondominiumRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumRowNumber !== -1) {

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
          incomeRemoteHeatingAccountId = ${incomeRemoteHeatingAccountId},
          paymentRemoteHeatingAccountId = ${paymentRemoteHeatingAccountId},
          commonCostAccountId = ${commonCostAccountId},
          organizationNumber = '${organizationNumber}',
          importPath = '${importPath}'
        WHERE condominiumId = ${condominiumId};
      `;

      updateMySql(SQLquery, 'condominium', 'UPDATE');
    } else {

      SQLquery = `
        INSERT INTO condominium (
          deleted,
          user,
          lastUpdate,
          name,
          street,
          address2,
          postalCode,
          city,
          phone,
          email,
          incomeRemoteHeatingAccountId,
          paymentRemoteHeatingAccountId,
          commonCostAccountId,
          organizationNumber,
          importPath)
        VALUES (
          'N',
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${condominiumName}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}',
          '${phone}',
          '${email}',
          ${incomeRemoteHeatingAccountId},
          ${paymentRemoteHeatingAccountId},
          ${commonCostAccountId},
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
  }
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
  objCondominium.showInput('condominium-postalCode', '* Postnummer', 4, '');

  // City
  objCondominium.showInput('condominium-city', '* Poststed', 50, '');

  // phone
  objCondominium.showInput('condominium-phone', 'Telefonnummer', 20, '');

  // email
  objCondominium.showInput('condominium-email', '* eMail', 50, '');

  // show all account Ids for income remote heating
  objAccount.showAllAccounts('condominium-incomeRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for payment remote heating
  objAccount.showAllAccounts('condominium-paymentRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for common cost accounts
  objAccount.showAllAccounts('condominium-commoncostAccountId', 0, "", "Ingen");

  // organization Number
  objCondominium.showInput('condominium-organizationNumber', '* Organisasjonsnummer', 9, '');

  // import path
  objCondominium.showInput('condominium-fileName', '* Navn på importfil', 50, '');

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

    // get object number for selected condominium id
    const objCondominiumRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumRowNumber !== -1) {

      // Condominium id
      document.querySelector('.select-condominium-condominiumId').value =
        condominiumArray[objCondominiumRowNumber].condominiumId;

      // Condominium name
      document.querySelector('.input-condominium-name').value =
        condominiumArray[objCondominiumRowNumber].name;

      // Show street
      document.querySelector('.input-condominium-street').value =
        condominiumArray[objCondominiumRowNumber].street;

      // Show address 2
      document.querySelector('.input-condominium-address2').value =
        condominiumArray[objCondominiumRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condominium-postalCode').value =
        condominiumArray[objCondominiumRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condominium-city').value =
        condominiumArray[objCondominiumRowNumber].city;

      // Show phone
      document.querySelector('.input-condominium-phone').value =
        condominiumArray[objCondominiumRowNumber].phone;

      // Show email
      document.querySelector('.input-condominium-email').value =
        condominiumArray[objCondominiumRowNumber].email;

      // account id for income remote heating
      document.querySelector('.select-condominium-incomeRemoteHeatingAccountId').value =
        (condominiumArray[objCondominiumRowNumber].incomeRemoteHeatingAccountId) ? condominiumArray[objCondominiumRowNumber].incomeRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominium-incomeRemoteHeatingAccountId').innerHTML =
        'Inntekt fjernvarmekonto';

      // account id for payment remote heating
      document.querySelector('.select-condominium-paymentRemoteHeatingAccountId').value =
        (condominiumArray[objCondominiumRowNumber].paymentRemoteHeatingAccountId) ? condominiumArray[objCondominiumRowNumber].paymentRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominium-paymentRemoteHeatingAccountId').innerHTML =
        'Utgift fjernvarmekonto';

      // account id for common cost
      document.querySelector('.select-condominium-commoncostAccountId').value =
        (condominiumArray[objCondominiumRowNumber].commonCostAccountId) ? condominiumArray[objCondominiumRowNumber].commonCostAccountId : 0;
      document.querySelector('.label-condominium-commoncostAccountId').innerHTML =
        'Konto for felleskostnader';

      // Show organization number
      document.querySelector('.input-condominium-organizationNumber').value =
        condominiumArray[objCondominiumRowNumber].organizationNumber;

      // Show file import path
      document.querySelector('.input-condominium-fileName').value =
        condominiumArray[objCondominiumRowNumber].importPath;
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

  // account id for income remote heating
  document.querySelector('.select-condominium-incomeRemoteHeatingAccountId').value =
    0;

  // account id for payment remote heating
  document.querySelector('.select-condominium-paymentRemoteHeatingAccountId').value =
    0;

  // account id for common cost
  document.querySelector('.select-condominium-commoncostAccountId').value =
    0;

  // Show organization number
  document.querySelector('.input-condominium-organizationNumber').value =
    '';

  // Show path for file to import
  document.querySelector('.input-condominium-fileName').value =
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
    const objCondominiumRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumRowNumber !== -1) {

      // current date
      const lastUpdate =
        today.toISOString();

      // Delete table
      SQLquery =
        `
          UPDATE condominium
            SET 
              deleted = 'Y',
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}'
          WHERE condominiumId = ${condominiumId};
      `;
      updateMySql(SQLquery, 'condominium', 'SELECT');
      condominiumArrayCreated =
        false;
    }

    // Get all condominiums from MySQL database
    const SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY name;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');
    condominiumArrayCreated =
      false;
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
    document.querySelector('.input-condominium-fileName').value;
  const validImportPath =
    objCondominium.validateText(importPath, "condominium-fileName", "Navn på importfil");

  return (validCondominiumName
    && validStreet
    && validPostalCode
    && validCity
    && validEmail
    && validOrganizationNumber
    && validImportPath
  ) ? true : false;
}