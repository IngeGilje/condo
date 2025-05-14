// class for all applications for the condo system
class Condos {

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

    let html = this.showLabel(className, labelText);
    html += `
      <input type="text" 
        class="input-${className}"
        maxlength="${maxlength}"
        placeholder="${placeholder}"
      >
    `;
    document.querySelector(`.div-${className}`)
      .innerHTML = html;
  }

  // Show leading text forinput
  showLeadingTextInput(className, labelText, maxlength, placeholder) {

    let html = this.showLeadingTextLabel(className, labelText);
    html += `
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

    document.querySelector(`.div-${className}`)
      .innerHTML = `
    <button class="button-${className}"
    >
      ${buttonText}
    </button>
  `;
  }

  // Show checkbox
  showCheckbox(columnName, labelText, ...texts) {

    let html = this.showLabel(columnName, labelText);
    html += `
        <form
          id="${columnName}"
        >
      `;
    texts.forEach((text) => {
      html += `
        <input type="checkbox" 
          class="input-${columnName}"
          id="${text}"
        >
          ${text}
        <br>
      `;
    });

    html += `
      </form>
    `;
    document.querySelector(`.div-${columnName}`)
      .innerHTML = html;
  }

  // Show radio buttons
  showRadioButtons(columnName, ...texts) {

    let html = `
      <form
        id="${columnName}"
      >
      <div class = "div-radio-${columnName}"
      >
    `;

    texts.forEach((text) => {
      html += `
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

    document.querySelector(`.div-${className}`).innerHTML = `
      <label class="label-${className}">
        ${labelText}
      </label>

      <input type="text" 
        readonly
        class="input-${className}}"
      >
    `;
  }

  // Check for valid text
  validateText(text, className, labelText) {

    let isTextValid = false;

    // Check text
    if ((text.length < 3) || text === '') {

      // Invalid text
      if (isClassDefined(className)) {

        document.querySelector(`.${className}`).outerHTML =
          `<div class="${className}-red">
            * Ugyldig ${labelText}
          </div>`;
      }
      isTextValid = false;
    } else {

      // Valid text
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

  // Validate postal code
  validatePostalCodeodeode(postalCode, className, labelText) {

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

  validateEmail(eMail, className, labelText) {

    let isValideMail = false;

    // Check valid eMail
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

  // Mark selected application in menu
  markSelectedMenu(text) {

    document.querySelector(`.a-menu-vertical-${this.applicationName}`).outerHTML =
      `<div class='a-menu-vertical-${this.applicationName}-green'>${text}</div>`;
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
        <select class="select-${className}" 
          id="selectedYear" name="selectedYear"
        >
      `;

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
    const objectNumberAccount = accountArray.findIndex(account => account.accountId === accountId);
    if (objectNumberAccount > 0) {

      document.querySelector(`.select-${className}`).value =
        accountId;
      return true;
    } else {

      return false;
    }
  }

  // Select bank account
  selectBankAccountId(bankAccountId, className) {

    // Check if account id exist
    const objectNumberBankAccount = bankAccountArray.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
    if (objectNumberBankAccount > 0) {

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
    const objectNumberCondo = condoArray.findIndex(condo => condo.condoId === condoId);
    if (objectNumberCondo > 0) {

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
    const objectNumberYear = this.yearArray.findIndex(year => year.year === year);
    if (objectNumberYear > 0) {

      document.querySelector(`.select-${className}`).value =
        year;
      return true;
    } else {

      return false;
    }
  }

  // Select numbers
  selectNumber(className, fromNumber, toNumber, selectedNumber, labelText) {

    let html = `
    <form action="/submit" method="POST">
      <label class="label-${className}"
        for="selectedNumber">
          ${labelText}
      </label>
      <select class="select-${className}" 
        id="selectedNumber"
        name="selectedNumber"
      >
    `;

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
  validateUser(user, password) {

    let validUser = false;

    if (!(user === '' || password === '')) {
      userArray.forEach(userRow => {
        if (!validUser) {
          if (userRow.email === user && userRow.password === password) {
            validUser = true;
          }
        }
      });
    }

    return validUser;
  }
}

// Check string includes  only digits
function isNumeric(string) {
  return !isNaN(string) && string.trim() !== "";
}

function menu() {

  document.querySelector('.div-menu')
    .innerHTML = `
      <a href="condo-login.html" class="a-menu-vertical-login">Login</a>
      <a href="condo-user.html" class="a-menu-vertical-user">Bruker</a>
      <a href="condo-condo.html" class="a-menu-vertical-condo">Leilighet</a>
      <a href="condo-bankaccount.html" class="a-menu-vertical-bankaccount">Bankkonto</a>
      <a href="condo-condominium.html" class="a-menu-vertical-condominium">Sameie</a>
      <a href="condo-account.html" class="a-menu-vertical-account">Konto</a>
      <a href="condo-income.html" class="a-menu-vertical-income">Innbetaling</a>
      <a href="condo-payment.html" class="a-menu-vertical-payment">Betaling</a>
      <a href="condo-due.html" class="a-menu-vertical-due">Forfall</a>
      <a href="condo-monthlyfee.html" class="a-menu-vertical-monthlyfee">Månedsavgift</a>
      <a href="condo-remoteheating.html" class="a-menu-vertical-remoteheating">Fjernvarme</a>
      <a href="condo-budget.html" class="a-menu-vertical-budget">Budsjett</a>
      <a href="condo-overview.html" class="a-menu-vertical-overview">Bet. oversikt</a>
      <a href="condo-accountmovement.html" class="a-menu-vertical-accountmovement">Kontobevegelser</a>
    `;
}

// Remove comma, periode and space
function removeComma(amount) {

  amount = amount.replace(/\s+/g, '');
  amount = String(amount).replace(/\./g, "");
  return amount.replace(/\,/g, "");
}

// validate the dd.mm.yyyy (European date format) format
function validateEuroDateFormat(dateString) {

  // Regular expression to check the dd.mm.yyyy format
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
  const date = new Date(year, month - 1, day);

  // Validate that the date components match
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Format date  (European date format) to yyyymmdd ("Basic ISO 8601 format)
function convertDateToISOFormat(date) {

  const dateParts = date.split(".");
  return `${dateParts[2]}${dateParts[1]}${dateParts[0]}`;
}

// Format date from yyyymmdd (Basic ISO 8601 format) -> dd.mm.yyyy (European date format)
function convertToEurDateFormat(date) {

  date = String(date);
  const formatedDate = date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
  return formatedDate;
}

// Check for valid amount
function checkAmount(amount, className, labelText) {

  let isValidAmount = true;

  // 123456,78 -> 12345678
  amount = this.removeComma(amount);
  if (!isNumeric(amount)) {

    // Invalid amount
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    isValidAmount = false;
  } else {

    if (this.isClassDefined(`label-${className}-red`)) {

      document.querySelector(`.label-${className}-red`).outerHTML =
        `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
    }
    isValidAmount = true;
  }
  return isValidAmount;
}

// Check for valid number
function checkNumber(number, min, max, className, labelText) {

  let isValidNumber = true;
  number = Number(number);
  min = Number(min);
  max = Number(max);

  // Check for valid number
  if (number < min && number > max) {

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

// Check for valid norwegian date dd.mm.yyyy
function checkNorDate(dateString, className, labelText) {

  let isDateValid = true;

  //dateString = (dateString.length === 0) ? this.getCurrentDate() : String(dateString); 
  dateString = (dateString.length === 0) ? '00.00.0000' : String(dateString);
  [day, month, year] = dateString.split('.');
  day = day.padStart(2, "0");
  month = month.padStart(2, "0");
  dateString = day + '.' + month + '.' + year;

  // Check for valid date
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

function checkPhoneNumber(phoneNumber, className, labelText) {

  // Check valid postal code
  const phoneNumberPattern = /^\d{8}$/;
  if (!(phoneNumberPattern.test(phoneNumber))) {

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

function checkOrganizationNumber(organizationNumber, className, labelText) {

  // Check valid Organization Number
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

function checkBankAccount(bankAccount, className, labelText) {

  // Check valid Bank Account Number
  const bankAccountPattern = /^\d{11}$/;
  if (!(bankAccountPattern.test(bankAccount))) {

    // Invalid Organization Number
    if (this.isClassDefined(`label-${className}`)) {

      document.querySelector(`.label-${className}`).outerHTML =
        `<div class="label-${className}-red">
            * Ugyldig ${labelText}
          </div>`;
    }
    return false;
  } else {

    // Valid valid Organization Number
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

// Format number (12345) to norwegian amount (12345,00)
function formatToNorAmount(amount) {

  amount = (amount.includes(",")) ? amount.replace(",", ".") : amount;
  amount = (amount.includes(".")) ? amount.replace(".", ",") : amount;
  amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return amount;
}

// Format number (1234567) to norwegian amount (12345,67)
function formatFromOreToKroner(amount) {

  amount = this.removeComma(String(amount));
  amount = String(Number(amount) / 100);
  amount = Number(amount).toFixed(2);
  return formatToNorAmount(amount);
}

// Format norwegian number (12345,12) to number (123456.12)
function formatAmountToNumber(number) {

  const formatedNumber = number.replace(',', '.');
  number = formatedNumber.replace(/\s+/g, "");
  return number;
}

// Format amount to euro format
function formatAmountToEuroFarmat(amount) {
  amount = formatAmountToOre(amount);
  amount = formatFromOreToKroner(amount);
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
      amount = kroner + orer;
      break;
    case 1:
      amount = kroner + orer + '0';
      break;
    case 0:
      amount = kroner + '00;'
      break;
    default:
      amount = kroner + orer.slice(0, 2);
      break;
  }

  // Check for valid amount in orer
  amount = (amount === '000') ? '0' : amount;
  amount = (isNumeric(amount)) ? amount : '0';
  return amount;
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
function getTextWidth(text, font) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

// Text must fit within the element
function truncateText(text, className) {

  // Initial values
  const element = document.querySelector(`.${className}`);
  const widthOfElement = element.offsetWidth;
  const fontSize = window.getComputedStyle(element).fontSize;

  const computedStyle = window.getComputedStyle(element);
  const fontFamily = computedStyle.fontFamily;
  const paddingLeft = parseFloat(computedStyle.paddingLeft);
  const paddingRight = parseFloat(computedStyle.paddingRight);
  const borderLeft = parseFloat(computedStyle.borderLeftWidth);
  const borderRight = parseFloat(computedStyle.borderRightWidth);
  const marginLeft = parseFloat(computedStyle.marginLeft);
  const marginRight = parseFloat(computedStyle.marginRight);

  let lengthTextPx = getTextWidth(text, font =
    `${fontSize} '${fontFamily}'`)
    + paddingLeft + paddingRight
    + borderLeft + borderRight
    + marginLeft + marginRight;

  for (; lengthTextPx > widthOfElement;) {
    text = text.slice(0, -1);
    lengthTextPx = getTextWidth(text, font = `${fontSize} '${fontFamily}'`)
      + paddingLeft + paddingRight
      + borderLeft + borderRight
      + marginLeft + marginRight;
  }
  return text;
}
