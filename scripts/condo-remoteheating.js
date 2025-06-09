// Overview of payments

// Activate objects
const objUser = new User('user');
const objRemoteheating = new Remoteheating('remoteheating');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objPayment = new Payment('payments');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
switch (objUser.serverStatus) {

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

objRemoteheating.menu();
objRemoteheating.markSelectedMenu('Fjernvarme');

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

    // Validate user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('http://localhost/condo-login.html');

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

    // condo table
    console.log('condoTable');

    // array including objects with condo information
    condoArray = JSON.parse(message);

    // Sends a request to the server to get all accounts
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

    // payment table
    console.log('paymentTable');

    // array including objects with payment information
    paymentArray = JSON.parse(message);

    // Show leading text
    const condoId = objCondo.getSelectedCondoId('condoId')
    showLeadingText(condoId);

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');
    //objPayment.getPayments(socket);
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

// Make overview events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-remoteheating-condoId')) {
      condoId = Number(event.target.value);
    }
  });

  // Select account number
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-remoteheating-accountId')) {
      accountId = Number(event.target.value);
    };
  });

  // Start search
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-remoteheating-search')) {

      showValues();
    }
  });
}

// Show leading text for payment
function showLeadingText(condoId) {

  // Show all condos
  objCondo.showAllCondos('remoteheating-condoId', condoId, 'Alle');

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('remoteheating-accountId', accountId, 'Alle');

  // Show from date
  objRemoteheating.showInput('remoteheating-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
  today = new Date();
  const year = String(today.getFullYear());
  document.querySelector('.input-remoteheating-fromDate').value =
    `01.01.${year}`;

  // Show to date
  objRemoteheating.showInput('remoteheating-toDate', 'Til dato', 10, 'mm.dd.åååå');
  document.querySelector('.input-remoteheating-toDate').value =
    getCurrentDate();

  // show start search button
  objRemoteheating.showButton('remoteheating-search', 'Start søk');
}

// Show values for payment
function showValues() {

  // check for valid filter
  if (validateValues()) {

    // Filter
    // 01.02.2025 -> 20250201
    let fromDate =
      convertDateToISOFormat(document.querySelector('.input-remoteheating-fromDate').value);
    let toDate =
      convertDateToISOFormat(document.querySelector('.input-remoteheating-toDate').value);
    if (toDate === 0) {
    }
    const condoId =
      Number(document.querySelector('.select-remoteheating-condoId').value);
    const accountId =
      Number(document.querySelector('.select-remoteheating-accountId').value);

    // Accomulate
    let sumColumnAmount = 0;
    let sumColumnNumberKWHour = 0;

    // Header payment
    let htmlColumnDate =
      '<div class="columnHeaderRight">Betalings dato</div><br>';
    let htmlColumnAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnNumberKWHour =
      '<div class="columnHeaderRight">Kilowatt timer</div><br>';
    let htmlColumnPriceKWHour =
      '<div class="columnHeaderRight">Pris/Kilowatt timer</div><br>';
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    // Make all columns
    paymentArray.forEach((payment) => {
      if (payment.paymentId > 1) {
        if (Number(payment.date) >= fromDate && Number(payment.date) <= toDate) {
          if (payment.condoId === condoId) {
            if (payment.accountId === accountId) {

              // date
              htmlColumnDate +=
                `
                  <div class="rightCell">
                `;
              htmlColumnDate +=
                convertToEurDateFormat(payment.date);
              htmlColumnDate +=
                `
                  </div>
                `;

              // amount
              htmlColumnAmount +=
                `
                  <div class="rightCell">
                `;
              htmlColumnAmount +=
                formatFromOreToKroner(payment.amount);
              htmlColumnAmount +=
                `
                  </div>
                `;

              // Number of kw/h
              htmlColumnNumberKWHour +=
                `
                  <div class="rightCell">
                `;
              htmlColumnNumberKWHour +=
                formatFromOreToKroner(payment.numberKWHour);
              htmlColumnNumberKWHour +=
                `
                  </div>
                `;

              // Price per KWHour
              const amount =
                Number(payment.amount);
              const numberKWHour =
                Number(payment.numberKWHour);
              htmlColumnPriceKWHour +=
                `
                <div class="rightCell">
                `;
              htmlColumnPriceKWHour +=
                formatFromOreToKroner(String(amount / numberKWHour) * 100);
              htmlColumnPriceKWHour +=
                `
                    </div>
                  `;

              // Text
              htmlColumnText +=
                `
                  <div class="leftCell">
                `;
              htmlColumnText +=
                payment.text;
              htmlColumnText +=
                `
                  </div>
                `;

              // Accomulate
              // amount
              sumColumnAmount += Number(payment.amount);

              // KWHour
              sumColumnNumberKWHour += Number(payment.numberKWHour);

            }
          }
        }
      }
    });

    // Show all sums
    htmlColumnDate +=
      `
       <div class="sumCellRight">
     `;
    htmlColumnDate +=
      'Sum';
    htmlColumnDate +=
      `
       </div>
     `;

    // Amount
    htmlColumnAmount +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnAmount +=
      formatFromOreToKroner(String(sumColumnAmount));
    htmlColumnAmount +=
      `
        </div>
      `;

    // Kilowatt/hour
    htmlColumnNumberKWHour +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnNumberKWHour +=
      formatFromOreToKroner(String(sumColumnNumberKWHour));
    htmlColumnNumberKWHour +=
      `
        </div>
      `;

    // Price per KWHour
    htmlColumnPriceKWHour +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnPriceKWHour +=
      formatFromOreToKroner(String(sumColumnNumberKWHour));
    htmlColumnPriceKWHour +=
      `
        </div>
      `;

    // Text
    htmlColumnText +=
      `
        <div class="sumCellLeft">
          <br>
        </div>
      `;

    // Show all columns
    document.querySelector('.div-remoteheating-columnDate').innerHTML =
      htmlColumnDate;
    document.querySelector('.div-remoteheating-columnAmount').innerHTML =
      htmlColumnAmount;
    document.querySelector('.div-remoteheating-columnNumberKWHour').innerHTML =
      htmlColumnNumberKWHour;
    document.querySelector('.div-remoteheating-columnPriceKWHour').innerHTML =
      htmlColumnPriceKWHour;
    document.querySelector('.div-remoteheating-columnText').innerHTML =
      htmlColumnText;
  }
}

// Check for valid filter values
function validateValues() {

  let validValues = true;

  const fromDate =
    document.querySelector('.input-remoteheating-fromDate').value;
  const toDate =
    document.querySelector('.input-remoteheating-toDate').value;

  if (fromDate !== '') {

    // Check from date dd.mm.yyyy
    if (!validateEuroDateFormat(fromDate)) {
      document.querySelector('.label-remoteheating-fromDate').outerHTML =
        "<div class='label-remoteheating-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }

  if (toDate !== '') {
    // Check to date dd.mm.yyyy
    if (!validateEuroDateFormat(toDate)) {
      document.querySelector('.label-remoteheating-fromDate').outerHTML =
        "<div class='label-remoteheating-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }

  if (validValues) {

    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-remoteheating-fromDate').outerHTML =
          "<div class='label-remoteheating-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return validValues;
}
