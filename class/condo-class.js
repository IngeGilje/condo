// class for all applications for the condo system
class Condos {

  // serverStatus = 1; // Web server
  // serverStatus = 2; // Test web server/ local web server
  // serverStatus = 3; // Test server/ local test server
  serverStatus = 3; // Test server/ local test server

  inactivityTimeout =
    false;

  // All year from 2020 until 2039
  #yearArray = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029,
    2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039];

  constructor(applicationName) {

    this.applicationName = applicationName;
  }

  // Validate application name
  set applicationName(validatedApplicationName) {

    if (typeof validatedApplicationName === 'string'
      && validatedApplicationName.length >= 3) {

      this._applicationName = validatedApplicationName;
    } else {

      console.error("Invalid application name.");
    }
  }

  get applicationName() {
    return this._applicationName;
  }

  // Show leading text for label
  showLeadingTextLabel(className, labelText) {
    return `
      <label
        class="label-${className}"
      >
        ${labelText}
      </label>
    `;
  }

  // Show input
  showInput(className, labelText, maxlength, placeholder) {

    let html =
      this.showLabel(className, labelText);

    html +=
      `
        <input 
          type="text" 
          class="input-${className} icon-input"
          maxlength="${maxlength}"
          placeholder="${placeholder}"
        >
      `;
    document.querySelector(`.div-${className}`).innerHTML =
      html;

    let imageName;
    imageName =
      className.includes('-name') ? "name.png" : '';
    imageName =
      className.includes('-street') ? "street.png" : imageName;
    imageName =
      className.includes('-address2') ? "address2.png" : imageName;
    imageName =
      className.includes('-postalCode') ? "postalcode.png" : imageName;
    imageName =
      className.includes('-city') ? "city.png" : imageName;
    imageName =
      className.includes('-phone') ? "phone.png" : imageName;
    imageName =
      className.includes('-email') ? "email.png" : imageName;
    imageName =
      className.includes('-organizationNumber') ? "organizationnumber.png" : imageName;
    imageName =
      className.includes('-fileName') ? "filename.png" : imageName;
    imageName =
      className.includes('-date') ? "date.png" : imageName;
    imageName =
      className.includes('-income') ? "income.png" : imageName;
    imageName =
      className.includes('-payment') ? "payment.png" : imageName;
    imageName =
      className.includes('-numberKWHour') ? "numberKWHour.png" : imageName;
    imageName =
      className.includes('-text') ? "text.png" : imageName;
    imageName =
      className.includes('-filterFromDate') ? "date.png" : imageName;
    imageName =
      className.includes('-fromDate') ? "date.png" : imageName;
    imageName =
      className.includes('-toDate') ? "date.png" : imageName;
    imageName =
      className.includes('-filterToDate') ? "date.png" : imageName;
    imageName =
      className.includes('-filterAmount') ? "amount.png" : imageName;
    imageName =
      className.includes('-amount') ? "amount.png" : imageName;
    imageName =
      className.includes('-bankAccount') ? "bankAccount.png" : imageName;
    imageName =
      className.includes('-firstName') ? "name.png" : imageName;
    imageName =
      className.includes('-lastName') ? "name.png" : imageName;
    imageName =
      className.includes('-password') ? "password.png" : imageName;
    imageName =
      className.includes('-accountName') ? "accountName.png" : imageName;
    imageName =
      className.includes('-openingBalance') ? "amount.png" : imageName;
    imageName =
      className.includes('-closingBalance') ? "amount.png" : imageName;
    imageName =
      className.includes('-openingBalanceDate') ? "date.png" : imageName;
    imageName =
      className.includes('-closingBalanceDate') ? "date.png" : imageName;
    imageName =
      className.includes('-importFileName') ? "filename.png" : imageName;

    // Set the PNG file
    const input =
      document.querySelector(`.input-${className}`);
    input.style.backgroundRepeat = `no-repeat`;
    input.style.backgroundImage = `url('icons/${imageName}')`;
  }

  /*
  // Show input
  showInput(className, labelText, maxlength, placeholder) {

    let html = `<input type="text" class="icon-input input-${className}" placeholder="Type here..." />`;
    document.querySelector(`.div-${className}`).innerHTML =
      html;

          // Dynamically set the PNG file
    const input = document.querySelector(`.div-${className}`);

    const iconPath = "icons/delete.png";
    input.style.backgroundImage = `url('${iconPath}')`;
  }
  */


  // Show leading text for input
  showLeadingTextInput(className, labelText, maxlength, placeholder) {

    let html = this.showLeadingTextLabel(className, labelText);
    html +=
      `
        <input type="text" 
          class="input-${className}"
          maxlength="${maxlength}"
          placeholder="${placeholder}"
        >
      `;
    document.querySelector(`.div-${className}`)
      .innerHTML = html;
  }

  // Show label
  showLabel(className, labelText) {
    return `
        <label
          class="label-${className}">
          ${labelText}
        </label>
      `;
  }

  // Show button
  showButton(className, buttonText) {
    let imageName;
    imageName =
      className.includes('-email') ? "mail.png" : '';
    imageName =
      className.includes('-save') ? "save.png" : '';
    imageName =
      className.includes('-insert') ? "insert.png" : imageName;
    imageName =
      className.includes('-cancel') ? "cancel.png" : imageName;
    imageName =
      className.includes('-delete') ? "delete.png" : imageName;
    imageName =
      className.includes('-startImport') ? "not_started.png" : imageName;

    const html =
      `
        <button 
          class="button-${className}"
        >
          <img 
            src="icons/${imageName}" 
            height="18"
          >
          ${buttonText}
        </button>
      `;
    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Show checkbox
  showCheckbox(columnName, labelText, ...texts) {

    let html = this.showLabel(columnName, labelText);
    html +=
      `
        <form 
          id="${columnName}"
        >
      `;
    texts.forEach((text) => {
      html +=
        `
          <input type="checkbox" 
            class="input-${columnName}"
            id="${text}"
          >
            ${text}
          <br>
        `;
    });

    html +=
      `
        </form>
      `;
    document.querySelector(`.div-${columnName}`)
      .innerHTML = html;
  }

  // Show radio buttons
  showRadioButtons(columnName, ...texts) {

    let html =
      `
        <form 
          id="${columnName}"
        >
        <div class = "div-radio-${columnName}"
        >
      `;

    texts.forEach((text) => {
      html +=
        `
          ${text}
          <input type="radio"
            id="${text}"
            name="${columnName}"
            value="${columnName}"
            class="input-radio-${text}"
          >
          <br>
        `;
    });

    html += `
        </div>
      </form>
    `;
    document.querySelector(`.div-${columnName}`).innerHTML =
      html;
  }

  // Show read only input
  showInputReadOnly(className, labelText) {

    document.querySelector(`.div-${className}`).innerHTML =
      `
        <label 
          class="label-${className}"
        >
          ${labelText}
        </label>

        <input 
          type="text" 
          readonly
          class="input-${className}"
        >
      `;
  }

  // Valid text
  validateText(tekst, className, labelText) {

    let validTekst =
      true;

    // Check for string
    if (typeof tekst !== "string") {

      validTekst =
        false;
    }

    // Check length
    if (tekst.length > 50) {

      validTekst =
        false;
    };

    // Check allowed characters (letters, numbers, spaces)
    if (tekst.length > 0) {


      const regex = /^[a-zA-ZæøåÆØÅ0-9.,\-+_%!:#"'\\/ ]*$/
      validTekst = (regex.test(tekst)) ? true : false;
    }

    if (!validTekst) {

      // Invalid text
      if (isClassDefined(className)) {

        document.querySelector(`.${className}`).outerHTML =
          `
            <div class="${className}-red">
              * Ugyldig ${labelText}
            </div>
          `;
      }
    }

    // Valid text
    if (validTekst) {
      if (isClassDefined(`${className}-red`)) {

        document.querySelector(`.${className}-red`).outerHTML =
          `
            <div class="${className}">
              * ${labelText}
            </div>
          `;
      }
    }
    return validTekst;
  }

  // Validate postal code
  validatePostalCode(postalCode, className, labelText) {

    let isValidPostalCode = false;

    // Check valid postal code
    const norwegianPostalCodePattern = /^[0-9]{4}$/;
    if (!(norwegianPostalCodePattern.test(postalCode))) {

      // Invalid postal code
      if (isClassDefined(className)) {

        document.querySelector(`.${className}`).outerHTML =
          `<div class="${className}-red">
              * Ugyldig ${labelText}
            </div>`;
      }
      isValidPostalCode = false;
    } else {

      // Valid valid postal code
      if (isClassDefined(`${className}-red`)) {

        document.querySelector(`.${className}-red`).outerHTML =
          `<div class="className">
              * ${labelText}
            </div>`;
      }
      isValidPostalCode = true;
    }
    return isValidPostalCode;
  }

  // Validate E-mail
  validateEmail(eMail, className, labelText) {

    let isValideMail = false;

    // Validate eMail
    const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!(eMailRegex.test(eMail))) {

      // Invalid eMail
      if (isClassDefined(className)) {

        document.querySelector(`.${className}`).outerHTML =
          `<div class="${className}-red">
              * Ugyldig ${labelText}
            </div>`;
      }
      isValideMail = false;
    } else {

      // Valid valid eMail
      if (isClassDefined(`${className}-red`)) {

        document.querySelector(`.${className}-red`).outerHTML =
          `<div class="${className}">
              * ${labelText}
            </div>`;
      }
      isValideMail = true;
    }
    return isValideMail;
  }

  // validate bank account 
  validateBankAccount(bankAccount, className, labelText) {

    // Validate Bank Account
    const bankAccountPattern = /^\d{11}$/;
    if (!(bankAccountPattern.test(bankAccount))) {

      // Invalid bank account
      if (isClassDefined(`${className}`)) {

        document.querySelector(`.${className}`).outerHTML =
          ` <div class="${className}-red">
              * Ugyldig ${labelText}
            </div>
          `;
      }
      return false;
    } else {

      // Valid valid Organization Number
      if (isClassDefined(`label-${className}-red`)) {

        document.querySelector(`.label-${className}-red`).outerHTML =
          `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
      }
      return true;
    }
  }

  // select file
  showInputFile(className) {

    document.querySelector(`.div-${className}`).innerHTML =
      `
        <input
          type="file"
          id="fileInput"
          class="input-importfile-fileName"
        >
        <p 
          id="fileName"
          class="p-importfile-fileName"
        >
        </p>
      `;
  }

  // Mark selected application in menu
  markSelectedMenu(text) {

    document.querySelector(`.a-menu-vertical-${this.applicationName}`).outerHTML =
      `
      <div 
        class='a-menu-vertical-${this.applicationName}-green'
      >
        ${text}
      </div>
    `;
  }

  showAllYears(className, selectedYear) {

    let html = `
      <form 
        action="/submit" 
        method="POST"
        id="showAllYears"
      >
        <label class="label-${className}"
          for="selectedYear">
            År
        </label>
        <select 
          class="select-${className}" 
          id="selectedYear"
          name="selectedYear"
        >
      `;

    let selectedOption =
      false;

    this.yearArray.forEach((year) => {
      if (year === selectedYear) {

        html += `
          <option 
            value="${year}"
            selected
          >
            ${year}
          </option>
        `;
        selectedOption =
          true;
      } else {
        html += `
          <option 
            value="${year}"
            >
            ${year}
          </option>
        `;
      }
    });

    html += `
        </select >
      </form>
    `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Select account
  selectAccountId(accountId, className) {

    // Check if account id exist
    const objUserAccountNumber =
      accountArray.findIndex(account => account.accountId === accountId);
    if (objUserAccountNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        accountId;
      return true;
    } else {

      return false;
    }
  }

  // Select budget
  selectBudgetId(budgetId, className) {

    // Check if budget id exist
    const objBudgetNumber =
      budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        budgetId;
      return true;
    } else {

      return false;
    }
  }

  // Select bank account
  selectBankAccountId(bankAccountId, className) {

    // Check if account id exist
    const objBankAccountRowNumber =
      bankAccountArray.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
    if (objBankAccountRowNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        bankAccountId;
      return true;
    } else {

      return false;
    }
  }

  // Select condo Id
  selectCondoId(condoId, className) {

    // Check if condo id exist
    const objCondoRowNumber =
      condoArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        condoId;
      return true;
    } else {

      return false;
    }
  }

  // Select year
  selectYear(year, className) {

    // Check if year
    const objYearRowNumber =
      this.yearArray.findIndex(year => year.year === year);
    if (objYearRowNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        year;
      return true;
    } else {

      return false;
    }
  }

  // Select numbers
  selectNumber(className, fromNumber, toNumber, selectedNumber, labelText) {

    let html =
      `
      <form 
        id="selectedNumber"
        action="/submit" method="POST"
      >
        <label 
          class="label-${className}"
          for="selectedNumber">
            ${labelText}
        </label>
        <select class="select-${className}" 
          id="selectedNumber"
          name="selectedNumber"
        >
    `;

    let selectedOption =
      false;

    for (let number = fromNumber; number <= toNumber; number++) {
      if (number === selectedNumber) {

        html += `
        <option 
          value="${number}"
          selected
          >
          ${number}
        </option>
      `;
        selectedOption =
          true;
      } else {
        html += `
        <option 
          value="${number}"
          >
          ${number}
        </option>
      `;
      }
    };

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // show button to start new page
  showPageButton(appName, className) {

    document.querySelector(`.div-${className}`).innerHTML =
      `
        <a
          class="button-link"
        >
          Login
        </a>
      `;
  }

  // Validate user
  validateUser(email, password) {

    let validUser = false;

    if (!(email === '' || password === '')) {
      userArray.forEach(userRow => {
        if (!validUser) {
          if (userRow.email === email && userRow.password === password) {
            validUser = true;
          }
        }
      });
    }

    return validUser;
  }

  menu() {

    let url;
    switch (this.serverStatus) {

      // Web server
      case 1: {

        url = "http://ingegilje.no/";
        break;
      }
      // Test web server/ local web server
      case 2:

      // Test server/ local test server
      case 3: {

        url = "http://localhost/";
        break;
      }

      default: {
        break;
      }
    }
    document.querySelector('.div-menu').innerHTML =
      `
        <a href="${url}condo-login.html"
          class="a-menu-vertical-login"
        >
          Login
        </a>

        <a href="${url}condo-condominium.html"
          class="a-menu-vertical-condominium"
        >
          Sameie
        </a>

        <a href="${url}condo-condo.html"
          class="a-menu-vertical-condo"
        >
          Leilighet
        </a>

        <a href="${url}condo-bankaccount.html"
          class="a-menu-vertical-bankaccount"
        >
          Bankkonto sameie
        </a>

        <a href="${url}condo-account.html"
          class="a-menu-vertical-account"
        >
          Kontonavn
        </a>

        <a href="${url}condo-user.html"
          class="a-menu-vertical-user"
        >
          Bruker
        </a>

        <a href="${url}condo-userbankaccount.html"
          class="a-menu-vertical-userbankaccount"
        >
          Bankkonto for bruker
        </a>

        <a href="${url}condo-supplier.html"
          class="a-menu-vertical-supplier"
        >
          Leverandør
        </a>

        <a href="${url}condo-due.html"
          class="a-menu-vertical-due"
        >
          Forfall
        </a>

        <a href="${url}condo-monthlyrent.html"
          class="a-menu-vertical-monthlyrent"
        >
          Månedsleie
        </a>

        <a href="${url}condo-budget.html"
          class="a-menu-vertical-budget"
        >
          Budsjett
        </a>

        <a href="${url}condo-remoteheating.html"
          class="a-menu-vertical-remoteheating"
        >
          Fjernvarme
        </a>

        <a href="${url}condo-overview.html"
          class="a-menu-vertical-overview"
        >
          Betalingsoversikt
        </a>

        <a href="${url}condo-bankaccountmovement.html"
          class="a-menu-vertical-bankaccountmovement"
        >
          Banktransaksjoner
        </a>

        <a href="${url}condo-importfile.html"
          class="a-menu-vertical-importfile"
        >
          Importer banktransaksjoner
        </a>

        <a href="${url}condo-accountreport.html"
          class="a-menu-vertical-accountreport"
        >
          Regnskapsrapport
        </a>
      `;
  }

  // Validate norwegian amount
  validateAmount(amount, className, labelText) {

    let isValidAmount = true;

    // 123456,78 -> 12345678
    amount =
      removeComma(amount);
    if (!isNumeric(amount)) {

      // Invalid amount
      if (isClassDefined(`label-${className}`)) {

        document.querySelector(`.label-${className}`).outerHTML =
          `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
      }
      isValidAmount = false;
    } else {

      if (isClassDefined(`label-${className}-red`)) {

        document.querySelector(`.label-${className}-red`).outerHTML =
          `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
      }
      isValidAmount = true;
    }
    return isValidAmount;
  }

  // Show input file
  showInputFile(className, labelText, maxlength, placeholder) {

    let html = this.showLabel(className, labelText);
    html +=
      `
        <input
          type="file"
          class="input-${className}"
          placeholder="${placeholder}"
          accept=".txt,.csv" 
        >
      `;
    document.querySelector(`.div-${className}`)
      .innerHTML = html;
  }

  // get text file name
  getFileName(className) {

    const fileInput = document.querySelector(`.input-'${className}`);
    const fileNameDisplay = document.getElementById(`.input-'${className}`);

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileNameDisplay.textContent = `Selected file: ${fileName}`;
      } else {
        fileNameDisplay.textContent = 'No file selected';
      }
    });
  }

  // get bank account name
  getBankAccountName(bankAccountNumber) {

    let bankAccountName = '';

    // Bank account name from bank account table 
    const objBankAccountRowNumber =
      bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber);
    if (objBankAccountRowNumber !== -1) {

      bankAccountName = bankAccountArray[objBankAccountRowNumber].name;
    }

    if (!bankAccountName) {

      // Bank account name from supplier table
      const objSupplierRowNumber =
        supplierArray.findIndex(supplier => supplier.bankAccount === bankAccountNumber);
      if (objSupplierRowNumber !== -1) {

        bankAccountName = supplierArray[objSupplierRowNumber].name;
      }
    }

    if (!bankAccountName) {

      // Bank account name from user bank account
      const objBankAccountRowNumber =
        userBankAccountArray.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccountNumber);
      if (objBankAccountRowNumber !== -1) {

        bankAccountName = userBankAccountArray[objBankAccountRowNumber].name;
      }
    }

    bankAccountName =
      (bankAccountName) ? bankAccountName : bankAccountNumber;
    return (bankAccountName) ? bankAccountName : "-";
  }

  // get account name
  getAccountName(accountId) {

    let accountName = "-";

    // Account name from account table
    const objAccountRowNumber =
      accountArray.findIndex(account => account.accountId === accountId);
    if (objAccountRowNumber !== -1) {

      accountName =
        accountArray[objAccountRowNumber].name;
    }

    return (accountName) ? accountName : "-";
  }

  // get condo Id from From Bank Account
  getCondoId(fromBankAccount) {

    let condoId = 0;

    // Validate Bank Account
    const bankAccountPattern = /^\d{11}$/;
    if ((bankAccountPattern.test(fromBankAccount))) {

      const objBankAccountRowNumber =
        userBankAccountArray.findIndex(userBankAccount => userBankAccount.bankAccount === fromBankAccount);
      if (objBankAccountRowNumber !== -1) {

        const userId = Number(userBankAccountArray[objBankAccountRowNumber].userId);

        if (userId >= 0) {

          const objUserRowNumber =
            userArray.findIndex(user => user.userId === userId);
          if (objUserRowNumber !== -1) {

            condoId =
              Number(userArray[objUserRowNumber].condoId);
          }
        }
      }
    }
    return condoId;
  }
}


// Check if string includes only digits
function isNumeric(string) {
  return !isNaN(string) && string.trim() !== "";
}

// Remove comma, periode and space
function removeComma(amount) {

  amount =
    amount.replace(/\s+/g, '');
  amount =
    String(amount).replace(/\./g, "");
  amount =
    amount.replace(/\,/g, "");
  return (amount === '000') ? '00' : amount;
}

// validate the dd.mm.yyyy (European date format) format
function validateEuroDateFormat(dateString) {

  // Regular expression for valuating the dd.mm.yyyy format
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateString.match(regex);

  if (!match) return false; // Return false if format doesn't match

  // Extract day, month, and year
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Check if month is between 1 and 12
  if (month < 1 || month > 12) return false;

  // Create a date object
  const date =
    new Date(year, month - 1, day);

  // Validate that the date components match
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  );
}

// Format date dd.mm.yyyy (European date format) to yyyymmdd ("Basic ISO 8601 format)
function convertDateToISOFormat(date) {
  if (date.includes('.')) {
    const dateParts = date.split(".");
    date =
      `${dateParts[2]}${dateParts[1]}${dateParts[0]}`;
  } else {
    date =
      '';
  }
  return date;
}

// Format date from yyyymmdd (Basic ISO 8601 format) -> dd.mm.yyyy (European date format)
function formatToNorDate(date) {

  date =
    String(date);
  const formatedDate =
    date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
  return (formatedDate.includes('..')) ? '' : formatedDate;
}

// Validate number
function validateNumber(number, min, max, className, labelText) {

  let isValidNumber = true;
  number = Number(number);
  min = Number(min);
  max = Number(max);

  // Validate number
  if (number < min || number > max) {

    // Invalid number
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    isValidNumber = false;
  } else {

    // Valid number
    if (this.isClassDefined(`label-${className}-red`)) {

      document.querySelector(`.label-${className}-red`).outerHTML =
        `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
    }
  }

  return isValidNumber;
}

// Validate norwegian date dd.mm.yyyy format
// Show error message
function validateNorDate(dateString, className, labelText) {

  let isDateValid = true;

  dateString =
    (dateString.length === 0) ? '00.00.0000' : String(dateString);
  [day, month, year] = dateString.split('.');
  day = day.padStart(2, "0");
  month = month.padStart(2, "0");
  dateString = day + '.' + month + '.' + year;

  // Validate date
  if (!this.validateEuroDateFormat(dateString)) {

    // Invalid date
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
      isDateValid = false;
    }
  } else {

    // Valid date
    document.querySelector(`.input-${className}`).value =
      dateString;

    if (this.isClassDefined(`label-${className}-red`)) {

      document.querySelector(`.label-${className}-red`).outerHTML =
        `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
    }
  }
  return isDateValid;
}

// Check if HTML class is defined
function isClassDefined(className) {

  const element =
    document.querySelector(`.${className}`);      // Select the element
  if (element !== null) {
    return (element.classList.contains(`${className}`)) ? true : false;
  } else {
    return false;
  }
}

function findNameOfMonth(month) {

  let nameOfMonth = '';
  switch (Number(month)) {
    case 1:
      nameOfMonth = 'Januar';
      break;
    case 2:
      nameOfMonth = 'Februar';
      break;
    case 3:
      nameOfMonth = 'Mars';
      break;
    case 4:
      nameOfMonth = 'April';
      break;
    case 5:
      nameOfMonth = 'Mai';
      break;
    case 6:
      nameOfMonth = 'Juni';
      break;
    case 7:
      nameOfMonth = 'Juli';
      break;
    case 8:
      nameOfMonth = 'August';
      break;
    case 9:
      nameOfMonth = 'September';
      break;
    case 10:
      nameOfMonth = 'Oktober';
      break;
    case 11:
      nameOfMonth = 'November';
      break;
    case 12:
      nameOfMonth = 'Desember';
      break;
  }
  return nameOfMonth;
}

// Validate phone number
function checkPhone(phone, className, labelText) {

  // Validate phone number
  const phonePattern = /^\d{8}$/;
  if (!(phonePattern.test(phone))) {

    // Invalid phone number
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    return false;
  } else {

    // Valid valid phone number
    if (this.isClassDefined(`label-${className}-red`)) {

      document.querySelector(`.label-${className}-red`).outerHTML =
        `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
    }
    return true;
  }
}

// Validate organization number
function validateOrganizationNumber(organizationNumber, className, labelText) {

  // Validate organization number Organization Number
  const organizationNumberPattern = /^\d{9}$/;
  if (!(organizationNumberPattern.test(organizationNumber))) {

    // Invalid Organization Number
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    return false;
  } else {

    // Valid Organization Number
    if (this.isClassDefined(`label-${className}-red`)) {

      document.querySelector(`.label-${className}-red`).outerHTML =
        `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
    }
    return true;
  }
}

// Get current date in  European date format (dd.mm.yyyy)
function getCurrentDate() {

  const today = new Date();
  const year = String(today.getFullYear());
  let month = today.getMonth() + 1;
  let day = today.getDate();
  month = (month < 10)
    ? '0' + String(month)
    : String(month)

  day = (day < 10)
    ? day = '0' + String(day)
    : String(day)

  return `${day}.${month}.${year}`;  // Output in dd.mm.yyyy format
}

// Format number (12345) to norwegian amount (1 2345,00)
function formatToNorAmount(amount) {

  amount = (amount.includes(",")) ? amount.replace(",", ".") : amount;
  amount = (amount.includes(".")) ? amount.replace(".", ",") : amount;
  amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return amount;
}

// Format number (1234567) to norwegian amount (1 2345,67)
function formatOreToKroner(amount) {

  amount = this.removeComma(String(amount));
  amount = String(Number(amount) / 100);
  amount = Number(amount).toFixed(2);
  return formatToNorAmount(amount);
}

// Format norwegian number (12 345,67) to number (12345.67)
function formatAmountToNumber(number) {

  const formatedNumber = number.replace(',', '.');
  number = formatedNumber.replace(/\s+/g, "");
  return number;
}

// Format norwegian kroner (12 345,67) to ore/number (1234567)
function formatKronerToOre(amount) {

  let kroner = '';
  let ore = '';

  // check for decimal number
  amount =
    amount.replace(/\s+/g, "");
  if (amount.includes('.')) {

    // decimal number
    [kroner, ore] = amount.split('.');
    ore =
      (ore.length === 1) ? ore + '0' : '00';

  } else {
    if (amount.includes(',')) {
      [kroner, ore] = amount.split(',');
      ore = (ore.length === 1) ? ore + '0' : ore.substring(0, 2);
    } else {

      // not decimal number
      kroner =
        amount;
      ore =
        "00";
    }
  }

  return kroner + ore;
}

// Format amount to euro format
function formatAmountToEuroFormat(amount) {
  amount =
    formatAmountToOre(amount);
  amount =
    formatOreToKroner(amount);
  return amount;
}

// Format norwegian amount (12345,67) to a integer (1234567)
function formatAmountToOre(amount) {

  // Remove comma and convert to a number
  amount.trim();

  // Remove leading zeroes
  amount = amount.replace(/^0+/, "");
  amount = amount.replace(/\s+/g, "");

  amount = String(amount);
  let kroner = '0';
  let orer = '00';

  if (!amount.includes(',') && !amount.includes('.')) {
    kroner = amount;
  }
  if (amount.includes(',')) {
    [kroner, orer] = amount.split(',');
  }
  if (amount.includes('.')) {
    [kroner, orer] = amount.split('.');
  }

  switch (Number(orer.length)) {
    case 2:
      amount =
        kroner + orer;
      break;
    case 1:
      amount =
        kroner + orer + '0';
      break;
    case 0:
      amount =
        kroner + '00;'
      break;
    default:
      amount =
        kroner + orer.slice(0, 2);
      break;
  }

  // Check for valid amount in orer
  amount =
    (amount === '000') ? '0' : amount;
  amount =
    (isNumeric(amount)) ? amount : '0';
  amount =
    Number(amount);
  //return String(amount);
  return Number(amount);
}

// Format norwegian date (11.05.1983) to number (19830511)
function formatNorDateToNumber(norDate) {

  const number = norDate.substring(6,) +
    norDate.substring(3, 5) + norDate.substring(0, 2);

  return number;
}

// Generate password
function generatePassword(passwordLenght,
  includeLowercase,
  includeUppercase,
  includeNumbers,
  includeSymbols) {

  const lowecaseChars = "abcdefghijlmnopqrstuvwxyzæøå";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";
  const numberChars = "0123456789";
  const symbolChars = "@£$!#¤%&/()=?\^.:;,<>{[]}+";

  let allowedChars = "";
  let password = "";

  allowedChars += (includeLowercase) ? lowecaseChars : "";
  allowedChars += (includeUppercase) ? uppercaseChars : "";
  allowedChars += (includeNumbers) ? numberChars : "";
  allowedChars += (includeSymbols) ? symbolChars : "";


  if (Number(passwordLenght) < 1) {

    return "Oppgi lengden på passordet.";
  }

  if (Number(allowedChars.length) < 1) {

    return "Oppgi minimum et sett av karakterer";
  }

  for (let i = 0; i < Number(passwordLenght); i++) {

    const randomIndex = Math.floor(Math.random() * Number(allowedChars.length));
    password += allowedChars[randomIndex];
  }
  return password;
}

// Hide input
function hideInput(className) {

  let element = null;
  if (this.isClassDefined(className)) {

    element = document.querySelector(`.${className}`); // Select the element
    if (element.classList.contains(className)) {
      document.querySelector(`.${className}`).style.display =
        'none';
    }
  }
  if (this.isClassDefined(className)) {

    element = document.querySelector(`.${className}`); // Select the element
    if (element.classList.contains(className)) {
      document.querySelector(`.${className}`).style.display =
        'none';
    }
  }
}

// Validate user/password
function checkUserPassword(user, password) {

  return true;
}

// Validate amount in the (1 234,12 = true) format
// This validateEuroAmount(amount) will never show any error message
function validateEuroAmount(amount) {

  amount = amount.replace(/\s+/g, '');
  amount = String(amount).replace(/\./g, "");
  amount = amount.replace(/\,/g, "");
  return isValidNumber(amount);
}

// Connection to a server
function connectingToServer() {

  switch (objUser.serverStatus) {

    // Web server
    case 1: {
      socket =
        new WebSocket('ws://ingegilje.no:5000');
      break;
    }
    // Test web server/ local web server
    case 2:
    // Test server/ local test server
    case 3: {

      const protocol =
        window.location.protocol === 'https:' ? 'wss' : 'ws';
      const hostname =
        window.location.hostname || 'localhost';
      socket =
        new WebSocket(`${protocol}://${hostname}:5000`);

      break;
    }
    default:
      break;
  }

  return socket;
}

// Removes the iframe
function removeIframe() {
  const iframe = document.getElementById("div-condo-login");
  if (iframe) {
    iframe.remove();
  }
}

function testMode() {

  switch (objUser.serverStatus) {

    // Web server
    case 1: {

      break;
    }
    // Test web server/ local web server
    case 2:
    // Test server/ local test server
    case 3: {

      sessionStorage.removeItem("user");

      // Save email/user, password and security level
      const email = 'inge.gilje@gmail.com';
      const password = '12345';
      const securityLevel = 9;
      const condominiumId = 2;
      sessionStorage.setItem('user', JSON.stringify({ email, password, securityLevel, condominiumId }));
      break;
    }
    default: {
      break;
    }
  }
}

function getTextWidth(text, font = '16px Arial') {

  // Create a canvas element (doesn't need to be in the DOM)
  const canvas =
    document.createElement('canvas');
  const context =
    canvas.getContext('2d');

  // Set the desired font
  context.font =
    font;

  // Measure the text
  const metrics =
    context.measureText(text);

  // Return the width in pixels
  return metrics.width;
}

// Sends a request to the sql server
function updateMySql(SQLquery, tableName, CRUDE) {

  let messageToServer =
  {
    tableName: tableName,
    CRUD: CRUDE,
    requestId: "requestId",
    SQLquery: SQLquery
  };

  // Converts a JavaScript value to a JavaScript Object Notation (JSON) string
  messageToServer =
    JSON.stringify(messageToServer);

  // Send message to server
  socket.send(messageToServer);
}

function validateInterval(className, labelText, fromValue, toValue) {

  let isIntervalValid = false;

  // Validate interval
  if (Number(toValue) < Number(fromValue)) {

    // Invalid interval
    if (isClassDefined(className)) {

      document.querySelector(`.${className}`).outerHTML =
        `<div class="${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    isTextValid = false;
  } else {

    // Valid interval
    if (isClassDefined(`${className}-red`)) {

      document.querySelector(`.${className}-red`).outerHTML =
        `<div class="${className}">
            * ${labelText}
          </div>`;
    }
    isTextValid = true;
  }
  return isTextValid;
}

// get account id from bank account
function getAccountIdFromBankAccount(bankAccount, payment) {

  let accountId = 0;

  if (bankAccount === '32073195801') {
    console.log('bank account:', bankAccount);
  }

  // Bank Acoount <> Condominium Bank Account
  let objBankAccountRowNumber =
    bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccount);
  if (objBankAccountRowNumber === -1) {

    // Check user bank account
    const objBankAccountRowNumber =
      userBankAccountArray.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccount);
    if (objBankAccountRowNumber !== -1) {

      accountId =
        userBankAccountArray[objBankAccountRowNumber].accountId;
    }

    // get Account Id from supplier
    const objSupplierRowNumber =
      supplierArray.findIndex(supplier => supplier.bankAccount === bankAccount);
    if (objSupplierRowNumber !== -1) {

      accountId =
        supplierArray[objSupplierRowNumber].accountId;

      // get Account Id from supplier amount
      const amount =
        (supplierArray[objSupplierRowNumber].amount) ? Number(supplierArray[objSupplierRowNumber].amount) : 0;

      accountId =
        (amount === Number(payment)) ? Number(supplierArray[objSupplierRowNumber].account2Id) : accountId;
    }
  }
  return accountId;
}

// exit application after 10 minuttes
function resetInactivityTimer() {

  clearTimeout(this.inactivityTimeout);

  inactivityTimeout = setTimeout(() => {
    window.location.href =
      'http://localhost/condo-login.html'
  }, 1 * 60 * 60 * 1000); // 1 hour
}

// Listen for user activity
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer);
});

