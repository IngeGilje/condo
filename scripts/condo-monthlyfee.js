// Monthly fee maintenance

let isEventsCreated = false;

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');
const objMonthlyFee = new MonthlyFee('monthlyfee');
const objDue = new Due('due');

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
objMonthlyFee.menu();
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

    // Sends a request to the server to get all condos
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY name;
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

    // array including objects with monthly fee information
    dueArray = JSON.parse(message);

    // Show leading text
    let condoId = 0;
    if (isClassDefined('select-monthlyfee-condoId')) {
      condoId =
        Number(document.querySelector('.select-monthlyfee-condoId').value);
    }
    if (condoId === 0) {
      condoId = condoArray.at(-1).condoId;
      showLeadingText();
    }

    // show all monthly amounts for selected condo id
    //const condoId = Number(document.querySelector('.select-monthlyfee-condoId').value);
    showMonthlyFee(condoId);

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Sends a request to the server to get all due
    const SQLquery = `
      SELECT * FROM due
      ORDER BY date;
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

// Make monthly amount events
function createEvents() {

  // Selected condo Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-condoId')) {

      const condoId = Number(event.target.value);
      //showLeadingText();
      showValues();

      // Show all dues for condo id
      showMonthlyFee(condoId);
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

  // Update monthly fee
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-update')) {

      updateMonthlyFee();
      const condoId =
        document.querySelector('.select-monthlyfee-condoId').value;
      showMonthlyFee(condoId);
    }
  });

  // New monthly fee
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-new')) {

      resetMonthlyFee();
      resetValues();
    }
  });

  // Delete monthly fee
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-delete')) {

      if (deleteMonthlyFee()) {

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

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-cancel')) {

      // Sends a request to the server to get all dues
      const SQLquery = `
        SELECT * FROM due
        ORDER BY dueId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateMonthlyFee() {

  let SQLquery;
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

    condoName =
     array.name;

    const day =
      Number(document.querySelector('.select-monthlyfee-day').value);

    const amount =
      formatAmountToOre(document.querySelector('.input-monthlyfee-amount').value);

    // Insert new monthly amount for every month this year
    for (month = 1; month < 13; month++) {

      const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
      const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
      const date = 
        String(year) + stringMonth + stringDay;

      const text = 
        String(name) + '-' + findNameOfMonth(month);

      SQLquery = `
        INSERT INTO due(
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          amount,
          date,
          text)
        VALUES(
          'due',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
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
    document.querySelector('.button-monthlyfee-new').disabled =
      false;
    document.querySelector('.select-monthlyfee-condoId').value =
      condoId;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteMonthlyFee() {

  // Check for valid values
  let isDeleted = false;
  if (validateValues()) {

    let SQLquery = '';

    const year =
      Number(document.querySelector('.select-monthlyfee-year').value);
    const day =
      Number(document.querySelector('.select-monthlyfee-day').value);
    const condoId =
      Number(document.querySelector('.select-monthlyfee-condoId').value);
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

// Show leading text for due
function showLeadingText() {

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('monthlyfee-condoId', condoId);

  // Show years
  objDue.selectNumber('monthlyfee-year', 2020, 2030, 2025, 'År');

  // Show days
  objDue.selectNumber('monthlyfee-day', 1, 28, 15, 'Dag')

  // Show amount
  objDue.showInput('monthlyfee-amount', '* Månedsavgift', 10, '');

  if (Number(objUserPassword.securityLevel) >= 9) {

    // show update button
    objDue.showButton('monthlyfee-update', 'Oppdater');

    // show new button
    objDue.showButton('monthlyfee-new', 'Ny');

    // show delete button
    objDue.showButton('monthlyfee-delete', 'Slett');

    // show cancel button
    objDue.showButton('monthlyfee-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid condo
  const year =
    document.querySelector('.select-monthlyfee-year').value;
  const validYear =
    validateNumber(year, 2020, 2099, 'monthlyfee-year', '* År');

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-monthlyfee-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'monthlyfee-condoId', 'Leilighet');

  // Check for valid day
  const day =
    document.querySelector('.select-monthlyfee-day').value;
  const validDay =
    validateNumber(day, 1, 28, 'monthlyfee-day', '* Dag');

  // Check amount
  const amount =
    document.querySelector('.input-monthlyfee-amount').value;
  document.querySelector('.input-monthlyfee-amount').value =
    formatAmountToEuroFarmat(amount);
  const validAmount =
    objDue.validateAmount(amount, "monthlyfee-amount", "Månedsavgift");

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

// Reset all monthly fee amounts
function resetMonthlyFee() {

  document.querySelector('.input-monthlyfee-amount').value =
    '';

  document.querySelector('.div-monthlyfee-columnDate').innerHTML =
    '';
  document.querySelector('.div-monthlyfee-columnAmount').innerHTML =
    '';

  document.querySelector('.button-monthlyfee-delete').disabled =
    true;
  document.querySelector('.button-monthlyfee-new').disabled =
    true;
}

// Reset all values for due
function resetValues() {

  document.querySelector('.select-monthlyfee-condoId').value =
    '';

  // Year
  document.querySelector('.select-monthlyfee-year').value =
    '2025';

  // Day
  document.querySelector('.input-monthlyfee-day').value =
    '';

  // Amount
  document.querySelector('.input-monthlyfee-amount').value =
    '';

  document.querySelector('.button-monthlyfee-delete').disabled =
    true;
  document.querySelector('.button-monthlyfee-new').disabled =
    true;
}

// show all monthly fees for selected condo id
function showMonthlyFee(condoId) {

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
        `
          <div 
            class="rightCell"
          >
            ${date}
          </div>
        `;

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

// Show all values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId > 1) {

    // find object number for selected due id
    const objectNumberDue = dueArray.findIndex(due => due.dueId === dueId);
    if (objectNumberDue >= 0) {

      // Condo id
      document.querySelector('.input-monthlyfee-condoId').value =
        dueArray[objectNumberDue].condoId;

      // year
      document.querySelector('.input-monthlyfee-year').value =
        dueArray[objectNumberDue].year;

      // Day
      document.querySelector('.input-monthlyfee-day').value =
        dueArray[objectNumberDue].day;

      // Amount
      document.querySelector('.input-monthlyfee-amount').value =
        dueArray[objectNumberDue].amount;
    }
  }
}
