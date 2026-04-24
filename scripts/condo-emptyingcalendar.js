// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
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

      // Show horizonal menu
      let html = objEmptyingCalendar.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;
      let emptyingCalendarId = 0;
      await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, emptyingCalendarId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

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
    if (event.target.classList.contains('filterYear')) {

      await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId);

      // Show emtyingcalendar
      showEmptyingCalendar(3);
    };
  });

  // update a emptyingcalendar row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['date', 'paper', 'residualWaste', 'food', 'cristmasTree'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[4]))) {

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

        await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId);

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
  html += objEmptyingCalendar.showTableHeaderLogOut('width:206px;', '1', '2', '3', '4Avfallskalender', '5', '6');
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
  html += objEmptyingCalendar.showTableHeaderMenu('width:150px;', menuNumber, '2', '3År', '4', '5', '6', '7');

  // start table body
  html += objEmptyingCalendar.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objEmptyingCalendar.insertTableColumns('', menuNumber, '2');

  // Selected year
  const year = String(today.getFullYear());
  html += objEmptyingCalendar.showSelectedNumbers('filterYear', "width:150px;", 2020, 2030, year, true);

  html += "<td>4</td><td>5</td><td>6</td><td>7</td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objEmptyingCalendar.insertTableColumns('', menuNumber, '2', '3', '4', '5', '6', '7');

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
  html += objEmptyingCalendar.showTableHeaderMenu('width:150px;background:#e0f0e0;', menuNumber, '2Slett', '3Dato', '4Papir', '5Restavfall', '6Matavfall', '7Juletre');

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

      // date
      let date = emptyingCalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.inputTableColumn(className, 'width:150px;', date, 10, enableChanges);

      // Paper
      selected = "Ugyldig verdi";
      if (emptyingCalendar.paper === 'Y') selected = "Ja";
      if (emptyingCalendar.paper === 'N') selected = "Nei";
      className = `paper${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // residual waste  
      selected = "Ugyldig verdi";
      if (emptyingCalendar.residualWaste === 'Y') selected = "Ja";
      if (emptyingCalendar.residualWaste === 'N') selected = "Nei";
      className = `residualWaste${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

      // food 
      selected = "Ugyldig verdi";
      if (emptyingCalendar.food === 'Y') selected = "Ja";
      if (emptyingCalendar.food === 'N') selected = "Nei";
      className = `food${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

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
  html += objEmptyingCalendar.showRestMenu(menuNumber);

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

  // date
  let date = getCurrentDate();
  let className = `date0`;
  html += objEmptyingCalendar.inputTableColumn(className, 'width:150px;', date, 10, enableChanges);

  // Paper
  let selected = "Nei";
  className = `paper0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // residual waste  
  selected = "Nei";
  className = `residualWaste0`;
  html += objEmptyingCalendar.showSelectedValues(className, 'width:150px;', enableChanges, selected, 'Nei', 'Ja')

  // food 
  selected = "Nei";
  className = `food0`;
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

  await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId);
}

// Update a emptyingcalendar table row
async function updateEmptyingCalendarRow(emptyingCalendarId) {

  emptyingCalendarId = Number(emptyingCalendarId);

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

  className = `christmasTree${emptyingCalendarId}`;
  let christmasTree = document.querySelector(`.${className}`).value;
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptyingcalendar columns
  if (validDate || (paper === 'Y') || (paper === 'N')
    || (residualWaste === 'Y') || (residualWaste === 'N')
    || (food === 'Y') || (food === 'N') || (christmasTree === 'Y')
    || (christmasTree === 'N')) {

    document.querySelector('.message').style.display = "none";

    // Check if the emtyingcalendar id exist
    rowNumberEmptyingCalendar = objEmptyingCalendar.arrayEmptyingCalendar.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      // update the emtyingcalendar row
      await objEmptyingCalendar.updateEmptyingCalendarTable(objEmptyingCalendar.user, emptyingCalendarId);

    } else {

      // Insert the emtyingcalendar row in table
      await objEmptyingCalendar.insertEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.user, date, paper, residualWaste, food, christmasTree);
    }

    await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId);

    // Show emtyingcalendar
    showEmptyingCalendar(3);
  }
}