// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objSupplier = new Supplier('supplier');

const disableChanges = (objSupplier.securityLevel < 5);
const condominiumId = objSupplier.condominiumId;
const user = objSupplier.user;
const securityLevel = objSupplier.securityLevel;

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((condominiumId === 0 || user === null)) {

  // LogIn is not valid
  //window.location.href = 'http://localhost/condo-login.html';
  const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident, objSupplier.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      await objSupplier.loadSuppliersTable(condominiumId);

      // Find selected supplier id
      const supplierId = objSupplier.getSelectedSupplierId('select-supplierId');

      // Show header
      showHeader();

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(supplierId, menuNumber);

      // Show supplier
      menuNumber = showResult(supplierId, menuNumber);

      // Events
      events();
    } else {

      objSupplier.showMessage(objSupplier, '', 'condo-server.js er ikke startet.');
    }
  }
}

// Events for suppliers
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      //const condominiumId = Number(condominiumId);
      await objSupplier.loadSuppliersTable(condominiumId);

      const supplierId = Number(document.querySelector('.filterSupplierId').value);

      let menuNumber = 0;
      menuNumber = showResult(supplierId, menuNumber);
    };
  });

  // update/insert a suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const supplierId = document.querySelector('.filterSupplierId').value;
      updateSuppliersRow(supplierId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      await deleteSupplierRow();

      //const condominiumId = Number(condominiumId);
      await objSupplier.loadSuppliersTable(condominiumId);

      // Show filter
      const supplierId = objSupplier.arraySuppliers.at(-1).supplierId;
      let menuNumber = 0;
      menuNumber = showFilter(supplierId, menuNumber);
      menuNumber = showResult(supplierId, menuNumber);
    };
  });

  // Insert a supplier row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload suppliers table
      await objSupplier.loadSuppliersTable(condominiumId);

      let supplierId = Number(document.querySelector('.filterSupplierId').value);
      if (supplierId === 0) supplierId = objSupplier.arraySuppliers.at(-1).supplierId;

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(supplierId, menuNumber);
      menuNumber = showResult(supplierId, menuNumber);
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objSupplier.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

function resetValues() {

  // supplier Id
  document.querySelector('.filterSupplierId').value = 0;

  // reset name
  document.querySelector('.name').value = '';

  // street
  document.querySelector('.street').value = '';

  // address 2
  document.querySelector('.address2').value = '';

  // reset postal code
  document.querySelector('.postalCode').value = '';

  // reset city
  document.querySelector('.city').value = '';

  // reset e-mail
  document.querySelector('.email').value = '';

  // reset phone number
  document.querySelector('.phone').value = '';

  // reset bank account
  document.querySelector('.bankAccount').value = '';

  // account Id
  document.querySelector('.accountId').value = 0;

  // amount accountId Id
  document.querySelector('.amountAccountId').value = 0;

  // amount
  document.querySelector('.amount').value = '';

  // text
  document.querySelector('.text').value = '';

  document.querySelector('.filterSupplierId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objSupplier.startTable(tableWidth);

  // show main header
  html += objSupplier.showTableHeader('width:175px;', 'Mottaker');

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objSupplier.startTable(tableWidth);

  // start table body
  html += objSupplier.startTableBody();

  // show main header
  html += objSupplier.showTableHeaderLogOut('width:175px;', '', '', 'Mottaker', '');
  html += "</tr>";

  // end table body
  html += objSupplier.endTableBody();

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(supplierId, rowNumber) {

  // Start table
  html = objSupplier.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objSupplier.showTableHeaderMenu('width:175px;', rowNumber, 'Velg mottaker', '');

  // start table body
  html += objSupplier.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objSupplier.insertTableColumns('', rowNumber);

  // supplier
  html += objSupplier.showSelectedSuppliersNew('filterSupplierId', 'width:175px;', supplierId, '', '')

  html += "</tr>";

  // end table body
  html += objSupplier.endTableBody();

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(supplierId, rowNumber) {

  // start table
  let html = objSupplier.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objSupplier.showTableHeaderMenu('width:175px;', rowNumber, '', '');

  // Check if supplier row exist
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // Header for value including menu
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Navn');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // name
    html += objSupplier.inputTableColumn('name', '', objSupplier.arraySuppliers[rowNumberSupplier].name, 45, disableChanges);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // street
    html += objSupplier.inputTableColumn('street', '', objSupplier.arraySuppliers[rowNumberSupplier].street, 45, disableChanges);

    // address2
    html += objSupplier.inputTableColumn('address2', '', objSupplier.arraySuppliers[rowNumberSupplier].address2, 45, disableChanges);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // postalCode
    html += objSupplier.inputTableColumn('postalCode', '', objSupplier.arraySuppliers[rowNumberSupplier].postalCode, 4, disableChanges);

    // city
    html += objSupplier.inputTableColumn('city', '', objSupplier.arraySuppliers[rowNumberSupplier].city, 45, disableChanges);

    html += "</tr>";

    // email,phone
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'e-Mail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // email
    html += objSupplier.inputTableColumn('email', '', objSupplier.arraySuppliers[rowNumberSupplier].email, 50, disableChanges);

    // phone
    html += objSupplier.inputTableColumn('phone', '', objSupplier.arraySuppliers[rowNumberSupplier].phone, 8, disableChanges);

    html += "</tr>";

    // bankAccount, accountId
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Konto', 'Bankkontonummer');

    // Show menu
    rowNumber++;
    html += objSupplier.verticalMenu(rowNumber);

    // accountId
    html += objAccount.showSelectedAccounts('accountId', '', objSupplier.arraySuppliers[rowNumberSupplier].accountId, 'Ingen konto er valgt', '', disableChanges);

    // bankAccount number
    html += objSupplier.inputTableColumn('bankAccount', '', objSupplier.arraySuppliers[rowNumberSupplier].bankAccount, 11, disableChanges);

    html += "</tr>";

    // amountAccountId, amount
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Konto for beløp', 'Beløp');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // amountAccountId
    html += objAccount.showSelectedAccounts('amountAccountId', '', objSupplier.arraySuppliers[rowNumberSupplier].amountAccountId, 'Ingen konto er valgt', '', disableChanges);

    // amount
    html += objSupplier.inputTableColumn('amount', '', objSupplier.arraySuppliers[rowNumberSupplier].amount, 11, disableChanges);

    html += "</tr>";

    // textAccountId, text
    html += "<tr>";
    rowNumber++;
    html += objSupplier.showTableHeaderMenu("width:175px;", rowNumber, 'Konto for tekst', 'Tekst');

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber);

    // AccountId for text
    html += objAccount.showSelectedAccounts('textAccountId', '', objSupplier.arraySuppliers[rowNumberSupplier].textAccountId, 'Ingen konto er valgt', '', disableChanges);

    // text for account id
    html += objSupplier.inputTableColumn('text', '', objSupplier.arraySuppliers[rowNumberSupplier].text, 50, disableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSupplier.insertTableColumns('', rowNumber, '');

    html += "</tr>";

    // Buttons
    if (!disableChanges) {

      // insert table columns in start of a row
      rowNumber++;
      html += objSupplier.insertTableColumns('', rowNumber);

      html += objSupplier.showButton('width:175px;', 'update', 'Oppdater');
      html += objSupplier.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      rowNumber++;
      html += objSupplier.insertTableColumns('', rowNumber);

      html += objSupplier.showButton('width:175px;', 'delete', 'Slett');
      html += objSupplier.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    rowNumber++;
    html += objSupplier.showRestMenu(rowNumber);

    // The end of the table
    html += objSupplier.endTable();
    document.querySelector('.result').innerHTML = html;
  }
}

// Update a supplier row
async function updateSuppliersRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = objSupplier.validateNumber('supplierId', supplierId, -1, objSupplier.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objSupplier.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objSupplier.validateText(street, 0, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objSupplier.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = objSupplier.validateNumber('postalCode', Number(postalCode), 0, 9999);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = objSupplier.validateText(city, 0, 45);

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  //let validPhone = objSupplier.validatePhone('phone', phone);
  //if (phone === '') validPhone = true;

  // validate email
  const email = document.querySelector('.email').value.trim();
  //let validEmail = objSupplier.validateEmail('email', email);
  //if (email === '') validEmail = true;

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = objSupplier.validateBankAccount('bankAccount', bankAccount);
  if (bankAccount === '') validBankAccount = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = objSupplier.validateNumber('accountId', accountId, 1, 999999998);

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = objSupplier.validateNumber('amountAccountId', amountAccountId, 0, 999999998);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatKronerToOre(amount));
  const validAmount = objSupplier.validateNumber('amount', amount, objSupplier.minusNineNine, objSupplier.nineNine);

  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = objSupplier.validateNumber('textAccountId', textAccountId, 0, 999999998);

  // validate text
  const text = document.querySelector('.text').value;
  const validText = objSupplier.validateText(text, 0, 50);

  if (validSupplierId && validName && validStreet && validAddress2 && validPostalCode && validCity && validBankAccount && validAccountId && validAmountAccountId && validAmount && validTextAccountId) {

    // Check if the supplierId exist
    const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSupplier.updateSuppliersTable(supplierId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(condominiumId);
    } else {

      // Insert the supplier row in supplier table
      await objSupplier.insertSuppliersTable(condominiumId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(condominiumId);
      supplierId = objSupplier.arraySuppliers.at(-1).supplierId;
      document.querySelector('.filterSupplierId').value = supplierId;
    }

    // Show filter
    let menuNumber = 0;
    menuNumber = showFilter(supplierId, menuNumber);
    menuNumber = showResult(supplierId, menuNumber);

    document.querySelector('.filterSupplierId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

// Delete a suppliers row
async function deleteSupplierRow() {

  // Check for supplier Id
  const supplierId = Number(document.querySelector('.filterSupplierId').value);

  // Check if supplier id exist
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // delete supplier row


    objSupplier.deleteSuppliersTable(supplierId, user);
  }
}