// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objCondominiums = new Condominium('condominium');
 
let condominium = 0;

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    const email = sessionStorage.getItem("email");
    if ((condominiumId === 0 || email === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      await objCondominiums.loadCondominiumsTable();
      //const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(condominiumId, fixedCost);
      await objBankAccounts.loadBankAccountsTable(condominiumId, objCondominiums.nineNine);

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

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
  }
}

// Events for condominium
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      filterSync();

      async function filterSync() {

        await objCondominiums.loadCondominiumsTable();

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

        await objCondominiums.loadCondominiumsTable();

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

        await objCondominiums.loadCondominiumsTable();

        let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        if (condominiumId === 0) condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;

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
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row
    const user = objUserInfo.email;

    await objCondominiums.deleteCondominiumsTable(condominiumId, user);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objCondominiums.startTable('width:600px;');

  // show main header
  html += objCondominiums.showTableHeader('width:175px;', 'Sameie');

  // The end of the table
  html += objCondominiums.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objCondominiums.startTable('width:600px;');

  // Header filter
  rowNumber++;
  html += objCondominiums.showTableHeaderMenu('width:175px;', rowNumber, 'Velg sameie', '');

  // start table body
  html += objCondominiums.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objCondominiums.insertTableColumns('', rowNumber);

  // condominium
  html += objCondominiums.showSelectedCondominiums('filterCondominiumId', 'width:175px;', '')
  
  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objCondominiums.insertTableColumns('', rowNumber,'','');

  // end table body
  html += objCondominiums.endTableBody();

  // The end of the table
  html += objCondominiums.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(condominiumId, rowNumber) {

  // start table
  let html = objCondominiums.startTable('width:600px;');

  // Check if condominiums row exist
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // Show menu
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Navn','');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // name
    html += objCondominiums.inputTableColumn('name', '', objCondominiums.arrayCondominiums[rowNumberCondominium].name, 45);

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // street
    html += objCondominiums.inputTableColumn('street', '', objCondominiums.arrayCondominiums[rowNumberCondominium].street, 45);

    // address2
    html += objCondominiums.inputTableColumn('address2', '', objCondominiums.arrayCondominiums[rowNumberCondominium].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // postalCode
    html += objCondominiums.inputTableColumn('postalCode', '', objCondominiums.arrayCondominiums[rowNumberCondominium].postalCode, 4);

    // city
    html += objCondominiums.inputTableColumn('city', '', objCondominiums.arrayCondominiums[rowNumberCondominium].city, 45);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'eMail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // eMail
    html += objCondominiums.inputTableColumn('email', '', objCondominiums.arrayCondominiums[rowNumberCondominium].email, 45);

    // phone
    html += objCondominiums.inputTableColumn('phone', '', objCondominiums.arrayCondominiums[rowNumberCondominium].phone, 8);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // incomeRemoteHeatingAccountId
    html += objAccounts.showSelectedAccounts('incomeRemoteHeatingAccountId', 'width:175px;', objCondominiums.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId, '', '');

    // paymentRemoteHeatingAccountId
    html += objAccounts.showSelectedAccounts('paymentRemoteHeatingAccountId', 'width:175px;', objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId, '', '');

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // commonCostAccountId
    html += objAccounts.showSelectedAccounts('commonCostAccountId', 'width:175px;', objCondominiums.arrayCondominiums[rowNumberCondominium].commonCostAccountId, 'Ingen', '');

    // organizationNumber
    html += objCondominiums.inputTableColumn('organizationNumber', '', objCondominiums.arrayCondominiums[rowNumberCondominium].organizationNumber, 9);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showTableHeaderMenu("width:175px;", rowNumber, 'Navn importfil');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    // importFileName
    html += objCondominiums.inputTableColumn('importFileName', '', objCondominiums.arrayCondominiums[rowNumberCondominium].importFileName, 100);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    html += objCondominiums.showButton('width:175px; background:#e0f0e0;', 'update', 'Oppdater');
    html += objCondominiums.showButton('width:175px; background:#e0f0e0;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber);

    html += objCondominiums.showButton('width:175px;', 'delete', 'Slett');
    html += objCondominiums.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    rowNumber++;
    html += objCondominiums.showRestMenu(rowNumber);

    // The end of the table
    html += objCondominiums.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  const user = objUserInfo.email;

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondominiums.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondominiums.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondominiums.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondominiums.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondominiums.validateText(city, 1, 50);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objCondominiums.validatePhone('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominiums.validateEmail('email', email);

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objCondominiums.validateNumber('incomeRemoteHeatingAccountId', incomeRemoteHeatingAccountId, 0, objCondominiums.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objCondominiums.validateNumber('paymentRemoteHeatingAccountId', paymentRemoteHeatingAccountId, 0, objCondominiums.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objCondominiums.validateNumber('commonCostAccountId', commonCostAccountId, 0, objCondominiums.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objCondominiums.validateOrganizationNumber('organizationNumber', organizationNumber);

  // Validate importFileName
  const importFileName = document.querySelector('.importFileName').value;
  const validImportFileName = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validImportFileName) {

    // Check if the condominiumId exist
    const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update the condominiums row
      await objCondominiums.updateCondominiumsTable(user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominiums.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objCondominiums.insertCondominiumsTable(user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName);
      await objCondominiums.loadCondominiumsTable();
      condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
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
