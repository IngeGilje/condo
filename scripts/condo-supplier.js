// Maintenance of users

// Activate objects
const objUser = new User('user');
const objAccount = new Account('account');
const objSupplier = new Supplier('supplier');

testMode();

// Redirect application after 2 hours
setTimeout(() => {
  window.location.href =
    'http://localhost/condo/condo-login.html'
}, 1 * 60 * 60 * 1000);

let isEventsCreated =
  false;

objSupplier.menu();
objSupplier.markSelectedMenu('Leverandør');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get suppliers
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY supplierId;
      `;

    updateMySql(SQLquery, 'supplier', 'SELECT');
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

          userArray =
            objInfo.tableArray;
          break;

        case 'account':

          // user table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          break;

        case 'supplier':

          // supplier table
          console.log('supplierTable');

          // array including objects with supplier information
          supplierArray =
            objInfo.tableArray;

          // Find selected supplier id
          const supplierId =
            objSupplier.getSelectedSupplierId('select-supplier-supplierId');

          // Show leading text
          showLeadingText(supplierId);

          // Show all values for supplier
          showValues(supplierId);

          // Make events
          if (!isEventsCreated) {
            createEvents();
            isEventsCreated = true;
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
              ORDER BY supplierId;
            `;
          updateMySql(SQLquery, 'supplier', 'SELECT');
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
}

// Make events for suppliers
function createEvents() {

  // Select Supplier
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-supplier-supplierId')) {

      let supplierId = Number(document.querySelector('.select-supplier-supplierId').value);
      supplierId =
        (supplierId !== 0) ? supplierId : supplierArray.at(-1).supplierId;
      if (supplierId) {
        showValues(supplierId);
      }
    }
  });

  // Update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-supplier-update')) {

      // user id
      let supplierId =
        Number(document.querySelector('.select-supplier-supplierId').value);
      updateSupplier(supplierId);
    }
  });

  // New supplier
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-supplier-insert')) {

      resetValues();
    }
  });

  // Delete supplier
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-supplier-delete')) {

      const supplierId =
        Number(document.querySelector('.select-supplier-supplierId').value);
      deleteSupplierRow(supplierId);

      // Sends a request to the server to get all suppliers
      const SQLquery =
        `
          SELECT * FROM supplier
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY supplierId;
        `;
      updateMySql(SQLquery, 'supplier', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-supplier-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery =
        `
          SELECT * FROM supplier
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY supplierId;
        `;
      updateMySql(SQLquery, 'supplier', 'SELECT');
    }
  });
}

function updateSupplier(supplierId) {

  let isUpdated = false;

  if (validateValues(supplierId)) {

    // name
    const supplierName =
      document.querySelector('.input-supplier-name').value;

    // street
    const street =
      document.querySelector('.input-supplier-street').value;

    // address 2
    const address2 =
      document.querySelector('.input-supplier-address2').value;

    // postal code
    const postalCode =
      document.querySelector('.input-supplier-postalCode').value;

    // city
    const city =
      document.querySelector('.input-supplier-city').value;

    // email
    const email =
      document.querySelector('.input-supplier-email').value;

    // phone
    const phone =
      document.querySelector('.input-supplier-phone').value;

    // bank account
    const bankAccount =
      document.querySelector('.input-supplier-bankAccount').value;

    // account Id
    const accountId =
      document.querySelector('.select-supplier-accountId').value;

    // account2 Id
    const account2Id =
      document.querySelector('.select-supplier-account2Id').value;

    // amount
    const amount =
      (document.querySelector('.input-supplier-amount').value) ? formatKronerToOre(document.querySelector('.input-supplier-amount').value) : '';

    let SQLquery = '';
    const now = new Date();
    const lastUpdate = now.toISOString();

    const objUserSupplierNumber =
      supplierArray.findIndex(supplier => supplier.supplierId === supplierId);

    // Check if first name exist
    if (objUserSupplierNumber !== -1) {

      // Update table
      SQLquery =
        `
          UPDATE supplier
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            email = '${email}',
            name = '${supplierName}',
            street = '${street}',
            address2 = '${address2}',
            postalcode = '${postalCode}',
            city = '${city}',
            email = '${email}',
            phone = '${phone}',
            bankAccount = '${bankAccount}',
            accountId = ${accountId},
            account2Id = ${account2Id},
            amount = ${amount}
          WHERE supplierId = ${supplierId}
          ;
        `;
      updateMySql(SQLquery, 'supplier', 'UPDATE');
    } else {

      // Insert new record
      SQLquery = `
        INSERT INTO supplier (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          name,
          street,
          address2,
          postalCode,
          city,
          email,
          phone,
          bankAccount,
          accountId,
          account2Id,
          amount
        ) 
        VALUES (
          'supplier',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${supplierName}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}',
          '${email}',
          '${phone}',
          '${bankAccount}',
          ${accountId},
          ${account2Id},
          ${amount}
        );
      `;
      // Client sends a request to the server
      updateMySql(SQLquery, 'supplier', 'INSERT');
    }

    document.querySelector('.select-supplier-supplierId').disabled =
      false;
    document.querySelector('.button-supplier-delete').disabled =
      false;
    document.querySelector('.button-supplier-insert').disabled =
      false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteSupplierRow(supplierId) {

  let SQLquery = "";

  if (supplierId >= 0) {

    // Check if supplier exist
    const objUserSupplierNumber =
      supplierArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objUserSupplierNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM supplier
        WHERE supplierId = ${supplierId};
      `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'supplier', 'SELECT');
    }

    // Get supplier
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY supplierId;
      `;
    updateMySql(SQLquery, 'supplier', 'SELECT');

    resetValues();
  }
}

// Show leading text for supplier
function showLeadingText(supplierId) {

  // Show all suppliers
  objSupplier.showAllSuppliers('supplier-supplierId', supplierId);

  // name
  objSupplier.showInput('supplier-name', '* Navn', 50, '');

  // street
  objSupplier.showInput('supplier-street', 'Gateadresse', 50, '');

  // Address 2
  objSupplier.showInput('supplier-address2', 'Adresse 2', 50, '');

  // postal code
  objSupplier.showInput('supplier-postalCode', 'Postnummer', 4, '');

  // City
  objSupplier.showInput('supplier-city', 'Poststed', 50, '');

  // email
  objSupplier.showInput('supplier-email', 'E-mail', 50, '');

  // phone
  objSupplier.showInput('supplier-phone', 'Telefonnummer', 20, '');

  // bank account
  objSupplier.showInput('supplier-bankAccount', '* Bankkonto', 11, '');

  // Show all accounts
  objAccount.showAllAccounts('supplier-accountId', 0, '', 'Ingen konti er valgt');

  // Show all accounts
  objAccount.showAllAccounts('supplier-account2Id', 0, '', 'Ingen konti er valgt');

  // Show amount
  objAccount.showInput('supplier-amount', 'Beløp', 10, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objSupplier.showButton('supplier-update', 'Oppdater');

    // new button
    objSupplier.showButton('supplier-insert', 'Ny');

    // delete button
    objSupplier.showButton('supplier-delete', 'Slett');

    // cancel button
    objSupplier.showButton('supplier-cancel', 'Avbryt');
  }
}

// Show values for supplier
function showValues(supplierId) {

  // Check for valid supplier Id
  if (supplierId >= 0) {

    // find object number for selected supplier Id 
    const objUserSupplierNumber =
      supplierArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objUserSupplierNumber !== -1) {

      // Select supplier Id
      document.querySelector('.select-supplier-supplierId').value =
        supplierArray[objUserSupplierNumber].supplierId;

      // name
      document.querySelector('.input-supplier-name').value =
        supplierArray[objUserSupplierNumber].name;

      // street
      document.querySelector('.input-supplier-street').value =
        supplierArray[objUserSupplierNumber].street;

      // address 2
      document.querySelector('.input-supplier-address2').value =
        supplierArray[objUserSupplierNumber].address2;

      // Postal code
      document.querySelector('.input-supplier-postalCode').value =
        supplierArray[objUserSupplierNumber].postalCode;

      // city
      document.querySelector('.input-supplier-city').value =
        supplierArray[objUserSupplierNumber].city;

      // Show email
      document.querySelector('.input-supplier-email').value =
        supplierArray[objUserSupplierNumber].email;

      // Show phone
      document.querySelector('.input-supplier-phone').value =
        supplierArray[objUserSupplierNumber].phone;

      // Show bankAccount
      document.querySelector('.input-supplier-bankAccount').value =
        supplierArray[objUserSupplierNumber].bankAccount;

      // Select account Id
      document.querySelector('.select-supplier-accountId').value =
        supplierArray[objUserSupplierNumber].accountId;

      // Select account2 Id
      document.querySelector('.select-supplier-account2Id').value =
        (supplierArray[objUserSupplierNumber].account2Id) ? supplierArray[objUserSupplierNumber].account2Id : 0;

      // Select amount
      document.querySelector('.input-supplier-amount').value =
        (supplierArray[objUserSupplierNumber].amount) ? formatOreToKroner(supplierArray[objUserSupplierNumber].amount) : '';
    }
  }
}

// Check for valid values
function validateValues(supplierId) {

  // Check name
  const supplierName = document.querySelector('.input-supplier-name').value;
  const validName = objSupplier.validateText(supplierName, "label-supplier-name", "Navn");

  // Validate bank account
  const bankAccount =
    document.querySelector('.input-supplier-bankAccount').value;
  const validBankAccount =
    objSupplier.validateBankAccount(bankAccount, "label-supplier-bankAccount", "Bankkonto");

  return (validName && validBankAccount) ? true : false;
}

function resetValues() {

  // supplier Id
  document.querySelector('.select-supplier-supplierId').value =
    0;

  // reset name
  document.querySelector('.input-supplier-name').value =
    '';

  // street
  document.querySelector('.input-supplier-street').value =
    '';

  // address 2
  document.querySelector('.input-supplier-address2').value =
    '';

  // reset postal code
  document.querySelector('.input-supplier-postalCode').value =
    '';

  // reset city
  document.querySelector('.input-supplier-city').value =
    '';

  // reset e-mail
  document.querySelector('.input-supplier-email').value =
    '';

  // reset phone number
  document.querySelector('.input-supplier-phone').value =
    '';

  // reset bank account
  document.querySelector('.input-supplier-bankAccount').value =
    '';

  // account Id
  document.querySelector('.select-supplier-accountId').value =
    0;

  // account2 Id
  document.querySelector('.select-supplier-account2Id').value =
    0;

  // amount
  document.querySelector('.input-supplier-amount').value =
    '';

  document.querySelector('.select-supplier-supplierId').disabled =
    true;
  document.querySelector('.button-supplier-delete').disabled =
    true;
  document.querySelector('.button-supplier-insert').disabled =
    true;
}
