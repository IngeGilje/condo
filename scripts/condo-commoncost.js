// Common cost maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Account('account');
const objDues = new Due('due');
const objCondominiums = new Condominiums('condominiums');
const objCommonCost = new CommonCost('commoncost');

testMode();

/*
// Exit application if no activity for 1 hour
//exitIfNoActivity();
*/

objCommonCost.menu();
objCommonCost.markSelectedMenu('Felleskostnader');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable();
     const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId,fixedCost);

    // Show leading text filter
    showLeadingTextFilter();

    // Show filter
    showLeadingText();

    // Show all dues for condo id and common cost account id
    // Get account id for common cost
    let accountId;
    const condominiumId = Number(objUserPassword.condominiumId);
    const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (condominiumsRowNumber !== -1) {

      accountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    }
    //const condoId = objCondo.arrayCondo.at(-1).condoId;
    const condoId = 999999999;
    const year = String(today.getFullYear());
    const fromDate = year + "0101";
    const toDate = year + "1231";
    await objDues.loadDuesTable(objUserPassword.condominiumId, accountId, condoId, fromDate, toDate);
    showCommonCost();

    // Show all values for 
    showValues();

    // Events
    events();
  }
}

// Make monthly amount events
function events() {

  // Selected condo Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-commoncost-filterCondoId')) {

      // reload common cost
      reloadCommonCostCondoIdSync();

      // reload common cost
      async function reloadCommonCostCondoIdSync() {

        // Get account id for common cost
        let accountId;
        const condominiumId = Number(objUserPassword.condominiumId);
        const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
        if (condominiumsRowNumber !== -1) {

          accountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
        }
        const year = document.querySelector('.select-commoncost-filterYear').value;
        const fromDate = year + "0101";
        const toDate = year + "1231";
        const condoId = Number(event.target.value);
        document.querySelector('.select-commoncost-condoId').value = condoId;

        await objDues.loadDuesTable(objUserPassword.condominiumId, accountId, condoId, fromDate, toDate);

        // Show all dues for condo id, account id
        showCommonCost();
      }
    }
  });

  // Selected year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-commoncost-filterYear')) {

      // reload common cost
      reloadCommonCostYearSync();

      // reload common cost
      async function reloadCommonCostYearSync() {

        // Get account id for common cost
        let accountId;
        const condominiumId = Number(objUserPassword.condominiumId);
        const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
        if (condominiumsRowNumber !== -1) {

          accountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
        }
        const year = Number(event.target.value);
        document.querySelector('.select-commoncost-year').value = year;
        const fromDate = year + "0101";
        const toDate = year + "1231";
        const condoId = Number(document.querySelector('.select-commoncost-condoId').value);
        await objDues.loadDuesTable(objUserPassword.condominiumId, 999999999, condoId, fromDate, toDate);

        // Show all dues for condo id, account id
        showCommonCost();
      }
    }
  });

  // Update common cost
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-commoncost-update')) {

      // update common cost
      updateCommonCostSync();

      // update common cost
      async function updateCommonCostSync() {

        // Check for valid values
        if (validateValues()) {

          // Valid values
          //const year = Number(document.querySelector('.select-commoncost-year').value);
          const condoId = Number(document.querySelector('.select-commoncost-condoId').value);

          // Get account id for common cost
          let accountId;
          const condominiumId = Number(objUserPassword.condominiumId);
          const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
          if (condominiumsRowNumber !== -1) {

            accountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
          }

          // get condo name 
          const objTemp = objCondo.arrayCondo.find(condo => condo.condoId === condoId);
          condoName = objTemp.name;

          const year = Number(document.querySelector('.select-commoncost-year').value);
          const day = Number(document.querySelector('.select-commoncost-day').value);
          const amount = Number(formatAmountToOre(document.querySelector('.input-commoncost-amount').value));
          
          const user = objUserPassword.email;

          // Insert new monthly amount for every month this year
          for (month = 1; month < 13; month++) {

            const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
            const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
            const date = String(year) + stringMonth + stringDay;
            const text = String(condoName) + '-' + findNameOfMonth(month);

            await objDues.insertDuesTable(condominiumId, user, condoId, accountId, amount, date, text);
          }

          // Show all dues for condo id, account id
          const fromDate = year + "0101";
          const toDate = year + "1231";
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
          showCommonCost();

          document.querySelector('.button-commoncost-delete').disabled = false;
          document.querySelector('.select-commoncost-condoId').value = condoId;
        }
      }
    }
  });

  // Delete common cost
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-commoncost-delete')) {

      // delete common cost
      deleteCommonCostSync();

      // delete common cost
      async function deleteCommonCostSync() {

        // Check for valid values
        if (validateValues()) {

          const year = Number(document.querySelector('.select-commoncost-year').value);
          const day = Number(document.querySelector('.select-commoncost-day').value);
          const condoId = Number(document.querySelector('.select-commoncost-condoId').value);
          const accountId = objAccounts.arrayAccounts[0].accountId;
          let amount = Number(formatAmountToOre(document.querySelector('.input-commoncost-amount').value));
          const user = objUserPassword.email;
          

          for (month = 1; month < 13; month++) {

            const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
            const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
            let date = Number(String(year) + stringMonth + stringDay);

            // due id for deleting row
            const dueId = findDueId(condoId, accountId, amount, date);

            if (dueId >= 0) {

              // current date
              await objDues.deleteDuesTable(dueId, user);
            }
          }
          const condominiumId = Number(objUserPassword.condominiumId);
          const fromDate = year + "0101";
          const toDate = year + "1231";
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
          showCommonCost();

          // Show all dues for condo id and common cost account id
          document.querySelector('.button-commoncost-delete').disabled = false;
          document.querySelector('.select-commoncost-condoId').value = condoId;
        }
      }
    }
  });
}

// Show leading text for due
function showLeadingText() {

  // Show all condos
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  objCondo.showSelectedCondos('commoncost-condoId', condoId);

  // Show years
  const year = today.getFullYear();
  objDues.selectNumber('commoncost-year', 2020, 2030, year, 'År');

  // Show days
  objDues.selectNumber('commoncost-day', 1, 28, 15, 'Dag')

  // Show amount
  objDues.showInput('commoncost-amount', '* Månedsavgift', 10, '');

  if (Number(objUserPassword.securityLevel) >= 9) {

    // show update button
    objDues.showButton('commoncost-update', 'Oppdater');

    // show delete button
    objDues.showButton('commoncost-delete', 'Slett');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid account Id
  const year = document.querySelector('.select-commoncost-year').value;
  const validYear = validateNumber(year, 2020, 2099, 'commoncost-year', '* År');

  // Check for valid condo Id
  const condoId = document.querySelector('.select-commoncost-condoId').value;
  const validCondoId = validateNumber(condoId, 1, 99999, 'commoncost-condoId', 'Leilighet');

  // Check for valid day
  const day = document.querySelector('.select-commoncost-day').value;
  const validDay = validateNumber(day, 1, 28, 'commoncost-day', 'Dag');

  // Check amount
  const amount = document.querySelector('.input-commoncost-amount').value;
  document.querySelector('.input-commoncost-amount').value = formatAmountToEuroFormat(amount);
  const validAmount = objDues.validateNorAmount(amount, "commoncost-amount", "Månedsavgift");

  return (validYear && validCondoId && validDay && validAmount) ? true : false;
}

function findDueId(condoId, accountId, amount, date) {

  let dueId = 0
  objDues.arrayDues.forEach((due) => {
    if (due.dueId > 1
      && due.amount === amount
      && due.date === Number(date)
      && due.condoId === condoId
      && due.accountId === accountId
    ) {

      dueId = due.dueId;
    }
  });

  return dueId;
}

// Reset all common cost amounts
function resetCommonCost() {

  document.querySelector('.input-commoncost-amount').value = '';
  document.querySelector('.div-commoncost-columnDate').innerHTML = '';
  document.querySelector('.div-commoncost-columnAmount').innerHTML = '';

  document.querySelector('.button-commoncost-delete').disabled = true;
}

// Reset all values for due
function resetValues() {

  // Condo Id
  document.querySelector('.select-commoncost-condoId').value = '';

  // Year
  document.querySelector('.select-commoncost-year').value = '';

  // Day
  document.querySelector('.input-commoncost-day').value = '';

  // Amount
  document.querySelector('.input-commoncost-amount').value = '';

  document.querySelector('.button-commoncost-delete').disabled = true;
}

// show all common costs for selected condo id
function showCommonCost() {

  let sumAmount = 0;
  let rowNumber = 0;

  // Get account id for common cost
  let accountId;
  const condominiumId = Number(objUserPassword.condominiumId);
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumsRowNumber !== -1) {

    accountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
  }

  document.querySelector(".input-commoncost-amount").value = '';

  let htmlColumnDate =
    `
      <div 
        class = "columnHeaderRight"
      >
        Forfallsdato
      </div>
      <br>
    `;

  let htmlColumnAmount =
    `
      <div 
        class = "columnHeaderRight"
      >
        Beløp
      </div>
      <br>
    `;

  objDues.arrayDues.forEach((due) => {

    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

    // 20250115 -> 15.01.2025
    date = formatToNorDate(String(due.date));
    htmlColumnDate +=
      `
            <div 
              class="rightCell ${colorClass}"
            >
              ${date}
            </div>
          `;

    // 1234567 -> 12345,67
    const amount = formatOreToKroner(due.amount);
    document.querySelector(".input-commoncost-amount").value = amount;
    htmlColumnAmount +=
      `
            <div 
              class="rightCell ${colorClass}"
            >
              ${amount}
            </div>
          `;
    sumAmount += Number(due.amount);
  });

  // Sum line

  // 1234567 -> 12345,67
  sumAmount = formatOreToKroner(String(sumAmount));
  htmlColumnAmount +=
    `
      <div 
        class="sumCellRight"
      >
        ${sumAmount}
      </div>
      <br>
    `;

  document.querySelector('.div-commoncost-columnDate').innerHTML = htmlColumnDate;
  document.querySelector('.div-commoncost-columnAmount').innerHTML = htmlColumnAmount;
}

// Show all values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId >= 0) {

    // find object number for selected due id
    const objDueRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      // Condo id
      document.querySelector('.select-commoncost-condoId').value = dueArray[objDueRowNumber].condoId;

      // Amount
      const amount = formatOreToKroner(dueArray[objDueRowNumber].amount);
      document.querySelector('.input-commoncost-amount').value = amount;
    } else {

      resetValues();
    }
  }
}

// Show filter for search
function showLeadingTextFilter() {

  // Show all condos
  const accountId = (isClassDefined('select-commoncost-filterCondoId')) ? Number(document.querySelector('.select-commoncost-filterAccountId').value) : 0;
  objCondo.showSelectedCondos('commoncost-filterCondoId', accountId, 'Alle');

  // Show common cost year
  if (!isClassDefined('select-commoncost-filterYear')) {
    const year = today.getFullYear();
    objCommonCost.selectNumber('commoncost-filterYear', 2020, 2030, year, 'År');
  }
}