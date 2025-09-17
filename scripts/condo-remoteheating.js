// Overview of remote heating

// Activate objects
const today = new Date();
const objRemoteheating = new Remoteheating('remoteheating');
const objCondominium = new Condominium('condominium');
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');

let condominiumArrayCreated = false;
let userArrayCreated = false;
let condoArrayCreated = false;
let accountArrayCreated = false;
let bankAccountMovementArrayCreated = false;

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

let isEventsCreated

objRemoteheating.menu();
objRemoteheating.markSelectedMenu('Fjernvarme');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {


  // Send a requests to the server
  socket.onopen = () => {

    let SQLquery;

    // Sends a request to the server to get account
    // Inner join
    SQLquery =
      `
        SELECT account.*
        FROM condominium
        JOIN account ON condominium.paymentRemoteHeatingAccountId = account.accountId
        WHERE condominium.condominiumId = ${objUserPassword.condominiumId}    
      `;

    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get condominiums
    SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY condominiumId;
      `;

    updateMySql(SQLquery, 'condominium', 'SELECT');
    condominiumArrayCreated =
      false;

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    // Sends a request to the server to get condos
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY condoId;
      `;

    updateMySql(SQLquery, 'condo', 'SELECT');
    condoArrayCreated =
      false;

    // Sends a request to the server to get bank account movements
    setTimeout(() => {

      if (accountArrayCreated) {

        // Filter
        const year =
          String(today.getFullYear());
        const fromDate =
          year + "0101";
        let toDate =
          getCurrentDate();
        toDate = convertDateToISOFormat(toDate)

        SQLquery =
          `
            SELECT * FROM bankaccountmovement
            WHERE deleted <> 'Y'
              AND accountId = ${accountArray[0].accountId}
              AND date BETWEEN ${fromDate} AND ${toDate}
            ORDER BY date DESC;
          `;

        updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
        bankAccountMovementArrayCreated =
          false;
      }
    }, 100);
  }
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
      case 'condominium':

        // condominium table
        console.log('condominiumTable');

        condominiumArray =
          objInfo.tableArray;
        condominiumArrayCreated =
          true;
        break;

      case 'user':

        // user table
        console.log('userTable');

        userArray =
          objInfo.tableArray;
        userArrayCreated =
          true;
        break;

      case 'condo':

        // condo table
        console.log('condoTable');

        condoArray =
          objInfo.tableArray;
        condoArrayCreated =
          true;
        break;

      case 'account':

        // account table
        console.log('accountTable');

        accountArray =
          objInfo.tableArray;
        accountArrayCreated =
          true;
        break;

      case 'bankaccountmovement':

        // bank account movement table
        console.log('bankaccountmovementTable');

        // array including objects with bank account movement information
        bankAccountMovementArray =
          objInfo.tableArray;
        bankAccountMovementArrayCreated =
          true;

        if (condominiumArrayCreated
          && userArrayCreated
          && condoArrayCreated
          && accountArrayCreated
          && bankAccountMovementArrayCreated) {

          // Find selected condo id
          const condoId =
            objCondo.getSelectedCondoId('select-remoteheating-condoId');

          // Show leading text
          showLeadingText(condoId);

          // Show all values for bank Account Movement
          showValues();

          // Make events
          isEventsCreated =
            (isEventsCreated) ? true : createEvents();
        }
        break;
    }
  }

  if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

    switch (objInfo.tableName) {
      case 'bankaccountmovement':

        // Get selected bank account movements
        getSelectedBankAccountMovements();
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

// Make remoteheating events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-remoteheating-condoId')) {

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    }
  });

  // From date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-remoteheating-fromDate')) {

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    };
  });

  // To date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-remoteheating-toDate')) {

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    };
  });
  return true;
}

// Show leading text
function showLeadingText() {

  // Show all condos
  if (!isClassDefined('select-remoteheating-condoId')) {

    objCondo.showAllCondos('remoteheating-condoId', 0, 'Alle');
  }

  // from date
  if (!isClassDefined('input-remoteheating-fromDate')) {

    objRemoteheating.showInput('remoteheating-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-remoteheating-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year =
        String(today.getFullYear());
      document.querySelector('.input-remoteheating-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-remoteheating-toDate')) {
    objRemoteheating.showInput('remoteheating-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-remoteheating-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-remoteheating-toDate').value =
        getCurrentDate();
    }
  }

  /*
  // Show all accounts
  if (!isClassDefined('select-remoteheating-accountId')) {

    // Check if condominium id exist
    const objCondominimuRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (objCondominimuRowNumber !== -1) {
      const accountId =
        condominiumArray[objCondominimuRowNumber].accountId;
      objAccount.showAllAccounts('remoteheating-accountId', accountId, 'Alle');

      getSelectedBankAccountMovements();
    }
  }
  */
}

// Show values for bankaccountmovement
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
    //const accountId =
    //  Number(document.querySelector('.select-remoteheating-accountId').value);

    // Accomulate
    let sumColumnPayment = 0;
    let sumColumnNumberKWHour = 0;

    // Header bankaccountmovement
    let htmlColumnDate =
      '<div class="columnHeaderRight">Betalings dato</div><br>';
    let htmlColumnPayment =
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

    bankAccountMovementArray.forEach((bankaccountmovement) => {

      rowNumber++;

      // check if the number is odd
      const colorClass =
        (rowNumber % 2 !== 0) ? "green" : "";

      // date
      const date =
        formatToNorDate(bankaccountmovement.date);
      htmlColumnDate +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${date}
          </div>
        `;

      // payment
      let payment =
        formatOreToKroner(bankaccountmovement.payment);
      htmlColumnPayment +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${payment}
          </div>
        `;

      // Number of kw/h
      let numberKWHour =
        formatOreToKroner(bankaccountmovement.numberKWHour);
      htmlColumnNumberKWHour +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${numberKWHour}
          </div>
        `;

      // Price per KWHour
      payment =
        Number(bankaccountmovement.payment);
      numberKWHour =
        Number(bankaccountmovement.numberKWHour);

      let priceKWHour = '-';
      if (numberKWHour !== 0 && payment !== 0) {

        priceKWHour =
          (-1 * payment) / numberKWHour;
        priceKWHour =
          priceKWHour.toFixed(2);
      }
      htmlColumnPriceKWHour +=
        `
          <div class="rightCell ${colorClass}"
          >
            ${priceKWHour}
          </div>
        `;

      htmlColumnText +=
        `
          <div 
            class="leftCell ${colorClass} one-line"
          >
            ${bankaccountmovement.text}
          </div>
        `;

      // Accomulate
      // payment
      sumColumnPayment +=
        Number(bankaccountmovement.payment);

      // KWHour
      sumColumnNumberKWHour +=
        Number(bankaccountmovement.numberKWHour);
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

    // Payment
    htmlColumnPayment +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnPayment +=
      formatOreToKroner(String(sumColumnPayment));
    htmlColumnPayment +=
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
    payment =
      Number(sumColumnPayment);
    numberKWHour =
      Number(sumColumnNumberKWHour);

    let sumPriceKWHour = '-';
    if (payment !== 0 && numberKWHour !== 0) {

      sumPriceKWHour =
        ((-1 * payment) / numberKWHour);
      sumPriceKWHour =
        sumPriceKWHour.toFixed(2);
    }

    htmlColumnPriceKWHour +=
      `
        <div class="sumCellRight">
          ${sumPriceKWHour}
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
    document.querySelector('.div-remoteheating-columnPayment').innerHTML =
      htmlColumnPayment;
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

// Get selected bank account movements
function getSelectedBankAccountMovements() {

  const condoId =
    Number(document.querySelector('.select-remoteheating-condoId').value);

  //const accountId =
  //  Number(document.querySelector('.select-remoteheating-accountId').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-fromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-toDate').value));

  let SQLquery =
    `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
        AND accountId = ${accountArray[0].accountId}
        AND date BETWEEN ${fromDate} AND ${toDate}
        ORDER By date DESC;
    `;

  // Check condo Id 
  if (condoId !== 999999999) {

    // Sends a request to the server to get selected bank account movements
    SQLquery +=
      `
        AND condoId = ${condoId}
      `;
  }

  // Check if condo Id is selected
  if (condoId !== 999999999) {

    // Sends a request to the server to get selected bank account movements
    SQLquery +=
      `
        ORDER BY date DESC;
      `;
  }

  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  bankAccountMovementArrayCreated =
    false;
}

