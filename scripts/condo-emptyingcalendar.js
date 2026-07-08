// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendars = new EmptyingCalendars('emptyingcalendars');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramEmptyingCalendarId = Number(queryParameters.get("emptyingCalendarId"));
const paramYear = Number(queryParameters.get("year"));
const paramMonth = Number(queryParameters.get("month"));

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
      let html = showHorizontalMenu(objEmptyingCalendar.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show menu for empty calendar 
      html = showHorizontalMenu(objEmptyingCalendar.arrayMenuEmptyingCalendar);
      document.querySelector('.menuEmptyingCalendar').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      // Show main menu
      html = showHorizontalMenu(objEmptyingCalendar.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show filter
      const year = (paramYear === 0)
        ? Number(getCurrentISODate().slice(0, 4))
        : Number(paramYear);

      const month = (paramMonth === 0)
        ? Number(getCurrentISODate().slice(5, 7))
        : Number(paramMonth);

      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);

      // Show emtyingcalendar
      const emptyingCalendarId = (paramEmptyingCalendarId === 0)
        ? objEmptyingCalendars.arrayEmptyingCalendars[0]?.emptyingCalendarId ?? 0
        : paramEmptyingCalendarId;

      const date = getEmptyingCalendarDate(emptyingCalendarId)
      showFilter(date);

      //emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars[0]?.emptyingCalendarId ?? 0;
      showEmptyingCalendar(emptyingCalendarId);

      // Events
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
    if (event.target.classList.contains('filterDate')) {

      let date = Number(document.querySelector('.filterDate').value);
      const emptyingCalendarId = getEmptyingCalendarId(date);

      const year = Number(String(date).slice(0, 4));
      const month = Number(String(date).slice(4, 6));

      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);

      // Show emtyingcalendar
      showEmptyingCalendar(emptyingCalendarId);
    };
  });

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterDate')) {

      debugger;
      const date = Number(document.querySelector('.filterDate').value);
      const emptyingCalendarId = getEmptyingCalendarId(date);
      showEmptyingCalendar(emptyingCalendarId);
    };
  });

  // return to emptyingcalendars
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objEmptyingCalendars.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-emptyingCalendars.html?emptyingCalendarsId=${paramEmptyingCalendarId}&year=${paramYear}&month=${paramMonth}`;
      window.location.href = URL;
    };
  });

  // update/insert a emptyingcalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a emptyingcalendars row
      let date = document.querySelector('.emptyingCalendarDate').value;
      date = formatISODateToNumber(date);
      const emptyingCalendarId = getEmptyingCalendarId(date);
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
        await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);

        // Show emtyingcalendar
        showEmptyingCalendar(emptyingCalendarId);
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

// Show filter
function showFilter(date) {

  // Start frame
  let html = startFrame();

  // Show date
  html += objEmptyingCalendars.showSelectedEmptyCalendarsNew('Tømmedato', 'filterDate', '', date, 'Velg Dato', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show emptyingCalendar
function showEmptyingCalendar(emptyingCalendarId) {

  /*
  // start table
  let html = objEmptyingCalendar.initializeTable(columnWidths);

  // Table header (<tr></tr>)

  html += objEmptyingCalendar.showTableHeaderMenu('#e0f0e0', 'center', 'Ansvarlig', 'Dato', 'Restavfall', 'Papiravfall', 'Matavfall', 'Plastavfall', 'Juletre', 'Slett',);

  if (objEmptyingCalendars.arrayEmptyingCalendars.length > 0) {objEmptyingCalendars.arrayEmptyingCalendars.forEach((emptyingCalendar) => {

      // Show menu
      html += objEmptyingCalendar.insertTableRow('');

      // condoId
      let condoId = emptyingCalendar.condoId;
      let className = `condoId${emptyingCalendar.emptyingCalendarId}`;
      html += objCondo.showSelectedCondos(className, '', condoId, 'Velg ansvarlig', '', enableChanges);

      // date
      let date = emptyingCalendar.date;
      date = formatNumberToNorDate(date);
      className = `date${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.editTableCell(className, date, 10, enableChanges);

      // residual waste  
      selected = "Ugyldig verdi";
      if (emptyingCalendar.residualWaste === 'Y') selected = "Ja";
      if (emptyingCalendar.residualWaste === 'N') selected = "Nei";
      className = `residualWaste${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')

      // Paper waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.paper === 'Y') selected = "Ja";
      if (emptyingCalendar.paper === 'N') selected = "Nei";
      className = `paper${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')

      // food waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.food === 'Y') selected = "Ja";
      if (emptyingCalendar.food === 'N') selected = "Nei";
      className = `food${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')

      // plastic waste
      selected = "Ugyldig verdi";
      if (emptyingCalendar.plastic === 'Y') selected = "Ja";
      if (emptyingCalendar.plastic === 'N') selected = "Nei";
      className = `plastic${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja');

      // Christmas tree
      selected = "Ugyldig verdi";
      if (emptyingCalendar.christmasTree === 'Y') selected = "Ja";
      if (emptyingCalendar.christmasTree === 'N') selected = "Nei";
      className = `christmasTree${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')

      // Delete
      className = `delete${emptyingCalendar.emptyingCalendarId}`;
      html += objEmptyingCalendar.showButton(className, 'Slett');
      html += "</tr>";
    });
  }

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty table row for insertion
    html += insertEmptyTableRow();
  };

  // The end of the table
  html += objEmptyingCalendar.endTable();
  document.querySelector('.showEmptyCalendar').innerHTML = html;
*/

  // row number emptyingcalendar array
  const rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);

  // Empty line
  let html = emptyLine();

  // userId
  html += startLine();
  const condoId = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('Ansvarlig', 'condoId', '', condoId, 'Velg ansvarlig', '', true);

  // date
  let emptyingCalendarDate = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.date ?? 0;
  emptyingCalendarDate = formatNumberToISODate(emptyingCalendarDate);
  html += showDate('Dato', 'emptyingCalendarDate', emptyingCalendarDate, enableChanges);
  html += "</div>";

  // residual waste 
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].residualWaste === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].residualWaste === 'N') selected = "Nei";
  className = 'residualWaste';
  html += showSelectedValuesNew('Restavfall', className, '', enableChanges, selected, 'Nei', 'Ja');

  // Paper waste
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].paper === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].paper === 'N') selected = "Nei";
  className = 'paper';
  html += showSelectedValuesNew('Papiravfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += "</div>";

  // food waste
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].food === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].food === 'N') selected = "Nei";
  className = 'food';
  html += showSelectedValuesNew('Matavfall', className, '', enableChanges, selected, 'Nei', 'Ja');

  // plastic waste
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].plastic === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].plastic === 'N') selected = "Nei";
  className = 'plastic';
  html += showSelectedValuesNew('Plastavfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += "</div>";

  // Christmas tree
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].christmasTree === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].christmasTree === 'N') selected = "Nei";
  className = 'christmasTree';
  html += showSelectedValuesNew('Juletre', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  if (paramEmptyingCalendarId !== 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  // Show empty calendar
  document.querySelector('.showEmptyCalendar').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterDate', false, 'white');
  }
}

// Delete one emtyingcalendar row
async function deleteEmptyingCalendarRow(emptyingCalendarId, className) {

  // Check if emtyingcalendar row exist
  rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emtyingCalendar => emtyingCalendar.emtyingCalendarId === emtyingCalendarId);
  if (rowNumberEmptyingCalendar !== -1) {

    // delete emtyingcalendar row
    await objEmptyingCalendar.deleteEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user);
  }

  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);
}

// Update a emptyingcalendar table row
async function updateEmptyingCalendarRow(emptyingCalendarId) {

  emptyingCalendarId = Number(emptyingCalendarId);

  // condoId
  className = 'condoId';
  condoId = Number(document.querySelector(`.${className}`).value);
  const validCondoId = validateInterval(className, '', 'Ugyldig ansvarlig', true, condoId, 1, objCondo.nineNine);

  // date
  debugger;
  className = 'emptyingCalendarDate';
  let date = document.querySelector(`.${className}`).value;
  let validDate = validateISODate(className, date, '', 'Ugyldig Dato');
  date = formatISODateToNumber(date);

  // Check for unique date
  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId,objEmptyingCalendar.nineNine, objEmptyingCalendar.nineNine,objEmptyingCalendar.nineNine);
  if (objEmptyingCalendars.arrayEmptyingCalendars.lenght !== 0) validDate = false;
  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);

  className = 'residualWaste';
  let residualWaste = document.querySelector(`.${className}`).value;
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  className = `paper`;
  let paper = document.querySelector(`.${className}`).value;
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';

  className = `food`;
  let food = document.querySelector(`.${className}`).value;
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  className = `plastic`;
  let plastic = document.querySelector(`.${className}`).value;
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  className = `christmasTree`;
  let christmasTree = document.querySelector(`.${className}`).value;
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptyingcalendar columns
  if (validCondoId && validDate
    && ((paper === 'Y') || (paper === 'N'))
    && ((residualWaste === 'Y') || (residualWaste === 'N'))
    && ((food === 'Y') || (food === 'N'))
    && ((plastic === 'Y') || (plastic === 'N'))
    && ((christmasTree === 'N') || (christmasTree === 'Y'))) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the emtyingcalendar id exist
    rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      // update the emtyingcalendar row
      debugger;
      await objEmptyingCalendars.updateEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);

      // get emptying calendar date
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine, objEmptyingCalendar.nineNine,objEmptyingCalendar.nineNine);
      date = getEmptyingCalendarDate(emptyingCalendarId);
      const year = Number(getCurrentISODate().slice(0, 4));
      const month = Number(getCurrentISODate().slice(5, 7));
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);

    } else {

      // Insert the emtyingcalendar row
      debugger;
      await objEmptyingCalendars.insertEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
      date = getEmptyingCalendarDate(emptyingCalendarId);
      const year = Number(getCurrentISODate().slice(0, 4));
      const month = Number(getCurrentISODate().slice(5, 7));
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, year, month,objEmptyingCalendar.nineNine);
    }

    // Show emtyingcalendar
    showEmptyingCalendar(emptyingCalendarId);
  }
}

// get emptying calendar date
function getEmptyingCalendarDate(emptyingCalendarId) {

  let date = 0;
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.emptyingCalendarId === emptyingCalendarId) date = emptyingCalendar.date;
  });

  return date;
}

// get emptying calendar Id
function getEmptyingCalendarId(date) {

  let emptyingCalendarId = 0;
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.date === date) emptyingCalendarId = emptyingCalendar.emptyingCalendarId;
  });

  return emptyingCalendarId;
}