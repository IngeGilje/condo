// Search for bank account movements

// Activate objects
const today =
  new Date();
const objUser =
  new User('user');
const objDue =
  new Due('due');
const objCondo =
  new Condo('condo');
const objBankAccountMovement =
  new BankAccountMovement('bankaccountmovement');
const objOverview =
  new Overview('overview');

testMode();

let isEventsCreated = false;

objOverview.menu();
objOverview.markSelectedMenu('Bet.oversikt');

let socket;
socket = connectingToServer();

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
    let todate =
      getCurrentDate();
    todate =
      convertDateToISOFormat(todate)
    year =
      today.getFullYear();
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${year}0101' AND '${todate}' 
        ORDER BY date DESC;
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
        AND date BETWEEN '${year}0101' AND '${todate}' 
        ORDER BY bankAccountMovementId;
      `;

    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
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
        case 'bankaccountmovement':

          // Get selected dues
          getSelectedDues();

          // Get selected bank account movements
          getSelectedBankAccountMovements();

      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
      console.log('disconnection');
    }
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

// Make overview events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-overview-condoId')) {

      // Show selected for dues
      getSelectedDues();

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    }
  });

  // From date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-overview-fromDate')) {

      // Show selected for dues
      getSelectedDues();

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    };
  });

  // To date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-overview-toDate')) {

      // Show selected for dues
      getSelectedDues();

      // Show selected for bank account movements
      getSelectedBankAccountMovements();
    };
  });
}

// Show leading text
function showLeadingText() {

  // Show all condos
  const condoId =
    (isClassDefined('select-overview-condoId')) ? Number(document.querySelector('.select-overview-condoId').value) : 0;
  objCondo.showAllCondos('overview-condoId', condoId, 'Alle');

  // from date
  if (!isClassDefined('input-overview-fromDate')) {

    objOverview.showInput('overview-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-overview-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year =
        String(today.getFullYear());
      document.querySelector('.input-overview-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-overview-toDate')) {
    objOverview.showInput('overview-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-overview-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-overview-toDate').value =
        getCurrentDate();
    }
  }
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

    let lineNumber = 0;

    let sumColumnDue = 0;
    dueArray.forEach((due) => {

      /*
      if (due.dueId >= 0) {
        if (due.condoId === condoId || condoId === 999999999) {
          if (Number(due.date) >= fromDate && (Number(due.date) <= toDate)) {
      */

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // condo name
      const condoName =
        objCondo.getCondoName(due.condoId);
      htmlColumnDueCondoName +=
        `
                <div class="rightCell ${colorClass}">
                  ${condoName}
                </div>
              `;

      // date
      const date =
        formatToNorDate(due.date);
      htmlColumnDueDate +=
        `
                <div 
                  class="rightCell ${colorClass}"
                >
                  ${date}
                </div>
              `;

      // amount
      htmlColumnDueAmount +=
        `
                <div class="rightCell ${colorClass}">
              `;
      htmlColumnDueAmount +=
        formatOreToKroner(due.amount);
      htmlColumnDueAmount +=
        `
                </div>
              `;

      htmlColumnDueText +=
        `
                <div 
                  class="leftCell one-line  ${colorClass}"
                >
                  ${due.text}
                </div>
              `;

      // Accomulate
      // due
      const formatedAmount = due.amount.replace(',', '.');
      sumColumnDue += Number(formatedAmount);
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

    let sumColumnBankAccountMovement =
      0;

    bankAccountMovementArray.forEach((bankAccountMovement) => {

      /*
      if (bankAccountMovement.bankAccountMovementId >= 0) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {
      */

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // condo name
      const condoName =
        (bankAccountMovement.condoId) ? objCondo.getCondoName(bankAccountMovement.condoId) : "-";
      htmlBankAccountMovementCondoName +=
        `
          <div class="rightCell ${colorClass}">
            ${condoName}
          </div>
        `;

      // date
      const date =
        formatToNorDate(bankAccountMovement.date);
      htmlBankAccountMovementDate +=
        `
          <div class="rightCell ${colorClass}"
          >
            ${date}
          </div>
        `;

      // income
      const income =
        formatOreToKroner(bankAccountMovement.income);
      htmlBankAccountMovementAmount +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${income}
          </div>
        `;

      // Text has to fit into the column
      htmlBankAccountMovementText +=
        `
          <div
            class="leftCell one-line ${colorClass}"
          >
            ${bankAccountMovement.text}
          </div>
        `;

      // Accomulate
      sumColumnBankAccountMovement +=
        Number(bankAccountMovement.income)
        + Number(bankAccountMovement.payment);
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

    // sum bank account movement
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
    const guilty =
      sumColumnDue - sumColumnBankAccountMovement;
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

  let fromDate =
    document.querySelector('.input-overview-fromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'overview-fromDate', 'Fra dato');

  let toDate =
    document.querySelector('.input-overview-toDate').value;
  const validToDate =
    validateNorDate(toDate, 'overview-toDate', 'Fra dato');

  // Check date interval
  fromDate =
    Number(convertDateToISOFormat(fromDate));
  toDate =
    Number(convertDateToISOFormat(toDate));

  validDateInterval =
    (fromDate <= toDate) ? true : false;

  fromDate =
    formatToNorDate(fromDate);
  toDate =
    formatToNorDate(toDate);


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
      const flipedFromDate =
        convertDateToISOFormat(fromDate);
      const flipedToDate =
        convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-overview-fromDate').outerHTML =
          "<div class='label-overview-fromDate-red label-overview-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return (validFromDate && validToDate && validDateInterval) ? true : false;
}

// Get selected due
function getSelectedDues() {

  const condoId =
    Number(document.querySelector('.select-overview-condoId').value);

  const fromDate =
    convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value);
  const toDate =
    convertDateToISOFormat(document.querySelector('.input-overview-toDate').value);

  // Check condo Id 
  if ((condoId === 999999999)) {

    // Sends a request to the server to get selected dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        ORDER BY date DESC;
      `;
  }

  // Check if condo Id is selected
  if ((condoId !== 999999999)) {

    // Sends a request to the server to get selected budgets
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        AND condoId = ${condoId}
        ORDER BY date DESC;
      `;
  }

  updateMySql(SQLquery, 'due', 'SELECT');
}

// Get selected bank account movements
function getSelectedBankAccountMovements() {

  const condoId =
    Number(document.querySelector('.select-overview-condoId').value);

  const fromDate =
    convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value);
  const toDate =
    convertDateToISOFormat(document.querySelector('.input-overview-toDate').value);

  // Check condo Id 
  if ((condoId === 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        ORDER BY date DESC;
      `;
  }

  // Check if condo Id is selected
  if ((condoId !== 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        AND condoId = ${condoId}
        ORDER BY date DESC;
      `;
  }

  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
}