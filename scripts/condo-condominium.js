// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objCondominiums = new Condominium('condominium');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

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

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objBankAccounts.loadBankAccountsTable(condominiumId, 999999999);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter(condominiumId);

    // Show result
    menuNumber = showResult(condominiumId, menuNumber);

    // Events
    events();
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

        const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

        let menuNumber = 0;
        showResult(condominiumId, menuNumber);
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

        await objCondominiums.loadCondominiumsTable();

        // Show filter
        const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
        showFilter(condominiumId);

        let menuNumber = 0;
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
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominiumId exist
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumRowNumber !== -1) {

    // delete condominium row
    const user = objUserPassword.email;

    await objCondominiums.deleteCondominiumsTable(condominiumId, user);
  }
}

/*
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objCondominiums.showTableHeaderNew('width:250px;', 'Sameie');

  // The end of the table
  html += endTableNew();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objCondominiums.startTableNew('width:750px;');

  // show main header
  html += objCondominiums.showTableHeaderNew('width:250px;', 'Sameie');

  //html += objCondominiums.insertEmptyTableRowNew(0,'');

  // The end of the table header
  //html += objCondominiums.endTableHeaderNew();

  // The end of the table
  html += objCondominiums.endTableNew();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objCondominiums.startTableNew('width:750px;');

  // Header filter
  html += objCondominiums.showTableHeaderNew("width:250px;", '', 'Velg sameie', '');

  // start table body
  html += objCondominiums.startTableBodyNew();

  // insert table columns in start of a row
  html += objCondominiums.insertTableColumnsNew('', 0, '');

  // condominium
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', '', 0, '', '')

  html += "</tr>";

  //html += objCondominiums.insertEmptyTableRowNew(0, '');
  // insert table columns in start of a row
  html += objCondominiums.insertTableColumnsNew('', 0, '');

  // end table body
  html += objCondominiums.endTableBodyNew();

  // The end of the table
  html += objCondominiums.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(condominiumId, rowNumber) {

  // start table
  let html = objCondominiums.startTableNew('width:750px;');

  // table header
  html += objCondominiums.showTableHeaderNew('width:250px;', '', '', '');

  // Check if condominiums row exist
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumRowNumber !== -1) {

    // Start table
    //html = startHTMLTable('width:750px;');

    // Main header
    //html += objCondominiums.showTableHeaderNew('width:250px;', '', '', '');

    // Show menu
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Navn');

    //html += "<tr>";

    // Show menu
    //html += "<tr>";

    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // name
    html += objCondominiums.inputTableColumnNew('name', objCondominiums.arrayCondominiums[condominiumRowNumber].name, 45);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Gate', 'Adresse 2');

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // street
    html += objCondominiums.inputTableColumnNew('street', objCondominiums.arrayCondominiums[condominiumRowNumber].street, 45);

    // address2
    html += objCondominiums.inputTableColumnNew('address2', objCondominiums.arrayCondominiums[condominiumRowNumber].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Postnummer', 'Poststed');

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // postalCode
    html += objCondominiums.inputTableColumnNew('postalCode', objCondominiums.arrayCondominiums[condominiumRowNumber].postalCode, 4);

    // city
    html += objCondominiums.inputTableColumnNew('city', objCondominiums.arrayCondominiums[condominiumRowNumber].city, 45);

    html += "</tr>";

    // email, phone
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'eMail', 'Telefonnummer');

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // eMail
    html += objCondominiums.inputTableColumnNew('email', objCondominiums.arrayCondominiums[condominiumRowNumber].email, 45);

    // phone
    html += objCondominiums.inputTableColumnNew('phone', objCondominiums.arrayCondominiums[condominiumRowNumber].phone, 8);

    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // incomeRemoteHeatingAccountId
    html += objAccounts.showSelectedAccountsNew('incomeRemoteHeatingAccountId', 'width:170px;', objCondominiums.arrayCondominiums[condominiumRowNumber].incomeRemoteHeatingAccountId, '', '');

    // paymentRemoteHeatingAccountId
    html += objAccounts.showSelectedAccountsNew('paymentRemoteHeatingAccountId', 'width:170px;', objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId, '', '');

    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Inntekstonto husleie', 'Organisasjonsnummer');

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // commonCostAccountId
    html += objAccounts.showSelectedAccountsNew('commonCostAccountId', 'width:170px;', objCondominiums.arrayCondominiums[condominiumRowNumber].commonCostAccountId, 'Ingen', '');

    // organizationNumber
    html += objCondominiums.inputTableColumnNew('organizationNumber', objCondominiums.arrayCondominiums[condominiumRowNumber].organizationNumber, 9);

    html += "</tr>";

    // importFileName
    html += "<tr>";
    rowNumber++;
    html += objCondominiums.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Navn importfil');

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    // importFileName
    html += objCondominiums.inputTableColumnNew('importFileName', objCondominiums.arrayCondominiums[condominiumRowNumber].importFileName, 100);

    html += "</tr>";

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    html += "</tr>";

    // show buttons
    //html += "<tr>";

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    html += objCondominiums.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objCondominiums.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // Show menu
    //html += "<tr>";
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";

    // Show menu
    //rowNumber++;
    //html += objCondominiums.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumnsNew('', rowNumber);

    html += objCondominiums.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objCondominiums.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    html += objCondominiums.showRestMenuNew(rowNumber);

    // The end of the table
    html += objCondominiums.endTableNew();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  const user = objUserPassword.email;

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
  //const validImportFileName = objCondominiums.validateFileNameNew(importFileName);
  const validImportFileName = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validImportFileName) {

    // Check if the condominiumId exist
    const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (condominiumRowNumber !== -1) {

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

    // Show filter
    showFilter(condominiumId);
    let menuNumber = 0;
    menuNumber = showResult(condominiumId, menuNumber);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
