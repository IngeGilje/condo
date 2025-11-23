// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objCondominiums = new Condominiums('condominiums');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

//objCondominiums.menu();
//objCondominiums.markSelectedMenu('Sameie');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objCondominiums.loadCondominiumsTable();
    const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;

    await objUsers.loadUsersTable(condominiumId);
    await objAccounts.loadAccountsTable(condominiumId);
    await objBankAccounts.loadBankAccountsTable(condominiumId, 999999999);

    // Show header
    showHeader();

    // Show filter
    showFilter(condominiumId);

    // Show result
    showResult(condominiumId);

    // Create events
    createEvents();
  }
}

// Make events for condominium
function createEvents() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      filterSync();

      async function filterSync() {

        await objCondominiums.loadCondominiumsTable();

        const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        showResult(condominiumId);
      }
    };
  });

  // update/insert a condominiums row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateCondominiumRowSync();

      // Update a condominiums row
      async function updateCondominiumRowSync() {

        condominiumId = document.querySelector('.filterCondominiumId').value;
        updateCondominiumRow(condominiumId);
      }
    };
  });

  // Delete condominiums row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      deleteAccountSync();

      async function deleteAccountSync() {

        deleteCondominiumsRow();

        await objCondominiums.loadCondominiumsTable();

        // Show filter
        const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
        showFilter(condominiumId);

        showResult(condominiumId);

        showResult(condominiumId);
      };
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condominiums table
      reloadCondominiumsSync();
      async function reloadCondominiumsSync() {

        await objCondominiums.loadCondominiumsTable();

        let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        showResult(condominiumId);
      };
    };
  });
}

/*
// Select condominium
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('select-condominiums-condominiumId')) {

    let condominiumId = Number(document.querySelector('.select-condominiums-condominiumId').value);
    condominiumId = (condominiumId !== 0) ? condominiumId : objCondominiums.arrayCondominiums.at(-1).condominiumId;
    if (condominiumId) {
      showValues(condominiumId);
    }
  }
});

// Update condominiums table
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-condominiums-update')) {

    // Update condominium and reload condominiums
    updateCondominiumSync();

    // Update condominium and reload condominiums
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

      // check for valid values
      if (validateValues()) {

        await updateCondominium(condominiumId);
        await objCondominiums.loadCondominiumsTable();

        // Select last condominiums if condominiumId is 0
        if (condominiumId === 0) condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;

        // Show leading text
        showLeadingText(condominiumId);

        // Show all values for condominium
        showValues(condominiumId);
      }
    }
  }

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condominiums-cancel')) {

      // Reload condominiums
      reloadCondominiumSync();

      async function reloadCondominiumSync() {

        let condominiumId = Number(objUserPassword.condominiumId);
        await objCondominiums.loadCondominiumsTable();

        // Show leading text for maintenance
        // Select first condominium Id
        if (objCondominiums.arrayCondominiums.length > 0) {
          condominiumId = objCondominiums.arrayCondominiums[0].condominiumId;
          showLeadingText(condominiumId);
        }

        // Show all selected condominiums
        objCondominiums.showSelectedCondominiums('condominiums-condominiumId', condominiumId);

        // Show condominium Id
        showValues(condominiumId);
      }
    }
  });
});

// New condominium
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-condominiums-insert')) {
    resetValues();
  }
});

// Delete condominium
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-condominiums-delete')) {

    // Delete condominium and reload users
    deleteCondominiumSync();

    // Delete condominium and reload users
    async function deleteCondominiumSync() {

      await deleteCondominium();

      // Load condominiums
      await objCondominiums.loadCondominiumsTable();

      // Show leading text
      const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
      showLeadingText(condominiumId);

      // Show all values for condominium
      showValues(condominiumId);
    }
  }
});
}
*/
/*
async function updateCondominium(condominiumId) {

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
  const importFileName = document.querySelector('.input-condominiums-fileName').value;

  // Check if condominium id exist
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumsRowNumber !== -1) {

    // update user
    objCondominiums.updateCondominiumTable(user, condominiumId, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
  } else {

    // Insert user row in users table
    objCondominiums.insertCondominiumTable(user, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
  }

  document.querySelector('.select-condominiums-condominiumId').disabled = false;
  document.querySelector('.button-condominiums-delete').disabled = false;
  document.querySelector('.button-condominiums-insert').disabled = false;
}
*/

/*
// Show leading text for condominium
function showLeadingText(condominiumId) {

  // Show all condominiums
  objCondominiums.showSelectedCondominiums('condominiums-condominiumId', condominiumId);

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
  objAccounts.showSelectedAccounts('condominiums-incomeRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for payment remote heating
  objAccounts.showSelectedAccounts('condominiums-paymentRemoteHeatingAccountId', 0, "", "Ingen");

  // show all account Ids for common cost accounts
  objAccounts.showSelectedAccounts('condominiums-commoncostAccountId', 0, "", "Ingen");

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
*/

/*
// Show all values for condominium
function showValues(condominiumId) {

  // Check for valid condominium Id
  if (condominiumId >= 0) {

    // get object number for selected condominium id
    const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (condominiumsRowNumber !== -1) {

      // Condominium id
      document.querySelector('.select-condominiums-condominiumId').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].condominiumId;

      // Condominium name
      document.querySelector('.input-condominiums-name').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].name;

      // Show street
      document.querySelector('.input-condominiums-street').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].street;

      // Show address 2
      document.querySelector('.input-condominiums-address2').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condominiums-postalCode').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condominiums-city').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].city;

      // Show phone
      document.querySelector('.input-condominiums-phone').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].phone;

      // Show email
      document.querySelector('.input-condominiums-email').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].email;

      // account id for income remote heating
      document.querySelector('.select-condominiums-incomeRemoteHeatingAccountId').value = (objCondominiums.arrayCondominiums[condominiumsRowNumber].incomeRemoteHeatingAccountId) ? objCondominiums.arrayCondominiums[condominiumsRowNumber].incomeRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominiums-incomeRemoteHeatingAccountId').innerHTML = 'Inntekt fjernvarmekonto';

      // account id for payment remote heating
      document.querySelector('.select-condominiums-paymentRemoteHeatingAccountId').value = (objCondominiums.arrayCondominiums[condominiumsRowNumber].paymentRemoteHeatingAccountId) ? objCondominiums.arrayCondominiums[condominiumsRowNumber].paymentRemoteHeatingAccountId : 0;
      document.querySelector('.label-condominiums-paymentRemoteHeatingAccountId').innerHTML = 'Utgift fjernvarmekonto';

      // account id for common cost
      document.querySelector('.select-condominiums-commoncostAccountId').value = (objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId) ? objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId : 0;
      document.querySelector('.label-condominiums-commoncostAccountId').innerHTML = 'Konto for felleskostnader';

      // Show organization number
      document.querySelector('.input-condominiums-organizationNumber').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].organizationNumber;

      // Show file import path
      document.querySelector('.input-condominiums-fileName').value = objCondominiums.arrayCondominiums[condominiumsRowNumber].importFileName;
    }
  }
}
*/

// Reset all values for condominium
function resetValues() {

  document.querySelector('.filterCondominiumId').value = '';

  document.querySelector('.name').value = '';

  // street
  document.querySelector('.street').value = '';

  //  address 2
  document.querySelector('.address2').value = '';

  // postal code
  document.querySelector('.postalCode').value = '';

  // city
  document.querySelector('.city').value = '';

  // phone number
  document.querySelector('.phone').value = '';

  // email
  document.querySelector('.email').value = '';

  // account id for income remote heating
  document.querySelector('.incomeRemoteHeatingAccountId').value = 0;

  // account id for payment remote heating
  document.querySelector('.paymentRemoteHeatingAccountId').value = 0;

  // account id for common cost
  document.querySelector('.commonCostAccountId').value = 0;

  // organization number
  document.querySelector('.organizationNumber').value = '';

  // name of importfile
  document.querySelector('.importFileName').value = '';

  document.querySelector('.filterCondominiumId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

/*
// Check for valid condominium number
function validateValues() {

  // Check condominium name
  const condominiumName = document.querySelector('.input-condominiums-name').value;
  const validCondominiumName = objCondominiums.validateText(condominiumName, "label-condominiums-name", "Navn");

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
  const importFileName = document.querySelector('.input-condominiums-fileName').value;
  const validimportFileName = objCondominiums.validateText(importFileName, "condominiums-fileName", "Navn på importfil");

  return (validCondominiumName && validStreet && validPostalCode && validCity
    && validEmail && validOrganizationNumber && importFileName);
}
*/

// Delete condominiums row
async function deleteCondominiumsRow() {

  // Check if condominiumId number
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominium number exist
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumRowNumber !== -1) {

    // delete condominium row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    await objCondominiums.deleteCondominiumsTable(condominiumId, user, lastUpdate);

    await objCondominiums.loadCondominiumsTable();
  }
}
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += showHTMLMainTableHeader('widht:250px;', '', 'Sameie', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(condominiumId) {

  // Start table
  html = startHTMLTable('width:750px;');

  // Header filter for search
  html += showHTMLFilterHeader("width:250px;", '');
  html += showHTMLFilterHeader("width:250px;", '', '', 'Velg sameie');

  // Filter for search
  html += "<tr>";

  html += "<td></td><td></td>";

  // condominium
  //const condominiumId = Number(objUserPassword.condominiumId);
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', '', condominiumId, '', '')

  html += "</tr>";

  // Header filter for search
  html += showHTMLFilterHeader("width:250px;", '', '', '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(condominiumId) {

  // Check if condominiums row exist
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumRowNumber !== -1) {

    let menuNumber = 0;

    // Start table
    html = startHTMLTable('width:750px;');

    // Main header
    html += showHTMLMainTableHeader('widht:250px;', '', '', '');

    // Show menu
    // Header for value including menu
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Navn');

    html += "<tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // name
    html += objCondominiums.showInputHTMLNew('name', objCondominiums.arrayCondominiums[condominiumRowNumber].name, 45);

    // account number
    //html += objCondominiums.showInputHTMLNew('condominium', objCondominiums.arrayCondominiums[condominiumRowNumber].condominium, 11);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Gate', 'Adresse 2');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // street
    html += objCondominiums.showInputHTMLNew('street', objCondominiums.arrayCondominiums[condominiumRowNumber].street, 45);

    // address2
    html += objCondominiums.showInputHTMLNew('address2', objCondominiums.arrayCondominiums[condominiumRowNumber].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Postnummer', 'Poststed');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // postalCode
    html += objCondominiums.showInputHTMLNew('postalCode', objCondominiums.arrayCondominiums[condominiumRowNumber].postalCode, 4);

    // city
    html += objCondominiums.showInputHTMLNew('city', objCondominiums.arrayCondominiums[condominiumRowNumber].city, 45);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'eMail', 'Telefonnummer');

    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // eMail
    html += objCondominiums.showInputHTMLNew('email', objCondominiums.arrayCondominiums[condominiumRowNumber].email, 45);

    // phone
    html += objCondominiums.showInputHTMLNew('phone', objCondominiums.arrayCondominiums[condominiumRowNumber].phone, 8);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Inntektskonto fjernvarme', 'Beløp');

    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // incomeRemoteHeatingAccountId
    html += objAccounts.showSelectedAccountsNew('incomeRemoteHeatingAccountId', 'width:170px;', objCondominiums.arrayCondominiums[condominiumRowNumber].incomeRemoteHeatingAccountId, '', '');

    // paymentRemoteHeatingAccountId
    html += objCondominiums.showInputHTMLNew('paymentRemoteHeatingAccountId', objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId, 10);

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // commonCostAccountId
    html += objAccounts.showSelectedAccountsNew('commonCostAccountId', 'width:170px;', objCondominiums.arrayCondominiums[condominiumRowNumber].commonCostAccountId, '', 'Ingen');

    // organizationNumber
    html += objCondominiums.showInputHTMLNew('organizationNumber', objCondominiums.arrayCondominiums[condominiumRowNumber].organizationNumber, 9);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.showHTMLTableHeader("width:250px;", menuNumber, 'Navn importfil');

    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    // importFileName
    html += objCondominiums.showInputHTMLNew('importFileName', objCondominiums.arrayCondominiums[condominiumRowNumber].importFileName, 45);

    html += "</tr>";








    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    html += objCondominiums.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objCondominiums.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objCondominiums.menuNew(menuNumber);

    html += objCondominiums.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objCondominiums.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    html += objCondominiums.showRestMenuNew(menuNumber);

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.result').innerHTML = html;
  }
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondominiums.validateTextNew(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondominiums.validateTextNew(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondominiums.validateTextNew(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondominiums.validateIntervalNew(Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondominiums.validateTextNew(city, 1, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objCondominiums.validatePhoneNew(phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominiums.validateEmailNew(email);

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objCondominiums.validateIntervalNew(incomeRemoteHeatingAccountId, 0, 999999999);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objCondominiums.validateIntervalNew(paymentRemoteHeatingAccountId, 0, 999999999);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objCondominiums.validateIntervalNew(commonCostAccountId, 0, 999999999);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objCondominiums.validateOrganizationNumberNew(organizationNumber);

  // Validate importFileName
  const importFileName = document.querySelector('.importFileName').value;
  const validImportFileName = objCondominiums.validateFileNameNew(importFileName);

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validImportFileName) {

    // Check if the condominiumId exist
    const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (condominiumRowNumber !== -1) {

      // update the condominiums row
      await objCondominiums.updateCondominiumsTable(user, condominiumId, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominiums.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objCondominiums.insertCondominiumsTable(user, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominiums.loadCondominiumsTable();
      condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
      document.querySelector('.filterCondominiumId').value = condominiumId;
    }

    // Show filter
    showFilter(condominiumId);

    showResult(condominiumId);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
