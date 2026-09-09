// maintenance of empty calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyCalendars = new EmptyCalendars("emptycalendars");

const enableChanges = (objEmptyCalendars.securityLevel > 5);
const applicationName = "condo-emptycalendar";

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

      // Show menu
      let html = objEmptyCalendars.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyCalendars.condominiumId, objEmptyCalendars.nineNine);
      const orderBy = "date DESC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

      let emptyCalendarId = 0;
      let date = String(getCurrentDate());

      emptyCalendarId = (paramEmptyCalendarId === 0)
        ? emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[0].emptyCalendarId
        : emptyCalendarId = paramEmptyCalendarId;

      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

      // Show filter
      showFilter(emptyCalendarId);

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

      const date = Number(document.querySelector('.filterEmptyCalendarId').value);
      const emptyCalendarId = getEmptyCalendarId(date);
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
      URL = `${URL}condo-emptyCalendars.html?emptyingCalendarsId=${paramEmptyCalendarId}&date=${paramDate}`;
      window.location.href = URL;
    };
  });

  // update/insert a emptycalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a emptycalendars row
      let date = document.querySelector('.emptyingCalendarDate').value;
      date = formatISODateToNumber(date);
      const emptyCalendarId = getEmptyCalendarId(date);
      updateEmptyingCalendarRow(emptyCalendarId);
    };
  });

  // Delete emptycalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let date = Number(document.querySelector('.filterEmptyCalendarId').value);
      let emptyCalendarId = getEmptyCalendarId(date);
      await deleteEmptyingCalendarRow(emptyCalendarId);

      // Show last row in emptyingCalendars tabel
      await objEmptyCalendars.getHighestEmptyCalendarId(objEmptyCalendars.condominiumId);
      emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars.at(-1)?.emptyCalendarId ?? 0;
      const orderBy = "date DESC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);

      // Show filter
      date = getEmptyingCalendarDate(emptyCalendarId);
      showFilter(emptyCalendarId);

      // show EmptyCalendar
      showEmptyCalendar(emptyCalendarId);
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload emptycalendars table
      const orderBy = "date DESC";
      await objEmptyCalendars.loadEmptyCalendarsTable(objEmptyCalendars.condominiumId, orderBy);
      await objEmptyCalendars.getHighestEmptyCalendarId(objEmptyCalendars.condominiumId);
      const emptyCalendarId = objEmptyCalendars.arrayEmptyCalendars[0]?.emptyCalendarId ?? 0;
      const date = objEmptyCalendars.arrayEmptyCalendars[0]?.date ?? 0;

      // Show filter
      showFilter(emptyCalendarId);

      // show emptycalendar
      showEmptyCalendar(emptyCalendarId);
    };
  });
}

// Show filter
function showFilter(emptyCalendarId) {

   // Start filter
  let html = startFilter("Tømmekalender");

  // Show date
  html += objEmptyCalendars.showSelectedEmptyCalendarsNew('Tømmedato', 'filterEmptyCalendarId', '', emptyCalendarId, 'Velg Dato', '', true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// show EmptyCalendar
function showEmptyCalendar(emptyCalendarId) {

  // row number emptycalendar array
  const rowNumberEmptyCalendar = objEmptyCalendars.arrayEmptyCalendars.findIndex(emptycalendar => emptycalendar.emptyCalendarId === emptyCalendarId);

  let html = startContent('Tømmekalender');

  // date
  let emptyingCalendarDate = objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar]?.date ?? 0;
  emptyingCalendarDate = formatNumberToISODate(emptyingCalendarDate);
  //html += showDate('Dato', 'emptyingCalendarDate', emptyingCalendarDate, enableChanges);
  html += inputDate('emptyingCalendarDate', 'Dato', emptyingCalendarDate, enableChanges);

  // condo
  const condoId = objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('condoId','Ansvarlig',  condoId, 'Velg ansvarlig', '', true);
  html += "<div></div>";

  // residual waste 
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].residualWaste === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].residualWaste === 'N') selected = "Nei";
  //html += inputValues('Restavfall', 'residualWaste', '', enableChanges, selected, 'Nei', 'Ja');
  html += inputValues('Restavfall', 'residualWaste', enableChanges, selected, 'Nei', 'Ja');

  // Paper waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].paper === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].paper === 'N') selected = "Nei";
  className = 'paper';
  //html += inputValues('Papiravfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += inputValues('Papiravfall', 'paper', enableChanges, selected, 'Nei', 'Ja');
  html += "<div></div>";

  // food waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].food === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].food === 'N') selected = "Nei";
  html += inputValues('Matavfall', 'food', enableChanges, selected, 'Nei', 'Ja');

  // plastic waste
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].plastic === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].plastic === 'N') selected = "Nei";
  //html += inputValues('Plastavfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += inputValues('Plastavfall', 'plastic', enableChanges, selected, 'Nei', 'Ja');
  html += "<div></div>";

  // Christmas tree
  selected = "Ugyldig verdi";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].christmasTree === 'Y') selected = "Ja";
  if (objEmptyCalendars.arrayEmptyCalendars[rowNumberEmptyCalendar].christmasTree === 'N') selected = "Nei";
  className = 'christmasTree';
  //html += inputValues('Juletre', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += inputValues('Juletre', 'christmasTree', enableChanges, selected, 'Nei', 'Ja');

  /*
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

  if (paramEmptyCalendarId !== 0) {
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
    disableButton('filterEmptyCalendarId', false, 'white');
  }
  */
  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("back secondary", "Tilbake", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showEmptyCalendar').innerHTML = html;
}

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

// Update a emptycalendar table row
async function updateEmptyingCalendarRow(emptyCalendarId) {

  emptyCalendarId = Number(emptyCalendarId);

  // condoId
  condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', 'Ugyldig ansvarlig', true, condoId, 1, objCondo.nineNine);

  // date
  let date = document.querySelector('.emptyingCalendarDate').value;
  let validDate = validateISODate('emptyingCalendarDate', date, true, 'Ugyldig Dato');
  date = formatISODateToNumber(date);

  let residualWaste = document.querySelector('.residualWaste').value;
  const validResidualWaste = validateValuesNew('residualWaste', 'Ugylgig valg', true, residualWaste, 'Nei', 'Ja');
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  let paper = document.querySelector('.paper').value;
  const validPaper = validateValuesNew('paper', 'Ugylgig valg', true, paper, 'Nei', 'Ja');
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';

  let food = document.querySelector('.food').value;
  const validFood = validateValuesNew('food', 'Ugylgig valg', true, food, 'Nei', 'Ja');
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  let plastic = document.querySelector('.plastic').value;
  const validPlastic = validateValuesNew('plastic', 'Ugylgig valg', true, plastic, 'Nei', 'Ja');
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  let christmasTree = document.querySelector('.christmasTree').value;
  const validChristmasTree = validateValuesNew('christmasTree', 'Ugylgig valg', true, christmasTree, 'Nei', 'Ja');
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptycalendar columns
  if (validCondoId && validDate && validPaper && validResidualWaste && validFood && validPlastic && validChristmasTree) {

    document.querySelector('.showMessage').style.display = "none";

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
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterEmptyCalendarId', false);
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

// get empty calendar Id
function getEmptyCalendarId(date) {

  let emptyCalendarId = 0;
  objEmptyCalendars.arrayEmptyCalendars.forEach(emptycalendar => {

    if (emptycalendar.date === date) emptyCalendarId = emptycalendar.emptyCalendarId;
  });

  return emptyCalendarId;
}

// get empty calendar Id
function getEmptyCalendarId(date) {

  let emptyCalendarId = 0;
  objEmptyCalendars.arrayEmptyCalendars.forEach(emptycalendar => {

    if (emptycalendar.date === date) emptyCalendarId = emptycalendar.emptyCalendarId;
  });

  return emptyCalendarId;
}

// resetValues
function resetValues() {

  document.querySelector('.filterEmptyCalendarId').value = '';

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
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterEmptyCalendarId', true);
  }
}