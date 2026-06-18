// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

const enableChanges = (objCondominium.securityLevel > 5);

const columnWidths = [175, 175];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCondominium.condominiumId === 0) || (objCondominium.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objCondominium.showHorizontalMenu(objCondominium.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show condominium menu
      html = objCondominium.showHorizontalMenu(objCondominium.arrayMenuCondominium);
      document.querySelector('.menuCondominium').innerHTML = html;

      await objCondominium.loadCondominiumsTable();
      const resident = 'Y';
      await objUser.loadUsersTable(objCondominium.condominiumId, resident, objCondominium.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objCondominium.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objCondominium.condominiumId, objCondominium.nineNine);

      // Show header

      showHeader();

      // Show filter
      editFilter(objCondominium.condominiumId);

      // Show condominium
      editCondominium(objCondominium.condominiumId);

      // Events
      events();
    }
  } else {

    objCondominium.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for condominium
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      // Show condominium
      const fixedCost = 'A';
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      editCondominium(condominiumId, 3);
    };
  });

  // update/insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a condominiums row
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      updateCondominiumRow(condominiumId);
    };
  });

  // Delete condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondominiumRow();

      await objCondominium.loadCondominiumsTable();



      // Show filter
      editFilter(0);

      // Show condominium
      editCondominium(objCondominium.condominiumId);
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

      await objCondominium.loadCondominiumsTable();


      // Show filter
      editFilter(condominiumId);

      // Show condominium
      editCondominium(objCondominium.condominiumId);
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
  document.querySelector('.importPath').value = '';

  objCondominium.removeMessage();

  document.querySelector('.filterCondominiumId').disabled = true;

  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Delete condominium row
async function deleteCondominiumRow() {

  // condominiumId
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominiumId exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row
    await objCondominium.deleteCondominiumsTable(condominiumId, objCondominium.user);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objCondominium.initializeTable(columnWidths);

  // show main header
  html += objCondominium.showTableHeaderLogOut('', 'Sameie');

  html += "</tr>";

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function editFilter(condominiumId) {

  // Start table
  let html = objCondominium.initializeTable(columnWidths);

  // start table body
  html += objCondominium.startTableBody();

  // Header filter (<tr></tr>)
  html += objCondominium.showTableHeaderMenu('', 'centrum', 'Velg sameie', '');

  // start table body
  html += objCondominium.startTableBody();

  // insert a table row (<tr></td>)

  html += objCondominium.insertTableRow('');

  // condominium
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', '', condominiumId, '', '', enableChanges)

  html += "<td></td></tr>";

  // insert a table row (<tr></td>)

  html += objCondominium.insertTableRow('', '', '');

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.editFilter').innerHTML = html;


}

// Show condominium
function editCondominium(condominiumId) {

  // Start table
  let html = objCondominium.initializeTable(columnWidths);

  // start table body
  html += objCondominium.startTableBody();

  // Check if condominiums row exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // Show menu

    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Navn', '');

    // insert a table row (<tr></td>)

    html += objCondominium.insertTableRow('');

    // name
    html += objCondominium.editTableCell('name', objCondominium.arrayCondominiums[rowNumberCondominium].name, 45, enableChanges);

    html += "<td></td></tr>";

    // street, address2

    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Gate', 'Adresse 2');

    // insert a table row (<tr></td>)

    html += objCondominium.insertTableRow('');

    // street
    html += objCondominium.editTableCell('street', objCondominium.arrayCondominiums[rowNumberCondominium].street, 45, enableChanges);

    // address2
    html += objCondominium.editTableCell('address2', objCondominium.arrayCondominiums[rowNumberCondominium].address2, 45, enableChanges);

    html += "</tr>";

    // postalCode, city

    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Postnummer', 'Poststed');

    // insert a table row (<tr></td>)

    html += objCondominium.insertTableRow('');

    // postalCode
    html += objCondominium.editTableCell('postalCode', objCondominium.arrayCondominiums[rowNumberCondominium].postalCode, 4, enableChanges);

    // city
    html += objCondominium.editTableCell('city', objCondominium.arrayCondominiums[rowNumberCondominium].city, 45, enableChanges);
    html += "</tr>";

    // email, phone
    html += objCondominium.showTableHeaderMenu('', 'centrum', 'eMail', 'Telefonnummer');

    // insert a table row (<tr></td>)
    html += objCondominium.insertTableRow('');

    // eMail
    html += objCondominium.editTableCell('email', objCondominium.arrayCondominiums[rowNumberCondominium].email, 45, enableChanges);

    // phone
    html += objCondominium.editTableCell('phone', objCondominium.arrayCondominiums[rowNumberCondominium].phone, 8, enableChanges);
    html += "</tr>";

    // incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId

    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Inntekstkonto fjernvarme', 'Utgiftskonto fjernvarme');

    // insert a table row (<tr></td>)
    html += objCondominium.insertTableRow('');

    // incomeRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('incomeRemoteHeatingAccountId', '', objCondominium.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId, 'Velg konto', '', enableChanges);

    // paymentRemoteHeatingAccountId
    html += objAccount.showSelectedAccounts('paymentRemoteHeatingAccountId', '', objCondominium.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId, 'Velg konto', '', enableChanges);
    html += "</tr>";

    // commonCostAccountId, organizationNumber
    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Inntektskonto husleie', 'Organisasjonsnummer');

    // insert a table row (<tr></td>)
    html += objCondominium.insertTableRow('');

    // commonCostAccountId
    html += objAccount.showSelectedAccounts('commonCostAccountId', '', objCondominium.arrayCondominiums[rowNumberCondominium].commonCostAccountId, 'Velg konto', '', enableChanges);

    // organizationNumber
    html += objCondominium.editTableCell('organizationNumber', objCondominium.arrayCondominiums[rowNumberCondominium].organizationNumber, 9, enableChanges);

    html += "</tr>";

    // importPath

    html += objCondominium.showTableHeaderMenu('', 'centrum', 'Plassering av data', '');

    // insert a table row (<tr></td>)
    html += objCondominium.insertTableRow('');

    // importPath
    html += objCondominium.editTableCell('importPath', objCondominium.arrayCondominiums[rowNumberCondominium].importPath, 100, enableChanges);
    html += "</tr>";

    // insert a table row (<tr></td>)
    html += objCondominium.insertTableRow('');
    html += "</tr>";

    // Show buttons (<tr></td>)
    if (enableChanges) {

      // insert a table row (<tr></td>)

      html += objCondominium.insertTableRow('');

      html += objCondominium.showButton('update', 'Oppdater');
      html += objCondominium.showButton('cancel', 'Angre');
      html += "</tr>";

      // insert a table row (<tr></td>)
      html += objCondominium.insertTableRow('');

      html += objCondominium.showButton('delete', 'Slett');
      html += objCondominium.showButton('insert', 'Ny');
      html += "</tr>";
    }

    // The end of the table
    html += objCondominium.endTable();
    document.querySelector('.editCondominium').innerHTML = html;
    if (enableChanges) document.querySelector('.cancel').disabled = true;


  }
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondominium.validateText('name', columnWidths, '', 'Ugyldig navn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondominium.validateText('street', columnWidths, '', 'Ugyldig addresse', true, street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondominium.validateText('address2', columnWidths, '', 'Ugyldig addresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondominium.validateInterval('postalCode', columnWidths, '', 'Ugyldig postnummer', true, Number(postalCode), 1, objCondominium.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondominium.validateText('city', columnWidths, '', 'Ugyldig poststed', true, city, 1, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objCondominium.validatePhone('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominium.validateEmail('email', email, objCondominium, '', 'Ugyldig mail');

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objCondominium.validateInterval('incomeRemoteHeatingAccountId', columnWidths, '', 'Ugyldig inntektskonto for husleie', true, incomeRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objCondominium.validateInterval('paymentRemoteHeatingAccountId', columnWidths, '', 'Ugyldig inntektskonto for fjernvarme', true, paymentRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objCondominium.validateInterval('commonCostAccountId', columnWidths, '', 'Ugyldig konto', true, commonCostAccountId, 0, objCondominium.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objCondominium.validateOrganizationNumber('organizationNumber', organizationNumber);

  // Validate importPath
  const importPath = document.querySelector('.importPath').value;
  const validimportPath = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validimportPath) {

    document.querySelector('.message').style.display = "none";

    // Check if the condominiumId exist
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update the condominiums row
      await objCondominium.updateCondominiumsTable(objCondominium.user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
      await objCondominium.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objCondominium.insertCondominiumsTable(objCondominium.user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
      await objCondominium.loadCondominiumsTable();
      condominiumId = Number(objCondominium.arrayCondominiums.at(-1).condominiumId);
    }



    // Show filter
    editFilter(condominiumId);

    // Show condominium
    editCondominium(condominiumId);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
