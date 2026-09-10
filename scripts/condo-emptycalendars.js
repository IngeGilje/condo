// maintenance of empty calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyCalendars = new EmptyCalendars("emptycalendars");

const enableChanges = (objEmptyCalendars.securityLevel > 5);
const applicationName = "condo-emptycalendars";

const columnWidths = [100, 100, 50, 50, 50, 50,50, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramEmptyCalendarId = Number(queryParameters.get("emptyCalendarId"));
const paramDate = Number(queryParameters.get("date"));

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

      // Show vertical menu
      let html = objEmptyCalendars.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyCalendars.condominiumId, objEmptyCalendars.nineNine);

      // Show filter
      calendarDate = getCurrentDate();
      const year = String(calendarDate).slice(6, 10);
      const month = String(calendarDate).slice(3, 5);

      const orderBy = "date ASC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);
      showFilter(Number(year), Number(month));

      // Show emtyingcalendars
      showEmptyCalendars(month);

      // events for emptycalendar
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      const orderBy = "date ASC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

      // Show emtyingcalendar
      showEmptyCalendars(month);
    };
  });

  // change empty calendar
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {
      const arrayPrefixes = ['change'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objEmptyCalendars.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let emptyCalendarId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        emptyCalendarId = Number(className.slice(prefix.length));
      }

      className = `date${emptyCalendarId}`
      let date = document.querySelector(`.${className}`).value;
      date = formatNorDateToNumber(date);
      let URL = (objEmptyCalendars.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-emptycalendar.html?emptyCalendarId=${emptyCalendarId}&date=${date}`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(year, month) {

  /*
  // Start frame
  let html = startFrame('filter-frame');

  // Show years
  html += inputSelectedNumbers('År', 'filterYear',  2020, 2030, year, true);

  // Show selected months
  html += showSelectedMonthsNew('Måned', 'filterMonth', '', month, true);

  // End filter
  html += "</div>";

  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame","Filter");
  */

  // Start filter
  let html = startFilter("Tømmekalender");

  // Show years
  //html += inputSelectedNumbers('År', 'filterYear',  2020, 2030, year, true);
  html += inputSelectedNumbers('filterYear','År',  2020, 2030, year, true);

  // Show months
  html += showSelectedMonthsNew('filterMonth', 'Måned', month, true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// show emptycalendars
function showEmptyCalendars(month) {

  // Show emptyingcalenders
  const year = Number(document.querySelector('.filterYear').value);
  month = Number(document.querySelector('.filterMonth').value);
  const text = findNameOfMonth(month) + " " +String(year);
  let html = startTable("Tømmeplan",text);
  
  html += tableHeader(columnWidths, "Ansvarlig", "Dato", "Restavfall", "Papiravfall", "Matavfall", "Plastavfall","Juletre"," ");

  if (Number(document.querySelector('.filterMonth').value) < 10) month = "0" + month;
  const fromDate = Number(document.querySelector('.filterYear').value + month + "01");
  const toDate = Number(document.querySelector('.filterYear').value + month + "31");
  if (objEmptyCalendars.arrayEmptyCalendars.length > 0) {
    objEmptyCalendars.arrayEmptyCalendars.forEach((emptycalendar) => {

      if (emptycalendar.date >= fromDate && emptycalendar.date <= toDate) {

        // New table row
        html += `
          <tr>
        `;

        // condoId 1
        const condoName = objCondo.getCondoNameById(emptycalendar.condoId);
        html += showTableText("condoId22", condoName);
        
        // date 2
        let date = emptycalendar.date;
        date = formatNumberToNorDate(date);
        className = `date${emptycalendar.emptyCalendarId}`;
        html += showTableText(className, date);

        // residual waste 3
        className = `residualWaste${emptycalendar.emptyCalendarId}`;
        html += (emptycalendar.residualWaste === 'Y')
          ? showTableIcon("bi bi-trash-fill", "black")
          : `<td></td>`;

        // Paper waste 4
        className = `paper${emptycalendar.emptyCalendarId}`;
        html += (emptycalendar.paper === 'Y')
          ? showTableIcon("bi bi-newspaper", "blue")
          : `<td></td>`;

        // food waste 5
        className = `food${emptycalendar.emptyCalendarId}`;
        html += (emptycalendar.food === 'Y')
          ? showTableIcon("bi bi-apple", "green")
          : `<td></td>`;

        // plastic waste 6
        className = `plastic${emptycalendar.emptyCalendarId}`;
        html += (emptycalendar.plastic === 'Y')
          ? showTableIcon("bi-recycle", "greenyellow")
          : `<td></td>`;

        // Christmas tree 7
        className = `christmasTree${emptycalendar.emptyCalendarId}`;
        html += (emptycalendar.christmasTree === 'Y')
          ? showTableIcon("bi bi-tree-fill", "green")
          : `<td></td>`;

        // Change emptycalenders 8
        className = `change${emptycalendar.emptyCalendarId}`;
        html += showTableButton(className, 'Rediger');
        html += `
          </tr>
        `;
      }
    });
  }

  html += endTable();
  document.querySelector('.showEmptyCalendars').innerHTML = html;
}
