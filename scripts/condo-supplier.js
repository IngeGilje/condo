// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objSupplier = new Supplier('supplier');

const enableChanges = (objSupplier.securityLevel > 5);

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objSupplier.condominiumId === 0) || (objSupplier.user === null)) {

  // LogIn is not valid
  const URL = (objUser.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Show horizonal menu
  let html = objSupplier.showHorizontalMenu();
  document.querySelector('.horizontalMenu').innerHTML = html;

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(objSupplier.condominiumId, resident, objSupplier.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objSupplier.condominiumId, fixedCost);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      // Find selected supplier id
      const supplierId = objSupplier.getSelectedSupplierId('select-supplierId');

      // Show header
      showHeader();

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, supplierId);

      // Show supplier
      menuNumber = showSupplier(menuNumber, supplierId);

      // Events
      events();
    } else {

      objSupplier.showMessage(objSupplier, '', 'Server er ikke startet.');
    }
  }
}

// Events for suppliers
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      //const condominiumId = Number(condominiumId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      const supplierId = Number(document.querySelector('.filterSupplierId').value);

      showSupplier(2, supplierId);
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
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      // Show filter
      const supplierId = (objSupplier.arraySuppliers.length > 0)
        ? objSupplier.arraySuppliers.at(-1).supplierId
        : 0;
      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, supplierId);
      menuNumber = showSupplier(menuNumber, supplierId);
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
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      let supplierId = Number(document.querySelector('.filterSupplierId').value);
      if (supplierId === 0) supplierId = objSupplier.arraySuppliers.at(-1).supplierId;

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber, supplierId);
      menuNumber = showSupplier(menuNumber, supplierId);
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

  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objSupplier.startTable(tableWidth);

  // start table body
  html += objSupplier.startTableBody();

  // show main header
  html += objSupplier.showTableHeaderLogOut('width:175px;', '', '', 'Leverandør', '');
  html += "</tr>";

  // end table body
  html += objSupplier.endTableBody();

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, supplierId) {

  // Start table
  let html = objSupplier.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objSupplier.showTableHeaderMenu('width:175px;', menuNumber, objSupplier.accountMenu, 'Velg leverandør', '');

  // start table body
  html += objSupplier.startTableBody();

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // supplier
  html += objSupplier.showSelectedSuppliers('filterSupplierId', 'width:175px;', supplierId, '', '', true)

  html += "</tr>";

  // end table body
  html += objSupplier.endTableBody();

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show result
function showSupplier(menuNumber, supplierId) {

  // start table
  let html = objSupplier.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objSupplier.showTableHeaderMenu('width:175px;', menuNumber, objSupplier.accountMenu, '', '');

  // Check if supplier row exist
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  //if (rowNumberSupplier !== -1) {

  // Header for value including menu
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Navn');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // name
  const name = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].name;

  html += objSupplier.inputTableColumn('name', '', name, 45, enableChanges);

  html += "</tr>";

  // street, address2
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Gate', 'Adresse 2');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // street
  const street = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].street;
  html += objSupplier.inputTableColumn('street', '', street, 45, enableChanges);

  // address2
  const address2 = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].address2;
  html += objSupplier.inputTableColumn('address2', '', address2, 45, enableChanges);

  html += "</tr>";

  // postalCode, city
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Postnummer', 'Poststed');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // postalCode
  const postalCode = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].postalCode;

  html += objSupplier.inputTableColumn('postalCode', '', postalCode, 4, enableChanges);

  // city
  const city = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].city;
  html += objSupplier.inputTableColumn('city', '', city, 45, enableChanges);

  html += "</tr>";

  // email,phone
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'e-Mail', 'Telefonnummer');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // email
  const email = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].email;
  html += objSupplier.inputTableColumn('email', '', email, 50, enableChanges);

  // phone
  const phone = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].phone;
  html += objSupplier.inputTableColumn('phone', '', phone, 8, enableChanges);

  html += "</tr>";

  // bankAccount, accountId
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Konto', 'Bankkontonummer');

  // Show menu
  menuNumber++;
  html += objSupplier.showAccountMenu(menuNumber);

  // accountId
  const accountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].accountId;
  html += objAccount.showSelectedAccounts('accountId', '', accountId, 'Ingen mottaker er valgt', '', enableChanges);

  // bankAccount number
  const bankAccount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].bankAccount;
  html += objSupplier.inputTableColumn('bankAccount', '', bankAccount, 11, enableChanges);

  html += "</tr>";

  // amountAccountId, amount
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Konto for beløp', 'Beløp');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // amountAccountId
  const amountAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].amountAccountId;
  html += objAccount.showSelectedAccounts('amountAccountId', '', amountAccountId, 'Ingen konto er valgt', '', enableChanges);

  // amount
  const amount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].amount;
  html += objSupplier.inputTableColumn('amount', '', amount, 11, enableChanges);

  html += "</tr>";

  // textAccountId, text
  html += "<tr>";
  menuNumber++;
  html += objSupplier.showTableHeaderMenu("width:175px;", menuNumber, objSupplier.accountMenu, 'Konto for tekst', 'Tekst');

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

  // AccountId for text
  const textAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].textAccountId;
  html += objAccount.showSelectedAccounts('textAccountId', '', textAccountId, 'Ingen konto er valgt', '', enableChanges);

  // text for account id
  const text = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].text;
  html += objSupplier.inputTableColumn('text', '', text, 50, enableChanges);

  html += "</tr>";

  // insert a table row
  menuNumber++;
  html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu, '');

  html += "</tr>";

  // Show buttons
  if (enableChanges) {

    // insert a table row
    menuNumber++;
    html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

    html += objSupplier.showButton('width:175px;', 'update', 'Oppdater');
    html += objSupplier.showButton('width:175px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert a table row
    menuNumber++;
    html += objSupplier.insertTableRow('', menuNumber, objSupplier.accountMenu);

    html += objSupplier.showButton('width:175px;', 'delete', 'Slett');
    html += objSupplier.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objSupplier.showRestMenu(menuNumber, objSupplier.accountMenu);

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.result').innerHTML = html;
  if (enableChanges) document.querySelector('.cancel').disabled = true;
}

// Update a supplier row
async function updateSuppliersRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = objSupplier.validateNumber('supplierId', supplierId, -1, objSupplier.nineNine, objSupplier, '', 'Ugyldig leverandør');

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objSupplier.validateText('name', name, 3, 45, objSupplier, '', 'Ugyldig navn');

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objSupplier.validateText('street', street, 0, 45, objSupplier, '', 'Ugyldig adresse');

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objSupplier.validateText('address2', address2, 0, 45, objSupplier, '', 'Ugyldig adresse');

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = objSupplier.validateNumber('postalCode', Number(postalCode), 0, objSupplier.nineNine, objSupplier, '', 'Ugyldig poststed');

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = objSupplier.validateText('city', city, 0, 45, objSupplier, '', 'Ugyldig poststed');

  // validate email
  const email = document.querySelector('.email').value.trim();
  const validEmail = (email === '')
    ? true
    : objSupplier.validateEmail('email', email, objSupplier, '', 'Ugyldig mail');

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  if (phone === '') validPhone = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = objSupplier.validateNumber('accountId', accountId, 1, objSupplier.nineNine, objSupplier, '', 'Ugyldig konto');

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = objSupplier.validateBankAccount('bankAccount', bankAccount, objSupplier, '', 'Ugyldig bankkontonummer');
  if (bankAccount === '') validBankAccount = true;

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = objSupplier.validateNumber('amountAccountId', amountAccountId, 0, objSupplier.nineNine, objSupplier, '', 'Ugyldig konto for beløp');

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatKronerToOre(amount));
  const validAmount = objSupplier.validateNumber('amount', amount, objSupplier.minusNineNine, objSupplier.nineNine, objSupplier, '', 'Ugyldig beløp');

  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = objSupplier.validateNumber('textAccountId', textAccountId, 0, objSupplier.nineNine, objSupplier, '', 'Ugyldig konto for tekst');

  // validate text
  const text = document.querySelector('.text').value;
  const validText = objSupplier.validateText('text', text, 0, 45, objSupplier, '', 'Ugyldig tekst');

  if (validSupplierId && validName && validStreet && validAddress2
    && validPostalCode && validCity && validBankAccount && validAccountId
    && validAmountAccountId && validAmount && validTextAccountId
    && validEmail && validText) {

    document.querySelector('.message').style.display = "none";

    // Check if the supplierId exist
    const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSupplier.updateSuppliersTable(supplierId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);
    } else {

      // Insert the supplier row in supplier table
      await objSupplier.insertSuppliersTable(objSupplier.condominiumId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);
      supplierId = objSupplier.arraySuppliers.at(-1).supplierId;
      //document.querySelector('.filterSupplierId').value = supplierId;
    }

    // Show filter
    let menuNumber = 0;
    menuNumber = showFilter(menuNumber, supplierId);
    menuNumber = showSupplier(menuNumber, supplierId);

    if (enableChanges) {
      document.querySelector('.filterSupplierId').disabled = false;
      document.querySelector('.delete').disabled = false;
      document.querySelector('.insert').disabled = false;
      document.querySelector('.cancel').disabled = true;
    }
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
    await objSupplier.deleteSuppliersTable(supplierId, objSupplier.user);
  }
}