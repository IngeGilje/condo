// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

const disableChanges = (objCondominium.securityLevel < 5);
const condominiumId = objCondominium.condominiumId;
const user = objCondominium.user;

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCondominium.condominiumId === 0 || objCondominium.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      await objCondominium.loadCondominiumsTable();
      //const condominiumId = objCondominium.arrayCondominiums.at(-1).condominiumId;

      const resident = 'Y';
      await objUser.loadUsersTable(objCondominium.condominiumId, resident);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objCondominium.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objCondominium.condominiumId, objCondominium.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      // Show result
      menuNumber = showResult(objCondominium.condominiumId, menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Events for condominium
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      await objCondominium.loadCondominiumsTable();

      let menuNumber = 0;
      menuNumber = showResult(condominiumId, menuNumber)
    };
  });

  // update/insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a condominiums row
      condominiumId = document.querySelector('.filterCondominiumId').value;
      updateCondominiumRow(condominiumId);
    };
  });

  // Delete condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondominiumRow();

      let menuNumber = 0;

      await objCondominium.loadCondominiumsTable();

      // Show filter
      menuNumber = showFilter(menuNumber);
      menuNumber = showResult(condominiumId, menuNumber);
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condominiums table
      await objCondominium.loadCondominiumsTable();

      let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      if (condominiumId === 0) condominiumId = objCondominium.arrayCondominiums.at(-1).condominiumId;

      let menuNumber = 0;
      menuNumber = showResult(condominiumId, menuNumber);
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCondominium.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

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

// Delete condominium row
async function deleteCondominiumRow() {

  // condominiumId
  //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominiumId exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row


    await objCondominium.deleteCondominiumsTable(condominiumId, user);
  }
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objCondominium.startTable(tableWidth);

  // show main header
  html += objCondominium.showTableHeader('width:175px;', 'Sameie');

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objCondominium.startTable(tableWidth);

  // start table body
  html += objCondominium.startTableBody();

  // show main header
  html += objCondominium.showTableHeaderLogOut('width:175px;', '', '', 'Sameie', '');
  html += "</tr>";

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objCondominium.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objCondominium.showTableHeaderMenu('width:175px;', rowNumber, 'Velg sameie', '');

  // start table body
  html += objCondominium.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objCondominium.insertTableColumns('', rowNumber);

  // condominium
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', '')

  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objCondominium.insertTableColumns('', rowNumber, '', '');

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(condominiumId, rowNumber) {

  // start table
  let html = objCondominium.startTable(tableWidth);

  // Check if condominiums row exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // Show menu
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Navn', '');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // name
    html += objCondominium.inputTableColumn('name', '', objCondominium.arrayCondominiums[rowNumberCondominium].name, 45, disableChanges);

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // street
    html += objCondominium.inputTableColumn('street', '', objCondominium.arrayCondominiums[rowNumberCondominium].street, 45, disableChanges);

    // address2
    html += objCondominium.inputTableColumn('address2', '', objCondominium.arrayCondominiums[rowNumberCondominium].address2, 45, disableChanges);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // postalCode
    html += objCondominium.inputTableColumn('postalCode', '', objCondominium.arrayCondominiums[rowNumberCondominium].postalCode, 4,disableChanges);

    // city
    html += objCondominium.inputTableColumn('city', '', objCondominium.arrayCondominiums[rowNumberCondominium].city, 45,disableChanges);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'eMail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // eMail
    html += objCondominium.inputTableColumn('email', '', objCondominium.arrayCondominiums[rowNumberCondominium].email, 45, disableChanges);

    // phone
    html += objCondominium.inputTableColumn('phone', '', objCondominium.arrayCondominiums[rowNumberCondominium].phone, 8, disableChanges);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // incomeRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('incomeRemoteHeatingAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId, '', '',disableChanges);

    // paymentRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('paymentRemoteHeatingAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId, '', '',disableChanges);

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // commonCostAccountId
    html += objAccount.showSelectedAccounts('commonCostAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].commonCostAccountId, 'Ingen', '',disableChanges);

    // organizationNumber
    html += objCondominium.inputTableColumn('organizationNumber', '', objCondominium.arrayCondominiums[rowNumberCondominium].organizationNumber, 9, disableChanges);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    rowNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", rowNumber, 'Navn importfil');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    // importFileName
    html += objCondominium.inputTableColumn('importFileName', '', objCondominium.arrayCondominiums[rowNumberCondominium].importFileName, 100, disableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber);

    html += "</tr>";

    if (!disableChanges) {

      // insert table columns in start of a row
      rowNumber++;
      html += objCondominium.insertTableColumns('', rowNumber);

      html += objCondominium.showButton('width:175px; background:#e0f0e0;', 'update', 'Oppdater');
      html += objCondominium.showButton('width:175px; background:#e0f0e0;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      rowNumber++;
      html += objCondominium.insertTableColumns('', rowNumber);

      html += objCondominium.showButton('width:175px;', 'delete', 'Slett');
      html += objCondominium.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    rowNumber++;
    html += objCondominium.showRestMenu(rowNumber);

    // The end of the table
    html += objCondominium.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);



  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondominium.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondominium.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondominium.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondominium.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondominium.validateText(city, 1, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objCondominium.validatePhone('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominium.validateEmail('email', email);

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objCondominium.validateNumber('incomeRemoteHeatingAccountId', incomeRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objCondominium.validateNumber('paymentRemoteHeatingAccountId', paymentRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objCondominium.validateNumber('commonCostAccountId', commonCostAccountId, 0, objCondominium.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objCondominium.validateOrganizationNumber('organizationNumber', organizationNumber);

  // Validate importFileName
  const importFileName = document.querySelector('.importFileName').value;
  const validImportFileName = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validImportFileName) {

    // Check if the condominiumId exist
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update the condominiums row
      await objCondominium.updateCondominiumsTable(user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominium.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objCondominium.insertCondominiumsTable(user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominium.loadCondominiumsTable();
      condominiumId = objCondominium.arrayCondominiums.at(-1).condominiumId;
      document.querySelector('.filterCondominiumId').value = condominiumId;
    }

    let menuNumber = 0;

    // Show filter
    menuNumber = showFilter(menuNumber);
    menuNumber = showResult(condominiumId, menuNumber);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
