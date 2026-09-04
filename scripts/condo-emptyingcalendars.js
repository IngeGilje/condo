// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendars = new EmptyingCalendars('emptyingcalendars');

const enableChanges = (objEmptyingCalendars.securityLevel > 5);
const applicationName = "condo-emptyingcalendars";

const columnWidths = [100, 100, 50, 50, 50, 50,50, 100];

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

      // Show vertical menu
      let html = objEmptyingCalendars.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyingCalendars.condominiumId, objEmptyingCalendars.nineNine);

      // Show filter
      calendarDate = getCurrentDate();
      const year = String(calendarDate).slice(6, 10);
      const month = String(calendarDate).slice(3, 5);

      const orderBy = "date ASC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendars.condominiumId, orderBy);
      showFilter(Number(year), Number(month));

      // Show emtyingcalendars
      showEmptyingCalendars(month);

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
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendars.condominiumId, orderBy);

      // Show emtyingcalendar
      showEmptyingCalendars(month);
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

  /*
  // Start frame
  let html = startFrame('filter-frame');

  // Show years
  html += showSelectedNumbersNew('År', 'filterYear',  2020, 2030, year, true);

  // Show selected months
  html += showSelectedMonthsNew('Måned', 'filterMonth', '', month, true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
  */

  // Start filter frame
  let html = startFilterFrame("Tømmekalender");

  // Show years
  //html += showSelectedNumbersNew('År', 'filterYear',  2020, 2030, year, true);
  html += showSelectedNumbersNew('År', 'filterYear', 2020, 2030, year, true);

  // Show months
  html += showSelectedMonthsNew('Måned', 'filterMonth', month, true);

  // End filter frame
  html += endFilterFrame();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show emptyingCalendars
function showEmptyingCalendars(month) {

  /*
  // start table
  let html = objEmptyingCalendars.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objEmptyingCalendars.showTableHeader('center', 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre', '');

  if (Number(document.querySelector('.filterMonth')) < 10) month = "0" + month;
  const fromDate = Number(document.querySelector('.filterYear').value + month + "01");
  const toDate = Number(document.querySelector('.filterYear').value + month + "31");
  if (objEmptyingCalendars.arrayEmptyingCalendars.length > 0) {
    objEmptyingCalendars.arrayEmptyingCalendars.forEach((emptyingcalendar) => {

      if (emptyingcalendar.date >= fromDate && emptyingcalendar.date <= toDate) {

        html += objEmptyingCalendars.insertTableRow('');

        // condoId
        let condoId = emptyingcalendar.condoId;
        className = `condoId${emptyingcalendar.emptyingCalendarId}`;
        html += objCondo.showSelectedCondos(className, '', condoId, 'Velg leilighet', '', false);

        // date
        let date = emptyingcalendar.date;
        date = formatNumberToNorDate(date);
        className = `date${emptyingcalendar.emptyingCalendarId}`;
        html += editTableCell(className, date, 10, false);
        //html += inputDate(className, "Dato", date, false);

        // residual waste  
        className = `residualWaste${emptyingcalendar.emptyingCalendarId}`;

        html += '<td class="center underscore">';
        html += (emptyingcalendar.residualWaste === 'Y')
          ? `<i class="bi bi-trash-fill" style="color: black; font-size: 29px;"></i>`
          : ``;
        html += "</td>";

        // Paper waste
        className = `paper${emptyingcalendar.emptyingCalendarId}`;
        html += "<td class='center underscore'>";
        html += (emptyingcalendar.paper === 'Y')
          ? `<i class="bi bi-newspaper" style="color: blue; font-size: 29px;"></i>`
          : ``;
        html += "</td>";

        // food waste
        className = `food${emptyingcalendar.emptyingCalendarId}`;
        html += "<td class='center underscore'>";
        html += (emptyingcalendar.food === 'Y')
          ? `<i class="bi bi-apple" style="color: green; font-size: 29px;"></i>`
          : ``;
        html += "</td>";

        // plastic waste
        className = `plastic${emptyingcalendar.emptyingCalendarId}`;
        html += "<td class='center underscore'>";
        html += (emptyingcalendar.plastic === 'Y')
          ? `<i class="bi bi-recycle"style="color: greenyellow; font-size: 29px;"></i>`
          : ``;
        html += "</td>";

        // Christmas tree
        className = `christmasTree${emptyingcalendar.emptyingCalendarId}`;
        html += "<td class='center underscore'>";
        html += (emptyingcalendar.christmasTree === 'Y')
          ? `<i class="bi bi-tree-fill" style="color: green; font-size: 29px;"></i>`
          : ``;

        // Change emptycalenders
        className = `change${emptyingcalendar.emptyingCalendarId}`;
        html += objEmptyingCalendars.showButton(className, 'Rediger');

        html += "</td>";
      }
    });
  }

  // The end of the table
  html += objEmptyingCalendars.endTable();
  */

  // Show emptyingcalenders
  const year = Number(document.querySelector('.filterYear').value);
  month = Number(document.querySelector('.filterMonth').value);
  let html = startTable(year, month, "Tømmeplan");
  
  html += tableHeader(columnWidths, "Ansvarlig", "Dato", "Restavfall", "Papiravfall", "Matavfall", "Plastavfall","Juletre"," ");

  if (Number(document.querySelector('.filterMonth').value) < 10) month = "0" + month;
  const fromDate = Number(document.querySelector('.filterYear').value + month + "01");
  const toDate = Number(document.querySelector('.filterYear').value + month + "31");
  if (objEmptyingCalendars.arrayEmptyingCalendars.length > 0) {
    objEmptyingCalendars.arrayEmptyingCalendars.forEach((emptyingcalendar) => {

      if (emptyingcalendar.date >= fromDate && emptyingcalendar.date <= toDate) {

        // New table row
        html += `
          <tr>
        `;

        // condoId 1
        const condoName = objCondo.getCondoNameById(emptyingcalendar.condoId);
        html += inputTableText("condoId22", condoName, false);
        
        // date 2
        let date = emptyingcalendar.date;
        date = formatNumberToNorDate(date);
        className = `date${emptyingcalendar.emptyingCalendarId}`;
        html += inputTableText(className, date, false);

        // residual waste 3
        className = `residualWaste${emptyingcalendar.emptyingCalendarId}`;
        html += (emptyingcalendar.residualWaste === 'Y')
          ? showTableIcon("bi bi-trash-fill", "black")
          : `<td></td>`;

        // Paper waste 4
        className = `paper${emptyingcalendar.emptyingCalendarId}`;
        html += (emptyingcalendar.paper === 'Y')
          ? showTableIcon("bi bi-newspaper", "blue")
          : `<td></td>`;

        // food waste 5
        className = `food${emptyingcalendar.emptyingCalendarId}`;
        html += (emptyingcalendar.food === 'Y')
          ? showTableIcon("bi bi-apple", "green")
          : `<td></td>`;

        // plastic waste 6
        className = `plastic${emptyingcalendar.emptyingCalendarId}`;
        html += (emptyingcalendar.plastic === 'Y')
          ? showTableIcon("bi-recycle", "greenyellow")
          : `<td></td>`;

        // Christmas tree 7
        className = `christmasTree${emptyingcalendar.emptyingCalendarId}`;
        html += (emptyingcalendar.christmasTree === 'Y')
          ? showTableIcon("bi bi-tree-fill", "green")
          : `<td></td>`;

        // Change emptycalenders 8
        className = `change${emptyingcalendar.emptyingCalendarId}`;
        html += showTableButton(className, 'Rediger');
        html += `
          </tr>
        `;
      }
    });
  }

  html += endTable();
  document.querySelector('.showEmptyingCalendars').innerHTML = html;
}
