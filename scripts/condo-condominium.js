// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

const enableChanges = (objCondominium.securityLevel > 5);

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || objCondominium.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      await objCondominium.loadCondominiumsTable();

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident, objCondominium.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(condominiumId, objCondominium.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      // Show result
      menuNumber = showResult(condominiumId, menuNumber);

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

      showResult(condominiumId, 3)
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

      await objCondominium.loadCondominiumsTable();

      // Show filter
      showResult(condominiumId, 3);
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

      showResult(condominiumId, 3);
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
function showFilter(menuNumber) {

  // Start table
  html = objCondominium.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objCondominium.showTableHeaderMenu('width:175px;', menuNumber, 'Velg sameie', '');

  // start table body
  html += objCondominium.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objCondominium.insertTableColumns('', menuNumber);

  // condominium
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', '')

  html += "</tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objCondominium.insertTableColumns('', menuNumber, '', '');

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show result
function showResult(condominiumId, menuNumber) {

  // start table
  let html = objCondominium.startTable(tableWidth);

  // Check if condominiums row exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // Show menu
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Navn', '');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // name
    html += objCondominium.inputTableColumn('name', '', objCondominium.arrayCondominiums[rowNumberCondominium].name, 45, enableChanges);

    html += "</tr>";

    // street, address2
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // street
    html += objCondominium.inputTableColumn('street', '', objCondominium.arrayCondominiums[rowNumberCondominium].street, 45, enableChanges);

    // address2
    html += objCondominium.inputTableColumn('address2', '', objCondominium.arrayCondominiums[rowNumberCondominium].address2, 45, enableChanges);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // postalCode
    html += objCondominium.inputTableColumn('postalCode', '', objCondominium.arrayCondominiums[rowNumberCondominium].postalCode, 4, enableChanges);

    // city
    html += objCondominium.inputTableColumn('city', '', objCondominium.arrayCondominiums[rowNumberCondominium].city, 45, enableChanges);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'eMail', 'Telefonnummer');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // eMail
    html += objCondominium.inputTableColumn('email', '', objCondominium.arrayCondominiums[rowNumberCondominium].email, 45, enableChanges);

    // phone
    html += objCondominium.inputTableColumn('phone', '', objCondominium.arrayCondominiums[rowNumberCondominium].phone, 8, enableChanges);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // incomeRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('incomeRemoteHeatingAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId, '', '', enableChanges);

    // paymentRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('paymentRemoteHeatingAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId, '', '', enableChanges);

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // commonCostAccountId
    html += objAccount.showSelectedAccounts('commonCostAccountId', 'width:175px;', objCondominium.arrayCondominiums[rowNumberCondominium].commonCostAccountId, 'Ingen', '', enableChanges);

    // organizationNumber
    html += objCondominium.inputTableColumn('organizationNumber', '', objCondominium.arrayCondominiums[rowNumberCondominium].organizationNumber, 9, enableChanges);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    menuNumber++;
    html += objCondominium.showTableHeaderMenu("width:175px;", menuNumber, 'Navn importfil');

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    // importFileName
    html += objCondominium.inputTableColumn('importFileName', '', objCondominium.arrayCondominiums[rowNumberCondominium].importFileName, 100, enableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber);

    html += "</tr>";

    // Show buttons
    if (enableChanges) {

      // insert table columns in start of a row
      menuNumber++;
      html += objCondominium.insertTableColumns('', menuNumber);

      html += objCondominium.showButton('width:175px; background:#e0f0e0;', 'update', 'Oppdater');
      html += objCondominium.showButton('width:175px; background:#e0f0e0;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      menuNumber++;
      html += objCondominium.insertTableColumns('', menuNumber);

      html += objCondominium.showButton('width:175px;', 'delete', 'Slett');
      html += objCondominium.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    menuNumber++;
    html += objCondominium.showRestMenu(menuNumber);

    // The end of the table
    html += objCondominium.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
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

    // Show filter
    menuNumber = showResult(condominiumId, 3);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
