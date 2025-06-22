// Import of bank transaction file 

// Activate objects
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objCondo = new Condo('condo');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objDue = new Due('due');
const objIncome = new Income('income');
const objSupplier = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

testMode();

let importFileArray = [];
let textFile;

let isEventsCreated = false;

// Mark selected menu
objImportFile.menu();
objImportFile.markSelectedMenu('Importer bankkontobevegelser');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('importfile-login');
} else {

  // Send a message to the server
  socket.onopen = () => {


    // Sends a request to the server to get all users
    const SQLquery =
      `
        SELECT * FROM user
        ORDER BY userId;
      `;
    socket.send(SQLquery);
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let message = event.data;

    // Create user array including objets
    if (message.includes('"tableName":"user"')) {

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condominium
          ORDER BY condominiumId;
        `;
      socket.send(SQLquery);
    }

    // Create condominium array including objets
    if (message.includes('"tableName":"condominium"')) {

      console.log('condominiumTable');

      // user array including objects with user information
      condominiumArray = JSON.parse(message);

      // Sends a request to the server to get all user bank accounts
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          ORDER BY userbankaccountId;
        `;
      socket.send(SQLquery);
    }

    // Create user bank account array including objets
    if (message.includes('"tableName":"userbankaccount"')) {

      console.log('userbankaccountTable');

      // array including objects with user ank account information
      userBankAccountArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condo
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      console.log('condoTable');

      // array including objects with condo information
      condoArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM bankaccount
          ORDER BY bankAccountId;
        `;
      socket.send(SQLquery);
    }

    // Create bank account array including objets
    if (message.includes('"tableName":"bankaccount"')) {

      console.log('bankaccountTable');

      // array including objects with bank account information
      bankAccountArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM due
          ORDER BY dueId;
        `;
      socket.send(SQLquery);
    }

    // Create due array including objets
    if (message.includes('"tableName":"due"')) {

      console.log('dueTable');

      // array including objects with due information
      dueArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM supplier
          ORDER BY supplierId;
        `;
      socket.send(SQLquery);
    }

    // Create supplier array including objets
    if (message.includes('"tableName":"supplier"')) {

      console.log('supplierTable');

      // array including objects with supplier information
      supplierArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM account
          ORDER BY accountId;
        `;
      socket.send(SQLquery);
    }

    // Create account array including objets
    if (message.includes('"tableName":"account"')) {

      // account table
      console.log('accountTable');

      // array including objects with account information
      accountArray = JSON.parse(message);

      // Get all income rows
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          ORDER BY bankaccountmovementId;
        `;
      socket.send(SQLquery);
    }

    // Create bankaccountmovement array including objets
    if (message.includes('"tableName":"bankaccountmovement"')) {

      // bankaccountmovement table
      console.log('bankaccountmovementTable');

      // array including objects with bankaccountmovement information
      bankAccountMovementArray = JSON.parse(message);

      // Get all income rows
      const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
      socket.send(SQLquery);
    }

    // Create income array including objets
    if (message.includes('"tableName":"income"')) {

      // income table
      console.log('incomeTable');

      // array including objects with income information
      incomeArray = JSON.parse(message);

      // Show leading text
      //showButtons();

      //requestImportFile();

      // Send a request to the server to get all bank account transactions
      const objectNumberCondominium =
        condominiumArray.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
      if (objectNumberCondominium >= 0) {

        const importFileName = `${condominiumArray[objectNumberCondominium].importPath}//transaksjonsliste.csv`;
        socket.send(`Name of importfile: ${importFileName}`);
      }

      //getImportFileName('importfile-importFileName');

      // Make events
      if (!isEventsCreated) {

        createEvents();
        isEventsCreated = true;
      }
    }

    // Create user array including objets
    if (message.includes('Dato;Rentedato;Beskrivelse;Inn;Ut;')) {

      createImportFileArray(message);
      showBankAccountMovements();
      showLeadingText();
      showValues(1);
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');
    }
  }

  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
}


// Make importfile events
function createEvents() {

  // Show selected import file row
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-importFileId')) {

      // Get row number import file array
      const rowNumber =
        Number(document.querySelector(".select-importfile-importFileId").value);

      showValues(rowNumber);
    };
  });

  // Update import file array
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-updateImportArray')) {

      // Get row number import file array
      const rowNumber =
        Number(document.querySelector(".select-importfile-importFileId").value);

      updateImportFileArray(rowNumber);

      showBankAccountMovements();

      showValues(rowNumber);
    };
  });

  // Update bank account movements
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-updateBankAccountMovement')) {


      // Update bank account movements
      updateBankAccountMovements();

      // Reset screen
      resetBankAccountMovements();
      document.querySelector(".button-importfile-updateBankAccountMovement").remove();
      document.querySelector(".button-importfile-updateImportArray").remove();
      removeBankAccountImportLine();
    }
  });
}

// Show leading text for income
function showLeadingText() {

  // Show all all account movements to update
  objImportFile.showImportFile('importfile-importFileId', 0);

  // Show date
  objImportFile.showInput('importfile-date', '* Dato', 10, 'dd.mm.åååå');

  // Show all condos
  objCondo.showAllCondos('importfile-condoId', 0);

  // Show all accounts
  objAccount.showAllAccounts('importfile-accountId', 0);

  // Show income
  objImportFile.showInput('importfile-income', '* Inntekt', 10, '');

  // Show payment
  objImportFile.showInput('importfile-payment', '* Utgift', 10, '');

  // Show text
  objImportFile.showInput('importfile-text', '* Tekst', 50, '');

  // Show button
  objImportFile.showButton('importfile-updateImportArray', 'Oppdater');

  // Show button for update of bank account movement
  objImportFile.showButton('importfile-updateBankAccountMovement', 'Oppdater bankkonto bevegelser');
}

// Show values for import file
function showValues(rowNumber) {

  // validate row number
  if (rowNumber > 0) {
    rowNumber--
  } else {
    rowNumber = 0;
  }

  // selected condo
  document.querySelector('.select-importfile-condoId').value =
    importFileArray[rowNumber].condoId;

  // selected account
  document.querySelector('.select-importfile-accountId').value =
    importFileArray[rowNumber].accountId;

  // Show date
  document.querySelector('.input-importfile-date').value =
    importFileArray[rowNumber].accountingDate;

  // Show income
  document.querySelector('.input-importfile-income').value =
    importFileArray[rowNumber].income;

  // Show payment
  document.querySelector('.input-importfile-payment').value =
    importFileArray[rowNumber].payment;

  // Show text
  document.querySelector('.input-importfile-text').value =
    importFileArray[rowNumber].text;
}

function deleteIncomeRow() {

  let SQLquery = "";

  // Check for valid income Id
  const incomeId = Number(document.querySelector('.select-importfile-income').value);

  // Check for valid income Id
  if (incomeId > 0) {

    // Check if income exist
    const objectNumberIncome = importFileArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM income
        WHERE incomeId = ${incomeId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }
}

function resetValues() {

  document.querySelector('.select-importfile-income').value =
    '';
  document.querySelector('.input-importfile-payment').value =
    '';
  document.querySelector('.input-importfile-date').value =
    '';
  document.querySelector('.input-importfile-text').value =
    '';

  document.querySelector('.select-importfile-importFileId').disabled =
    true;
  document.querySelector('.button-importfile-delete').disabled =
    true;
  document.querySelector('.button-importfile-new').disabled =
    true;
}

function showBankAccountMovements() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;
  let rowNumber = 0;

  let htmlColumnLineNumber =
    '<div class = "columnHeaderCenter">Linje</div><br>';
  let htmlColumnAccountingDate =
    '<div class = "columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName =
    '<div class = "columnHeaderRight">Leilighet</div><br>';
  let htmlColumnAccountName =
    '<div class = "columnHeaderRight">Konto</div><br>';
  let htmlColumnFromBankAccount =
    '<div class = "columnHeaderRight">Fra b.konto</div><br>';
  let htmlColumnToBankAccount =
    '<div class = "columnHeaderRight">Til b.konto</div><br>';
  let htmlColumnPayment =
    '<div class = "columnHeaderRight">Beløp</div><br>';
  let htmlColumnText =
    '<div class = "columnHeaderLeft">Tekst</div><br>';

  importFileArray.forEach((importFile) => {

    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
    htmlColumnLineNumber +=
      `
        <div
          class = "centerCell ${colorClass}"
        >
          ${rowNumber}
        </div>
      `;

    htmlColumnAccountingDate +=
      `
        <div 
          class = "rightCell ${colorClass}"
        >
          ${importFile.accountingDate}
        </div>
      `;

    // Condo name
    const condoName =
      objCondo.getCondoName(importFile.condoId);
    htmlColumnCondoName +=
      `
        <div
          class = "rightCell ${colorClass} "
        >
          ${condoName}
        </div>
      `;

    accountName =
      truncateText(importFile.accountName, 'div-importfile-columnAccountName');

    if (importFile.accountId) {

      htmlColumnAccountName +=
        `
        <div
          class = "rightCell ${colorClass}"
        >
          ${accountName}
        </div>
      `;
    } else {

      htmlColumnAccountName +=
        `
        <div
          class = "rightCell red"
        >
          ${accountName}
        </div>
      `;

    }

    const fromBankAccountName =
      truncateText(importFile.fromBankAccountName, 'div-importfile-columnFromBankAccount');
    htmlColumnFromBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${fromBankAccountName}
        </div>
      `;

    // get to bank account name
    const toBankAccountName =
      truncateText(importFile.toBankAccountName, 'div-importfile-columnToBankAccount');
    htmlColumnToBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${toBankAccountName}
        </div>
      `;

    // Payment (income or payment)
    let payment =
      formatFromOreToKroner(importFile.payment);
    if (Number(importFile.payment) === 0) {

      payment =
        formatFromOreToKroner(importFile.income);
    }
    htmlColumnPayment +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${payment}
        </div>
      `;

    // Text has to fit into the column
    let text = truncateText(importFile.text, 'div-importfile-columnText');
    text = (text === "") ? "-" : text;
    htmlColumnText +=
      `
        <div
          class = "leftCell ${colorClass}"
        />
          ${text}
        </div>
      `;

    // Accomulate

    // income
    const numericIncome = Number(importFile.income.replace(",", ".")) * 100;
    sumColumnIncome += Number(numericIncome);

    // payment
    const numericPayment = Number(importFile.payment.replace(",", ".")) * 100;
    sumColumnPayment += Number(numericPayment);
  });

  //Show sum row
  htmlColumnLineNumber +=
    `
      <div 
        class = "sumCellLeft"
      >
       -
      </div>
    `;

  htmlColumnAccountingDate +=
    `
      <div 
        class = "sumCellRight"
      >
        -
      </div>
    `;

  htmlColumnCondoName +=
    `
      <div 
        class = "sumCellRight"
      >
        -
      </div>
    `;

  htmlColumnAccountName +=
    `
      <div 
        class = "sumCellRight"
      >
        Utg.balanse 
      </div>
    `;

  // opening balance date
  const closingBalanceDate =
    getClosingBalanceDate();
  htmlColumnFromBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        ${closingBalanceDate}
      </div>
    `;

  // opening balance
  let openingBalance =
    getOpeningBalance();
  openingBalance =
    formatFromOreToKroner(openingBalance);
  htmlColumnToBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        ${openingBalance}
      </div>
    `;

  const sumColumnPayments =
    sumColumnPayment + sumColumnIncome;
  const payments =
    formatFromOreToKroner(sumColumnPayments);
  htmlColumnPayment +=
    `
      <div 
        class = "sumCellRight"
      >
        ${payments}
      </div>
    `;

  // Utgående balanse
  openingBalance = openingBalance.replace(" ", "");
  openingBalance = openingBalance.replace(",", "");
  let closingBalanse =
    Number(openingBalance) + sumColumnPayment + sumColumnIncome;
  closingBalanse =
    formatFromOreToKroner(closingBalanse);
  htmlColumnText +=
    `
      <div 
        class = "sumCellLeft"
      >
        ${closingBalanse}
      </div>
    `;

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML =
    htmlColumnLineNumber;
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnName").innerHTML =
    htmlColumnCondoName;
  document.querySelector(".div-importfile-columnAccountName").innerHTML =
    htmlColumnAccountName;
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML =
    htmlColumnFromBankAccount;
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML =
    htmlColumnToBankAccount;
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML =
    htmlColumnText;
}

// Create array for bank account movement
function createImportFileArray(fileContent) {

  let importFileId = 0;

  textFile = fileContent.split(/\r?\n/);
  textFile.forEach((record) => {

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (European date format) format
    if (validateEuroDateFormat(accountingDate)) {

      // text
      // remove first and last "
      text =
        text.replace(/^"|"$/g, '');

      // Condo id
      const condoId =
        objImportFile.getCondoId(fromBankAccount);

      accountId =
        objImportFile.getAccountIdFromBankAccount(fromBankAccount, toBankAccount);

      // Account Name
      if (text.includes('FAKT.TJ')) {

        accountRowNumber =
          accountArray.findIndex(account => account.name.includes('FAKT.TJ'));
        if (accountRowNumber !== -1) {

          accountId =
            accountArray[accountRowNumber].accountId;
          accountName =
            accountArray[accountRowNumber].name;
        }
      } else {

        if (accountId) {
          accountName =
            objImportFile.getAccountName(accountId);

        } else {

          accountName =
            text;
        }
      }

      // get to bank account name 
      toBankAccountName =
        objImportFile.getBankAccountName(toBankAccount);

      fromBankAccountName =
        objImportFile.getBankAccountName(fromBankAccount);

      // From bank account
      importFileId++;
      console.log('importFileId:', importFileId, "-", accountId);

      const objBankAccountMovement = {
        importFileId: importFileId,
        accountingDate: accountingDate,
        condoId: condoId,
        accountId: accountId,
        accountName: accountName,
        fromBankAccount: fromBankAccount,
        fromBankAccountName: fromBankAccountName,
        toBankAccount: toBankAccount,
        toBankAccountName: toBankAccountName,
        income: income,
        payment: payment,
        text: text
      };

      importFileArray.push(objBankAccountMovement);
    }
  });
}

// Update Bank Account Movement table
function updateBankAccountMovements() {

  importFileArray.forEach((importFile) => {

    // Update income and bank Account Movement table
    updateIncomeTable(importFile.importFileId);

    // Update payment and bank Account Movement table
    updatePaymentTable(importFile.importFileId);
  });

  // Update opening balance
  updateOpeningBalance();
}

// Update income- and account movement table
function updateIncomeTable(rowNumber) {

  rowNumber--;

  if ((importFileArray[rowNumber].income) !== '') {

    let SQLquery = '';

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(importFileArray[rowNumber].condoId);

    const accountId =
      Number(importFileArray[rowNumber].accountId);

    const amount =
      formatKronerToOre(importFileArray[rowNumber].income);

    const date =
      convertDateToISOFormat(importFileArray[rowNumber].accountingDate);

    const text =
      importFileArray[rowNumber].text;

    SQLquery =
      `
        INSERT INTO income (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'income',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

    // Client sends a request to the server
    socket.send(SQLquery);

    console.log('condoId 2,5:', condoId);
    SQLquery =
      `
        INSERT INTO bankaccountmovement (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'bankaccountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

function updatePaymentTable(rowNumber) {

  let SQLquery = "";

  // validate row number
  if (rowNumber > 0) {
    rowNumber--;
  } else {
    rowNumber = 0;
  }

  if ((importFileArray[rowNumber].payment) !== '') {

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(importFileArray[rowNumber].condoId);
    console.log('condoId 3:', condoId);

    const accountId =
      (((Number(importFileArray[rowNumber].accountId)) === 0)
        || (!importFileArray[rowNumber].accountId))
        ? 1
        : Number(importFileArray[rowNumber].accountId);

    const amount =
      formatKronerToOre(importFileArray[rowNumber].payment);

    let numberKWHour = 0;

    const date =
      convertDateToISOFormat(importFileArray[rowNumber].accountingDate);

    const text =
      importFileArray[rowNumber].text;
    console.log('text: 3', text)

    SQLquery =
      `
        INSERT INTO payment (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          accountId,
          amount,
          numberKWHour,
          date,
          text
        )
        VALUES (
          'payment',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          '${amount}',
          '${numberKWHour}',
          '${date}', 
          '${text}'
        );
        `;

    // Client sends a request to the server
    socket.send(SQLquery);

    SQLquery =
      `
        INSERT INTO bankaccountmovement (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          accountId,
          amount,
          date,
          text
        )
        VALUES (
          'bankaccountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

// Update opening balance
function updateOpeningBalance() {

  let bankAccountId = 0;

  textFile.forEach((record) => {

    [accountingDate, openingBalance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("DRIFT.")) {

      // remove first and last " in text
      accountingDate = accountingDate.replace(/\./g, "");
      accountingDate = accountingDate.replace(/\"/g, "");
      accountingDate = accountingDate.replace(/ /g, "");

      [text, bankAccountNumber] =
        accountingDate.split(',');

      bankAccountId =
        (bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber) + 1);
    }

    if (accountingDate.includes("Inngående saldo pr.")) {

      // Remove first and last "
      openingBalance = openingBalance.replace(/^"|"$/g, '');
      openingBalance = openingBalance.replace(".", "");

      const norDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate = norDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate = convertDateToISOFormat(openingBalanceDate);

      const now = new Date();
      const lastUpdate = now.toISOString();

      // Update opening balance
      SQLquery =
        `
          UPDATE bankaccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            openingBalance = '${openingBalance}',
            openingBalanceDate = '${openingBalanceDate}'
          WHERE bankAccountId = ${bankAccountId};
        `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }
  });
}

// Get opening balance
function getOpeningBalance() {

  let openingBalace;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Inngående saldo")) {

      // remove first and last " in openingBalance
      openingBalance = description.replace(/\./g, "");
      openingBalance = openingBalance.replace(/\"/g, "");
      openingBalance = openingBalance.replace(/ /g, "");
    }
  });

  return openingBalance;
}

// Get opening balance date
function getOpeningBalanceDate() {

  let openingBalanceDate;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Inngående saldo pr")) {

      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return openingBalanceDate ? openingBalanceDate[0] : null;
}

// Get closing balance date
function getClosingBalanceDate() {

  let closingBalanceDate;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Utgående saldo pr")) {

      closingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return closingBalanceDate ? closingBalanceDate[0] : null;
}

// reset Bank Account Movements
function resetBankAccountMovements() {

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML =
    '';
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    '';
  document.querySelector(".div-importfile-columnName").innerHTML =
    '';
  document.querySelector(".div-importfile-columnAccountName").innerHTML =
    '';
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML =
    '';
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML =
    '';
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    '';
  document.querySelector(".div-importfile-columnText").innerHTML =
    '';
}

function removeBankAccountImportLine() {

  document.querySelector(".select-importfile-importFileId").remove();
  document.querySelector(".label-importfile-importFileId").remove();
  document.querySelector(".select-importfile-condoId").remove();
  document.querySelector(".label-importfile-condoId").remove();
  document.querySelector(".select-importfile-accountId").remove();
  document.querySelector(".label-importfile-accountId").remove();
  document.querySelector(".input-importfile-date").remove();
  document.querySelector(".label-importfile-date").remove();
  document.querySelector(".input-importfile-income").remove();
  document.querySelector(".label-importfile-income").remove();
  document.querySelector(".input-importfile-payment").remove();
  document.querySelector(".label-importfile-payment").remove();
  document.querySelector(".input-importfile-text").remove();
  document.querySelector(".label-importfile-text").remove();
}

// Send a request to the server to get all bank account transactions
function requestImportFile() {

  const objectNumberCondominium =
    condominiumArray.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (objectNumberCondominium >= 0) {

    const importFileName = `${condominiumArray[objectNumberCondominium].importPath}//transaksjonsliste.csv`;
    socket.send(`Name of importfile: ${importFileName}`);
  }
}

/*
// get condo Id
function getCondoId(bankAccount) {

  let condoId = 0;

  // Check for valid bank account
  if (Number(bankAccount) > 987654321) {

    const objUserBankAccountNumber = userBankAccountArray.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccount);
    if (objUserBankAccountNumber > 0) {

      userId = Number(userBankAccountArray[objUserBankAccountNumber].userId);

      if (userId >= 0) {

        const objUserNumber = userArray.findIndex(user => user.userId === userId);
        if (objUserNumber >= 0) {

          condoId =
            Number(userArray[objUserNumber].condoId);
        }
      }
    }
  }
  return condoId;
}
*/

// Update import file array row
function updateImportFileArray(rowNumber) {

  // validate row number
  if (rowNumber > 0) {
    rowNumber--;
  } else {
    rowNumber = 0;
  }
  // condo Id
  importFileArray[rowNumber].condoId =
    Number(document.querySelector('.select-importfile-condoId').value);
  console.log('condoId 5:', condoId);

  // Account Id
  importFileArray[rowNumber].accountId =
    Number(document.querySelector('.select-importfile-accountId').value);

  // Account Name
  const accountId =
    importFileArray[rowNumber].accountId;
  const objNumberAccount =
    accountArray.findIndex(account => account.accountId === accountId);
  if (objNumberAccount >= 0) {
    importFileArray[rowNumber].accountName =
      accountArray[objNumberAccount].name;
  }

  // Acounting Date
  importFileArray[rowNumber].accountingDate =
    document.querySelector('.input-importfile-date').value;

  // Income
  importFileArray[rowNumber].income =
    document.querySelector('.input-importfile-income').value;

  // Payment
  importFileArray[rowNumber].payment =
    document.querySelector('.input-importfile-payment').value;

  // Text
  importFileArray[rowNumber].text =
    document.querySelector('.input-importfile-text').value;
}
