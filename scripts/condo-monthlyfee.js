// Monthly fee maintenance

let isEventsCreated = false;

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');
const objMonthlyFee = new MonthlyFee('monthlyfee');
const objDue = new Due('due');

const objUserPassword = JSON.parse(localStorage.getItem('savedUser'));

// Connection to a server
let socket;
(objUser.localServer)
  ? socket = new WebSocket('ws://localhost:8080')
  : socket = new WebSocket('ws://ingegilje.no:8080');

menu();
objMonthlyFee.markSelectedMenu('Månedsavgift');

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
    (objUser.validateUser(objUserPassword.user, objUserPassword.password)) ? '' : window.location.href('condo-login.html');

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

    console.log('CondoTable');
    // condo table

    // array including objects with condo information
    condoArray = JSON.parse(message);

    // Sends a request to the server to get all due
    const SQLquery = `
      SELECT * FROM due
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }

  // Create monthly amountArray array including objets
  if (message.includes('"tableName":"due"')) {

    // monthly amount table
    console.log('dueTable');

    // array including objects with due information
    dueArray = JSON.parse(message);

    // Show all leading text
    showLeadingText();

    // show all monthly amounts for selected condo id
    const condoId = Number(document.querySelector('.select-monthlyfee-condoId').value);
    duesCondo(condoId);

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

// Make monthly amount events
function createEvents() {

  // Selected condo Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-condoId')) {

      const condoId = Number(event.target.value);
      //showLeadingText();
      showValues();

      // Show all dues for condo id
      duesCondo(condoId);
    }
  });

  // Selected year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-year')) {
    }
  });

  // Selected day
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-day')) {
    }
  });

  // Update monthly fee due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-update')) {

      if (updateMontlyamountRows()) {

        // Sends a request to the server to get all due
        //objDue.getDues(socket);
        const SQLquery = `
          SELECT * FROM due
          ORDER BY date;
        `;
        socket.send(SQLquery);
      }
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-delete')) {

      if (deleteDueRows()) {

        condoId =
          document.querySelector('.select-monthlyfee-condoId').value;


        // Sends a request to the server to get all due
        const SQLquery =
          `
            SELECT * FROM due
            ORDER BY date;
          `;
        socket.send(SQLquery);

        document.querySelector('.select-monthlyfee-condoId').value =
          condoId;
      }
    }
  });
}

function updateMontlyamountRows() {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid values
  if (validateValues()) {

    // Valid values

    const now = new Date();
    const lastUpdate = now.toISOString();

    const year =
      Number(document.querySelector('.select-monthlyfee-year').value);

    const condoId =
      Number(document.querySelector('.select-monthlyfee-condoId').value);

    // get condo name 
    const array =
      condoArray.find(condo => condo.condoId === condoId);

    condoName = array.condoName;

    const day =
      Number(document.querySelector('.select-monthlyfee-day').value);

    const amount =
      formatAmountToOre(document.querySelector('.input-monthlyfee-amount').value);

    // Insert new monthly amount for every month this year
    for (month = 1; month < 13; month++) {

      const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
      const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
      const date = String(year) + stringMonth + stringDay;

      const text = String(condoName) + '-' + findNameOfMonth(month);

      SQLquery = `
        INSERT INTO due(
          tableName,
          user,
          lastUpdate,
          condoId,
          amount,
          date,
          text)
        VALUES(
          'due',
          '${objUserPassword.user}',
          '${lastUpdate}',
          ${condoId},
          '${amount}',
          '${date}',
          '${text}'
        );
      `;

      socket.send(SQLquery);
    }
    document.querySelector('.button-monthlyfee-delete').disabled =
      false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteDueRows() {

  // Check for valid values
  let isDeleted = false;
  if (validateValues()) {

    let SQLquery = '';

    const year = Number(document.querySelector('.select-monthlyfee-year').value);
    const day = Number(document.querySelector('.select-monthlyfee-day').value);
    const condoId = Number(document.querySelector('.select-monthlyfee-condoId').value);
    let amount =
      formatAmountToOre(document.querySelector('.input-monthlyfee-amount').value);

    for (month = 1; month < 13; month++) {

      const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
      const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
      let date = String(year) + stringMonth + stringDay;

      // due id for deleting row
      const dueId = findDueId(condoId, amount, date);

      if (dueId > 1) {
        SQLquery = `
          DELETE FROM due 
          WHERE dueId = ${dueId};
        `;

        socket.send(SQLquery);
        console.log(SQLquery);

        isDeleted = true;
      }
    }
  }
  return isDeleted;
}

// Show all leading text for due
function showLeadingText() {

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('monthlyfee-condoId', condoId);

  // Show years
  objDue.selectNumber('monthlyfee-year', 2020, 2030, 'År');

  // Show days
  objDue.selectNumber('monthlyfee-day', 1, 28, 15, 'Dag')

  // Show amount
  objDue.showInput('monthlyfee-amount', '* Månedsavgift', 10, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDue.showButton('monthlyfee-update', 'Oppdater');

    // show delete button
    objDue.showButton('monthlyfee-delete', 'Slett');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid condo
  const year =
    document.querySelector('.select-monthlyfee-year').value;
  const validYear =
    checkNumber(year, 2020, 2099, 'monthlyfee-year', '* År');

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-monthlyfee-condoId').value;
  const validCondoId =
    checkNumber(condoId, 1, 99999, 'monthlyfee-condoId', 'Leilighet');

  // Check for valid day
  const day =
    document.querySelector('.select-monthlyfee-day').value;
  const validDay =
    checkNumber(day, 1, 28, 'monthlyfee-day', '* Dag');

  // Check amount
  const amount =
    document.querySelector('.input-monthlyfee-amount').value;
  document.querySelector('.input-monthlyfee-amount').value =
    formatAmountToEuroFarmat(amount);
  const validAmount =
    checkAmount(amount, "monthlyfee-amount", "Månedsavgift");

  return (validYear && validCondoId && validDay && validAmount) ? true : false;
}

function findDueId(condoId, amount, date) {

  let dueId = 0
  dueArray.forEach((due) => {
    if (due.dueId > 1
      && due.amount === amount
      && due.date === date
      && due.condoId === condoId) {

      dueId = due.dueId;
    }
  });

  return dueId;
}

// show all monthly amounts for selected condo id
function duesCondo(condoId) {

  let sumAmount = 0;
  document.querySelector(".input-monthlyfee-amount").value =
    '';

  let htmlColumnDate =
    `<div 
      class = "columnHeaderRight"
    >
      Forfallsdato
  </div>
  <br>
  `;

  let htmlColumnAmount =
    `<div 
      class = "columnHeaderRight"
    >
      Beløp
  </div>
  <br>
  `;

  dueArray.forEach((due) => {

    if (due.condoId > 1 && due.condoId === condoId) {

      // 20250115 -> 15.01.2025
      date = convertToEurDateFormat(String(due.date));
      htmlColumnDate +=
        `<div 
          class="rightCell"
        >
          ${date}
        </div>
        <br>`;

      // 1234567 -> 12345,67
      const amount = formatFromOreToKroner(due.amount);
      document.querySelector(".input-monthlyfee-amount").value =
        amount;
      htmlColumnAmount +=
        `
        <div 
          class="rightCell"
        >
          ${amount}
        </div>
        <br>
      `;
      sumAmount += Number(due.amount);
    }
  });

  // Sum line

  // 1234567 -> 12345,67
  sumAmount = formatFromOreToKroner(String(sumAmount));
  htmlColumnAmount +=
    `
      <div 
        class="sumCellRight"
      >
        ${sumAmount}
      </div>
      <br>
    `;

  document.querySelector('.div-monthlyfee-columnDate').innerHTML =
    htmlColumnDate;
  document.querySelector('.div-monthlyfee-columnAmount').innerHTML =
    htmlColumnAmount;
}

/*
DROP TABLE due; 
CREATE TABLE due (
  dueId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condoId INT,
  amount VARCHAR(10) NOT NULL,
  date VARCHAR(10) NOT NULL,
  text VARCHAR (255) NOT NULL
);
INSERT INTO due (
  tableName,
  user,
  lastUpdate,
  condoId,
  amount,
  date,
  text)
VALUES (
  'due',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  '',
  '',
  ''
);
*/