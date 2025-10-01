// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objCondominiums = new Condominiums('condominiums');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objCondominiums.menu();
objCondominiums.markSelectedMenu('Sameie');

// Validate user/password
const objUserPassword =
  JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);

    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);

    await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);

    // Find selected condominium id
    const condominiumId = objCondominiums.getSelectedCondominiumId('select-condominiums-condominiumId');

    // Show leading text
    showLeadingText(condominiumId);

    // Show all values for condominium
    showValues(condominiumId);

    // Make events
    createEvents();
  }
}

// Make events for condominium
function createEvents() {

  /*
  // Select condominium
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condominiums-condominiumId')) {
      showValues(Number(event.target.value));
    }
  });
  */
  // Select condominium
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condominiums-condominiumId')) {

      let condominiumId = Number(document.querySelector('.select-condominiums-condominiumId').value);
      condominiumId =
        (condominiumId !== 0) ? condominiumId : objCondominiums.arrayCondominiums.at(-1).condominiumId;
      if (condominiumId) {
        showValues(condominiumId);
      }
    }
  });

  /*
  // Update condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-update')) {

      const condominiumId =
        Number(document.querySelector('.select-condominiums-condominiumId').value);
      updateCondominium(condominiumId);
    }
  });
  */
  // Update condominiums table
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-update')) {

      // Update condominium and reload condominiums
      updateCondominiumSync();

      // Update condominiums and reload users
      async function updateCondominiumSync() {

        // Load condominiums
        let condominiumId;
        if (document.querySelector('.select-condominiums-condominiumId').value === '') {

          // Insert new row into condominiums table
          condominiumId = 0;
        } else {

          // Update existing row in condominiums table
          condominiumId = Number(document.querySelector('.select-condominiums-condominiumId').value);
        }

        updateCondominium(condominiumId);

        await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);

        // Select last condominium if condominiumId is 0
        if (condominiumId === 0) condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;

        // Show leading text
        showLeadingText(condominiumId);

        // Show all values for condominium
        showValues(condominiumId);
      }
    }
  });

  // New condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-insert')) {
      resetValues();
    }
  });

  /*
  // Delete condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-delete')) {

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
  */

  // Delete condominium
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-delete')) {

      // Delete user and reload users
      deleteCondominiumSync();

      // Delete user and reload users
      async function deleteCondominiumSync() {

        await deleteCondominium();

        // Load condominiums
        await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);

        // Show leading text
        const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
        showLeadingText(condominiumId);

        // Show all values for condominium
        showValues(condominiumId);
      }
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-cancel')) {

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

async function updateCondominium(condominiumId) {

  // Check values
  if (validateValues()) {

    // Get values
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    const name = document.querySelector('.input-condominiums-name').value;
    const street = document.querySelector('.input-condominiums-street').value;
    const address2 = document.querySelector('.input-condominiums-address2').value;
    const postalCode = document.querySelector('.input-condominiums-postalCode').value;
    const city = document.querySelector('.input-condominiums-city').value;
    const phone = document.querySelector('.input-condominiums-phone').value;
    const email = document.querySelector('.input-condominiums-email').value;
    const incomeRemoteHeatingAccountId = Number(document.querySelector('.select-condominiums-incomeRemoteHeatingAccountId').value);
    const paymentRemoteHeatingAccountId = Number(document.querySelector('.select-condominiums-paymentRemoteHeatingAccountId').value);
    const commonCostAccountId = Number(document.querySelector('.select-condominiums-commoncostAccountId').value);
    const organizationNumber = document.querySelector('.input-condominiums-organizationNumber').value;
    const importPath = document.querySelector('.input-condominiums-fileName').value;

    // Check if condominium id exist
    const objCondominiumsRowNumber =
      objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumsRowNumber !== -1) {

      // update user
      objCondominiums.updateCondominiumTable(user, condominiumId, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);

    } else {

      // Insert user row in users table
      objCondominiums.insertCondominiumTable(user, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
    }
    /*
    // Update condominium table
    const SQLquery =
      `
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
    */
  }

  document.querySelector('.select-condominiums-condominiumId').disabled =
    false;
  document.querySelector('.button-condominiums-delete').disabled =
    false;
  document.querySelector('.button-condominiums-insert').disabled =
    false;
}


// Show leading text for condominium
function showLeadingText(condominiumId) {

  // Show all condominiums
  objCondominiums.showAllCondominiums('condominiums-condominiumId', condominiumId);

  // Show condominium name
  objCondominiums.showInput('condominiums-name', '* Navn', 50, '');

  // Show street name
  objCondominiums.showInput('condominiums-street', '* Gateadresse', 50, '');

  // Show address 2
  objCondominiums.showInput('condominiums-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondominiums.showInput('condominiums-postalCode', '* Postnummer', 4, '');

  // City
  objCondominiums.showInput('condominiums-city', '* Poststed', 50, '');

  // phone
  objCondominiums.showInput('condominiums-phone', 'Telefonnummer', 20, '');

  // email
  objCondominiums.showInput('condominiums-email', '* eMail', 50, '');

  // show all account Ids for income remote heating
  objAccounts.showAllAccounts('condominiums-incomeRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for payment remote heating
  objAccounts.showAllAccounts('condominiums-paymentRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for common cost accounts
  objAccounts.showAllAccounts('condominiums-commoncostAccountId', 0, "", "Ingen");

  // organization Number
  objCondominiums.showInput('condominiums-organizationNumber', '* Organisasjonsnummer', 9, '');

  // import path
  objCondominiums.showInput('condominiums-fileName', '* Navn på importfil', 50, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objCondominiums.showButton('condominiums-update', 'Oppdater');

    // show new button
    objCondominiums.showButton('condominiums-insert', 'Ny');

    // show delete button
    objCondominiums.showButton('condominiums-delete', 'Slett');

    // cancel button
    objCondominiums.showButton('condominiums-cancel', 'Avbryt');
  }
}

// Show all values for condominium
function showValues(condominiumId) {

  // Check for valid condominium Id
  if (condominiumId >= 0) {

    // get object number for selected condominium id
    const objCondominiumsRowNumber =
      objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumsRowNumber !== -1) {

      // Condominium id
      document.querySelector('.select-condominiums-condominiumId').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].condominiumId;

      // Condominium name
      document.querySelector('.input-condominiums-name').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].name;

      // Show street
      document.querySelector('.input-condominiums-street').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].street;

      // Show address 2
      document.querySelector('.input-condominiums-address2').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condominiums-postalCode').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condominiums-city').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].city;

      // Show phone
      document.querySelector('.input-condominiums-phone').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].phone;

      // Show email
      document.querySelector('.input-condominiums-email').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].email;

      // account id for income remote heating
      document.querySelector('.select-condominiums-incomeRemoteHeatingAccountId').value =
        (objCondominiums.arrayCondominiums[objCondominiumsRowNumber].incomeRemoteHeatingAccountId) ? objCondominiums.arrayCondominiums[objCondominiumsRowNumber].incomeRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominiums-incomeRemoteHeatingAccountId').innerHTML =
        'Inntekt fjernvarmekonto';

      // account id for payment remote heating
      document.querySelector('.select-condominiums-paymentRemoteHeatingAccountId').value =
        (objCondominiums.arrayCondominiums[objCondominiumsRowNumber].paymentRemoteHeatingAccountId) ? objCondominiums.arrayCondominiums[objCondominiumsRowNumber].paymentRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominiums-paymentRemoteHeatingAccountId').innerHTML =
        'Utgift fjernvarmekonto';

      // account id for common cost
      document.querySelector('.select-condominiums-commoncostAccountId').value =
        (objCondominiums.arrayCondominiums[objCondominiumsRowNumber].commonCostAccountId) ? objCondominiums.arrayCondominiums[objCondominiumsRowNumber].commonCostAccountId : 0;
      document.querySelector('.label-condominiums-commoncostAccountId').innerHTML =
        'Konto for felleskostnader';

      // Show organization number
      document.querySelector('.input-condominiums-organizationNumber').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].organizationNumber;

      // Show file import path
      document.querySelector('.input-condominiums-fileName').value =
        objCondominiums.arrayCondominiums[objCondominiumsRowNumber].importPath;
    }
  }
}

// Reset all values for condominium
function resetValues() {

  document.querySelector('.select-condominiums-condominiumId').value =
    '';

  document.querySelector('.input-condominiums-name').value =
    '';

  // Show street
  document.querySelector('.input-condominiums-street').value =
    '';

  // Show address 2
  document.querySelector('.input-condominiums-address2').value =
    '';

  // Show postal code
  document.querySelector('.input-condominiums-postalCode').value =
    '';

  // Show city
  document.querySelector('.input-condominiums-city').value =
    '';

  // Show phone number
  document.querySelector('.input-condominiums-phone').value =
    '';

  // Show email
  document.querySelector('.input-condominiums-email').value =
    '';

  // account id for income remote heating
  document.querySelector('.select-condominiums-incomeRemoteHeatingAccountId').value =
    0;

  // account id for payment remote heating
  document.querySelector('.select-condominiums-paymentRemoteHeatingAccountId').value =
    0;

  // account id for common cost
  document.querySelector('.select-condominiums-commoncostAccountId').value =
    0;

  // Show organization number
  document.querySelector('.input-condominiums-organizationNumber').value =
    '';

  // Show path for file to import
  document.querySelector('.input-condominiums-fileName').value =
    '';

  document.querySelector('.select-condominiums-condominiumId').disabled =
    true;
  document.querySelector('.button-condominiums-delete').disabled =
    true;
  document.querySelector('.button-condominiums-insert').disabled =
    true;
  //document.querySelector('.button-condominiums-cancel').disabled =
  //  true;
}

/*
// Delete a row in condominium table
function deleteCondominiumRow() {

  let SQLquery = "";

  // Check for valid condominium Id
  const condominiumId = Number(document.querySelector('.select-condominiums-condominiumId').value);
  if (condominiumId >= 0) {

    // Check if condominium exist
    const objCondominiumsRowNumber =
      objcondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (objCondominiumsRowNumber !== -1) {

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
*/

// Check for valid condominium number
function validateValues() {

  // Check condominium name
  const condominiumName =
    document.querySelector('.input-condominiums-name').value;
  const validCondominiumName =
    objCondominiums.validateText(condominiumName, "label-condominiums-name", "Navn");

  // Check street name
  const street = document.querySelector('.input-condominiums-street').value;
  const validStreet = objCondominiums.validateText(street, "label-condominiums-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condominiums-postalCode').value;
  const validPostalCode = objCondominiums.validatePostalCode(postalCode, "label-condominiums-postalCode", "Postnummer");

  // Validate city
  const city = document.querySelector('.input-condominiums-city').value;
  const validCity = objCondominiums.validateText(city, "label-condominiums-city", "Poststed");

  // Check email
  const eMail = document.querySelector('.input-condominiums-email').value;
  const validEmail = objCondominiums.validateEmail(eMail, "label-condominiums-email", "E-mail");

  // Check organization number
  const organizationNumber = document.querySelector('.input-condominiums-organizationNumber').value;
  const validOrganizationNumber = validateOrganizationNumber(organizationNumber, "condominiums-organizationNumber", "Organisasjonsnummer");

  // Check import path
  const importPath = document.querySelector('.input-condominiums-fileName').value;
  const validImportPath = objCondominiums.validateText(importPath, "condominiums-fileName", "Navn på importfil");

  return (validCondominiumName
    && validStreet
    && validPostalCode
    && validCity
    && validEmail
    && validOrganizationNumber
    && validImportPath
  ) ? true : false;
}

// Delete condominium
async function deleteCondominium() {

  // Check for valid condominium number
  const condominiumId = Number(document.querySelector('.select-condominiums-condominiumId').value);

  // Check if condominium number exist
  const condominiumRowNumberObj = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumRowNumberObj !== -1) {

    // delete condominium row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objCondominiums.deleteCondominiumsTable(condominiumId, user, lastUpdate);
  }
}