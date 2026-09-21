// maintenance of empty calendar

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objEmptyCalendars = new EmptyCalendars("emptycalendars");

const enableChanges = (objEmptyCalendars.securityLevel > 5);
const applicationName = "condo-emptycalendar";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramemptyCalendarId = Number(queryParameters.get("emptyCalendarId"));
const paramYear = Number(queryParameters.get("year"));
const paramMonth = Number(queryParameters.get("month"));
const paramBackApplication = queryParameters.get("backApplication");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objEmptyCalendars.condominiumId === 0) || (objEmptyCalendars.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objEmptyCalendars.showMenu(objEmptyCalendars.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyCalendars.condominiumId, objEmptyCalendars.nineNine);

      // Show filter
      let emptyCalendarId = 0;
      if (paramemptyCalendarId) {

        emptyCalendarId = paramemptyCalendarId;
      } else {

        // Last emptycalendars row
        await objEmptyCalendars.getHighestEmptyCalendarId(objEmptyCalendars.condominiumId);
        emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[0]?.emptyCalendarId ?? 0;
      }

      const orderBy = "date DESC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

      showFilter(emptyCalendarId);

      // Show empty calendar
      showEmptyCalendar(emptyCalendarId);

      // Events
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
    if (event.target.classList.contains('filterEmptyCalendarId')) {

      const emptyCalendarId = Number(document.querySelector('.filterEmptyCalendarId').value);
      //const rowNumberEmptyCalendars = objEmptyCalendars.arrayEmptyCalendars.findIndex((emptycalendar) => emptycalendar.date === date);
      //const emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendars]?.emptyCalendarId ?? 0;
      //const emptyCalendarId = getemptyCalendarId(date);
      showEmptyCalendar(emptyCalendarId);
    };
  });

  // insert a new news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Insert new news row
      resetValues();
    };
  });

  // return to emptycalendars
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objEmptyCalendars.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-showemptycalendars.html?emptyingCalendarsId=${paramemptyCalendarId}&year=${paramYear}&month=${paramMonth}`;
      window.location.href = URL;
    }
  })

  // update a emptycalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const emptyCalendarId = Number(document.querySelector('.filterEmptyCalendarId').value);
      updateEmptyingCalendarRow(emptyCalendarId);
    };
  });

  // Delete emptycalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const emptyCalendarId = Number(document.querySelector('.filterEmptyCalendarId').value)
      await deleteEmptyCalendarsRow(emptyCalendarId);
    };
  });
}

// Show filter
function showFilter(emptyCalendarId) {

  // Start filter
  let html = startGridFilter("Tømmekalender");

  // Show date
  html += objEmptyCalendars.showSelectedEmptyCalendarsNew('filterEmptyCalendarId', 'Tømmedato', emptyCalendarId, 'Velg Dato', '', true);

  // End filter
  html += endGridFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// show EmptyCalendar
function showEmptyCalendar(emptyCalendarId) {

  // row number emptycalendar array
  const rowNumberEmptyCalendar = objEmptyCalendars.arrayEmptyCalendars.findIndex(emptycalendar => emptycalendar.emptyCalendarId === emptyCalendarId);

  let html = startGrid('Tømmekalender');

  // date
  let emptyingCalendarDate = objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar]?.date ?? 0;
  emptyingCalendarDate = formatNumberToISODate(emptyingCalendarDate);
  html += inputDate('emptyingCalendarDate', 'Dato', emptyingCalendarDate, enableChanges);

  // condo
  const condoId = objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('condoId', 'Ansvarlig', condoId, 'Velg ansvarlig', '', true);
  //html += "<div></div>";

  // residual waste 
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].residualWaste === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].residualWaste === 'N') selected = "Nei";
  html += inputValues('Restavfall', 'residualWaste', enableChanges, selected, 'Nei', 'Ja');

  // Paper waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].paper === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].paper === 'N') selected = "Nei";
  className = 'paper';
  html += inputValues('Papiravfall', 'paper', enableChanges, selected, 'Nei', 'Ja');
  //html += "<div></div>";

  // food waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].food === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].food === 'N') selected = "Nei";
  html += inputValues('Matavfall', 'food', enableChanges, selected, 'Nei', 'Ja');

  // plastic waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].plastic === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].plastic === 'N') selected = "Nei";
  html += inputValues('Plastavfall', 'plastic', enableChanges, selected, 'Nei', 'Ja');
  //html += "<div></div>";

  // Christmas tree
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].christmasTree === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].christmasTree === 'N') selected = "Nei";
  className = 'christmasTree';
  html += inputValues('Juletre', 'christmasTree', enableChanges, selected, 'Nei', 'Ja');

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }

    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showEmptyCalendar').innerHTML = html;
}

/*
// Delete one emtyingcalendar row
async function deleteEmptyingCalendarRow(emptyCalendarId, className) {

  // Check if emtyingcalendar row exist
  rowNumberEmptyCalendar = objEmptyCalendars.arrayEmptyCalendars.findIndex(emtyingCalendar => emtyingCalendar.emptyCalendarId === emptyCalendarId);
  if (rowNumberEmptyCalendar !== -1) {

    // delete emtyingcalendar row
    await objEmptyCalendars.deleteEmptyCalendarTable(emptyCalendarId, objEmptyCalendars.user);
  }

  const orderBy = "date DESC";
  await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);
}
*/

// Update a emptycalendar table row
async function updateEmptyingCalendarRow(emptyCalendarId) {

  emptyCalendarId = Number(emptyCalendarId);

  // condoId
  condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', 'Ugyldig ansvarlig',  condoId, 1, objCondo.nineNine);

  // date
  let date = document.querySelector('.emptyingCalendarDate').value;
  let validDate = validateISODate('emptyingCalendarDate', date,  'Ugyldig Dato');
  date = formatISODateToNumber(date);

  let residualWaste = document.querySelector('.residualWaste').value;
  const validResidualWaste = validateValuesNew('residualWaste', 'Ugylgig valg',  residualWaste, 'Nei', 'Ja');
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  let paper = document.querySelector('.paper').value;
  const validPaper = validateValuesNew('paper', 'Ugylgig valg',  paper, 'Nei', 'Ja');
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';

  let food = document.querySelector('.food').value;
  const validFood = validateValuesNew('food', 'Ugylgig valg',  food, 'Nei', 'Ja');
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  let plastic = document.querySelector('.plastic').value;
  const validPlastic = validateValuesNew('plastic', 'Ugylgig valg',  plastic, 'Nei', 'Ja');
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  let christmasTree = document.querySelector('.christmasTree').value;
  const validChristmasTree = validateValuesNew('christmasTree', 'Ugylgig valg', christmasTree, 'Nei', 'Ja');
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptycalendar columns
  if (validCondoId && validDate && validPaper && validResidualWaste && validFood && validPlastic && validChristmasTree) {

    document.querySelector('.showMessage').style.display = "none";

    const rowNumberEmptyCalendar = objEmptyCalendars.arrayEmptyCalendars.findIndex((emptyCalendar) => emptyCalendar.emptyCalendarId = emptyCalendarId);

    // Check if the emptycalendars row exist
    if (rowNumberEmptyCalendar !== -1) {

      // update a emptycalendars row
      await objEmptyCalendars.updateEmptyCalendarTable(emptyCalendarId, objEmptyCalendars.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
    } else {

      // Insert a emptycalendars row
      await objEmptyCalendars.insertEmptyCalendarTable(objEmptyCalendars.condominiumId, objEmptyCalendars.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
      await objEmptyCalendars.getHighestEmptyCalendarId(objEmptyCalendars.condominiumId);
      emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars.at(-1)?.emptyCalendarId ?? 0;
    }

    const orderBy = "date DESC";
    await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(emptyCalendarId);

    // Show emtyingcalendar
    showEmptyCalendar(emptyCalendarId);
  }
}

// get empty calendar date
function getEmptyingCalendarDate(emptyCalendarId) {

  let date = 0;
  objEmptyCalendars.arrayEmptyCalendars.forEach(emptycalendar => {

    if (emptycalendar.emptyCalendarId === emptyCalendarId) date = emptycalendar.date;
  });

  return date;
}

/*
// get empty calendar Id
function getemptyCalendarId(date) {

  let emptyCalendarId = 0;
  objEmptyCalendars.arrayEmptyCalendars.forEach(emptycalendar => {

    if (emptycalendar.date === date) emptyCalendarId = emptycalendar.emptyCalendarId;
  });

  return emptyCalendarId;
}
*/

/*
// get empty calendar Id
function getemptyCalendarId(date) {

  let emptyCalendarId = 0;
  objEmptyCalendars.arrayEmptyCalendars.forEach(emptycalendar => {

    if (emptycalendar.date === date) emptyCalendarId = emptycalendar.emptyCalendarId;
  });

  return emptyCalendarId;
}
*/

// resetValues
function resetValues() {

  document.querySelector('.filterEmptyCalendarId').value = 0;

  // condoId
  document.querySelector('.condoId').value = 0;

  // date
  document.querySelector('.emptyingCalendarDate').value = 0;

  //  residualWaste
  document.querySelector('.residualWaste').value = 'Nei';

  // paper
  document.querySelector('.paper').value = 'Nei';

  // food
  document.querySelector('.food').value = 'Nei';

  // plastic
  document.querySelector('.plastic').value = 'Nei';

  // christmasTree
  document.querySelector('.christmasTree').value = 'Nei';

  document.querySelector('.filterEmptyCalendarId').disabled = true;

  // Buttons
  if (enableChanges) {

    disableButton('delete', true);
  }
}

// Delete emptyCalendars row
async function deleteEmptyCalendarsRow(emptyCalendarId) {

  // Check if emptyCalendars row exist
  const rowNumberEmptyCalendars = objEmptyCalendars.arrayEmptyCalendars.findIndex(emptyCalendar => emptyCalendar.emptyCalendarId === emptyCalendarId);
  if (rowNumberEmptyCalendars !== -1) {

    // delete emptyCalendars row
    await objEmptyCalendars.deleteEmptyCalendarsTable(emptyCalendarId, objEmptyCalendars.user);
    await objEmptyCalendars.getHighestEmptyCalendarId(objEmptyCalendars.condominiumId);

    //emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[0].emptyCalendarId;
    // Check for empty array
    if (Array.isArray(objEmptyCalendars.arrayEmptyCalendars) && objEmptyCalendars.arrayEmptyCalendars.length === 0) {

      // Empty array
      emptyCalendarId = 0;
    } else {

      emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[0].userId;
    }
  }

  await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId);

  // Show filter
  showFilter(emptyCalendarId);

  // Show emptyCalendar
  showEmptyCalendar(emptyCalendarId);
}

