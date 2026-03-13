// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objBankAccountTransactions = new BankAccountMovements('bankaccountmovements');

let condominiumId = 0;
let user = "";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    user = sessionStorage.getItem("user");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      await objBankAccountTransactions.loadCondominiumsTable();
      //const condominiumId = objBankAccountTransactions.arrayCondominiums.at(-1).condominiumId;

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(condominiumId, fixedCost);
      await objBankAccounts.loadBankAccountsTable(condominiumId, objBankAccountTransactions.nineNine);

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

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js er ikke startet.');
  }
}

// Events for condominium
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      filterSync();

      async function filterSync() {

        await objBankAccountTransactions.loadCondominiumsTable();

        //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

        let menuNumber = 0;
        menuNumber = showResult(condominiumId, menuNumber);
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

        deleteCondominiumRow();

        let menuNumber = 0;

        await objBankAccountTransactions.loadCondominiumsTable();

        // Show filter
        menuNumber = showFilter(menuNumber);

        menuNumber = showResult(condominiumId, menuNumber);
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

        await objBankAccountTransactions.loadCondominiumsTable();

        let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        if (condominiumId === 0) condominiumId = objBankAccountTransactions.arrayCondominiums.at(-1).condominiumId;

        let menuNumber = 0;
        menuNumber = showResult(condominiumId, menuNumber);
      };
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
  const rowNumberCondominium = objBankAccountTransactions.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row


    await objBankAccountTransactions.deleteCondominiumsTable(condominiumId, user);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransactions.startTable('width:600px;');

  // show main header
  html += objBankAccountTransactions.showTableHeader('width:175px;', 'Sameie');

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objBankAccountTransactions.startTable('width:600px;');

  // Header filter
  rowNumber++;
  html += objBankAccountTransactions.showTableHeaderMenu('width:175px;', rowNumber, 'Velg sameie', '');

  // start table body
  html += objBankAccountTransactions.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber);

  // condominium
  html += objBankAccountTransactions.showSelectedCondominiums('filterCondominiumId', 'width:175px;', '')

  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber, '', '');

  // end table body
  html += objBankAccountTransactions.endTableBody();

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(condominiumId, rowNumber) {

  // start table
  let html = objBankAccountTransactions.startTable('width:600px;');

  // Check if condominiums row exist
  const rowNumberCondominium = objBankAccountTransactions.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // Show menu
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Navn', '');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // name
    html += objBankAccountTransactions.inputTableColumn('name', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].name, 45);

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // street
    html += objBankAccountTransactions.inputTableColumn('street', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].street, 45);

    // address2
    html += objBankAccountTransactions.inputTableColumn('address2', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // postalCode
    html += objBankAccountTransactions.inputTableColumn('postalCode', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].postalCode, 4);

    // city
    html += objBankAccountTransactions.inputTableColumn('city', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].city, 45);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'eMail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // eMail
    html += objBankAccountTransactions.inputTableColumn('email', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].email, 45);

    // phone
    html += objBankAccountTransactions.inputTableColumn('phone', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].phone, 8);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // incomeRemoteHeatingAccountId
    html += objAccounts.showSelectedAccounts('incomeRemoteHeatingAccountId', 'width:175px;', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId, '', '');

    // paymentRemoteHeatingAccountId
    html += objAccounts.showSelectedAccounts('paymentRemoteHeatingAccountId', 'width:175px;', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId, '', '');

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // commonCostAccountId
    html += objAccounts.showSelectedAccounts('commonCostAccountId', 'width:175px;', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].commonCostAccountId, 'Ingen', '');

    // organizationNumber
    html += objBankAccountTransactions.inputTableColumn('organizationNumber', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].organizationNumber, 9);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, 'Navn importfil');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // importFileName
    html += objBankAccountTransactions.inputTableColumn('importFileName', '', objBankAccountTransactions.arrayCondominiums[rowNumberCondominium].importFileName, 100);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += objBankAccountTransactions.showButton('width:175px; background:#e0f0e0;', 'update', 'Oppdater');
    html += objBankAccountTransactions.showButton('width:175px; background:#e0f0e0;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += objBankAccountTransactions.showButton('width:175px;', 'delete', 'Slett');
    html += objBankAccountTransactions.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    rowNumber++;
    html += objBankAccountTransactions.showRestMenu(rowNumber);

    // The end of the table
    html += objBankAccountTransactions.endTable();
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
  const validName = objBankAccountTransactions.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objBankAccountTransactions.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objBankAccountTransactions.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objBankAccountTransactions.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objBankAccountTransactions.validateText(city, 1, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objBankAccountTransactions.validatePhone('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objBankAccountTransactions.validateEmail('email', email);

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objBankAccountTransactions.validateNumber('incomeRemoteHeatingAccountId', incomeRemoteHeatingAccountId, 0, objBankAccountTransactions.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objBankAccountTransactions.validateNumber('paymentRemoteHeatingAccountId', paymentRemoteHeatingAccountId, 0, objBankAccountTransactions.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objBankAccountTransactions.validateNumber('commonCostAccountId', commonCostAccountId, 0, objBankAccountTransactions.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objBankAccountTransactions.validateOrganizationNumber('organizationNumber', organizationNumber);

  // Validate importFileName
  const importFileName = document.querySelector('.importFileName').value;
  const validImportFileName = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validImportFileName) {

    // Check if the condominiumId exist
    const rowNumberCondominium = objBankAccountTransactions.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update the condominiums row
      await objBankAccountTransactions.updateCondominiumsTable(user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objBankAccountTransactions.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objBankAccountTransactions.insertCondominiumsTable(user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objBankAccountTransactions.loadCondominiumsTable();
      condominiumId = objBankAccountTransactions.arrayCondominiums.at(-1).condominiumId;
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
