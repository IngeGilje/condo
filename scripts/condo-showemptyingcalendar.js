// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');
const objShowEmptyingCalendar = new ShowEmptyingCalendar('showemptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);

const tableWidth = 'width:1230px;';

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
      let html = objShowEmptyingCalendar.showHorizontalMenu();
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

      // events for emptyingcalendar
      events();
    }
  } else {

    objShowEmptyingCalendar.showMessage(objEmptyingCalendar, '', 'Server er ikke startet.');
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
  let html = objShowEmptyingCalendar.startTable(tableWidth);

  // start table body
  html += objShowEmptyingCalendar.startTableBody();

  // show main header
  html += objShowEmptyingCalendar.showTableHeaderLogOut('width:206px;', '', '', '', 'Avfallskalender', '', '', '', '');
  html += "</tr>";

  // end table body
  html += objShowEmptyingCalendar.endTableBody();

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  let html = objShowEmptyingCalendar.startTable(tableWidth);

  // start table body
  html += objShowEmptyingCalendar.startTableBody();

  // Header filter
  menuNumber++;
  html += objShowEmptyingCalendar.showTableHeaderMenu('width:150px;', menuNumber, '', '', 'År', 'Måned', '', '', '', '');

  // insert table columns in start of a row
  menuNumber++;
  html += objShowEmptyingCalendar.insertTableColumns('', menuNumber, '', '');

  // Selected year
  const year = String(today.getFullYear());
  html += objShowEmptyingCalendar.showSelectedNumbers('filterYear', "width:150px;", 2020, 2030, year, true);

  // Selected month
  // Get current date in  European date format (dd.mm.yyyy)
  const date = getCurrentDate();
  let month = Number(date.split('.')[1]); // Extract the month part
  html += objShowEmptyingCalendar.showSelectedMonths('filterMonth', "width:150px;", month, true);

  html += "<td></td><td></td><td></td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objShowEmptyingCalendar.insertTableColumns("width:150px;", menuNumber, '', '', '', '', '', '', '');

  // end table body
  html += objShowEmptyingCalendar.endTableBody();

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show emptyingCalendar
function showEmptyingCalendar(menuNumber) {

  // start table
  let html = objEmptyingCalendar.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objEmptyingCalendar.showTableHeaderMenu('width:150px;background:#e0f0e0;', menuNumber, 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre');

  if (objEmptyingCalendar.arrayEmptyingCalendar.length > 0) {
    objEmptyingCalendar.arrayEmptyingCalendar.forEach((emptyingCalendar) => {

      // Show menu
      menuNumber++;
      html += objShowEmptyingCalendar.insertTableColumns('', menuNumber);

      // condoId
      let condoId = emptyingCalendar.condoId;
      className = `condoId${emptyingCalendar.emptyingCalendarId}`;
      html += objCondo.showSelectedCondos(className, 'width:150px;', condoId, 'Velg leilighet', '', false);

      // date
      let date = emptyingCalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptyingCalendar.emptyingCalendarId}`;
      html += objShowEmptyingCalendar.inputTableColumn(className, 'width:150px;', date, 10, false);

      // residual waste  
      className = `residualWaste${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center'>";
      html += (emptyingCalendar.residualWaste === 'Y')
        ? `<i class="bi bi-trash-fill" style="color: black; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Paper waste
      className = `paper${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center'>";
      html += (emptyingCalendar.paper === 'Y')
        ? `<i class="bi bi-newspaper" style="color: blue; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // food waste
      className = `food${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center'>";
      html += (emptyingCalendar.food === 'Y')
        ? `<i class="bi bi-apple" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // plastic waste
      className = `plastic${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center'>";
      html += (emptyingCalendar.plastic === 'Y')
        ? `<i class="bi bi-recycle"style="color: greenyellow; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Christmas tree
      className = `christmasTree${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center'>";
      html += (emptyingCalendar.christmasTree === 'Y')
        ? `<i class="bi bi-tree-fill" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";
    });
  }

  // Show the rest of the menu
  menuNumber++;
  html += objShowEmptyingCalendar.showRestMenu(menuNumber);

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.showemptyingcalendar').innerHTML = html;

  return menuNumber;
}