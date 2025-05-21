// Payment maintenance

// Activate objects
const objUser = new User('user');
const objPayment = new Payment('payment');
const objCondo = new Condo('condo');
const objAccount = new Account('account');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
(objUser.testServer)
  ? socket = new WebSocket('ws://localhost:5000')
  : socket = new WebSocket('ws://ingegilje.no:5000');

let isEventsCreated = false;

objPayment.menu();
objPayment.markSelectedMenu('Betaling');

// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all users
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

    console.log('userTable');

    // user array including objects with user information
    userArray = JSON.parse(message);

    // Check user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('file:///C:/inetpub/wwwroot/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all condos
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoName;
    `;
    socket.send(SQLquery);
  }

  // Create condo array including objets
  if (message.includes('"tableName":"condo"')) {

    console.log('condoTable');
    // condo table

    // array including objects with condo information
    condoArray = JSON.parse(message);

    //objAccount.getAccounts(socket);
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

    // Sends a request to the server to get all payments
    const SQLquery = `
      SELECT * FROM payment
      ORDER BY paymentId;
    `;
    socket.send(SQLquery);
  }

  // Create payment array including objets
  if (message.includes('"tableName":"payment"')) {

    console.log('paymentTable');
    // payment table

    // array including objects with payment information
    paymentArray = JSON.parse(message);

    const paymentId = objPayment.getSelectedPaymentId('paymentId');

    // Show all leading text
    showLeadingText(paymentId);

    // Show all values for payment
    showValues(paymentId);

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Sends a request to the server to get all payments
    const SQLquery = `
      SELECT * FROM payment
      ORDER BY paymentId;
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

// Make payment events

// Select payment id
function createEvents() {

  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-payment-paymentId')) {

      showValues(Number(event.target.value));
    };
  });

  // Select account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-account-accountId')) {
    }
  });

  // Click update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-payment-update')) {

      updatePayment();
    };
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-payment-new')) {

      resetValues();
    };
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-payment-delete')) {

      deletePaymentRow();

      // Sends a request to the server to get all condos
      const SQLquery = `
        SELECT * FROM payment
        ORDER BY paymentId;
      `;
      socket.send(SQLquery);
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-payment-cancel')) {

      // Sends a request to the server to get all condos
      const SQLquery = `
        SELECT * FROM payment
        ORDER BY paymentId;
      `;
      socket.send(SQLquery);
    };
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-payment-cancel')) {

      // Sends a request to the server to get all condos
      const SQLquery = `
        SELECT * FROM payment
        ORDER BY paymentId;
      `;
      socket.send(SQLquery);
    };
  });
}

function updatePayment() {

  let SQLquery = "";
  let isUpdated = false;

  // Check for valid payment values
  if (validateValues()) {

    const now = new Date();
    const lastUpdate = now.toISOString();

    const paymentId =
      Number(document.querySelector('.select-payment-paymentId').value);

    const accountId =
      document.querySelector('.select-payment-accountId').value;

    const condoId =
      document.querySelector('.select-payment-condoId').value;

    let amount =
      formatAmountToOre(document.querySelector('.input-payment-amount').value);

    let numberKWHour =
      formatAmountToOre(document.querySelector('.input-payment-numberKWHour').value);

    const date =
      convertDateToISOFormat(document.querySelector('.input-payment-date').value);

    const text =
      document.querySelector('.input-payment-text').value;

    // Check if payment exist
    const objectNumberPayment = paymentArray.findIndex(payment => payment.paymentId === paymentId);
    if (objectNumberPayment > 0) {

      // Update payment table
      SQLquery = `
        UPDATE payment
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          accountId = ${accountId},
          condoId = ${condoId},
          amount = '${amount}',
          numberKWHour = '${numberKWHour}',
          date = '${date}',
          text = '${text}'
        WHERE paymentId = ${paymentId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);

    } else {

      SQLquery = `
        INSERT INTO payment (
        tableName,
        user,
        lastUpdate,
        accountId,
        condoId,
        amount,
        numberKWHour,
        date,
        text)
        VALUES (
          'payment',
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          ${condoId},
          '${amount}',
          '${numberKWHour}',
          '${date}', 
          '${text}'
        );
        `;

      // Client sends a request to the server
      socket.send(SQLquery);

      SQLquery = `
        INSERT INTO accountmovement (
          tableName,
          user,
          lastUpdate,
          accountId,
          condoId,
          amount,
          date,
          text)
        VALUES (
          'accountmovement',
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          ${condoId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    document.querySelector('.select-payment-paymentId').disabled =
      false;
    document.querySelector('.button-payment-delete').disabled =
      false;
    document.querySelector('.button-payment-new').disabled =
      false;
    //document.querySelector('.button-payment-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

// Show all leading text for payment
function showLeadingText(paymentId) {

  // Show all payments

  // Show payment id
  objPayment.showAllPayments('paymentId', paymentId);

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('payment-accountId', accountId);

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('payment-condoId', condoId);

  // Show amount
  objPayment.showInput('payment-amount', '* Beløp', 10, '');

  // show kilwatt/hour
  objPayment.showInput('payment-numberKWHour', 'Kilowatt/time', 10, '');

  // Show payment date
  objPayment.showInput('payment-date', '* Dato', 10, 'dd.mm.åååå');

  // payment text
  objPayment.showInput('payment-text', '* Tekst', 255, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objPayment.showButton('payment-update', 'Oppdater');

    // show new button
    objPayment.showButton('payment-new', 'Ny');

    // show delete button
    objPayment.showButton('payment-delete', 'Slett');

    // show cancel button
    objPayment.showButton('payment-cancel', 'Avbryt');
  }
}

// Show values for payment
function showValues(paymentId) {

  // Check for valid payment Id
  if (paymentId > 1) {

    // Find object number in payment array
    const objectNumberPayment = paymentArray.findIndex(payment => payment.paymentId === paymentId);
    if (objectNumberPayment >= 1) {

      // Show payment Id
      document.querySelector('.select-payment-paymentId').value =
        paymentArray[objectNumberPayment].paymentId;

      // show selected account Id
      const accountId = paymentArray[objectNumberPayment].accountId;
      objPayment.selectAccountId(accountId, 'payment-accountId')

      // show selected condo Id
      const condoId = paymentArray[objectNumberPayment].condoId;
      objPayment.selectAccountId(condoId, 'payment-condoId')

      // show amount
      document.querySelector('.input-payment-amount').value =
        formatFromOreToKroner(paymentArray[objectNumberPayment].amount);

      // kilowatt/hour
      document.querySelector('.input-payment-numberKWHour').value =
        formatFromOreToKroner(paymentArray[objectNumberPayment].numberKWHour);

      // payment date
      document.querySelector('.input-payment-date').value =
        convertToEurDateFormat(paymentArray[objectNumberPayment].date);

      // payment text
      document.querySelector('.input-payment-text').value =
        paymentArray[objectNumberPayment].text;
    }
  }
}

function deletePaymentRow() {

  let SQLquery = "";

  // Check for valid payment Id
  const paymentId = Number(document.querySelector('.select-payment-paymentId').value);
  if (paymentId > 0) {

    // Check if payment exist
    const objectNumberPayment = paymentArray.findIndex(payment => payment.paymentId === paymentId);
    if (objectNumberPayment >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM payment
        WHERE paymentId = ${paymentId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

// Check for valid payment values
function validateValues() {

  // Check payment
  const amount =
    document.querySelector('.input-payment-amount').value;
  document.querySelector('.input-payment-amount').value =
    formatToNorAmount(amount);
  const validAmount = checkAmount(amount, 'payment-amount', 'Beløp');

  let validNumberKWHour = true;
  const numberKWHour =
    document.querySelector('.input-payment-numberKWHour').value;
  if (numberKWHour !== '') {

    document.querySelector('.input-payment-numberKWHour').value =
      formatToNorAmount(numberKWHour);
    validNumberKWHour = checkAmount(numberKWHour, 'payment-numberKWHour', 'Kilowat/time');
  } else {

    validNumberKWHour = true;
  }

  const date =
    document.querySelector('.input-payment-date').value;
  const validDate = checkNorDate(date, 'payment-date', 'Dato');

  const text =
    document.querySelector('.input-payment-text').value;
  const validText = objPayment.validateText(text, 'label-payment-text', 'Tekst');

  return (validAmount && validDate && validText) ? true : false;
}

function resetValues() {

  document.querySelector('.input-payment-amount').value =
    '';

  document.querySelector('.input-payment-numberKWHour').value =
    '';

  document.querySelector('.input-payment-date').value =
    '';

  document.querySelector('.input-payment-text').value =
    '';

  document.querySelector('.select-payment-paymentId').value = '';

  document.querySelector('.select-payment-paymentId').disabled =
    true;
  document.querySelector('.button-payment-delete').disabled =
    true;
  document.querySelector('.button-payment-new').disabled =
    true;
  //document.querySelector('.button-payment-cancel').disabled =
  //  true;
}

/*
DROP TABLE payment;
CREATE TABLE payment (
  paymentId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  accountId INT,
  condoId INT,
  amount VARCHAR(10) NOT NULL,
  numberKWHour VARCHAR(10),
  date VARCHAR(10) NOT NULL,
  text VARCHAR (255) NOT NULL
);
INSERT INTO payment (
  tableName,
  user,
  lastUpdate,
  accountId,
  condoId,
  amount,
  numberKWHour,
  date,
  text)
VALUES (
  'payment',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0, 
  0,
  '',
  '',
  '',
  ''
);
*/