// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objSuppliers = new Supplier('supplier');

const disableChanges = (objSuppliers.securityLevel < 5);
const condominiumId = objSuppliers.condominiumId;
const user = objSuppliers.user;
const securityLevel = objSuppliers.securityLevel;

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
      await objUser.loadUsersTable(condominiumId, resident);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      await objSuppliers.loadSuppliersTable(condominiumId);

      // Find selected supplier id
      const supplierId = objSuppliers.getSelectedSupplierId('select-supplierId');

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

      objSuppliers.showMessage(objSuppliers, '', 'condo-server.js er ikke startet.');
    }
  }
}

// Events for suppliers
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      //const condominiumId = Number(condominiumId);
      await objSuppliers.loadSuppliersTable(condominiumId);

      const supplierId = Number(document.querySelector('.filterSupplierId').value);

      let menuNumber = 0;
      menuNumber = showResult(supplierId, menuNumber);
    };
  });

  // update/insert a suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const supplierId = document.querySelector('.filterSupplierId').value;
      updateSupplierRow(supplierId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      await deleteSupplierRow();

      //const condominiumId = Number(condominiumId);
      await objSuppliers.loadSuppliersTable(condominiumId);

      // Show filter
      const supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;
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
      await objSuppliers.loadSuppliersTable(condominiumId);

      let supplierId = Number(document.querySelector('.filterSupplierId').value);
      if (supplierId === 0) supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(supplierId, menuNumber);
      menuNumber = showResult(supplierId, menuNumber);
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objSuppliers.serverStatus === 1)
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
  let html = objSuppliers.startTable(tableWidth);

  // show main header
  html += objSuppliers.showTableHeader('width:175px;', 'Mottaker');

  // The end of the table
  html += objSuppliers.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objSuppliers.startTable(tableWidth);

  // start table body
  html += objSuppliers.startTableBody();

  // show main header
  html += objSuppliers.showTableHeaderLogOut('width:175px;', '', '', 'Mottaker', '');
  html += "</tr>";

  // end table body
  html += objSuppliers.endTableBody();

  // The end of the table
  html += objSuppliers.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(supplierId, rowNumber) {

  // Start table
  html = objSuppliers.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objSuppliers.showTableHeaderMenu('width:175px;', rowNumber, 'Velg mottaker', '');

  // start table body
  html += objSuppliers.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objSuppliers.insertTableColumns('', rowNumber);

  // supplier
  html += objSuppliers.showSelectedSuppliersNew('filterSupplierId', 'width:175px;', supplierId, '', '')

  html += "</tr>";

  // end table body
  html += objSuppliers.endTableBody();

  // The end of the table
  html += objSuppliers.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(supplierId, rowNumber) {

  // start table
  let html = objSuppliers.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objSuppliers.showTableHeaderMenu('width:175px;', rowNumber, '', '');

  // Check if supplier row exist
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // Header for value including menu
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Navn');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // name
    html += objSuppliers.inputTableColumn('name', '', objSuppliers.arraySuppliers[rowNumberSupplier].name, 45,disableChanges);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // street
    html += objSuppliers.inputTableColumn('street', '', objSuppliers.arraySuppliers[rowNumberSupplier].street, 45,disableChanges);

    // address2
    html += objSuppliers.inputTableColumn('address2', '', objSuppliers.arraySuppliers[rowNumberSupplier].address2, 45,disableChanges);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // postalCode
    html += objSuppliers.inputTableColumn('postalCode', '', objSuppliers.arraySuppliers[rowNumberSupplier].postalCode, 4,disableChanges);

    // city
    html += objSuppliers.inputTableColumn('city', '', objSuppliers.arraySuppliers[rowNumberSupplier].city, 45,disableChanges);

    html += "</tr>";

    // email,phone
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'e-Mail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // email
    html += objSuppliers.inputTableColumn('email', '', objSuppliers.arraySuppliers[rowNumberSupplier].email, 50,disableChanges);

    // phone
    html += objSuppliers.inputTableColumn('phone', '', objSuppliers.arraySuppliers[rowNumberSupplier].phone, 8,disableChanges);

    html += "</tr>";

    // bankAccount, accountId
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Konto', 'Bankkontonummer');

    // Show menu
    rowNumber++;
    html += objSuppliers.verticalMenu(rowNumber);

    // accountId
    html += objAccount.showSelectedAccounts('accountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].accountId, 'Ingen konto er valgt', '',disableChanges);

    // bankAccount number
    html += objSuppliers.inputTableColumn('bankAccount', '', objSuppliers.arraySuppliers[rowNumberSupplier].bankAccount, 11,disableChanges);

    html += "</tr>";

    // amountAccountId, amount
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Konto for beløp', 'Beløp');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // amountAccountId
    html += objAccount.showSelectedAccounts('amountAccountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].amountAccountId, 'Ingen konto er valgt', '',disableChanges);

    // amount
    html += objSuppliers.inputTableColumn('amount', '', objSuppliers.arraySuppliers[rowNumberSupplier].amount, 11,disableChanges);

    html += "</tr>";

    // textAccountId, text
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showTableHeaderMenu("width:175px;", rowNumber, 'Konto for tekst', 'Tekst');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // AccountId for text
    html += objAccount.showSelectedAccounts('textAccountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].textAccountId, 'Ingen konto er valgt', '',disableChanges);

    // text for account id
    html += objSuppliers.inputTableColumn('text', '', objSuppliers.arraySuppliers[rowNumberSupplier].text, 50,disableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber, '');

    html += "</tr>";

    // Buttons
    if (!disableChanges) {

      // insert table columns in start of a row
      rowNumber++;
      html += objSuppliers.insertTableColumns('', rowNumber);

      html += objSuppliers.showButton('width:175px;', 'update', 'Oppdater');
      html += objSuppliers.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      rowNumber++;
      html += objSuppliers.insertTableColumns('', rowNumber);

      html += objSuppliers.showButton('width:175px;', 'delete', 'Slett');
      html += objSuppliers.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    rowNumber++;
    html += objSuppliers.showRestMenu(rowNumber);

    // The end of the table
    html += objSuppliers.endTable();
    document.querySelector('.result').innerHTML = html;
  }
}

// Update a supplier row
async function updateSupplierRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = objSuppliers.validateNumber('supplierId', supplierId, -1, objSuppliers.nineNine);

  //const condominiumId = Number(condominiumId);


  // validate name
  const name = document.querySelector('.name').value;
  const validName = objSuppliers.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objSuppliers.validateText(street, 0, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objSuppliers.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = objSuppliers.validateNumber('postalCode', Number(postalCode), 0, 9999);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = objSuppliers.validateText(city, 0, 45);

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  let validPhone = objSuppliers.validatePhone('phone', phone);
  if (phone === '') validPhone = true;

  // validate email
  const email = document.querySelector('.email').value.trim();
  let validEmail = objSuppliers.validateEmail('email', email);
  if (email === '') validEmail = true;

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = objSuppliers.validateBankAccount('bankAccount', bankAccount);
  if (bankAccount === '') validBankAccount = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = objSuppliers.validateNumber('accountId', accountId, 1, 999999998);

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = objSuppliers.validateNumber('amountAccountId', amountAccountId, 0, 999999998);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatKronerToOre(amount));
  const validAmount = objSuppliers.validateNumber(amount, objSuppliers.minusNineNine, objSuppliers.nineNine);

  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = objSuppliers.validateNumber('textAccountId', textAccountId, 0, 999999998);

  // validate text
  const text = document.querySelector('.text').value;
  const validText = objSuppliers.validateText(text, 0, 50);

  if (validSupplierId && validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail && validBankAccount && validAccountId && validAmountAccountId && validAmount && validTextAccountId) {

    // Check if the supplierId exist
    const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSuppliers.updateSuppliersTable(supplierId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSuppliers.loadSuppliersTable(condominiumId);
    } else {

      // Insert the supplier row in supplier table
      await objSuppliers.insertSuppliersTable(condominiumId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSuppliers.loadSuppliersTable(condominiumId);
      supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;
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
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // delete supplier row


    objSuppliers.deleteSuppliersTable(supplierId, user);
  }
}