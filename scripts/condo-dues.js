// show dues

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objDues = new Dues('dues');

// Fixed values
const enableChanges = (objDues.securityLevel > 5);
const applicationName = "condo-dues";

const columnWidths = [150, 150, 175, 175, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramDueId = Number(queryParameters.get("dueId"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objDues.condominiumId === 0) || (objDues.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objDues.showMenu();
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objDues.condominiumId, resident, objDues.nineNine);
      await objCondo.loadCondoTable(objDues.condominiumId, objDues.nineNine);

      // Show filter
      const date = getCurrentDate();
      const year = String(date).slice(6, 10);
      const month = String(date).slice(3, 5);
      showFilter(year, month, 0);

      await objDues.loadDuesTable(objDues.condominiumId);

      // Show due
      showDues();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for dues
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if ((event.target.classList.contains('filterYear'))
      || (event.target.classList.contains('filterMonth'))
      || (event.target.classList.contains('filterCondoId'))) {

      const year = Number(document.querySelector(".filterYear").value);
      const month = Number(document.querySelector(".filterMonth").value);
      const condoId = Number(document.querySelector(".filterCondoId").value);
      showFilter(year, month, condoId);
      await objDues.loadDuesTable(objDues.condominiumId);

      showDues();
    };
  });

  // change a dues row
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let dueId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        dueId = Number(className.slice(prefix.length));
      }

      // due id
      const rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);
      if (rowNumberDue !== -1) {

        const date = objDues.arrayDues[rowNumberDue].date;
        const year = Number(String(date).slice(0, 4));

        let URL = (objDues.serverStatus === 1)
          ? 'http://ingegilje.no/'
          : 'http://localhost/';
        URL = `${URL}condo-due.html?dueId=${dueId}&year=${year}&backApplication=${applicationName}.html`;
        window.location.href = URL;
      }
    };
  });
};

// Show filter
function showFilter(year, month, condoId) {

  // Start frame
  let html = startFrame('filter-frame');

  // year
  html += showSelectedNumbers('filterYear', 'År', 2019, 2029, Number(year), enableChanges);

  // month
  html += showSelectedMonthsNew('filterMonth', 'Måned', Number(month), enableChanges);

  // condo
  html += objCondo.showSelectedCondosNew('filterCondoId', 'leilighet', condoId, 'Velg leilighet', '', true);

  // End frame
  html += "</div>";
  document.querySelector(".showFilter").innerHTML = html;
}


// Show dues
function showDues() {

  let totalPriceYear = 0;

  // start table
  let html = emptyLine();
  html += objDues.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  const filterYear = Number(document.querySelector(".filterYear").value);
  const filterMonth = Number(document.querySelector(".filterMonth").value);
  const filterCondoId = Number(document.querySelector(".filterCondoId").value);

  html += objDues.showTableHeader('Dato', 'Leilighet', `K.timer`, 'Beløp', '');

  objDues.arrayDues.forEach((due) => {

    // Filter
    const date = String(due.date);
    const year = String(date).slice(0, 4);
    const month = String(date).slice(4, 6);
    if ((Number(year) === filterYear)
      && (Number(month) === filterMonth || filterMonth === objDues.nineNine)
      && (due.condoId === filterCondoId || filterCondoId === 0)) {

      // insert a table row (<tr></td>)
      html += objDues.insertTableRow('');

      // date
      let date = due.date;
      let className = `date${due.dueId}`;
      date = formatNumberToNorDate(date);
      html += showTableText(className, date);

      // condoId
      const condoId = due.condoId;
      className = `condoId${due.dueId}`;
      const condoName = objCondo.getCondoNameById(due.condoId);
      html += showTableText(className, condoName);

      // kilowattHour
      let kilowattHour = due.kilowattHour;
      className = `kilowattHour${due.dueId}`;
      kilowattHour = formatNumberToNorAmount(kilowattHour);
      html += showTableText(className, kilowattHour);

      // price for used elcticity/remote heating for one year
      let amount = Number(due.amount);
      if (amount === 0) {

        // calculate price for used elcticity/remote heating for one year
        let price = document.querySelector('.filterPrice').value;
        price = formatNumberToNorAmount(price);
        kilowattHour = formatNumberToNorAmount(kilowattHour);
        kilowattHourLastYear = formatNumberToNorAmount(kilowattHourLastYear);
        amount = Number(price) * (Number(kilowattHour) - Number(kilowattHourLastYear));
        amount = (amount / 100);
        amount = formatNumberToNorAmount(amount);
      } else {

        amount = formatNumberToNorAmount(due.amount);
      }
      className = `amount${due.dueId}`;
      html += showTableText(className, amount);

      // Maintnance
      className = `change${due.dueId}`;
      html += showTableButton(className, 'Rediger');
      html += "</tr>";

      // accumulate
      amount = formatNorAmountToNumber(amount);
      totalPriceYear += amount;
    }
  });

  // How much to pay for remote heating for all condos
  totalPriceYear = formatNumberToNorAmount(totalPriceYear);

  html += objDues.insertTableRow('', '', 'Totalt', totalPriceYear, '', '');
  html += "</tr>";

  // The end of the table
  html += endTable();
  document.querySelector('.showDues').innerHTML = html;
}