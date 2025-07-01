// Overview of payments

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objPayment = new Payment('payments');
const objRemoteheating = new Remoteheating('remoteheating');

testMode();

let isEventsCreated = false;

objRemoteheating.menu();
objRemoteheating.markSelectedMenu('Fjernvarme');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('condo-login');
} else {

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

      // Sends a request to the server to get all condos
      const SQLquery = `
      SELECT * FROM condo
      ORDER BY name;
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
      const condoId =
        objCondo.getSelectedCondoId('condoId')
      showLeadingText(condoId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {

      console.log('affectedRows');
      //objPayment.getPayments(socket);
      const SQLquery =
        `
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
  objCondo.showAllCondos('remoteheating-condoId', condoId, 'Alle leiligheter');

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('remoteheating-accountId', accountId, 'Alle konti');

  // Show from date
  objRemoteheating.showInput('remoteheating-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

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
    let fromDate =
      convertDateToISOFormat(document.querySelector('.input-remoteheating-fromDate').value);
    let toDate =
      convertDateToISOFormat(document.querySelector('.input-remoteheating-toDate').value);

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
    let rowNumber =
      0;
    paymentArray.forEach((payment) => {
      if (payment.paymentId > 1) {
        if (Number(payment.date) >= fromDate && Number(payment.date) <= toDate) {
          if (payment.condoId === condoId || condoId === 999999999) {
            if (payment.accountId === accountId || accountId === 999999999) {

              rowNumber++;

              // check if the number is odd
              const colorClass =
                (rowNumber % 2 !== 0) ? "green" : "";

              // date
              const date =
                formatToNorDate(payment.date);
              htmlColumnDate +=
                `
                  <div 
                    class="rightCell ${colorClass}"
                  >
                    ${date}
                  </div>
                `;

              // amount
              let amount =
                formatOreToKroner(payment.amount);
              htmlColumnAmount +=
                `
                  <div 
                    class="rightCell ${colorClass}"
                  >
                    ${amount}
                  </div>
                `;

              // Number of kw/h
              let numberKWHour =
                formatOreToKroner(payment.numberKWHour);
              htmlColumnNumberKWHour +=
                `
                  <div 
                    class="rightCell ${colorClass}"
                  >
                    ${numberKWHour}
                  </div>
                `;

              // Price per KWHour
              amount =
                Number(payment.amount);
              numberKWHour =
                Number(payment.numberKWHour);
              if (amount && numberKWHour) {
                priceKWHour =
                  formatOreToKroner(String(amount / numberKWHour) * 100);
              } else {
                priceKWHour = "-";
              }

              htmlColumnPriceKWHour +=
                `
                  <div class="rightCell ${colorClass}"
                  >
                    ${priceKWHour}
                  </div>
                `;

              // Text
              const text =
                truncateText(payment.text, 'div-remoteheating-columnText');

              htmlColumnText +=
                `
                  <div 
                    class="leftCell ${colorClass}"
                  >
                    ${text}
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
      formatOreToKroner(String(sumColumnAmount));
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
      formatOreToKroner(String(sumColumnNumberKWHour));
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
      formatOreToKroner(String(sumColumnNumberKWHour));
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
