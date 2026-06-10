// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');
const objShowEmptyingCalendar = new ShowEmptyingCalendar('showemptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);

const columnWidths = [100, 175, 175, 175, 175, 175, 175];

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

      // Show main menu
      let html = objShowEmptyingCalendar.ShowHorizontalMenu(objShowEmptyingCalendar.arrayMainMenu);
      document.querySelector('.mainMenu').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      // Show header
      showHeader();

      // Show filter
      showFilter();

      const year = Number(document.querySelector('.filterYear').value);
      const month = Number(document.querySelector('.filterMonth').value);
      await objEmptyingCalendar.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month);

      // Show emtyingcalendar
      showEmptyingCalendar();

      // events for emptyingcalendar
      events();
    }
  } else {

    objShowEmptyingCalendar.showMessageNew(columnWidths, '', 'Server er ikke startet.');
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
  let html = objShowEmptyingCalendar.initializeTable(columnWidths);

  // start table body
  html += objShowEmptyingCalendar.startTableBody();

  // show main header
  html += objShowEmptyingCalendar.showTableHeaderLogOut('', '', '', 'Avfallskalender', '', '');
  html += "</tr>";

  // end table body
  html += objShowEmptyingCalendar.endTableBody();

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  let html = objShowEmptyingCalendar.initializeTable(columnWidths);

  // start table body
  html += objShowEmptyingCalendar.startTableBody();

  // Header filter (<tr></tr>)
  html += objShowEmptyingCalendar.showTableHeaderMenu(0, objShowEmptyingCalendar.accountMenu,    '',             'left','', '','', 'År', 'Måned',  '', '');
 
  // insert a table row (<tr></td>)
  html += objShowEmptyingCalendar.insertTableRow('', '1', '2', '3');

  // Selected year (<td></td>)
  const year = String(today.getFullYear());
  html += objShowEmptyingCalendar.showSelectedNumbers('filterYear','', 2020, 2030, year, true);

  // Selected month
  // Get current date in  European date format (dd.mm.yyyy)
  const date = getCurrentDate();
  let month = Number(date.split('.')[1]); // Extract the month part
  html += objShowEmptyingCalendar.showSelectedMonths('filterMonth','', month, true);

  html += "<td></td><td></td></tr>";

  // insert a table row (<tr></td>)
  html += objShowEmptyingCalendar.insertTableRow('',  '1', '2', '3', '4', '5', '6', '7');

  // end table body
  html += objShowEmptyingCalendar.endTableBody();

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.editFilter').innerHTML = html;
}

// Show emptyingCalendar
function showEmptyingCalendar() {

  // start table
  let html = objEmptyingCalendar.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objEmptyingCalendar.showTableHeaderMenu(0, objEmptyingCalendar.accountMenu, '#e0f0e0',           'center', 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre');

  if (objEmptyingCalendar.arrayEmptyingCalendars.length > 0) {
    objEmptyingCalendar.arrayEmptyingCalendars.forEach((emptyingCalendar) => {

      // Show menu
      html += objShowEmptyingCalendar.insertTableRow('');

      // condoId
      let condoId = emptyingCalendar.condoId;
      className = `condoId${emptyingCalendar.emptyingCalendarId}`;
      html += objCondo.showSelectedCondos(className,'', condoId, 'Velg leilighet', '', false);

      // date
      let date = emptyingCalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptyingCalendar.emptyingCalendarId}`;
      html += objShowEmptyingCalendar.editTableCell(className,  date, 10, false);

      // residual waste  
      className = `residualWaste${emptyingCalendar.emptyingCalendarId}`;
      html += '<td class="center underscore">';
      html += (emptyingCalendar.residualWaste === 'Y')
        ? `<i class="bi bi-trash-fill" style="color: black; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Paper waste
      className = `paper${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptyingCalendar.paper === 'Y')
        ? `<i class="bi bi-newspaper" style="color: blue; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // food waste
      className = `food${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptyingCalendar.food === 'Y')
        ? `<i class="bi bi-apple" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // plastic waste
      className = `plastic${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptyingCalendar.plastic === 'Y')
        ? `<i class="bi bi-recycle"style="color: greenyellow; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Christmas tree
      className = `christmasTree${emptyingCalendar.emptyingCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptyingCalendar.christmasTree === 'Y')
        ? `<i class="bi bi-tree-fill" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";
    });
  }

  // The end of the table
  html += objShowEmptyingCalendar.endTable();
  document.querySelector('.showemptyingcalendar').innerHTML = html;
}