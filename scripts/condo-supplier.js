// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objSuppliers = new Supplier('supplier');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    // Find selected supplier id
    const supplierId = objSuppliers.getSelectedSupplierId('select-supplierId');

    // Show header
    showHeader();

    // Show filter
    showFilter(supplierId);

    // Show supplier
    let menuNumber = 0;
    menuNumber = showResult(supplierId, menuNumber);

    // Events
    events();
  }
}

// Events for suppliers
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      filterSync();

      async function filterSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        await objSuppliers.loadSuppliersTable(condominiumId);

        const supplierId = Number(document.querySelector('.filterSupplierId').value);

        let menuNumber = 0;
        menuNumber = showResult(supplierId, menuNumber);
      }
    };
  });

  // update/insert a suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateSupplierRowSync();

      // Update a suppliers row
      async function updateSupplierRowSync() {

        const supplierId = document.querySelector('.filterSupplierId').value;
        updateSupplierRow(supplierId);
      }
    };
  });

  // Delete suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      deleteSupplierSync();

      async function deleteSupplierSync() {

        await deleteSupplierRow();

        const condominiumId = Number(objUserPassword.condominiumId);
        await objSuppliers.loadSuppliersTable(condominiumId);

        // Show filter
        const supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;
        showFilter(supplierId);

        let menuNumber = 0;
        menuNumber = showResult(supplierId, menuNumber);
      };
    };
  });

  // Insert a supplier row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload suppliers table
      reloadSupplierSync();
      async function reloadSupplierSync() {

        await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

        let SupplierId = Number(document.querySelector('.filterSupplierId').value);
        if (SupplierId === 0) SupplierId = objSuppliers.arraySuppliers.at(-1).SupplierId;

        // Show filter
        showFilter(SupplierId);

        let menuNumber = 0;
        menuNumber = showResult(supplierId, menuNumber);
      };
    };
  });
}

/*
// Events for suppliers
function events() {

  // Select Supplier
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-suppliers-supplierId')) {

      let supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);
      supplierId = (supplierId !== 0) ? supplierId : objSuppliers.arraySuppliers.at(-1).supplierId;
      if (supplierId) {
        showValues(supplierId);
      }
    }
  });

  // Update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-suppliers-update')) {

      // Update suppliers and reload suppliers
      updateSupplierSync();

      // Update supplier and reload suppliers
      async function updateSupplierSync() {

        // Load supplier
        let supplierId;
        if (document.querySelector('.select-suppliers-supplierId').value === '') {

          // Insert new row into supplier table
          supplierId = 0;
        } else {

          // Update existing row in suppliers table
          supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);
        }

        if (validateValues()) {

          await updateSupplier(supplierId);
          await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

          // Select last suppliers if supplierId is 0
          if (supplierId === 0) supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;

          // Show leading text
          showLeadingText(supplierId);

          // Show all values for supplier
          showValues(supplierId);
        }
      }
    }
  });

  // New supplier
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-suppliers-insert')) {

      resetValues();
    }
  });

  // Delete supplier
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-suppliers-delete')) {

      // Delete supplier and reload supplier
      deleteSupplierSync();

      // Delete supplier
      async function deleteSupplierSync() {

        await deleteSupplier();
        await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

        // Show leading text
        const supplierId = objSuppliers.arraySuppliers.at(-1).supplierId;
        showLeadingText(supplierId);

        // Show all values for supplier
        showValues(supplierId);
      };
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-suppliers-cancel')) {

      // Reload supplier
      reloadSupplierSync();
      async function reloadSupplierSync() {

        let condominiumId = Number(objUserPassword.condominiumId);
        await objSuppliers.loadSuppliersTable(condominiumId);

        // Show leading text for maintenance
        // Select first supplier Id
        if (objSuppliers.arraySuppliers.length > 0) {
          supplierId = objSuppliers.arraySuppliers[0].supplierId;
          showLeadingText(supplierId);
        }

        // Show all selected supplier
        objSuppliers.showSelectedSuppliers('suppliers-supplierId', supplierId);

        // Show supplier Id
        showValues(supplierId);
      }
    }
  });
}

// Delete supplier
async function deleteSupplier() {

  // Check for supplier Id
  const supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);

  // Check if supplier id exist
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // delete supplier row
    const user = objUserPassword.email;

    objSuppliers.deleteSuppliersTable(supplierId, user);
  }
}
*/
/*
async function updateSupplier(supplierId) {

  // user
  const user = objUserPassword.email;

  // supplier Id
  supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);

  // name
  const name = document.querySelector('.input-suppliers-name').value;

  // street
  const street = document.querySelector('.input-suppliers-street').value;

  // address 2
  const address2 = document.querySelector('.input-suppliers-address2').value;

  // postal code
  const postalCode = document.querySelector('.input-suppliers-postalCode').value;

  // city
  const city = document.querySelector('.input-suppliers-city').value;

  // email
  const email = document.querySelector('.input-suppliers-email').value;

  // phone
  const phone = document.querySelector('.input-suppliers-phone').value;

  // bank account
  const bankAccount = document.querySelector('.input-suppliers-bankAccount').value;

  // account Id
  const bankAccountId = Number(document.querySelector('.select-suppliers-bankAccountId').value);

  // amount accountId Id
  const amountAccountId = Number(document.querySelector('.select-suppliers-amountAccountId').value);

  // amount
  const amount = (document.querySelector('.input-suppliers-amount').value) ? formatKronerToOre(document.querySelector('.input-suppliers-amount').value) : '0';

  // amount accountId Id
  const textAccountId = Number(document.querySelector('.select-suppliers-textAccountId').value);

  // text
  const text = (document.querySelector('.input-suppliers-text').value);


  const condominiumId = Number(objUserPassword.condominiumId);
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  // Check if supplier exist
  if (rowNumberSupplier !== -1) {

    // update supplier
    objSuppliers.updateSuppliersTable(supplierId, user, name, street, address2, postalCode, city, email, phone, bankAccount, bankAccountId, amount, amountAccountId, text, textAccountId);

  } else {

    // insert supplier
    objSuppliers.insertSuppliersTable(condominiumId, user, name, street, address2, postalCode, city, email, phone, bankAccount, bankAccountId, amount, amountAccountId, text, textAccountId);
  }

  document.querySelector('.select-suppliers-supplierId').disabled = false;
  document.querySelector('.button-suppliers-delete').disabled = false;
  document.querySelector('.button-suppliers-insert').disabled = false;
}
*/

/*
// Show values for supplier
function showValues(supplierId) {

  // Check for valid supplier Id
  if (supplierId >= 0) {

    // find object number for selected supplier Id 
    const objUserSupplierNumber = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (objUserSupplierNumber !== -1) {

      // Supplier Id
      document.querySelector('.select-suppliers-supplierId').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].supplierId;

      // name
      document.querySelector('.input-suppliers-name').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].name;

      // street
      document.querySelector('.input-suppliers-street').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].street;

      // address 2
      document.querySelector('.input-suppliers-address2').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].address2;

      // Postal code
      document.querySelector('.input-suppliers-postalCode').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].postalCode;

      // city
      document.querySelector('.input-suppliers-city').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].city;

      // email
      document.querySelector('.input-suppliers-email').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].email;

      // phone
      document.querySelector('.input-suppliers-phone').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].phone;

      // bankAccount
      document.querySelector('.input-suppliers-bankAccount').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].bankAccount;

      // bank account account Id
      document.querySelector('.select-suppliers-bankAccountId').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].bankAccountId;

      // amount
      document.querySelector('.input-suppliers-amount').value =
        (objSuppliers.arraySuppliers[objUserSupplierNumber].amount)
          ? formatOreToKroner(objSuppliers.arraySuppliers[objUserSupplierNumber].amount) : '';

      // amount accountId Id
      document.querySelector('.select-suppliers-amountAccountId').value =
        (objSuppliers.arraySuppliers[objUserSupplierNumber].amountAccountId)
          ? objSuppliers.arraySuppliers[objUserSupplierNumber].amountAccountId : 0;

      // Text
      document.querySelector('.input-suppliers-text').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].text;

      // text accountId Id
      document.querySelector('.select-suppliers-textAccountId').value =
        (objSuppliers.arraySuppliers[objUserSupplierNumber].textAccountId)
          ? objSuppliers.arraySuppliers[objUserSupplierNumber].textAccountId : 0;
    }
  }
}
*/

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

// Show header
function showHeader() {

  // Start table
  let html = objSuppliers.startTable('width:750px;');

  // show main header
  html += objSuppliers.showTableHeader('width:750px;', 'Mottaker');

  // The end of the table
  html += objSuppliers.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(supplierId) {

  // Start table
  html = objSuppliers.startTable('width:750px;');

  // Header filter
  html += objSuppliers.showTableHeader('width:250px;', '', 'Velg mottaker', '');

  // start table body
  html += objSuppliers.startTableBody();

  // insert table columns in start of a row
  html += objSuppliers.insertTableColumns('', 0, '');

  // supplier
  html += objSuppliers.showSelectedSuppliersNew('filterSupplierId', 'width:100px;', supplierId, '', '')

  html += "</tr>";

  // insert table columns in start of a row
  html += objSuppliers.insertTableColumns('', 0, '');

  // end table body
  html += objSuppliers.endTableBody();

  // The end of the table
  html += objSuppliers.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(supplierId, rowNumber) {

  // start table
  let html = objSuppliers.startTable('width:750px;');

  // table header
  html += objSuppliers.showTableHeader('width:250px;', '', '', '');

  // Check if supplier row exist
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // Header for value including menu
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Navn');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // name
    html += objSuppliers.inputTableColumn('name', objSuppliers.arraySuppliers[rowNumberSupplier].name, 45);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Gate', 'Adresse 2');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // street
    html += objSuppliers.inputTableColumn('street', objSuppliers.arraySuppliers[rowNumberSupplier].street, 45);

    // address2
    html += objSuppliers.inputTableColumn('address2', objSuppliers.arraySuppliers[rowNumberSupplier].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // postalCode
    html += objSuppliers.inputTableColumn('postalCode', objSuppliers.arraySuppliers[rowNumberSupplier].postalCode, 4);

    // city
    html += objSuppliers.inputTableColumn('city', objSuppliers.arraySuppliers[rowNumberSupplier].city, 45);

    html += "</tr>";

    // email,phone
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'e-Mail', 'Telefonnummer');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // email
    html += objSuppliers.inputTableColumn('email', objSuppliers.arraySuppliers[rowNumberSupplier].email, 50);

    // phone
    html += objSuppliers.inputTableColumn('phone', objSuppliers.arraySuppliers[rowNumberSupplier].phone, 8);

    html += "</tr>";

    // bankAccount, accountId
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Bankkonto', 'Bankkontonummer');

    // Show menu
    rowNumber++;
    html += objSuppliers.verticalMenu(rowNumber);

    // accountId
    html += objAccounts.showSelectedAccountsNew('accountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].accountId, 'Ingen konto er valgt', '');

    // bankAccount
    html += objSuppliers.inputTableColumn('bankAccount', objSuppliers.arraySuppliers[rowNumberSupplier].bankAccount, 11);

    html += "</tr>";

    // amountAccountId, amount
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Konto for beløp', 'Beløp');

     // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // amountAccountId
    html += objAccounts.showSelectedAccountsNew('amountAccountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].amountAccountId, 'Ingen konto er valgt', '');

    // amount
    html += objSuppliers.inputTableColumn('amount', objSuppliers.arraySuppliers[rowNumberSupplier].amount, 11);

    html += "</tr>";

    // textAccountId, text
    html += "<tr>";
    rowNumber++;
    html += objSuppliers.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Konto for tekst', 'Tekst');

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    // textAccountId
    html += objAccounts.showSelectedAccountsNew('textAccountId', '', objSuppliers.arraySuppliers[rowNumberSupplier].textAccountId, 'Ingen konto er valgt', '');

    // text
    html += objSuppliers.inputTableColumn('text', objSuppliers.arraySuppliers[rowNumberSupplier].text, 50);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber, '');

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    html += objSuppliers.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objSuppliers.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber, '');

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objSuppliers.insertTableColumns('', rowNumber);

    html += objSuppliers.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objSuppliers.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

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

  if (supplierId === '') supplierId = -1
  supplierId = Number(supplierId);
  const validSupplierId = validateNumberNew(supplierId, -1, 999999999);

  const condominiumId = Number(objUserPassword.condominiumId);

  const user = objUserPassword.email;

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
  const validPostalCode = objSuppliers.validateIntervalNew(Number(postalCode), 0, 9999);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = objSuppliers.validateText(city, 0, 45);

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  let validPhone = objSuppliers.validatePhoneNew(phone);
  if (phone === '') validPhone = true;

  // validate email
  const email = document.querySelector('.email').value.trim();
  let validEmail = objSuppliers.validateEmailNew(email);
  if (email === '') validEmail = true;

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = objSuppliers.validateBankAccountNew(bankAccount);
  if (bankAccount === '') validBankAccount = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = objSuppliers.validateNumberNew(accountId, 1, 999999998);

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = objSuppliers.validateNumberNew(amountAccountId, 0, 999999998);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatKronerToOre(amount));
  const validAmount = objSuppliers.validateNumberNew(amount, -999999999, 999999999);

  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = objSuppliers.validateNumberNew(textAccountId, 0, 999999998);

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
    showFilter(supplierId);

    let menuNumber = 0;
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
    const user = objUserPassword.email;

    objSuppliers.deleteSuppliersTable(supplierId, user);
  }
}