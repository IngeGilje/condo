// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objSuppliers = new Suppliers('suppliers');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objSuppliers.menu();
objSuppliers.markSelectedMenu('Leverandør');

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

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    // Find selected supplier id
    const supplierId = objSuppliers.getSelectedSupplierId('select-supplierId');

    // Show leading text
    showLeadingText(supplierId);

    // Show all values for supplier Id
    showValues(supplierId);

    // Make events
    createEvents();
  }
}

// Make events for suppliers
function createEvents() {

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
  const supplierRowNumber = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (supplierRowNumber !== -1) {

    // delete supplier row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objSuppliers.deleteSuppliersTable(supplierId, user, lastUpdate);
  }
}

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
  const bankAccountAccountId = Number(document.querySelector('.select-suppliers-bankAccountAccountId').value);

  // amount accountId Id
  const amountAccountId = Number(document.querySelector('.select-suppliers-amountAccountId').value);

  // amount
  const amount = (document.querySelector('.input-suppliers-amount').value) ? formatKronerToOre(document.querySelector('.input-suppliers-amount').value) : '0';

   // amount accountId Id
  const textAccountId = Number(document.querySelector('.select-suppliers-textAccountId').value);

  // text
  const text = (document.querySelector('.input-suppliers-text').value);

  const lastUpdate = today.toISOString();
  const condominiumId = Number(objUserPassword.condominiumId);
  const supplierRowNumber = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  // Check if supplier exist
  if (supplierRowNumber !== -1) {

    // update supplier
    objSuppliers.updateSuppliersTable(supplierId, condominiumId, user, lastUpdate, name, street, address2, postalCode, city, email, phone, bankAccount, bankAccountAccountId, amount, amountAccountId, text, textAccountId);

  } else {

    // insert supplier
    objSuppliers.insertSuppliersTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, email, phone, bankAccount, bankAccountAccountId, amount, amountAccountId,text,textAccountId);
  }

  document.querySelector('.select-suppliers-supplierId').disabled = false;
  document.querySelector('.button-suppliers-delete').disabled = false;
  document.querySelector('.button-suppliers-insert').disabled = false;
}

// Show leading text for supplier
function showLeadingText(supplierId) {

  // Show all selected suppliers
  objSuppliers.showSelectedSuppliers('suppliers-supplierId', supplierId);

  // name
  objSuppliers.showInput('suppliers-name', '* Navn', 50, '');

  // street
  objSuppliers.showInput('suppliers-street', 'Gateadresse', 50, '');

  // Address 2
  objSuppliers.showInput('suppliers-address2', 'Adresse 2', 50, '');

  // postal code
  objSuppliers.showInput('suppliers-postalCode', 'Postnummer', 4, '');

  // City
  objSuppliers.showInput('suppliers-city', 'Poststed', 50, '');

  // email
  objSuppliers.showInput('suppliers-email', 'E-mail', 50, '');

  // phone
  objSuppliers.showInput('suppliers-phone', 'Telefonnummer', 20, '');

  // bank account
  objSuppliers.showInput('suppliers-bankAccount', 'Bankkonto', 11, '');

  // Show all accounts
  objAccounts.showSelectedAccounts('suppliers-bankAccountAccountId', 0, '', 'Ingen konti er valgt');

  // Show all accounts
  objAccounts.showSelectedAccounts('suppliers-amountAccountId', 0, '', 'Ingen konti er valgt');

  // Show amount
  objAccounts.showInput('suppliers-amount', 'Beløp', 10, '');

  // Show all accounts
  objAccounts.showSelectedAccounts('suppliers-textAccountId', 0, '', 'Ingen konti er valgt');

  // Show text
  objAccounts.showInput('suppliers-text', 'Tekst', 45, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objSuppliers.showButton('suppliers-update', 'Oppdater');

    // new button
    objSuppliers.showButton('suppliers-insert', 'Ny');

    // delete button
    objSuppliers.showButton('suppliers-delete', 'Slett');

    // cancel button
    objSuppliers.showButton('suppliers-cancel', 'Avbryt');
  }
}

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
      document.querySelector('.select-suppliers-bankAccountAccountId').value =
        objSuppliers.arraySuppliers[objUserSupplierNumber].bankAccountAccountId;

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

// Check for valid values
function validateValues() {

  // Check name
  const supplierName = document.querySelector('.input-suppliers-name').value;
  const validName = objSuppliers.validateText(supplierName, "label-suppliers-name", "Navn");

  /*
  // Validate bank account
  const bankAccount = document.querySelector('.input-suppliers-bankAccount').value;
  const validBankAccount = objSuppliers.validateBankAccount(bankAccount, "label-suppliers-bankAccount", "Bankkonto");
  */

  return (validName) ? true : false;
}

function resetValues() {

  // supplier Id
  document.querySelector('.select-suppliers-supplierId').value = 0;

  // reset name
  document.querySelector('.input-suppliers-name').value = '';

  // street
  document.querySelector('.input-suppliers-street').value = '';

  // address 2
  document.querySelector('.input-suppliers-address2').value = '';

  // reset postal code
  document.querySelector('.input-suppliers-postalCode').value = '';

  // reset city
  document.querySelector('.input-suppliers-city').value = '';

  // reset e-mail
  document.querySelector('.input-suppliers-email').value = '';

  // reset phone number
  document.querySelector('.input-suppliers-phone').value = '';

  // reset bank account
  document.querySelector('.input-suppliers-bankAccount').value = '';

  // account Id
  document.querySelector('.select-suppliers-bankAccountAccountId').value = 0;

  // amount accountId Id
  document.querySelector('.select-suppliers-amountAccountId').value = 0;

  // amount
  document.querySelector('.input-suppliers-amount').value = '';

   // text accountId Id
  document.querySelector('.select-suppliers-textAccountId').value = 0;

  // text
  document.querySelector('.input-suppliers-text').value = '';

  document.querySelector('.select-suppliers-supplierId').disabled = true;
  document.querySelector('.button-suppliers-delete').disabled = true;
  document.querySelector('.button-suppliers-insert').disabled = true;
}
