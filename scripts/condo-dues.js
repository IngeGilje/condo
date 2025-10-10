// Due maintenance

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objDues = new Dues('dues');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objDues.menu();
objDues.markSelectedMenu('Forfall');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    // Call main when script loads
    main();

    // Main entry point
    async function main() {

      const condominiumId = Number(objUserPassword.condominiumId);
      await objUsers.loadUsersTable(condominiumId);
      await objCondo.loadCondoTable(condominiumId);
      await objAccounts.loadAccountsTable(condominiumId);

      const accountId = 999999999;
      const condoId = 999999999;
      const year = String(today.getFullYear());
      const fromDate = year + "0101";
      let toDate = getCurrentDate();
      toDate = Number(convertDateToISOFormat(toDate));
      await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

      // Show leading text filter
      showLeadingTextFilter();

      // Show leading text maintenance
      // Select first due Id
      if (objDues.arrayDues.length > 0) {
        dueId = objDues.arrayDues[0].dueId;
        showLeadingText(dueId);
      } else {

        dueId = 0;
      }

      // Show dues 
      showDues();

      // Show due Id
      objDues.showSelectedDues('dues-dueId', dueId);

      showValues(dueId);

      // Make events
      createEvents();
    }
  }
}

// Make due events
function createEvents() {

  // Selected condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterCondoId')) {

      // Search for dues and reload
      searchDuesCondoIdSync();

      async function searchDuesCondoIdSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show leading text filter
        showLeadingTextFilter();

        // Show leading text for maintenance
        // Select first due Id
        if (objDues.arrayDues.length > 0) {
          dueId = objDues.arrayDues[0].dueId;
          showLeadingText(dueId);
        }

        // Show dues 
        showDues();

        // Show due Id
        objDues.showSelectedDues('dues-dueId', dueId);
        showValues(dueId);
      }
    }
  });

  // Selected account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterAccountId')) {

      // Search for dues and reload
      searchDuesAccountIdSync();

      async function searchDuesAccountIdSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show leading text filter
        showLeadingTextFilter();

        // Show leading text for maintenance
        // Select first due Id
        if (objDues.arrayDues.length > 0) {
          dueId = objDues.arrayDues[0].dueId;
          showLeadingText(dueId);
        }

        // Show dues 
        showDues();

        // Show due Id
        objDues.showSelectedDues('dues-dueId', dueId);
        showValues(dueId);
      }
    }
  });

  // Selected from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-dues-filterFromDate')) {

      // Search for dues and reload
      searchDuesFromDateSync();

      async function searchDuesFromDateSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show leading text filter
        showLeadingTextFilter();

        // Show leading text for maintenance
        // Select first due Id
        if (objDues.arrayDues.length > 0) {
          dueId = objDues.arrayDues[0].dueId;
          showLeadingText(dueId);
          
          // Show dues 
          showDues();

          // Show due Id
          objDues.showSelectedDues('dues-dueId', dueId);
          showValues(dueId);

        } else {

          resetValues();

          // Show dues 
          showDues();
        }

      }
    }
  });

  // Selected to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-dues-filterToDate')) {

      // Search for dues and reload
      searchDuesToDateSync();

      async function searchDuesToDateSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show leading text filter
        showLeadingTextFilter();

        // Show leading text for maintenance
        // Select first due Id
        if (objDues.arrayDues.length > 0) {
          dueId = objDues.arrayDues[0].dueId;
          showLeadingText(dueId);
        }

        // Show dues 
        showDues();

        // Show due Id
        objDues.showSelectedDues('dues-dueId', dueId);
        showValues(dueId);
      }
    }
  });

  // Selected due Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-dueId')) {

      // Search for dues and reload
      selectDueIdSync();

      async function selectDueIdSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show due Id
        const dueId = document.querySelector('.select-dues-dueId').value;
        showValues(dueId);
      }
    }
  });

  // Update due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-update')) {

      // Search for dues and reload
      updateDueSync();

      async function updateDueSync() {

        // Check for valid values
        let dueId = Number(document.querySelector('.select-dues-dueId').value);
        if (validateValues(dueId)) {

          const condominiumId = Number(objUserPassword.condominiumId);
          const user = objUserPassword.email;
          let condoId = Number(document.querySelector('.select-dues-condoId').value);
          let accountId = Number(document.querySelector('.select-dues-accountId').value);
          const date = Number(formatNorDateToNumber(document.querySelector('.input-dues-date').value));
          const amount = Number(formatAmountToOre(document.querySelector('.input-dues-amount').value));
          const text = document.querySelector('.input-dues-text').value;
          const lastUpdate = today.toISOString();

          // Check if due Id exist
          // Get selected due Id
          dueId = Number(document.querySelector('.select-dues-dueId').value);
          const dueRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
          if (dueRowNumber !== -1) {

            // update due row in dues table
            await objDues.updateDuesTable(dueId, user, lastUpdate, condoId, accountId, amount, date, text);
          } else {

            // insert due row in dues table
            await objDues.insertDuesTable(condominiumId, user, lastUpdate, condoId, accountId, amount, date, text);
            dueId = objDues.arrayDues.at(-1).dueId;
          }

          accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
          condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
          let fromDate = document.querySelector('.input-dues-filterFromDate').value;
          fromDate = Number(convertDateToISOFormat(fromDate));
          let toDate = document.querySelector('.input-dues-filterToDate').value;
          toDate = Number(convertDateToISOFormat(toDate));
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

          // Show leading text filter
          //showLeadingTextFilter();

          // Show leading text maintenance
          //showLeadingText(dueId);

          // Show dues 
          showDues();

          // Show due Id
          showValues(dueId);

          document.querySelector('.select-dues-dueId').disabled = false;
          document.querySelector('.button-dues-delete').disabled = false;
          document.querySelector('.button-dues-insert').disabled = false;
        }
      }
    }
  });

  // insert due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-insert')) {

      resetValues();
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-delete')) {

      // Delete due row and reload dues
      deleteDueSync();

      async function deleteDueSync() {

        // Check for valid values
        const dueId = Number(document.querySelector('.select-dues-dueId').value);
        if (validateValues(dueId)) {

          const user = objUserPassword.email;
          let condoId = Number(document.querySelector('.select-dues-condoId').value);
          let accountId = Number(document.querySelector('.select-dues-accountId').value);
          const lastUpdate = today.toISOString();

          // Check if due Id exist
          // Get selected due Id
          let dueId = Number(document.querySelector('.select-dues-dueId').value);
          const dueRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
          if (dueRowNumber !== -1) {

            // delete due row in dues table
            await objDues.deleteDuesTable(dueId, user, lastUpdate);
          }

          const condominiumId = Number(objUserPassword.condominiumId);
          accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
          condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
          let fromDate = document.querySelector('.input-dues-filterFromDate').value;
          fromDate = Number(convertDateToISOFormat(fromDate));
          let toDate = document.querySelector('.input-dues-filterToDate').value;
          toDate = Number(convertDateToISOFormat(toDate));
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

          // Show leading text filter
          showLeadingTextFilter();

          // Show leading text for maintenance
          // Select first due Id
          if (objDues.arrayDues.length > 0) {
            dueId = objDues.arrayDues[0].dueId;
            showLeadingText(dueId);

            // Show dues 
            showDues();

            // Show due Id
            showValues(dueId);
          } else {

            resetValues();

            // Show dues 
            showDues();
          }

          document.querySelector('.select-dues-dueId').disabled = false;
          document.querySelector('.button-dues-delete').disabled = false;
          document.querySelector('.button-dues-insert').disabled = false;

          document.querySelector('.select-dues-filterCondoId').value = document.querySelector('.select-dues-condoId').value;
          document.querySelector('.select-dues-filterAccountId').value = document.querySelector('.select-dues-accountId').value;
        }
      }
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-cancel')) {

      // Reload dues
      reloadDueSync();

      async function reloadDueSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const accountId = Number(document.querySelector('.select-dues-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
        let fromDate = document.querySelector('.input-dues-filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.input-dues-filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        // Show leading text filter
        showLeadingTextFilter();

        // Show leading text for maintenance
        // Select first due Id
        if (objDues.arrayDues.length > 0) {
          dueId = objDues.arrayDues[0].dueId;
          showLeadingText(dueId);
        }

        // Show dues 
        showDues();

        // Show due Id
        objDues.showSelectedDues('dues-dueId', dueId);
        showValues(dueId);
      }
    }
  });
}

// Show filter for search
function showLeadingTextFilter() {

  // Show all condos
  const condoId = (isClassDefined('select-dues-filterCondoId')) ? Number(document.querySelector('.select-dues-filterCondoId').value) : 0;
  objCondo.showSelectedCondos('dues-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId = (isClassDefined('select-dues-filterAccountId')) ? Number(document.querySelector('.select-dues-filterAccountId').value) : 0;
  objAccounts.showSelectedAccounts('dues-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-dues-filterFromDate')) {
    objDues.showInput('dues-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-dues-filterToDate')) {
    objDues.showInput('dues-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Check for filter from date
  let date = document.querySelector('.input-dues-filterFromDate').value;

  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-dues-filterFromDate').value = "01.01." + year;
  }

  // Check for filter to date
  date = document.querySelector('.input-dues-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-dues-filterToDate').value = getCurrentDate();
  }
}

// Show leading text for due
function showLeadingText(dueId) {

  // Show selected dues
  objDues.showSelectedDues('dues-dueId', dueId);

  // Show selected condos
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  objCondo.showSelectedCondos('dues-condoId', condoId, 'Ingen er valgt');

  // Show selected accounts
  const accountId = objAccounts.accountsArray.at(-1).accountId;
  objAccounts.showSelectedAccounts('dues-accountId', accountId, 'Ingen er valgt');

  // Show amount
  objDues.showInput('dues-date', '* Dato', 10, '');

  // Show amount
  objDues.showInput('dues-amount', '* Beløp', 10, '');

  // Show text
  objDues.showInput('dues-text', 'Tekst', 50, '');

  // show buttons
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDues.showButton('dues-update', 'Oppdater');

    // show new button
    objDues.showButton('dues-insert', 'Ny');

    // show delete button
    objDues.showButton('dues-delete', 'Slett');

    // show cancel button
    objDues.showButton('dues-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues(dueId) {

  // Check for valid condo Id
  const condoId = document.querySelector('.select-dues-condoId').value;
  const validCondoId = validateNumber(condoId, 1, 99999, 'dues-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId = document.querySelector('.select-dues-accountId').value;
  const validAccountId = validateNumber(condoId, 1, 99999, 'dues-accountId', 'Konto');

  // Check for valid date
  const date = document.querySelector('.input-dues-date').value;
  const validDate = validateNorDate(date, 'dues-date', 'Dato');

  // Check amount
  const amount = formatToNorAmount(document.querySelector('.input-dues-amount').value);
  const validAmount = objDues.validateAmount(amount, "dues-amount", "Månedsbetaling");

  // Check text
  const text = document.querySelector('.input-dues-text').value;
  const validText = objDues.validateText(text, "label-dues-text", "Tekst");

  return (validAccountId && validCondoId && validDate && validAmount && validText) ? true : false;
}

// Show values for due
function showValues(dueId) {

  dueId = Number(dueId);

  // Check for valid due Id
  if (dueId >= 0) {

    // Check if due Id exist
    const dueRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
    if (dueRowNumber !== -1) {

      // Show due id
      document.querySelector('.select-dues-dueId').value = objDues.arrayDues[dueRowNumber].dueId;

      // Show condo id
      const condoId = objDues.arrayDues[dueRowNumber].condoId;
      objCondo.selectCondoId(condoId, 'dues-condoId');

      // Show account id
      const accountId = objDues.arrayDues[dueRowNumber].accountId;
      objAccounts.selectAccountId(accountId, 'dues-accountId');

      // Show due date
      const dueDate = formatToNorDate(objDues.arrayDues[dueRowNumber].date);
      document.querySelector('.input-dues-date').value = dueDate;

      // Show amount
      document.querySelector('.input-dues-amount').value = formatOreToKroner(objDues.arrayDues[dueRowNumber].amount);

      // Show text
      document.querySelector('.input-dues-text').value = objDues.arrayDues[dueRowNumber].text;
    }
  }
}

function resetValues() {

  // Show dueid
  document.querySelector('.select-dues-dueId').value = 0;

  // Show condo
  document.querySelector('.select-dues-condoId').value = 0;

  // Show date
  document.querySelector('.input-dues-date').value = '';

  // Show amount
  document.querySelector('.input-dues-amount').value = '';

  // Show text
  document.querySelector('.input-dues-text').value = '';

  document.querySelector('.select-dues-dueId').disabled = true;
  document.querySelector('.button-dues-delete').disabled = true;
  document.querySelector('.button-dues-insert').disabled = true;
}

// Show selected dues
function showDues() {

  // Validate search filter
  if (validateFilter()) {

    // Header
    let htmlColumnLine = '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnDate = '<div class="columnHeaderRight">Dato</div><br>';
    let htmlColumnCondoName = '<div class="columnHeaderRight">Leilighet</div><br>';
    let htmlColumnAccountName = '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlcolumnAmount = '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnText = '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumAmount = 0;
    let lineNumber = 0;

    objDues.arrayDues.forEach((due) => {

      lineNumber++;

      // check if the number is odd
      const colorClass = (lineNumber % 2 !== 0) ? "green" : "";

      // line number
      htmlColumnLine +=
        `
          <div 
            class="centerCell ${colorClass}"
          >
            ${lineNumber}
          </div >
        `;

      // condo name
      let condoName = "-";
      if (due.condoId) {
        const condoId =
          Number(due.condoId);
        condoName =
          objCondo.getCondoName(condoId);
      }
      htmlColumnCondoName +=
        `
          <div
            class="${colorClass} leftCell one-line"
          >
            ${condoName}    
          </div >
        `;

      // account name
      const accountName =
        objAccounts.getAccountName(due.accountId);
      const colorClassAccountName =
        (accountName === '-') ? 'red' : colorClass;
      htmlColumnAccountName +=
        `
          <div
            class="leftCell ${colorClassAccountName} one-line"
          >
            ${accountName}    
          </div >
        `;

      // date
      const date =
        formatToNorDate(due.date);
      htmlColumnDate +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${date}
          </div >
        `;

      // amount
      const amount =
        formatOreToKroner(due.amount);
      htmlcolumnAmount +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${amount}
          </div>
        `;

      // text
      htmlColumnText +=
        `
          <div
            class="leftCell ${colorClass} one-line"
          >
            ${due.text}
          </div>
        `;

      // accumulate
      sumAmount += Number(due.amount);
    });

    // Sum line

    // amount
    amount = formatOreToKroner(sumAmount);
    htmlcolumnAmount +=
      `
        <div
          class="sumCellRight"
        >
          ${amount}
        </div >
      `;

    // Show line number
    document.querySelector('.div-dues-columnLine').innerHTML = htmlColumnLine;

    // Show date
    document.querySelector('.div-dues-columnDate').innerHTML = htmlColumnDate;

    // Show condo name
    document.querySelector('.div-dues-columnCondoName').innerHTML = htmlColumnCondoName;

    // Show account name
    document.querySelector('.div-dues-columnAccountName').innerHTML = htmlColumnAccountName;

    // Show amount
    document.querySelector('.div-dues-columnAmount').innerHTML = htmlcolumnAmount;

    // Show text
    document.querySelector('.div-dues-columnText').innerHTML = htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account
  const accountId =
    document.querySelector('.select-dues-filterAccountId').value;
  const validAccountId = validateNumber(accountId, 1, 999999999, 'dues-filterAccountId', 'Konto');

  const condoId = Number(document.querySelector('.select-dues-filterCondoId').value);
  const validCondoId = validateNumber(accountId, 1, 999999999, 'dues-filterCondoId', 'Leilighet');

  const fromDate = document.querySelector('.input-dues-filterFromDate').value;
  const validFromDate = validateNorDate(fromDate, 'dues-filterFromDate', 'Fra dato');

  const toDate = document.querySelector('.input-dues-filterToDate').value;
  const validToDate = validateNorDate(toDate, 'dues-filterToDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}