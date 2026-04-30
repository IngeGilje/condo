// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);

const tableWidth = 'width:1450px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objEmptyingCalendar.condominiumId === 0) || (objEmptyingCalendar.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      await objCondo.loadCondoTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      // Show horizonal menu
      let html = objEmptyingCalendar.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const year = Number(document.querySelector('.filterYear').value);
      const month = Number(document.querySelector('.filterMonth').value);
      await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);

      // Show emtyingcalendar
      menuNumber = showEmptyingCalendar(menuNumber);

      // Events
      events();
    }
  } else {

    objEmptyingCalendar.showMessage(objEmptyingCalendar, '', 'Server er ikke startet.');
  }
}

// Events for emptyingcalendar
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterMonth')) {

      const year = Number(document.querySelector('.filterYear').value);
      const month = Number(document.querySelector('.filterMonth').value);
      await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);

      // Show emtyingcalendar
      showEmptyingCalendar(3);
    };
  });

  // update a emptyingcalendar row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'date', 'paper', 'residualWaste', 'food', 'plastic', 'christmasTree'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[4]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[5]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[6]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objEmptyingCalendar.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let emptyingCalendarId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        emptyingCalendarId = Number(className.slice(prefix.length));
      }

      updateEmptyingCalendarRow(emptyingCalendarId);
    };
  });

  // Delete emptyingcalendar row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objEmptyingCalendar.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let emptyingCalendarId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        emptyingCalendarId = Number(className.slice(prefix.length));
      }

      const deleted = document.querySelector(`.${className}`).value;
      if (deleted === "Ja") {

        const emptyingCalendarId = Number(className.substring(6));
        await objEmptyingCalendar.deleteEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user);

        const year = Number(document.querySelector('.filterYear').value);
        const month = Number(document.querySelector('.filterMonth').value);
        await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);

        // Show emtyingcalendar
        showEmptyingCalendar(3);
      }
    }
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objEmptyingCalendar.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objEmptyingCalendar.startTable(tableWidth);

  // start table body
  html += objEmptyingCalendar.startTableBody();

  // show main header
  html += objEmptyingCalendar.showTableHeaderLogOut('width:206px;', '1', '2', '3', '4Avfallskalender', '5', '6', '7', '8');
  html += "</tr>";

  // end table body
  html += objEmptyingCalendar.endTableBody();

  // The end of the table
  html += objEmptyingCalendar.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  let html = objEmptyingCalendar.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objEmptyingCalendar.showTableHeaderMenu('width:150px;', menuNumber, '2', '3', '4År', '5Måned', '6', '7', '8', '9');

  // start table body
  html += objEmptyingCalendar.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objEmptyingCalendar.insertTableColumns('', menuNumber, '2', '3');

  // Selected year
  const year = String(today.getFullYear());
  html += objEmptyingCalendar.showSelectedNumbers('filterYear', "width:150px;", 2020, 2030, year, true);

  // Selected month
  // Get current date in  European date format (dd.mm.yyyy)
  const date = getCurrentDate();
  let month = Number(date.split('.')[1]); // Extract the month part
  html += objEmptyingCalendar.showSelectedMonths('filterMonth', "width:150px;", month, true);

  html += "<td>6</td><td>7</td><td>8</td><td>9</td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objEmptyingCalendar.insertTableColumns('', menuNumber, '2', '3', '4', '5', '6', '7', '8', '9');

  // end table body
  html += objEmptyingCalendar.endTableBody();

  // The end of the table
  html += objEmptyingCalendar.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show emptyingCalendar
function showEmptyingCalendar(menuNumber) {

  // start table
  let html = objEmptyingCalendar.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objEmptyingCalendar.showTableHeaderMenu('width:150px;background:#e0f0e0;', menuNumber, '2Slett', '3Ansvarlig', '4Dato', '5Restavfall', '6Papiravfall', '7Matavfall', '8Plastavfall', '9Juletre');

  if (objEmptyingCalendar.arrayEmptyingCalendar.length > 0) {
    objEmptyingCalendar.arrayEmptyingCalendar.forEach((emptyingCalendar) => {

      // Show menu
      menuNumber++;
      html += objEmptyingCalendar.insertTableColumns('', menuNumber);

      // Delete
      let selected = "Ugyldig verdi";
      if (emptyingCalendar.deleted === 'Y') selected = "Ja";
      if (emptyingCalendar.deleted === 'N') selected = "Nei";
      let className = `delete${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // condoId
      let condoId = emptyingCalendar.condoId;
      className = `condoId${emptyingCalendar.emptyingCalendarId}`;
      html += objCondo.showSelectedCondos(className, 'width:150px;', condoId, 'Velg leilighet', '', enableChanges);

      // date
      let date = emptyingCalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.inputTableColumn(className, 'width:150px;', date, 10, enableChanges);

      // residual waste  
      selected = "Ugyldig verdi";
      if (emptyingCalendar.residualWaste === 'Y') selected = "Ja";
      if (emptyingCalendar.residualWaste === 'N') selected = "Nei";
      className = `residualWaste${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // Paper waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.paper === 'Y') selected = "Ja";
      if (emptyingCalendar.paper === 'N') selected = "Nei";
      className = `paper${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // food waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.food === 'Y') selected = "Ja";
      if (emptyingCalendar.food === 'N') selected = "Nei";
      className = `food${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // plastic waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.plastic === 'Y') selected = "Ja";
      if (emptyingCalendar.plastic === 'N') selected = "Nei";
      className = `plastic${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja');

      // Christmas tree
      selected = "Ugyldig verdi";
      if (emptyingCalendar.christmasTree === 'Y') selected = "Ja";
      if (emptyingCalendar.christmasTree === 'N') selected = "Nei";
      className = `christmasTree${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')
      html += "</tr>";
    });
  }

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty table row for insertion
    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  };

  // Show the rest of the menu
  menuNumber++;
  html += objEmptyingCalendar.showRestMenu(menuNumber,  objEmptyingCalendar.accountMenu);

  // The end of the table
  html += objEmptyingCalendar.endTable();
  document.querySelector('.emptyingcalendar').innerHTML = html;

  return menuNumber;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // Show menu
  // insert table columns in start of a row
  html += objEmptyingCalendar.insertTableColumns('', menuNumber);

  // delete
  html += "<td class='center'>2Ny tømming</td>";

  // condoId
  let className = `condoId0`;
  html += objCondo.showSelectedCondos(className, 'width:150px;', 0, 'Velg leilighet', '', enableChanges);

  // date
  let date = 'dd.mm.åååå';
  className = `date0`;
  html += objEmptyingCalendar.inputTableColumn(className, 'width:150px;', date, 10, enableChanges);

  // Paper waste
  let selected = "Nei";
  className = `paper0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // residual waste  
  selected = "Nei";
  className = `residualWaste0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // food waste
  selected = "Nei";
  className = `food0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // plastic waste
  selected = "Nei";
  className = `plastic0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // Christmas tree
  selected = "Nei";
  className = `christmasTree0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  html += "</tr>";
  return html;
}

// Delete one emtyingcalendar row
async function deleteEmptyingCalendarRow(emptyingCalendarId, className) {

  // Check if emtyingcalendar row exist
  rowNumberEmptyingCalendar = objEmptyingCalendar.arrayEmptyingCalendar.findIndex(emtyingCalendar => emtyingCalendar.emtyingCalendarId === emtyingCalendarId);
  if (rowNumberEmptyingCalendar !== -1) {

    // delete emtyingcalendar row
    await objEmptyingCalendar.deleteEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  const month = Number(document.querySelector('.filterMonth').value);
  await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);
}

// Update a emptyingcalendar table row
async function updateEmptyingCalendarRow(emptyingCalendarId) {

  emptyingCalendarId = Number(emptyingCalendarId);

  // condoId
  className = `condoId${emptyingCalendarId}`;
  condoId = Number(document.querySelector(`.${className}`).value);
  const validCondoId = objCondo.validateNumber(className, condoId, 1, objCondo.nineNine, objCondo, '', 'Ugyldig leilighet');

  // date
  className = `date${emptyingCalendarId}`;
  let date = document.querySelector(`.${className}`).value;
  date = formatNorDateToNumber(date);
  const validDate = objEmptyingCalendar.validateNumber(className, date, 20100101, objEmptyingCalendar.nineNine, objEmptyingCalendar, '', 'Ugyldig dato');

  className = `paper${emptyingCalendarId}`;
  let paper = document.querySelector(`.${className}`).value;
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';
  className = `residualWaste${emptyingCalendarId}`;

  let residualWaste = document.querySelector(`.${className}`).value;
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  className = `food${emptyingCalendarId}`;
  let food = document.querySelector(`.${className}`).value;
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  className = `plastic${emptyingCalendarId}`;
  let plastic = document.querySelector(`.${className}`).value;
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  className = `christmasTree${emptyingCalendarId}`;
  let christmasTree = document.querySelector(`.${className}`).value;
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptyingcalendar columns
  if (validDate && validCondoId
    && ((paper === 'Y') || (paper === 'N'))
    && ((residualWaste === 'Y') || (residualWaste === 'N'))
    && ((food === 'Y') || (food === 'N'))
    && ((plastic === 'Y') || (plastic === 'N'))
    && ((christmasTree === 'N') || (christmasTree === 'Y'))) {

    document.querySelector('.message').style.display = "none";

    // Check if the emtyingcalendar id exist
    rowNumberEmptyingCalendar = objEmptyingCalendar.arrayEmptyingCalendar.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      // update the emtyingcalendar row
      await objEmptyingCalendar.updateEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);

    } else {

      // Insert the emtyingcalendar row in table
      await objEmptyingCalendar.insertEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
    }

    const year = Number(document.querySelector('.filterYear').value);
    const month = Number(document.querySelector('.filterMonth').value);
    await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);

    // Show emtyingcalendar
    showEmptyingCalendar(3);
  }
}