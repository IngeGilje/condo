// maintenance of empty calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendar = new scripts/condo-emptycalendar.js('emptycalendar');
const objshowemptycalendar = new showemptycalendar('showemptycalendar');

const enableChanges = (objEmptyCalendars.securityLevel > 5);

const columnWidths = [100, 100, 100, 100, 100, 100, 100];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objEmptyCalendars.condominiumId === 0) || (objEmptyCalendars.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objshowemptycalendar.showHorizontalMenu(objshowemptycalendar.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show menu for empty calendar 
      html = objEmptyCalendars.showHorizontalMenu(objEmptyCalendars.arrayMenuEmptyCalendar);
      document.querySelector('.menuEmptyCalendar').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyCalendars.condominiumId, objEmptyCalendars.nineNine);

      // Show header
      showHeader();

      // Show filter
      showFilter();

      const year = Number(document.querySelector('.filterYear').value);
      const month = Number(document.querySelector('.filterMonth').value);
      await objEmptyCalendars.loadEmptyingCalendarTable(objEmptyCalendars.condominiumId, year, month);

      // Show emtyingcalendar
      showEmptyCalendar();

      // events for emptycalendar
      events();
    }
  } else {

    showMessageNew( 'Server er ikke startet.');
  }
}

// Events for emptycalendar
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterMonth')) {

      const year = Number(document.querySelector('.filterYear').value);
      const month = Number(document.querySelector('.filterMonth').value);
      await objEmptyCalendars.loadEmptyingCalendarTable(objEmptyCalendars.condominiumId, year, month);

      // Show emtyingcalendar
      showEmptyCalendar(3);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objEmptyCalendars.serverStatus === 1)
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
  let html = objshowemptycalendar.initializeTable(columnWidths);

  // start table body
  html += objshowemptycalendar.startTableBody();

  // show main header
  html += objshowemptycalendar.showTableHeaderLogOut('', '', '', 'Avfall', '', '');
  html += "</tr>";

  // end table body
  html += objshowemptycalendar.endTableBody();

  // The end of the table
  html += objshowemptycalendar.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

    // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show years
  const year = String(today.getFullYear());
  html += inputSelectedNumbers('filterYear','År',  2020, 2030, Number(year), true);

  // Show selected months
  const date = getCurrentDate();
  let month = Number(date.split('.')[1]); // Extract the month part
  html += objshowemptycalendar.showSelectedMonthsNew('Måned', 'filterMonth', month, true);

  html += "</div>";

  // End filter
  html += "</div>";

  document.querySelector(".showFilter").innerHTML = html;
}

// show EmptyCalendar
function showEmptyCalendar() {

  // start table
  let html = objEmptyCalendars.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objEmptyCalendars.showTableHeaderMenu('#e0f0e0', 'center', 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre');

  if (objEmptyCalendars.arrayEmptyCalendars.length > 0) {
    objEmptyCalendars.arrayEmptyCalendars.forEach((emptycalendar) => {

      // Show menu
      html += objshowemptycalendar.insertTableRow('');

      // condoId
      let condoId = emptycalendar.condoId;
      className = `condoId${emptycalendar.emptyCalendarId}`;
      html += objCondo.showSelectedCondos(className, '', condoId, 'Velg leilighet', '', false);

      // date
      let date = emptycalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptycalendar.emptyCalendarId}`;
      html += objshowemptycalendar.editTableCell(className, date, 10, false);

      // residual waste  
      className = `residualWaste${emptycalendar.emptyCalendarId}`;
      html += '<td class="center underscore">';
      html += (emptycalendar.residualWaste === 'Y')
        ? `<i class="bi bi-trash-fill" style="color: black; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Paper waste
      className = `paper${emptycalendar.emptyCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptycalendar.paper === 'Y')
        ? `<i class="bi bi-newspaper" style="color: blue; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // food waste
      className = `food${emptycalendar.emptyCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptycalendar.food === 'Y')
        ? `<i class="bi bi-apple" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // plastic waste
      className = `plastic${emptycalendar.emptyCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptycalendar.plastic === 'Y')
        ? `<i class="bi bi-recycle"style="color: greenyellow; font-size: 29px;"></i>`
        : ``;
      html += "</td>";

      // Christmas tree
      className = `christmasTree${emptycalendar.emptyCalendarId}`;
      html += "<td class='center underscore'>";
      html += (emptycalendar.christmasTree === 'Y')
        ? `<i class="bi bi-tree-fill" style="color: green; font-size: 29px;"></i>`
        : ``;
      html += "</td>";
    });
  }

  // The end of the table
  html += objshowemptycalendar.endTable();
  document.querySelector('.showemptycalendar').innerHTML = html;
}