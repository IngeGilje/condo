// class for all applications for the condominium system
class Condos {

  // serverStatus = 1; // Web server
  // serverStatus = 2; // Test web server/ local web server
  // serverStatus = 3; // Test server/ local test server
  serverStatus = 3; // Test server/ local test server

  inactivityTimeout = false;

  /*
  // All year from 2020 until 2039
  #yearArray = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029,
    2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039];
  */

  // array of menu objects
  arrayMenu = [
    {
      applicationName: "condo-login.html",
      className: "Menu1",
      text: "login"
    },
    {
      applicationName: "condo-condominium.html",
      className: "Menu2",
      text: "Sameie"
    },
    {
      applicationName: "condo-condo.html",
      className: "Menu3",
      text: "Leilighet"
    },
    {
      applicationName: "condo-bankaccount.html",
      className: "Menu4",
      text: "Bankkonto sameiet"
    },
    {
      applicationName: "condo-account.html",
      className: "Menu5",
      text: "Konto"
    },
    {
      applicationName: "condo-user.html",
      className: "Menu6",
      text: "Bruker"
    },

    {
      applicationName: "condo-userbankaccount.html",
      className: "Menu7",
      text: "Bankkonto for bruker"
    },
    {
      applicationName: "condo-supplier.html",
      className: "Menu8",
      text: "Mottaker"
    },
    {
      applicationName: "condo-due.html",
      className: "Menu9",
      text: "Forfall"
    },
    {
      applicationName: "condo-budget.html",
      className: "Menu10",
      text: "Budsjett"
    },
    {
      applicationName: "condo-remoteheating.html",
      className: "Menu11",
      text: "Fjernvarme"
    },
    {
      applicationName: "condo-overview.html",
      className: "Menu12",
      text: "Betalingsoversikt"
    },
    {
      applicationName: "condo-bankaccounttransaction.html",
      className: "Menu13",
      text: "Banktransaksjoner"
    },
    {
      applicationName: "condo-importfile.html",
      className: "Menu14",
      text: "Importer banktransaksjoner"
    },
    {
      applicationName: "condo-annualaccount.html",
      className: "Menu15",
      text: "Årsregnskap"
    },
  ];

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
          class="input-${className} icon-input one-line"
          maxlength="${maxlength}"
          placeholder="${placeholder}"
        >
      `;
    document.querySelector(`.div-${className}`).innerHTML = html;

    // Set the PNG file
    const inputElement = document.querySelector(`.input-${className}`);
    inputElement.style.backgroundRepeat = `no-repeat`;

    const iconName = this.getIconName(className);
    inputElement.style.backgroundImage = `url('icons/${iconName}')`;
  }

  // Show input
  showInputHTML(className, labelText, maxlength, placeholder) {

    let html =
      `
        <div>
          <label
            class="one-line"
          >
            ${labelText}
          </label>
          <input 
            type="text" 
            class="${className} icon-input one-line"
            maxlength="${maxlength}"
            placeholder="${placeholder}"
          >
        </div>
      `;
    return html;
  }

  // Show input
  showInputHTMLNew(className, value, maxlength) {

    let html =
      `
        <td class="center">
          <input 
            class="${className} center one-line"
            type="text" 
            maxlength="${maxlength}"
            value="${value}"
          >
        </td>
      `;

    return html;
  }

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
          class="label-${className} one-line">
          ${labelText}
        </label>
      `;
  }

  // Show label
  showLabelNew(labelText) {
    return `
        <label
          class="one-line">
          ${labelText}
        </label>
      `;
  }

  // Show button
  showButton(className, buttonText) {

    const iconName = this.getIconName(className);

    const html =
      `
        <button 
          class="button-${className}"
        >
          <img 
            src="icons/${iconName}.png" 
            height="18"
          >
          ${buttonText}
        </button>
      `;
    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Show button
  showButtonNew(style, className, buttonText) {

    const html =
      `
        <td 
          class="center"
        >
          <button 
            class="${className} center"
            style="${style}"
          >
            <img 
              src="icons/${className}.png" 
            >
              ${buttonText}
          </button>
        </td>
      `;
    return html;
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

    let validTekst = true;

    // Check for string
    if (typeof tekst !== "string") {

      validTekst = false;
    }

    // Check length
    if (tekst.length > 50) {

      validTekst = false;
    };

    // Check allowed characters (letters, numbers, spaces)
    if (tekst.length > 0) {

      const regex = /^[a-zA-ZæøåÆØÅ0-9.,\-+_%!:#"'\\/ ]*$/
      validTekst = (regex.test(tekst)) ? true : false;
    } else {

      validTekst = false;
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

    if (validTekst) {

      // Valid text
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

  // Valid text
  validateTextNew(tekst, minLenght, maxLength) {

    // Check for string
    if (typeof tekst !== "string") return false;

    // Check length
    if (!(tekst.length >= minLenght) && (tekst.length <= maxLength)) return false;

    // Check allowed characters (letters, numbers, spaces)
    const regex = /^[a-zA-ZæøåÆØÅ0-9.,\-+_%!:#"'\\/ ]*$/
    return (regex.test(tekst)) ? true : false;
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
          `
            <div class="${className}-red">
              * Ugyldig ${labelText}
            </div>
          `;
      }
      isValideMail = false;
    } else {

      // Valid valid eMail
      if (isClassDefined(`${className}-red`)) {

        document.querySelector(`.${className}-red`).outerHTML =
          ` <div class="${className}">
              * ${labelText}
            </div>
          `;
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

      // Valid valid bank account 
      if (isClassDefined(`label-${className}-red`)) {

        document.querySelector(`.label-${className}-red`).outerHTML =
          `<div class="label-${className} label-${className}">
            * ${labelText}
          </div>`;
      }
      return true;
    }
  }

  // validate bank account 
  validateBankAccountNew(bankAccount) {

    // Validate Bank Account
    const bankAccountPattern = /^\d{11}$/;
    return (bankAccountPattern.test(bankAccount)) ? true : false;
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

  // Select bank account
  selectBankAccountId(bankAccountId, className) {

    // Check if account id exist
    const bankAccountRowNumber = this.arrayBankAccounts.findIndex(bankAccounts => bankAccounts.bankAccountId === bankAccountId);
    if (bankAccountRowNumber !== -1) {

      document.querySelector(`.select-${className}`).value = bankAccountId;
      return true;
    } else {

      return false;
    }
  }

  // Select numbers
  selectNumber(className, fromNumber, toNumber, selectedNumber, labelText) {

    selectedNumber = Number(selectedNumber);
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
        <select 
          class="select-${className}" 
          id="selectedNumber"
          name="selectedNumber"
        >
    `;

    let selectedOption = false;

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

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Select number
  selectNumberHTMLNew(className, fromNumber, toNumber, selectedNumber) {

    let html =
      `
        <td>
          <select 
            class="${className}" 
            id="selectedNumber"
            name="selectedNumber"
          >
      `;

    let selectedOption = false;

    for (let number = fromNumber; number <= toNumber; number++) {
      if (number === selectedNumber) {

        html +=
          `
            <option 
              value="${number}"
              selected
            >
              ${number}
            </option>
          `;
        selectedOption = true;
      } else {

        html +=
          `
            <option 
              value="${number}"
            >
              ${number}
            </option>
          `;
      }
    };

    html +=
      `
          </select >
        </td>
      `;
    return html;
  }

  // Select numbers
  selectNumber(className, fromNumber, toNumber, selectedNumber, labelText) {

    selectedNumber = Number(selectedNumber);
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

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Select numbers
  showSelectedNumbersNew(className, style, fromNumber, toNumber, selectedNumber) {

    selectedNumber = Number(selectedNumber);
    let html =
      `
        <td
          class="center"
        >
          <select
            class="${className} center"
      `;
    if (style) html += `style="${style}"`;
    html += `>`;

    for (let number = fromNumber; number <= toNumber; number++) {
      if (number === selectedNumber) {

        html +=
          `
            <option 
              value="${number}"
              selected
              >
              ${number}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value="${number}"
              >
              ${number}
            </option>
          `;
      }
    };

    html +=
      `
          </select >
        </td>
      `;

    return html;
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

  // show button to start new page
  showPageButtonNew() {

    html =
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
      objUsers.arrayUsers.forEach(user => {
        if (!validUser) {

          if (user.email === email && user.password === password) validUser = true;
        }
      });
    }

    return validUser;
  }

  menuNew(menuNumber) {

    let html = "";

    // Check of menu exists
    if (this.arrayMenu.length >= menuNumber) {

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

      const applicationName = this.arrayMenu[menuNumber - 1].applicationName;
      const text = this.arrayMenu[menuNumber - 1].text;
      const className = this.arrayMenu[menuNumber - 1].className;

      html +=
        `
        <td class="menu one-line">
          <a 
            href="${url}${applicationName}"
            class="${className}"
            style="width:100px;"
          >
            ${text}
          </a>
        </td>
      `;
    } else {

      html += "<td></td>";
    }

    return html;
  }

  // Validate norwegian amount (12 345,67)
  validateNorAmount(amount, className, labelText) {

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

  // Validate norwegian amount (12 345,67)
  validateNorAmountNew(amount) {

    // 123456,78 -> 12345678
    amount = removeComma(amount);
    return (isNumeric(amount)) ? true : false;
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

  // Select choices like Yes, No, Ignore
  showSelectedValues(className, selectedChoice, labelText, ...choices) {

    let selectedOption =
      false;

    let html =
      `
      <form 
        id="${accountId}"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${className}"
          for="${accountId}"
          id="${accountId}"
        >
          ${labelText}
        </label>
        <select 
          class="select-${className}" 
          id="${accountId}"
          name="${accountId}"
        >
      `;

    choices.forEach((choice) => {
      if (choice === selectedChoice) {

        html +=
          `
          <option 
            value=${choice}
            selected
          >
            ${choice}
          </option>
        `;
        selectedOption =
          true;
      } else {

        html +=
          `
          <option 
            value="${choice}">
            ${choice}
          </option>
        `;
      }
    });

    html +=
      `
        </select >
      </form>
    `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Select choices like Yes, No, Ignore
  showSelectedValuesNew(className, style, selectedChoice, ...choices) {

    let html =
      `
        <td
          class="center"
        >
          <select 
            class="${className} center"
            style="${style}"
          >
      `;

    choices.forEach((choice) => {
      if (choice === selectedChoice) {

        html +=
          `
            <option 
              value=${choice}
              selected
            >
              ${choice}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value="${choice}">
              ${choice}
            </option>
          `;
      }
    });

    html +=
      `
          </select >
        </td>
      `;

    return html;
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
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber);
    if (bankAccountRowNumber !== -1) {

      bankAccountName = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name;
    }

    if (!bankAccountName) {

      // Bank account name from supplier table
      const supplierRowNumber = objSuppliers.arraySuppliers.findIndex(supplier => supplier.bankAccount === bankAccountNumber);
      if (supplierRowNumber !== -1) {

        bankAccountName = objSuppliers.arraySuppliers[supplierRowNumber].name;
      }
    }

    if (!bankAccountName) {

      // Bank account name from user bank account
      const bankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccountNumber);
      if (bankAccountRowNumber !== -1) {

        bankAccountName = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].name;
      }
    }

    bankAccountName = (bankAccountName) ? bankAccountName : bankAccountNumber;
    return (bankAccountName) ? bankAccountName : "-";
  }

  // get condo Id from From Bank Account
  getCondoId(fromBankAccount) {

    let condoId = 0;

    // Validate Bank Account
    const bankAccountPattern = /^\d{11}$/;
    if ((bankAccountPattern.test(fromBankAccount))) {

      const bankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === fromBankAccount);
      if (bankAccountRowNumber !== -1) {

        const userId = Number(objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].userId);

        if (userId >= 0) {

          const userRowNumber =
            objUsers.arrayUsers.findIndex(user => user.userId === userId);
          if (userRowNumber !== -1) {

            condoId =
              Number(objUsers.arrayUsers[userRowNumber].condoId);
          }
        }
      }
    }
    return condoId;
  }

  // Show icon
  showIcon(className) {

    // Set the PNG file
    const inputElement = document.querySelector(`.${className}`);
    inputElement.style.backgroundRepeat = `no-repeat`;

    const iconName = this.getIconName(`${className}`);
    inputElement.style.backgroundImage = `url('icons/${iconName}')`;
  }

  // Show icon
  showIconNew(className) {

    // Set the PNG file
    const inputElement = document.querySelector(`.${className}`);
    inputElement.style.backgroundRepeat = `no-repeat`;

    const iconName = this.getIconNameNew(`${className}`);
    inputElement.style.backgroundImage = `url('icons/${iconName}')`;
  }

  // get icon name from column name
  getIconNameNew(className) {

    let imageName;
    if (className.toLowerCase().includes("name")) imageName = "name.png";
    if (className.toLowerCase().includes("condo")) imageName = "condo.png";
    if (className.toLowerCase().includes("address")) imageName = "address.png";
    if (className.toLowerCase().includes("postalcode")) imageName = "postalCode.png";
    if (className.toLowerCase().includes("street")) imageName = "street.png";
    if (className.toLowerCase().includes("city")) imageName = "city.png";
    if (className.toLowerCase().includes("phone")) imageName = "phone.png";
    if (className.toLowerCase().includes("email")) imageName = "email.png";
    if (className.toLowerCase().includes("organization")) imageName = "organizationnumber.png";
    if (className.toLowerCase().includes("filename")) imageName = "fileName.png";
    if (className.toLowerCase().includes("date")) imageName = "date.png";
    if (className.toLowerCase().includes("income")) imageName = "income.png";
    if (className.toLowerCase().includes("kwhour")) imageName = "numberKWHour.png";
    if (className.toLowerCase().includes("text")) imageName = "text.png";
    if (className.toLowerCase().includes("amount")) imageName = "amount.png";
    if (className.toLowerCase().includes("password")) imageName = "password.png";
    if (className.toLowerCase().includes("account")) imageName = "account.png";
    if (className.toLowerCase().includes("balance")) imageName = "accountname.png";
    if (className.toLowerCase().includes("balancedate")) imageName = "date.png";
    if (className.toLowerCase().includes("update")) imageName = "save.png";
    if (className.toLowerCase().includes("save")) imageName = "save.png";
    if (className.toLowerCase().includes("insert")) imageName = "insert.png";
    if (className.toLowerCase().includes("cancel")) imageName = "cancel.png";
    if (className.toLowerCase().includes("delete")) imageName = "cancel.png";
    if (className.toLowerCase().includes("supplier")) imageName = "supplier.png";
    if (className.toLowerCase().includes("year")) imageName = "calendar.png";
    if (imageName === 'undefined') imageName = "error.png";
    return imageName;
  }

  // get icon name from column name
  getIconName(className) {

    let imageName;
    const posionOfText = className.lastIndexOf("-");
    className = className.slice(posionOfText + 1);
    switch (className) {
      case "firstName":
      case "lastName":
      case "name": {

        imageName =
          "name.png";
        break;
      }
      case "street": {
        imageName =
          "street.png";
        break;
      }
      case "address2": {
        imageName =
          "address2.png";
        break;
      }
      case "postalCode": {
        imageName =
          "postalcode.png";
        break;
      }
      case "city": {
        imageName =
          "city.png";
        break;
      }
      case "phone": {
        imageName =
          "phone.png";
        break;
      }
      case "eMail":
      case "email": {
        imageName =
          "email.png";
        break;
      }
      case "organizationNumber": {
        imageName =
          "organizationnumber.png";
        break;
      }
      case "fileName": {
        imageName =
          "filename.png";
        break;
      }
      case "filterFromDate":
      case "filterToDate":
      case "fromDate":
      case "toDate":
      case "date": {
        imageName =
          "date.png";
        break;
      }
      case "income": {
        imageName =
          "income.png";
        break;
      }
      case "payment": {
        imageName =
          "payment.png";
        break;
      }
      case "numberKWHour": {
        imageName =
          "numberKWHour.png";
        break;
      }
      case "text": {
        imageName =
          "text.png";
        break;
      }
      case "amount": {
        imageName =
          "amount.png";
        break;
      }
      case "text": {
        imageName =
          "text.png";
        break;
      }
      case "bankAccount": {
        imageName =
          "bankAccount.png";
        break;
      }
      case "password": {
        imageName =
          "password.png";
        break;
      }
      case "accountName":
      case "accountId": {
        imageName =
          "accountName.png";
        break;
      }
      case "closingBalance":
      case "openingBalance": {
        imageName =
          "accountName.png";
        break;
      }
      case "closingBalanceDate":
      case "openingBalanceDate": {
        imageName =
          "date.png";
        break;
      }
      case "importFileName": {
        imageName =
          "filename.png";
        break;
      }
      case "update":
      case "save": {
        imageName =
          "save.png";
        break;
      }
      case "insert": {
        imageName =
          "insert.png";
        break;
      }
      case "cancel": {
        imageName =
          "cancel.png";
        break;
      }
      case "delete": {
        imageName =
          "delete.png";
        break;
      }
      case "startImport": {
        imageName =
          "not_started.png";
        break;
      }
      default: {
        imageName =
          "error.png";
        break;
      }
    }

    return imageName;
  }

  getClassByPrefix(element, prefix) {
    return [...element.classList].find(cls => cls.startsWith(prefix));
  }
  // get class name for account
  getAccountClass(element) {
    return [...element.classList].find(cls => cls.startsWith('account'));
  }

  // get class name for condo
  getCondoClass(element) {
    return [...element.classList].find(cls => cls.startsWith('condo'));
  }

  // get class name for amount
  getAmountClass(element) {
    return [...element.classList].find(cls => cls.startsWith('amount'));
  }

  // get class name for year
  getYearClass(element) {
    return [...element.classList].find(cls => cls.startsWith('year'));
  }

  // get class name for delete
  getDeleteClass(element) {
    return [...element.classList].find(cls => cls.startsWith('delete'));
  }
  // get class name for fixed cost 
  getFixedCostClass(element) {
    return [...element.classList].find(cls => cls.startsWith('fixedCost'));
  }
  // get class name for name
  getNameClass(element) {
    return [...element.classList].find(cls => cls.startsWith('name'));
  }

  // get class name for date
  getDateClass(element) {
    return [...element.classList].find(cls => cls.startsWith('date'));
  }

  // get class name for text
  getTextClass(element) {
    return [...element.classList].find(cls => cls.startsWith('Text'));
  }

  // Show Yes/No
  showYesNo(className, selectedChoice) {

    switch (selectedChoice) {
      case 'Y': {

        selectedChoice = "Ja";
        break;
      }
      case 'N': {

        selectedChoice = "Nei";
        break;
      }
      default: {

        selectedChoice = "Ugyldig verdi";
        break
      }
    }
    html = this.showSelectedValuesNew(className, '', selectedChoice, 'Nei', 'Ja')
    return html;
  }
  // Show table header including menu
  showHTMLTableHeader(style, menuNumber, ...texts) {

    let html = "<tr>";

    html += this.menuNew(menuNumber);

    texts.forEach((text) => {

      if (text === '') {
        html +=
          `
            <td 
              class="no-border center"
              style="${style}"
            >
              ${text}
            </td>
          `;
      } else {

        html +=
          `
            <td 
              class="no-border center bold"
              style="${style}"
            >
              ${text}
            </td>
          `;
      }
    });

    html += "</tr>";
    return html;
  }

  // Validate interval
  validateIntervalNew(value, fromValue, toValue) {

    value = Number(value);
    fromValue = Number(fromValue);
    toValue = Number(toValue);

    // Validate interval
    return ((fromValue <= toValue)
      && (value >= fromValue)
      && (value <= toValue));
  }

  // Show the rest of the menu
  showRestMenuNew(rowNumber) {

    let html = "";
    for (; this.arrayMenu.length >= rowNumber; rowNumber++) {

      html += "<tr>";

      // Show menu
      html += this.menuNew(rowNumber);
      html += "</tr>"
    }

    // The end of the table
    html += endHTMLTable();
    return html;
  }

  // Validate number
  validateNumberNew(number, min, max) {

    return (Number(number) < Number(min) || Number(number) > Number(max)) ? false : true;
  }

  // validate the norwegian date format dd.mm.yyyy
  validateNorDateFormatNew(date) {

    // Check for valid date String
    if (date === '' || typeof date === 'undefined') {
      return false;
    }
    // Regular expression for valuating the dd.mm.yyyy format
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/
    const match = date.match(regex);

    if (!match) return false; // Return false if format doesn't match

    // Extract day, month, and year
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Check if month is between 1 and 12
    if (month < 1 || month > 12) return false;

    // Create a date object
    const objDate = new Date(year, month - 1, day);

    // Validate that the date components match
    return (
      objDate.getFullYear() === year
      && objDate.getMonth() === month - 1
      && objDate.getDate() === day
    );
  }

  // Format norwegian date (11.05.1983) to number (19830511)
  formatNorDateToNumberNew(norDate) {

    return norDate.substring(6,) + norDate.substring(3, 5) + norDate.substring(0, 2);
  }

  // Validate phone number 
  validatePhoneNew(phone) {

    // Validate phone number
    phone = phone.replace(/\s+/g, "");
    return /^\d{8,15}$/.test(phone);
  }

  // Validate E-mail
  validateEmailNew(eMail) {

    // Validate eMail
    const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return ((eMailRegex.test(eMail))) ? true : false;
  }

  // Validate organization number
  validateOrganizationNumberNew(organizationNumber) {

    // Validate organization number Organization Number
    const organizationNumberPattern = /^\d{9}$/;
    return (organizationNumberPattern.test(organizationNumber)) ? true : false;
  }

  // Validate filename
  validateFileNameNew(fileName) {
    const fileNameRegex = /^(?:[a-zA-Z]:\\)?(?:[^<>:"/\\|?*\x00-\x1F]+\\)*[^<>:"/\\|?*\x00-\x1F]*$/;
    return fileNameRegex.test(fileName);
  }

  // Show main header table
  showHTMLMainTableHeaderNew(style, ...texts) {

    let html = `<tr class="bold">`;

    texts.forEach((text) => {

      if (text === '') {
        html +=
          `
          <th 
            class="no-border"
            style="${style}"
          >
            ${text}
          </th>
        `;
      } else {
        html +=
          `
          <th 
            class="center no-border"
            style="${style}"
          >
            ${text}
          </th>
        `;
      }
    });

    html += "</tr>";
    return html;
  }

  /* Does not work
  // Show all selected users
  showSelectedRowsNew(className, style, arrayName, columnName, id, selectAll, selectNone) {

    let selectedValue = false;

    let html =
      `
        <td
          class="center one-line"
        >
          <select 
            class="${className} center"
      `;
    if (style) html += `style="${style}"`;
    html += `>`;

    // Check if user array is empty
    const numberOfRows = arrayName.length;
    if (numberOfRows > 0) {
      arrayName.forEach((array) => {
        if (array.columnName === id) {

          html +=
            `
              <option 
                value=${array.id}
                selected
              >
                ${arrayName.columnName}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${array.id}">
                ${array.columnName}
              </option>
            `;
        }
      });
    } else {

      html +=
        `
          <option value="0" 
            selected
          >
            Ingen leilighet
          </option>
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=999999999
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
        html +=
          `
          <option 
            value=0
          >
            ${selectNone}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=0
              selected
            >
              ${selectNone}
            </option>
          `;
        selectedValue = true;
      }
    }

    html +=
      `
          </select >
        </td>
      `;

    return html;
  }
  */
}

// Check if string includes only digits
function isNumeric(string) {
  return !isNaN(string) && string.trim() !== "";
}

// Remove comma, period and space
function removeComma(amount) {

  amount = amount.replace(/\s+/g, '');
  amount = String(amount).replace(/\./g, "");
  amount = amount.replace(/\,/g, "");
  return (amount === '000') ? '00' : amount;
}

// validate the dd.mm.yyyy (European date format) format
function validateEuroDateFormat(dateString) {

  // Check for valid date String
  if (dateString === '' || typeof dateString === 'undefined') {
    return false;
  }
  // Regular expression for valuating the dd.mm.yyyy format
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/
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
    date = `${dateParts[2]}${dateParts[1]}${dateParts[0]}`;
  } else {
    date = '';
  }
  return date;
}

// Format date from yyyymmdd (Basic ISO 8601 format) -> dd.mm.yyyy (European date format)
function formatToNorDate(date) {

  date = String(date);
  const formatedDate = date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
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

// Validate number (No error message)
function validateNumberHTML(number, min, max) {

  let isValidNumber;
  number = Number(number);
  min = Number(min);
  max = Number(max);

  // Validate number
  if (number < min || number > max) {

    isValidNumber = false;
  } else {

    isValidNumber = true;
  }

  return isValidNumber;
}

// Validate number
function validateNumberNew(number, min, max) {

  return (Number(number) < Number(min) || Number(number) > Number(max)) ? false : true;
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

// Validate norwegian date dd.mm.yyyy format
// Do not show error message
function validateNorDateHTML(dateString) {

  dateString =
    (dateString.length === 0) ? '00.00.0000' : String(dateString);
  [day, month, year] = dateString.split('.');
  day = day.padStart(2, "0");
  month = month.padStart(2, "0");
  dateString = day + '.' + month + '.' + year;

  // Validate date
  if (!this.validateEuroDateFormat(dateString)) {

    return false;
  } else {

    return true;
  }
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

// Format norwegian kroner (12 345,67) to ore/number (1234567)
function formatKronerToOre(amount) {

  let kroner = '';
  let ore = '';

  // check for decimal number
  amount = amount.replace(/\s+/g, "");
  if (amount.includes('.')) {

    // decimal number
    [kroner, ore] = amount.split('.');
    ore = (ore.length === 1) ? ore + '0' : '00';

  } else {
    if (amount.includes(',')) {
      [kroner, ore] = amount.split(',');
      ore = (ore.length === 1) ? ore + '0' : ore.substring(0, 2);
    } else {

      // not decimal number
      kroner = amount;
      ore = "00";
    }
  }

  return kroner + ore;
}

// Format amount to euro format
function formatAmountToEuroFormat(amount) {
  amount = formatAmountToOre(amount);
  amount = formatOreToKroner(amount);
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
function generatePassword(passwordLenght, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {

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

// Removes the iframe
function removeIframe() {
  const iframe = document.getElementById("div-condo-login");
  if (iframe) {
    iframe.remove();
  }
}

function testMode() {

  switch (objUsers.serverStatus) {

    // Web server
    case 1:
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

/*
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
*/

/*
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
*/

// Validate interval
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

// HTML start for filters
function startHTMLFilters() {

  return `
      <!-- Filters -->
      <div class="filters">
    `;
}

// HTML end for filters
function endHTMLFilters() {

  return `
        <!-- End Filters -->
        <div>
    `;
}

function HTMLTableHeader(...texts) {

  let html = `
      <thead>
        <tr>
    `;

  texts.forEach((text) => {

    html += `
          <th>${text}</th>
        `;
  });

  html += `
          </tr>   
        </thead>
     `;
  return html;
}

// Start body table
function startHTMLTableBody() {

  let html = `
      <tbody>
        <tr>
     `;
  return html;
}

// End body table
function endHTMLTableBody() {

  let html = `
      </tbody>
    `;
  return html;
}

// One row in a table
function HTMLTableRow(...texts) {

  let html = `
      <tr>
    `;
  texts.forEach((text) => {

    html += `
        <td>${text}</td>
      `;
  });

  html += `
      </tr>
    `;
  return html;
}

/*
// Show icon
function showIcon(className) {

  // Set the PNG file
  const inputElement =
    document.querySelector(`.${className}`);
  inputElement.style.backgroundRepeat = `no-repeat`;

  const iconName = this.getIconName(`${className}`);
  inputElement.style.backgroundImage = `url('icons/${iconName}')`;
}
*/

/*
// exit application after 1 hour
function exitIfNoActivity() {

  clearTimeout(this.inactivityTimeout);

  inactivityTimeout = setTimeout(() => {
    window.location.href =
      'condo-login.html'
  }, 1 * 60 * 60 * 1000); // 1 hour
}

// Listen for user activity
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, exitIfNoActivity);
});
*/

// Start of HTML table
function startHTMLTable(style) {

  return `<table style="${style}">`;
}

// Show main header table
function showHTMLMainTableHeader(style, ...texts) {

  let html = `<tr class="bold">`;

  texts.forEach((text) => {

    if (text === '') {
      html +=
        `
          <th 
            class="no-border"
            style="${style}"
          >
            ${text}
          </th>
        `;
    } else {
      html +=
        `
          <th 
            class="center no-border"
            style="${style}"
          >
            ${text}
          </th>
        `;
    }
  });

  html += "</tr>";
  return html;
}

// Show filter header table
function showHTMLFilterHeader(style, ...texts) {

  let html = "<tr>";

  texts.forEach((text) => {

    if (text === '') {
      html +=
        `
          <td 
            class="no-border center"
            style="${style}"
          >
            ${text}
          </td>
        `;
    } else {

      html +=
        `
          <td 
            class="no-border center bold"
            style="${style}"
          >
            ${text}
          </td>
        `;
    }
  });

  html += "</tr>";
  return html;
}

// End of HTML table
function endHTMLTable() {

  return `</table>`;
}
