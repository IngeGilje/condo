// Search for bank account movements

// Activate objects
const today = new Date();
const objUser = new User('user');
const objDue = new Due('due');
const objCondo = new Condo('condo');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');
const objOverview = new Overview('overview');

testMode();

let isEventsCreated = false;

objOverview.menu();
objOverview.markSelectedMenu('Bet.oversikt');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('condo-login');
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

    // Sends a request to the server to get dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY dueId;
      `;

    updateMySql(SQLquery, 'due', 'SELECT');

    // Sends a request to the server to get condos
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY name;
      `;

    updateMySql(SQLquery, 'condo', 'SELECT');

    // Sends a request to the server to get bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountMovementId;
      `;

    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;
    console.log('Incoming message from server:', messageFromServer);

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

        case 'due':

          // due table
          console.log('dueTable');

          dueArray =
            objInfo.tableArray;
          break;

        case 'condo':

          // condo table
          console.log('condoTable');

          condoArray =
            objInfo.tableArray;
          break;

        case 'bankaccountmovement':

          // bank account movement table
          console.log('bankaccountmovementTable');

          // array including objects with bank account movement information
          bankAccountMovementArray =
            objInfo.tableArray;

          // Show leading text bank account movement
          showLeadingText();

          // Show all values for 
          showValues();

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
        case 'bank account movement':

          // Sends a request to the server to get bank account movements one more time
          SQLquery =
            `
              SELECT * FROM bankaccountmovement
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY bankaccountmovementId;
            `;
          updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
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

  /*
  // Send a message to the server
  socket.onopen = () => {

    // Sends a request to the server to get all users
    const SQLquery =
      `
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
      const SQLquery =
        `
          SELECT * FROM condo
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      console.log('condoTable');
      // condo table

      // array including objects with condo information
      condoArray = JSON.parse(message);

      // Sends a request to the server to get all monthly payments
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY date;
        `;
      socket.send(SQLquery);

    }

    // Create monthly payment array including objets
    if (message.includes('"tableName":"due"')) {

      // monthly payment table
      console.log('dueTable');

      // array including objects with due information
      dueArray = JSON.parse(message);

      // Sends a request to the server to get all bank account movements
      // Get all bankaccountmovement. rows
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY date;
        `;
      socket.send(SQLquery);
    }

    // Create bank account movement array including objets
    if (message.includes('"tableName":"bankaccountmovement"')) {

      // bank account movement table
      console.log('bankaccountmovementTable');

      // array including objects with bank account movement information
      bankAccountMovementArray =
        JSON.parse(message);

      // Show leading text
      showLeadingText();

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {
      console.log('affectedRows');
    }


  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
  */
}

// Make overview events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-overview-condoId')) {

      showValues();
    }
  });

  // Start search
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-overview-search')) {

      // Show all values for bank account movements
      showValues();
    };
  });
}

// Show leading text for payment
function showLeadingText() {

  // Show all condos
  objCondo.showAllCondos('overview-condoId', 0, 'Alle');

  // Show from date
  objOverview.showInput('overview-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
  const year = String(today.getFullYear());
  document.querySelector('.input-overview-fromDate').value =
    `01.01.${year}`;

  // Show to date
  objOverview.showInput('overview-toDate', 'Til dato', 10, 'mm.dd.åååå');
  document.querySelector('.input-overview-toDate').value =
    getCurrentDate();

  // show start search button
  objOverview.showButton('overview-search', 'Start søk');

}

// Show values for due and bankaccountmovement. for selected condo
function showValues() {

  // check for valid filter
  if (validateValues()) {

    // Header due
    let htmlColumnDueCondoName =
      '<div class="columnHeaderRight">Leilighet</div><br>';
    let htmlColumnDueDate =
      '<div class="columnHeaderRight">Forfallsdato</div><br>';
    let htmlColumnDueAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnDueText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    // Filter
    let fromDate =
      convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value);
    let toDate =
      convertDateToISOFormat(document.querySelector('.input-overview-toDate').value);
    toDate = (toDate === 0) ? 99999999 : toDate;

    const condoId =
      Number(document.querySelector('.select-overview-condoId').value);

    let sumColumnDue = 0;
    dueArray.forEach((due) => {
      if (due.dueId > 1) {
        if (due.condoId === condoId || condoId === 999999999) {
          if (Number(due.date) >= fromDate && (Number(due.date) <= toDate)) {

            // condo name
            const condoName =
              objCondo.getCondoName(due.condoId);
            htmlColumnDueCondoName +=
              `
                <div class="rightCell">
                  ${condoName}
                </div>
              `;

            // date
            const date =
              formatToNorDate(due.date);
            htmlColumnDueDate +=
              `
                <div 
                  class="rightCell"
                >
                  ${date}
                </div>
              `;

            // amount
            htmlColumnDueAmount +=
              `
                <div class="rightCell">
              `;
            htmlColumnDueAmount +=
              formatOreToKroner(due.amount);
            htmlColumnDueAmount +=
              `
                </div>
              `;

            // Text has to fit into the column
            const text =
              truncateText(due.text, 'div-overview-columnDueText');
            htmlColumnDueText +=
              `
                <div 
                  class="leftCell"
                >
                  ${text}
                </div>
              `;

            // Accomulate
            // due
            const formatedAmount = due.amount.replace(',', '.');
            sumColumnDue += Number(formatedAmount);
          }
        }
      }
    });

    // Show bank account movement

    // Header
    let htmlBankAccountMovementCondoName =
      '<div class="columnHeaderRight">Leiliget</div><br>';
    let htmlBankAccountMovementDate =
      '<div class="columnHeaderRight">Betalingsdato</div><br>';
    let htmlBankAccountMovementAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlBankAccountMovementText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumColumnBankAccountMovement = 0;

    bankAccountMovementArray.forEach((bankAccountMovement) => {
      if (bankAccountMovement.bankAccountMovementId > 1) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {

            // condo name
            const condoName =
              (bankAccountMovement.condoId) ? objCondo.getCondoName(bankAccountMovement.condoId) : "-";
            htmlBankAccountMovementCondoName +=
              `
                <div class="rightCell">
                  ${condoName}
                </div>
              `;

            // date
            const date =
              formatToNorDate(bankAccountMovement.date);
            htmlBankAccountMovementDate +=
              `
                <div class="rightCell"
                  ${date}
                >
                </div>
              `;

            // income
            const income =
              formatOreToKroner(bankAccountMovement.income);
            htmlBankAccountMovementAmount +=
              `
                <div 
                  class="rightCell"
                >
                  ${income}
                </div>
              `;

            // Text has to fit into the column
            const bankAccountMovementText =
              truncateText(bankAccountMovement.text, 'div-overview-columnBankAccountMovementText');
            htmlBankAccountMovementText +=
              `
                <div
                  class="leftCell"
                >
                  ${bankAccountMovementText}
                </div>
              `;

            // Accomulate
            // bankaccountmovement.
            sumColumnBankAccountMovement += Number(bankAccountMovement.amount);
          }
        }
      }
    });

    // Show total line
    htmlColumnDueCondoName +=
      `
      <div class="sumCellLeft">
        Sum
      </div>
    `;

    htmlColumnDueDate +=
      `
        <div class="sumCellLeft">
          -
        </div>
      `;

    // Sum due
    htmlColumnDueAmount +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnDueAmount +=
      formatOreToKroner(String(sumColumnDue));
    htmlColumnDueAmount +=
      `
        </div>
      `;

    // Sum text
    htmlColumnDueText +=
      `
        <div class="sumCellLeft">
      `;
    htmlColumnDueText +=
      '-';
    htmlColumnDueText +=
      `
        </div>
      `;

    // sum bank account movement.
    htmlBankAccountMovementDate +=
      `
      <div class="sumCellRight">
    `;
    htmlBankAccountMovementDate +=
      '-';
    htmlBankAccountMovementDate +=
      `
      </div>
    `;

    htmlBankAccountMovementAmount +=
      `
        <div class="sumCellRight">
      `;
    htmlBankAccountMovementAmount +=
      formatOreToKroner(String(sumColumnBankAccountMovement));
    htmlBankAccountMovementAmount +=
      `
        </div>
      `;

    // sum guilty
    htmlBankAccountMovementText +=
      `
        <div class="sumCellLeft"
        >
      `;
    const guilty = sumColumnDue - sumColumnBankAccountMovement;
    htmlBankAccountMovementText +=
      `Skyldig ` + formatOreToKroner(String(guilty));
    htmlBankAccountMovementText +=
      `
        </div>
      `;

    // Show due rows
    document.querySelector('.div-overview-columnDueCondoName').innerHTML =
      htmlColumnDueCondoName;
    document.querySelector('.div-overview-columnDueDate').innerHTML =
      htmlColumnDueDate;
    document.querySelector('.div-overview-columnDueAmount').innerHTML =
      htmlColumnDueAmount;
    document.querySelector('.div-overview-columnDueText').innerHTML =
      htmlColumnDueText;

    // Show bankaccountmovement. rows
    document.querySelector('.div-overview-columnBankAccountMovementCondoName').innerHTML =
      htmlBankAccountMovementCondoName;
    document.querySelector('.div-overview-columnBankAccountMovementDate').innerHTML =
      htmlBankAccountMovementDate;
    document.querySelector('.div-overview-columnBankAccountMovementAmount').innerHTML =
      htmlBankAccountMovementAmount;
    document.querySelector('.div-overview-columnBankAccountMovementText').innerHTML =
      htmlBankAccountMovementText;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate = document.querySelector('.input-overview-fromDate').value;
  const validFromDate = validateNorDate(fromDate, 'overview-fromDate', 'Fra dato');

  let toDate = document.querySelector('.input-overview-toDate').value;
  const validToDate = validateNorDate(toDate, 'overview-toDate', 'Fra dato');

  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));

  validDateInterval = (fromDate <= toDate) ? true : false;

  fromDate = formatToNorDate(fromDate);
  toDate = formatToNorDate(toDate);


  if (toDate !== '') {
    // Check to date dd.mm.yyyy
    if (!validateEuroDateFormat(toDate)) {
      document.querySelector('.label-overview-fromDate').outerHTML =
        "<div class='label-overview-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }

  if (validFromDate && validToDate && validDateInterval) {

    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-overview-fromDate').outerHTML =
          "<div class='label-overview-fromDate-red label-overview-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return (validFromDate && validToDate && validDateInterval) ? true : false;
}

