// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objRemoteHeatingPrices = new RemoteHeatingPrice('remoteheatingprice');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      await objCondos.loadCondoTable(objUserPassword.condominiumId);

      let html = objRemoteHeatingPrices.showHorizontalMenu('width: 750px');
      document.querySelector(".horizontalMenu").innerHTML = html;

      // Show header
      let menuNumber = 0;
      showHeader();

      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objUserPassword.condominiumId);

      // Show remoteHeatingPrice
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  }
}

// Events for remoteheatingprices
function events() {

  // Delete remoteheatingprices row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteRemoteHeatingRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteRemoteHeatingRowValue === "Ja") {

        const remoteHeatingPriceId = Number(className.substring(6));
        deleteRemoteHeatingPriceSync();

        async function deleteRemoteHeatingPriceSync() {

          await deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className);

          await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objUserPassword.condominiumId);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });

  // update a remoteheatingprices row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['year', 'priceKilowattHour'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract remoteHeatingPriceId in the class name
      let remoteHeatingPriceId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        remoteHeatingPriceId = Number(className.slice(prefix.length));
      }

      updateRemoteHeatingPriceSync();

      // Update a remoteheatingprices row
      async function updateRemoteHeatingPriceSync() {

        await updateRemoteHeatingPricesRow(remoteHeatingPriceId);
      }
    };
  });

  // Delete suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objRemoteHeatingPrices.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const remoteHeatingPriceId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(remoteHeatingPriceId, className);

          await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objUserPassword.condominiumId);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objRemoteHeatingPrices.startTable('width:1100px;');

  // show main header
  html += objRemoteHeatingPrices.showTableHeader('width:250px;', 'Fjernvarme');

  // The end of the table header
  html += objRemoteHeatingPrices.endTableHeaderNew();

  // The end of the table
  html += objRemoteHeatingPrices.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";
  let date = "";

  // insert table columns in start of a row
  html += objRemoteHeatingPrices.insertTableColumns('', rowNumber);

  html += "<td class='center'>Ny fjernvarmepris</td>";

  // Select year
  const year = today.getFullYear();
  html += objRemoteHeatingPrices.selectInterval('year0', 'width:100px;', 2020, 2030, year);

  // priceKilowattHour 
  html += objRemoteHeatingPrices.inputTableColumn('priceKilowattHour0', "", 10);

  html += "</tr>";
  return html;
}

// Show remoteheatingprices
function showResult(rowNumber) {

  // start table
  let html = objRemoteHeatingPrices.startTable('width:1100px;');

  html += objRemoteHeatingPrices.showTableHeader('width:250px;', '', 'Slett', 'År', `Pris kilowatTimer`);

  objRemoteHeatingPrices.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objRemoteHeatingPrices.insertTableColumns('', rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (remoteHeatingPrice.deleted === 'Y') selectedChoice = "Ja";
    if (remoteHeatingPrice.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrices.showSelectedValues(className, 'width:75px;', selectedChoice, 'Nei', 'Ja')

    // Select year
    const year = remoteHeatingPrice.year;
    className = `year${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrices.selectInterval(className, 'width:100px;', 2020, 2030, year);

    // priceKilowattHour
    let priceKilowattHour = remoteHeatingPrice.priceKilowattHour;
    className = `priceKilowattHour${remoteHeatingPrice.remoteHeatingPriceId}`;
    priceKilowattHour = formatOreToKroner(priceKilowattHour);
    html += objRemoteHeatingPrices.inputTableColumn(className, priceKilowattHour, 10);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show the rest of the menu
  rowNumber++;
  html += objRemoteHeatingPrices.showRestMenu(rowNumber);

  // The end of the table
  html += objRemoteHeatingPrices.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one remoteHeatingPrice row
async function deleteAccountRow(remoteHeatingPriceId, className) {

  const user = objUserPassword.email;

  // Check if remoteHeatingPrice row exist
  accountsRowNumber = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeatingPrice row
    objRemoteHeatingPrices.deleteAccountsTable(remoteHeatingPriceId, user);
  }

  await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objUserPassword.condominiumId);
}

// Update a remoteheatingprices table row
async function updateRemoteHeatingPricesRow(remoteHeatingPriceId) {

  remoteHeatingPriceId = Number(remoteHeatingPriceId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // year
  className = `.year${remoteHeatingPriceId}`;
  let year = document.querySelector(className).value;
  const validYear = objRemoteHeatingPrices.validateIntervalNew(year, 2020, 2030);

  // priceKilowattHour
  className = `.priceKilowattHour${remoteHeatingPriceId}`;
  let priceKilowattHour = document.querySelector(className).value;
  priceKilowattHour = formatKronerToOre(priceKilowattHour);
  className = `priceKilowattHour${remoteHeatingPriceId}`;
  const validKilowattHourPrice = objRemoteHeatingPrices.validateNumber(className, priceKilowattHour, 0, objRemoteHeatingPrices.nineNine);

  // Validate remoteheatingprices columns
  if (validYear && validKilowattHourPrice) {

    // Check if the remoteHeatingPrice id exist
    const rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrices.updateRemoteHeatingPricesTable(user, remoteHeatingPriceId, year, priceKilowattHour);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrices.insertRemoteHeatingPricesTable(condominiumId, user, year, priceKilowattHour);
    }

    await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objUserPassword.condominiumId);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Delete a remoteheatingprices row
async function deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className) {

  const user = objUserPassword.email;

  // Check if remoteheatingprices row exist
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    objRemoteHeatingPrices.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, user);
  }
}
