// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendars = new EmptyingCalendars('emptyingcalendars');

const enableChanges = (objEmptyingCalendars.securityLevel > 5);
const applicationName = "condo-emptyingcalendars";

const columnWidths = [100, 100, 100, 100, 100, 100, 100, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramEmptyingCalendarId = Number(queryParameters.get("emptyingCalendarId"));
const paramDate = Number(queryParameters.get("date"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objEmptyingCalendars.condominiumId === 0) || (objEmptyingCalendars.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objEmptyingCalendars.showHorizontalMenu(objEmptyingCalendars.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show menu for empty calendar 
      html = objEmptyingCalendars.showHorizontalMenu(objEmptyingCalendars.arrayMenuEmptyingCalendar);
      document.querySelector('.menuEmptyingCalendar').innerHTML = html;
      objEmptyingCalendars.markActivatedApplication(objEmptyingCalendars.arrayMenuEmptyingCalendar, applicationName);

      await objCondo.loadCondoTable(objEmptyingCalendars.condominiumId, objEmptyingCalendars.nineNine);

      // Show filter
      calendarDate = getCurrentDate();
      const year = String(calendarDate).slice(6, 10);
      const month = String(calendarDate).slice(3, 5);
      const fromDate = Number(year + month + "01");
      const toDate = Number(year + month + "31");

      const orderBy = "date ASC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendars.condominiumId, orderBy, fromDate, toDate);
      showFilter(Number(year), Number(month));

      // Show emtyingcalendars
      showEmptyingCalendars(year, month);

      // events for emptyingcalendar
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      const orderBy = "date ASC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendars.condominiumId, orderBy, fromDate, toDate);

      // Show emtyingcalendar
      showEmptyingCalendars(year, month);
    };
  });

  // change emptying calendar
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {
      const arrayPrefixes = ['change'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objEmptyingCalendars.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let emptyingCalendarId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        emptyingCalendarId = Number(className.slice(prefix.length));
      }

      className = `date${emptyingCalendarId}`
      let date = document.querySelector(`.${className}`).value;
      date = formatNorDateToNumber(date);
      let URL = (objEmptyingCalendars.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-emptyingcalendar.html?emptyingCalendarId=${emptyingCalendarId}&date=${date}`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(year, month) {

  // Start frame
  let html = startFrame();

  // Show years
  html += showSelectedNumbersNew('År', 'filterYear', '', 2020, 2030, year, true);

  // Show selected months
  html += showSelectedMonthsNew('Måned', 'filterMonth', '', month, true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show emptyingCalendars
function showEmptyingCalendars(year, month) {

  // start table
  let html = objEmptyingCalendars.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objEmptyingCalendars.showTableHeader('center', 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre', '');

  if (Number(document.querySelector('.filterMonth')) < 10) month = "0" + month;
  const fromDate = Number(document.querySelector('.filterYear').value + month + "01");
  const toDate = Number(document.querySelector('.filterYear').value + month + "31");
  if (objEmptyingCalendars.arrayEmptyingCalendars.length > 0) {
    objEmptyingCalendars.arrayEmptyingCalendars.forEach((emptyingCalendar) => {

      if (emptyingCalendar.date >= fromDate && emptyingCalendar.date <= toDate) {

        // Show menu
        html += objEmptyingCalendars.insertTableRow('');

        // condoId
        let condoId = emptyingCalendar.condoId;
        className = `condoId${emptyingCalendar.emptyingCalendarId}`;
        html += objCondo.showSelectedCondos(className, '', condoId, 'Velg leilighet', '', false);

        // date
        let date = emptyingCalendar.date;
        date = formatNumberToNorDate(date);
        className = `date${emptyingCalendar.emptyingCalendarId}`;
        html += editTableCell(className, date, 10, false);

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

        // Change emptycalenders
        className = `change${emptyingCalendar.emptyingCalendarId}`;
        html += objEmptyingCalendars.showButton(className, 'Endre');

        html += "</td>";
      }
    });
  }

  // The end of the table
  html += objEmptyingCalendars.endTable();
  document.querySelector('.showEmptyingCalendars').innerHTML = html;
}