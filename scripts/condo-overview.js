// Search for amount movements

// Activate objects
const objUser = new User('user');
const objOverview = new Overview('overview');
const objIncome = new Income('income');
const objDue = new Due('due');
const objCondo = new Condo('condo');

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

objOverview.menu();
objOverview.markSelectedMenu('Bet. oversikt');

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

    // Sends a request to the server to get all monthly payments
    const SQLquery = `
      SELECT * FROM due
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

    // Sends a request to the server to get all incomes
    // Get all income rows
    const SQLquery = `
        SELECT * FROM income
        ORDER BY date;
      `;
    socket.send(SQLquery);
  }

  // Create income array including objets
  if (message.includes('"tableName":"income"')) {

    // income table
    console.log('incomeTable');

    // array including objects with income information
    incomeArray = JSON.parse(message);

    const incomeId = objIncome.getSelectedIncomeId('overview-income');

    // Show leading text
    showLeadingText(incomeId);

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {
    console.log('affectedRows');
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
    if (event.target.classList.contains('select-overview-condoId')) {

      showValues();
    }
  });

  // Start search
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-overview-search')) {

      // Show all values for payment
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
  today = new Date();
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

// Show values for payment
function showValues() {

  // check for valid filter
  if (validateValues()) {

    // Header payment
    let htmlColumnDueDate =
      '<div class="columnHeaderRight">Forfallsdato</div><br>';
    let htmlColumnDueAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnDueText =
      '<div class="columnHeaderLeft">Tekst</div><br>';


    // Filter
    // 01.02.2025 -> 20250201
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

            // date
            htmlColumnDueDate +=
              `
            <div class="leftCell">
          `;
            htmlColumnDueDate +=
              convertToEurDateFormat(due.date);
            htmlColumnDueDate +=
              `
              </div>
            `;

            // amount
            htmlColumnDueAmount +=
              `
              <div class="rightCell">
            `;
            htmlColumnDueAmount +=
              formatFromOreToKroner(due.amount);
            htmlColumnDueAmount +=
              `
            </div>
          `;

            // Text has to fit into the column
            due.text = truncateText(due.text, 'div-overview-columnDueText');
            htmlColumnDueText +=
              `
              <div 
                class="leftCell"
              >
            `;
            htmlColumnDueText +=
              due.text;
            htmlColumnDueText +=
              `
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

    // Show income

    // Header
    let htmlColumnIncomeDate =
      '<div class="columnHeaderRight">Betalingsdato</div><br>';
    let htmlColumnIncomeAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnIncomeText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumColumnIncome = 0;

    incomeArray.forEach((income) => {
      if (income.incomeId > 1) {
        if (Number(income.date) >= Number(fromDate) && Number(income.date) <= Number(toDate)) {
          if (income.condoId === condoId || condoId === 999999999) {

            // date
            htmlColumnIncomeDate +=
              `
                <div class="rightCell">
              `;
            htmlColumnIncomeDate +=
              convertToEurDateFormat(income.date);
            htmlColumnIncomeDate +=
              `
                </div>
              `;

            // amount
            htmlColumnIncomeAmount +=
              `
                <div class="rightCell">
              `;
            htmlColumnIncomeAmount +=
              formatFromOreToKroner(income.amount);
            htmlColumnIncomeAmount +=
              `
                </div>
              `;

            // Text has to fit into the column
            income.text = truncateText(income.text, 'div-overview-columnIncomeText');
            htmlColumnIncomeText +=
              `
                <div
                  class="leftCell"
                >
                  ${income.text}
                </div>
              `;

            // Accomulate
            // income
            sumColumnIncome += Number(income.amount);
          }
        }
      }
    });

    // Show sum line
    // Sum text
    htmlColumnDueDate +=
      `
      <div class="sumCellLeft">
        Sum
      </div>
    `;

    // Sum due
    htmlColumnDueAmount +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnDueAmount +=
      formatFromOreToKroner(String(sumColumnDue));
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
      '.';
    htmlColumnDueText +=
      `
        </div>
      `;

    // sum income
    htmlColumnIncomeDate +=
      `
      <div class="sumCellRight">
    `;
    htmlColumnIncomeDate +=
      '.';
    htmlColumnIncomeDate +=
      `
      </div>
    `;

    htmlColumnIncomeAmount +=
      `
      <div class="sumCellRight">
    `;
    htmlColumnIncomeAmount +=
      formatFromOreToKroner(String(sumColumnIncome));
    htmlColumnIncomeAmount +=
      `
      </div>
    `;

    // sum guilty
    htmlColumnIncomeText +=
      `
        <div class="sumCellLeft"
        >
      `;
    const guilty = sumColumnDue - sumColumnIncome;
    htmlColumnIncomeText +=
      `Skyldig ` + formatFromOreToKroner(String(guilty));
    htmlColumnIncomeText +=
      `
        </div>
      `;

    // Show monthly payment rows
    document.querySelector('.div-overview-columnDueDate').innerHTML =
      htmlColumnDueDate;
    document.querySelector('.div-overview-columnDueAmount').innerHTML =
      htmlColumnDueAmount;
    document.querySelector('.div-overview-columnDueText').innerHTML =
      htmlColumnDueText;

    // Show income rows
    document.querySelector('.div-overview-columnIncomeDate').innerHTML =
      htmlColumnIncomeDate;
    document.querySelector('.div-overview-columnIncomeAmount').innerHTML =
      htmlColumnIncomeAmount;
    document.querySelector('.div-overview-columnIncomeText').innerHTML =
      htmlColumnIncomeText;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate = document.querySelector('.input-overview-fromDate').value;
  const validFromDate = checkNorDate(fromDate, 'overview-fromDate', 'Fra dato');

  let toDate = document.querySelector('.input-overview-toDate').value;
  const validToDate = checkNorDate(toDate, 'overview-toDate', 'Fra dato');

  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));

  validDateInterval = (fromDate <= toDate) ? true : false;

  fromDate = convertToEurDateFormat(fromDate);
  toDate = convertToEurDateFormat(toDate);


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

