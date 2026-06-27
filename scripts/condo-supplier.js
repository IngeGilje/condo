// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objSupplier = new Supplier('supplier');

const enableChanges = (objSupplier.securityLevel > 5);

const columnWidths = [175, 175];

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

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      // Show main menu
      let html = objAccount.showHorizontalMenu(objAccount.arrayMenuMain);
      document.querySelector('.showMainMenu').innerHTML = html;

      // Show due menu
      html = objAccount.showHorizontalMenu(objAccount.arrayMenuCondominium);
      document.querySelector('.showDueMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objSupplier.condominiumId, resident, objSupplier.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objSupplier.condominiumId, fixedCost);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      // Find selected supplier id
      const supplierId = objSupplier.getSelectedSupplierId('select-supplierId');

      // Show header
      //showHeader();

      // Show filter
      showFilter(supplierId);

      // Show supplier
      showSupplier(supplierId);

      // Events
      events();
    } else {

      showMessageNew( 'Server er ikke startet.');
    }
  }
}

// Events for suppliers
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      const supplierId = Number(document.querySelector('.filterSupplierId').value);

      showSupplier(supplierId);
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

      showFilter(supplierId);
      showSupplier(supplierId);
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

      showFilter(supplierId);
      showSupplier(supplierId);
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

  // text accountId Id
  document.querySelector('.textAccountId').value = 0;

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
  let html = objSupplier.initializeTable(columnWidths);

  // start table body
  html += objSupplier.startTableBody();

  // show main header
  html += objSupplier.showTableHeaderLogOut('Leverandør');
  html += "</tr>";

  // end table body
  html += objSupplier.endTableBody();

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(supplierId) {

  // Start frame
  let html = startFrame();

  html += startRow();

  html += emptyRow();

  // Show suppliers
  html += objSupplier.showSelectedSuppliersNew('Leverandør', 'filterSupplierId', '', supplierId, '', '', true);

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show supplier
function showSupplier(supplierId) {

  // row Number Supplier
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  let html = emptyRow();
  html += startRow();

  // name
  const name = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].name.trim();
  html += showTextNew('Navn', 'name', name, enableChanges, "Leverandørnavn");
  html += "</div>";
  // street,address2
  html += startRow();

  // street
  const street = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].street;
  html += showTextNew('Gatenavn', 'street', street, enableChanges);

  // address2
  const address2 = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].address2;
  html += showTextNew('Adresse2', 'address2', address2, enableChanges);
  html += "</div>";

  // postalCode, city
  html += startRow();

  let postalCode = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].postalCode;
  if (postalCode === '0') postalCode = "";
  html += showTextNew('Postnummer', 'postalCode', postalCode, enableChanges);

  // city
  const city = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].city;
  html += showTextNew('Poststed', 'city', city, enableChanges);
  html += "</div>";

  // email,phone
  html += startRow();

  // email
  let email = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].email;
  html += showTextNew('E-mail', 'email', email, enableChanges);

  // phone
  const phone = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].phone;
  html += showTextNew('Telefonnummer', 'phone', phone, enableChanges);
  html += "</div>";

  //  accountId, bankAccount
  html += startRow();

  // accountId
  const accountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].accountId;
  html += objAccount.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg konto', '', enableChanges);

  // bank Account number
  const bankAccount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].bankAccount;
  html += showTextNew('Bankkonto', 'bankAccount', bankAccount, enableChanges);
  html += "</div>";

  // amountAccountId, amount
  html += startRow();

  // amountAccountId
  const amountAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].amountAccountId;
  html += objAccount.showSelectedAccountsNew('Konto for beløp', 'amountAccountId', '', amountAccountId, 'Velg konto', '', enableChanges);

  // amount
  let amount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].amount;
  if (amount === '0') amount = "";
  html += showTextNew('Beløp', 'amount', amount, enableChanges);
  html += "</div>";

  // textAccountId, text
  html += startRow();

  // AccountId for text
  const textAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].textAccountId;
  html += objAccount.showSelectedAccountsNew('Konto for tekst', 'textAccountId', '', textAccountId, 'Velg konto', '', enableChanges);

  // text for account id
  const text = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].text;
  html += showTextNew('Tekst', 'accountText', text, enableChanges);
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startRow();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startRow();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showSupplier').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;

  /*
  // start table

  html = objSupplier.initializeTable(columnWidths);

  // Check if supplier row exist
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  // Header for value
  html += objSupplier.showTableHeaderMenu('', 'center', 'Navn', '');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // name
  name = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].name;

  html += objSupplier.editTableCell('name', name, 45, enableChanges, 1);
  html += "<td></td></tr>";

  // street, address2
  html += objSupplier.showTableHeaderMenu('', 'center', 'Gate', 'Adresse 2');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // street
  const street = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].street;
  html += objSupplier.editTableCell('street', street, 45, enableChanges);

  // address2
  const address2 = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].address2;
  html += objSupplier.editTableCell('address2', address2, 45, enableChanges);
  html += "</tr>";

  // postalCode, city
  html += objSupplier.showTableHeaderMenu('', 'center', 'Postnummer', 'Poststed');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // postalCode
  const postalCode = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].postalCode;

  html += objSupplier.editTableCell('postalCode', postalCode, 4, enableChanges);

  // city
  const city = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].city;
  html += objSupplier.editTableCell('city', city, 45, enableChanges);
  html += "</tr>";

  // email,phone
  html += objSupplier.showTableHeaderMenu('', 'center', 'E-mail', 'Telefonnummer');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // email
  const email = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].email;
  html += objSupplier.editTableCell('email', email, 45, enableChanges);

  // phone
  const phone = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].phone;
  html += objSupplier.editTableCell('phone', phone, 8, enableChanges);
  html += "</tr>";

  // bankAccount, accountId
  html += objSupplier.showTableHeaderMenu('', 'center', 'Konto', 'Bankkontonummer');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // accountId
  const accountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].accountId;
  html += objAccount.showSelectedAccounts('accountId', '', accountId, 'Velg konto', '', enableChanges);

  // bankAccount number
  const bankAccount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].bankAccount;
  html += objSupplier.editTableCell('bankAccount', bankAccount, 11, enableChanges);
  html += "</tr>";

  // amountAccountId, amount
  html += objSupplier.showTableHeaderMenu('', 'center', 'Konto for beløp', 'Beløp');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // amountAccountId
  const amountAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].amountAccountId;
  html += objAccount.showSelectedAccounts('amountAccountId', '', amountAccountId, 'Velg konto', '', enableChanges);

  // amount
  const amount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].amount;
  html += objSupplier.editTableCell('amount', amount, 11, enableChanges);
  html += "</tr>";

  // textAccountId, text
  html += objSupplier.showTableHeaderMenu('', 'center', 'Konto for tekst', 'Tekst');

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('');

  // AccountId for text
  const textAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].textAccountId;
  html += objAccount.showSelectedAccounts('textAccountId', '', textAccountId, 'Velg konto', '', enableChanges);

  // text for account id
  const text = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].text;
  html += objSupplier.editTableCell('text', text, 50, enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objSupplier.insertTableRow('', '', '');
  html += "</tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    html += objSupplier.insertTableRow('');

    html += objSupplier.showButton('update', 'Oppdater');
    html += objSupplier.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    html += objSupplier.insertTableRow('');

    html += objSupplier.showButton('delete', 'Slett');
    html += objSupplier.showButton('insert', 'Ny');
    html += "</tr>";
  }

  // The end of the table
  html += objSupplier.endTable();
  document.querySelector('.showSupplier').innerHTML = html;
  */


}

// Update a supplier row
async function updateSuppliersRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = objSupplier.validateInterval('supplierId', columnWidths, '', 'Ugyldig leverandør', true, supplierId, -1, objSupplier.nineNine);

  const name = document.querySelector('.name').value;
  const validName = objSupplier.validateText('name', columnWidths, '', 'Ugyldig navn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objSupplier.validateText('street', columnWidths, '', 'Ugyldig adresse', true, street, 0, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objSupplier.validateText('address2', columnWidths, '', 'Ugyldig adresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = objSupplier.validateInterval('postalCode', columnWidths, '', 'Ugyldig poststed', true, Number(postalCode), 0, objSupplier.nineNine);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = objSupplier.validateText('city', columnWidths, '', 'Ugyldig poststed', true, city, 0, 45, '',);

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
  const validAccountId = objSupplier.validateInterval('accountId', columnWidths, '', 'Ugyldig konto', true, accountId, 1, objSupplier.nineNine);

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = objSupplier.validateBankAccount('bankAccount', columnWidths, true, bankAccount, '', 'Ugyldig bankkontonummer');

  if (bankAccount === '') validBankAccount = true;

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = objSupplier.validateInterval('amountAccountId', columnWidths, '', 'Ugyldig konto for beløp', true, amountAccountId, 0, objSupplier.nineNine);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatKronerToOre(amount));
  const validAmount = objSupplier.validateInterval('amount', columnWidths, '', 'Ugyldig beløp', true, amount, objSupplier.minusNineNine, objSupplier.nineNine);


  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = objSupplier.validateInterval('textAccountId', columnWidths, '', 'Ugyldig konto for tekst', true, textAccountId, 0, objSupplier.nineNine);

  // validate text
  const text = document.querySelector('.accountText').value;
  const validText = objSupplier.validateText('accountText', columnWidths, '', 'Ugyldig tekst', true, text, 0, 45);

  if (validSupplierId && validName && validStreet && validAddress2
    && validPostalCode && validCity && validBankAccount && validAccountId
    && validAmountAccountId && validAmount && validTextAccountId
    && validEmail && validText) {

    document.querySelector('.showMessage').style.display = "none";

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
    }

    // Show filter

    showFilter(supplierId);
    showSupplier(supplierId);

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

// Show menu
function showMenu() {

  // Show main menu
  let html = startFrame();

  html += startRow();

  html += objSupplier.showHorizontalMenu(objSupplier.arrayMenuMain);

  html += "</div>";
  html += "</div>";

  // Show due menu
  html += startFrame();

  html += startRow();

  html += objSupplier.showHorizontalMenu(objSupplier.arrayMenuDue);

  html += "</div>";

  // end filter frame
  html += "</div>";

  document.querySelector('.showDueMenu').innerHTML = html;

  // Change frame title
  setFrameTitle("Forfalls Meny");
}
