// Maintenance of users

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
  /*
  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM users
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM accounts
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get suppliers
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY supplierId;
      `;

    updateMySql(SQLquery, 'supplier', 'SELECT');
    supplierArrayCreated =
      false;
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;


    //Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'user':

          // user table
          console.log('userTable');

          userArray = objInfo.tableArray;
          userArrayCreated =
            true;
          break;

        case 'account':

          // user table
          console.log('accountTable');

          accountsArray = objInfo.tableArray;
          accountArrayCreated =
            true;
          break;

        case 'supplier':

          // supplier table
          console.log('supplierTable');

          // array including objects with supplier information
          objSuppliers.suppliersArray = objInfo.tableArray;
          supplierArrayCreated =
            true;

          if (userArrayCreated
            && accountArrayCreated
            && supplierArrayCreated) {

            // Find selected supplier id
            const supplierId =
              objSuppliers.getSelectedSupplierId('select-suppliers-supplierId');

            // Show leading text
            showLeadingText(supplierId);

            // Show all values for supplier
            showValues(supplierId);

            // Make events
            isEventsCreated = 
            (isEventsCreated) ? true : createEvents();
          }
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'supplier':

          // Sends a request to the server to get suppliers one more time
          SQLquery =
            `
              SELECT * FROM supplier
              WHERE condominiumId = ${objUserPassword.condominiumId}
                AND deleted <> 'Y'
              ORDER BY supplierId;
            `;
          updateMySql(SQLquery, 'supplier', 'SELECT');
          supplierArrayCreated =
            false;
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }
  */
}

// Make events for suppliers
function createEvents() {

  // Select Supplier
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-suppliers-supplierId')) {

      let supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);
      supplierId = (supplierId !== 0) ? supplierId : objSuppliers.suppliersArray.at(-1).supplierId;
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

        await updateSupplier(supplierId);

        await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

        // Select last suppliers if supplierId is 0
        if (supplierId === 0) supplierId = objSuppliers.suppliersArray.at(-1).supplierId;

        // Show leading text
        showLeadingText(supplierId);

        // Show all values for supplier
        showValues(supplierId);
      }
    }
  });
  /*
  // supplier id
  let supplierId =
    Number(document.querySelector('.select-suppliers-supplierId').value);
  updateSupplier(supplierId);

  updateSupplierSync();

  // Main entry point
  async function updateSupplierSync() {

    // Load supplier

    await updateSupplier();

    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    // Show leading text
    showLeadingText(supplierId);

    // Show all values for supplier
    let supplierId;
    if (document.querySelector('.select-suppliers-supplierId')) {
      supplierId = objSuppliers.getSelectedSupplierId('select-suppliers-supplierId');
    } else {
      supplierId = objSuppliers.suppliersArray.at(-1).supplierId;
    }

    showValues(supplierId);
  }

}
  });
  */

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

        // Load supplier
        await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

        // Show leading text
        const supplierId = objSuppliers.suppliersArray.at(-1).supplierId;
        showLeadingText(supplierId);

        // Show all values for supplier
        showValues(supplierId);
      };
    };
  });
}

// Delete supplier
async function deleteSupplier() {

  // Check for supplier Id
  const supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);

  // Check if supplier id exist
  const objSupplierRowNumber = objSuppliers.suppliersArray.findIndex(supplier => supplier.supplierId === supplierId);
  if (objSupplierRowNumber !== -1) {

    // delete supplier row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objSuppliers.deleteSuppliersTable(supplierId, user, lastUpdate);
  }
}
/*
const supplierId =
  Number(document.querySelector('.select-suppliers-supplierId').value);
deleteSupplierRow(supplierId);

// Sends a request to the server to get all suppliers
const SQLquery =
  `
    SELECT * FROM supplier
    WHERE condominiumId = ${objUserPassword.condominiumId}
      AND deleted <> 'Y'
    ORDER BY supplierId;
  `;
updateMySql(SQLquery, 'supplier', 'SELECT');
supplierArrayCreated =
  false;
}
});

// Cancel
document.addEventListener('click', (event) => {
if (event.target.classList.contains('button-suppliers-cancel')) {

// Sends a request to the server to get all user
const SQLquery =
  `
    SELECT * FROM supplier
    WHERE condominiumId = ${objUserPassword.condominiumId}
      AND deleted <> 'Y'
    ORDER BY supplierId;
  `;
updateMySql(SQLquery, 'supplier', 'SELECT');
supplierArrayCreated =
  false;
}
});
return true;
}
*/
async function updateSupplier(supplierId) {

  if (validateValues(supplierId)) {

    // user
    const user = objUserPassword.email;

    // supplier Id
    const supplierId = Number(document.querySelector('.select-suppliers-supplierId').value);

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
    const accountId = Number(document.querySelector('.select-suppliers-accountId').value);

    // account2 Id
    const accountAmountId = Number(document.querySelector('.select-suppliers-accountAmountId').value);

    // amount
    const amount = (document.querySelector('.input-suppliers-amount').value) ? formatKronerToOre(document.querySelector('.input-suppliers-amount').value) : '0';

    const lastUpdate = today.toISOString();

    const condominiumId = objUserPassword.condominiumId;

    const objSupplierRowNumber = objSuppliers.suppliersArray.findIndex(supplier => supplier.supplierId === supplierId);

    // Check if supplier exist
    if (objSupplierRowNumber !== -1) {

      // update supplier
      objSuppliers.updateSuppliersTable(supplierId, condominiumId, user, lastUpdate, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, accountAmountId, amount);

    } else {

      // insert supplier
      objSuppliers.insertSuppliersTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, accountAmountId, amount);
    }

    document.querySelector('.select-suppliers-supplierId').disabled = false;
    document.querySelector('.button-suppliers-delete').disabled = false;
    document.querySelector('.button-suppliers-insert').disabled = false;
  }
}

/*
function deleteSupplierRow(supplierId) {

  let SQLquery = "";

  if (supplierId >= 0) {

    // Check if supplier exist
    const objUserSupplierNumber =
      objSuppliers.suppliersArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objUserSupplierNumber !== -1) {

      // current date
      const lastUpdate =
        today.toISOString();

      // Delete table
      SQLquery =
        `
          UPDATE supplier
            SET 
              deleted = 'Y',
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}'
          WHERE supplierId = ${supplierId};
      `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'supplier', 'SELECT');
      supplierArrayCreated =
        false;
    }

    // Get supplier
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY supplierId;
      `;
    updateMySql(SQLquery, 'supplier', 'SELECT');
    supplierArrayCreated =
      false;

    resetValues();
  }
}
*/

// Show leading text for supplier
function showLeadingText(supplierId) {

  // Show all suppliers
  objSuppliers.showAllSuppliers('suppliers-supplierId', supplierId);

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
  objSuppliers.showInput('suppliers-bankAccount', '* Bankkonto', 11, '');

  // Show all accounts
  objAccounts.showAllAccounts('suppliers-accountId', 0, '', 'Ingen konti er valgt');

  // Show all accounts
  objAccounts.showAllAccounts('suppliers-accountAmountId', 0, '', 'Ingen konti er valgt');

  // Show amount
  objAccounts.showInput('suppliers-amount', 'Beløp', 10, '');

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
    const objUserSupplierNumber = objSuppliers.suppliersArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objUserSupplierNumber !== -1) {

      // Select supplier Id
      document.querySelector('.select-suppliers-supplierId').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].supplierId;

      // name
      document.querySelector('.input-suppliers-name').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].name;

      // street
      document.querySelector('.input-suppliers-street').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].street;

      // address 2
      document.querySelector('.input-suppliers-address2').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].address2;

      // Postal code
      document.querySelector('.input-suppliers-postalCode').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].postalCode;

      // city
      document.querySelector('.input-suppliers-city').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].city;

      // Show email
      document.querySelector('.input-suppliers-email').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].email;

      // Show phone
      document.querySelector('.input-suppliers-phone').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].phone;

      // Show bankAccount
      document.querySelector('.input-suppliers-bankAccount').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].bankAccount;

      // Select account Id
      document.querySelector('.select-suppliers-accountId').value =
        objSuppliers.suppliersArray[objUserSupplierNumber].accountId;

      // Select account2 Id
      document.querySelector('.select-suppliers-accountAmountId').value =
        (objSuppliers.suppliersArray[objUserSupplierNumber].accountAmountId) ? objSuppliers.suppliersArray[objUserSupplierNumber].accountAmountId : 0;

      // Select amount
      document.querySelector('.input-suppliers-amount').value =
        (objSuppliers.suppliersArray[objUserSupplierNumber].amount) ? formatOreToKroner(objSuppliers.suppliersArray[objUserSupplierNumber].amount) : '';
    }
  }
}

// Check for valid values
function validateValues(supplierId) {

  // Check name
  const supplierName = document.querySelector('.input-suppliers-name').value;
  const validName = objSuppliers.validateText(supplierName, "label-suppliers-name", "Navn");

  // Validate bank account
  const bankAccount =
    document.querySelector('.input-suppliers-bankAccount').value;
  const validBankAccount =
    objSuppliers.validateBankAccount(bankAccount, "label-suppliers-bankAccount", "Bankkonto");

  return (validName && validBankAccount) ? true : false;
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
  document.querySelector('.select-suppliers-accountId').value = 0;

  // account2 Id
  document.querySelector('.select-suppliers-accountAmountId').value = 0;

  // amount
  document.querySelector('.input-suppliers-amount').value = '';

  document.querySelector('.select-suppliers-supplierId').disabled = true;
  document.querySelector('.button-suppliers-delete').disabled = true;
  document.querySelector('.button-suppliers-insert').disabled = true;
}
