// Maintenance of users

// Activate objects
const objUser = new User('user');
const objAccount = new Account('account');
const objSupplier = new Supplier('supplier');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
switch (objSupplier.serverStatus) {

  // Web server
  case 1: {
    socket = new WebSocket('ws://ingegilje.no:7000');
    break;
  }
  // Test web server/ local web server
  case 2: {
    socket = new WebSocket('ws://localhost:7000');
    break;
  }
  // Test server/ local test server
  case 3: {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    socket = new WebSocket(`${protocol}://${hostname}:6050`); break;
    break;
  }
  default:
    break;
}

let isEventsCreated = false;

objSupplier.menu();
objSupplier.markSelectedMenu('Leverandør');

// Send a message to the server
socket.onopen = () => {

  // Send a request to the server to get all users
  const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
  socket.send(SQLquery);
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let message = event.data;

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    // user table
    console.log('userTable');

    // array including objects with user information
    userArray = JSON.parse(message);

    // Send a request to the server to get all accounts
    const SQLquery = `
    SELECT * FROM account
    ORDER BY accountId;
  `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    // account table
    console.log('accountTable');

    // array including objects with account information
    accountArray = JSON.parse(message);

    // Send a request to the server to get all suppliers
    const SQLquery = `
    SELECT * FROM supplier
    ORDER BY supplierId;
  `;
    socket.send(SQLquery);
  }

  // Create supplier array including supplier objets
  if (message.includes('"tableName":"supplier"')) {

    // supplier table
    console.log('supplierTable');

    // array including objects with suplier information
    supplierArray = JSON.parse(message);

    // Show leading texts
    let supplierId = objSupplier.getSelectedSupplierId('select-supplier-supplierId');
    showLeadingText(supplierId);

    // Show all values for all suppliers
    showValues(supplierId);

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Sends a request to the server to get all users
    const SQLquery = `
        SELECT * FROM supplier
        ORDER BY supplierId;
      `;
    socket.send(SQLquery);
  }
};

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make events for suppliers
function createEvents() {

  // Select Supplier
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-supplier-supplierId')) {

      let supplierId = Number(document.querySelector('.select-supplier-supplierId').value);
      supplierId = (supplierId !== 0) ? supplierId : supplierArray.at(-1).supplierId;
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
    if (event.target.classList.contains('button-supplier-new')) {

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
      const SQLquery = `
        SELECT * FROM supplier
        ORDER BY supplierId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-supplier-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery = `
        SELECT * FROM supplier
        ORDER BY supplierId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateSupplier(supplierId) {

  let isUpdated = false;

  if (validateValues(supplierId)) {

    // name
    const name =
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

    let SQLquery = '';
    const now = new Date();
    const lastUpdate = now.toISOString();

    const objectNumberSupplier = supplierArray.findIndex(supplier => supplier.supplierId === supplierId);

    // Check if first name exist
    if (objectNumberSupplier >= 0) {

      // Update table
      SQLquery = `
          UPDATE supplier
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            email = '${email}',
            name = '${name}',
            street = '${street}',
            address2 = '${address2}',
            postalcode = '${postalCode}',
            city = '${city}',
            email = '${email}',
            phone = '${phone}',
            bankAccount = '${bankAccount}',
            accountId = ${accountId}
          WHERE supplierId = ${supplierId}
          ;
        `;
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
          accountId
        ) 
        VALUES (
          'supplier',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${name}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}',
          '${email}',
          '${phone}',
          '${bankAccount}',
          ${accountId}
        );
      `;
    }

    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-supplier-supplierId').disabled =
      false;
    document.querySelector('.button-supplier-delete').disabled =
      false;
    document.querySelector('.button-supplier-new').disabled =
      false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteSupplierRow(supplierId) {

  let SQLquery = "";

  if (supplierId > 1) {

    // Check if supplier exist
    const objectNumberSupplier = supplierArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objectNumberSupplier >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM supplier
        WHERE supplierId = ${supplierId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    // Get supplier
    SQLquery = `
      SELECT * FROM supplier
      ORDER BY supplierId;
    `;
    socket.send(SQLquery);

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
  objAccount.showAllAccounts('supplier-accountId', 0);

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objSupplier.showButton('supplier-update', 'Oppdater');

    // new button
    objSupplier.showButton('supplier-new', 'Ny');

    // delete button
    objSupplier.showButton('supplier-delete', 'Slett');

    // cancel button
    objSupplier.showButton('supplier-cancel', 'Avbryt');
  }
}

// Show values for supplier
function showValues(supplierId) {

  // Check for valid supplier Id
  if (supplierId > 1) {

    // find object number for selected supplier Id 
    const objectNumberSupplier = supplierArray.findIndex(supplier => supplier.supplierId === supplierId);
    if (objectNumberSupplier >= 0) {

      // Select supplier Id
      document.querySelector('.select-supplier-supplierId').value =
        supplierArray[objectNumberSupplier].supplierId;

      // name
      document.querySelector('.input-supplier-name').value =
        supplierArray[objectNumberSupplier].name;

      // street
      document.querySelector('.input-supplier-street').value =
        supplierArray[objectNumberSupplier].street;

      // address 2
      document.querySelector('.input-supplier-address2').value =
        supplierArray[objectNumberSupplier].address2;

      // Postal code
      document.querySelector('.input-supplier-postalCode').value =
        supplierArray[objectNumberSupplier].postalCode;

      // city
      document.querySelector('.input-supplier-city').value =
        supplierArray[objectNumberSupplier].city;

      // Show email
      document.querySelector('.input-supplier-email').value =
        supplierArray[objectNumberSupplier].email;

      // Show phone
      document.querySelector('.input-supplier-phone').value =
        supplierArray[objectNumberSupplier].phone;

      // Show bankAccount
      document.querySelector('.input-supplier-bankAccount').value =
        supplierArray[objectNumberSupplier].bankAccount;

      // Select account Id
      document.querySelector('.select-supplier-accountId').value =
        supplierArray[objectNumberSupplier].accountId;

    }
  }
}

// Check for valid values
function validateValues(supplierId) {

  // Check name
  const name = document.querySelector('.input-supplier-name').value;
  const validName = objSupplier.validateText(name, "label-supplier-name", "Navn");

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

  document.querySelector('.select-supplier-supplierId').disabled =
    true;
  document.querySelector('.button-supplier-delete').disabled =
    true;
  document.querySelector('.button-supplier-new').disabled =
    true;
}
