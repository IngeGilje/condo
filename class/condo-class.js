// class for all applications for the condominium system
class Condos {

  constructor(applicationName) {

    this.applicationName = applicationName;
  }

  // const serverStatus = 1; // http://ingegilje.no
  // const serverStatus = 2; // http://localhost
  serverStatus = 2;

  inactivityTimeout = false;

  nineNine = 999999998;
  minusNineNine = -999999998;

  // account type 1 is account menu
  // 2 is administration menu  
  // 3 is horizontal menu
  accountMenu = 1;
  administrationMenu = 2;
  horizontalMenu = 3;

  // User info
  condominiumId = Number(sessionStorage.getItem("condominiumId"));
  user = sessionStorage.getItem("user");
  securityLevel = Number(sessionStorage.getItem("securityLevel"));
  userId = Number(sessionStorage.getItem("userId"));

  // array of horizontal menu
  arrayHorizontalMenu = [
    {
      applicationName: "condo-bankaccounttransaction.html",
      className: "Menu1",
      text: "Regnskap"
    },
    {
      applicationName: "condo-shownews.html",
      className: "Menu2",
      text: "Nyheter"
    },
    {
      applicationName: "condo-showemptyingcalendar.html",
      className: "Menu3",
      text: "Tømmekalender"
    },
    {
      applicationName: "condo-news.html",
      className: "Menu4",
      text: "Administrasjon"
    }
  ];

  // array of menu for account
  arrayAccountMenu = [
    {
      applicationName: "condo-condominium.html",
      className: "Menu1",
      text: "Sameie"
    },
    {
      applicationName: "condo-user.html",
      className: "Menu2",
      text: "Bruker"
    },
    {
      applicationName: "condo-password.html",
      className: "Menu3",
      text: "Passord"
    },
    {
      applicationName: "condo-condo.html",
      className: "Menu4",
      text: "Leilighet"
    },
    {
      applicationName: "condo-bankaccount.html",
      className: "Menu5",
      text: "Bankkonto sameie"
    },
    {
      applicationName: "condo-account.html",
      className: "Menu6",
      text: "Konto"
    },
    {
      applicationName: "condo-userbankaccount.html",
      className: "Menu7",
      text: "Bankkonto for bruker"
    },
    {
      applicationName: "condo-supplier.html",
      className: "Menu8",
      text: "Leverandør"
    },
    {
      applicationName: "condo-commoncost.html",
      className: "Menu9",
      text: "Felleskostnader"
    },
    {
      applicationName: "condo-due.html",
      className: "Menu10",
      text: "Forfall"
    },
    {
      applicationName: "condo-remoteheatingprice.html",
      className: "Menu11",
      text: "Pris fjernvarme"
    },
    {
      applicationName: "condo-remoteheating.html",
      className: "Menu12",
      text: "Fjernvarme"
    },
    {
      applicationName: "condo-budget.html",
      className: "Menu13",
      text: "Budsjett"
    },
    {
      applicationName: "condo-overview.html",
      className: "Menu14",
      text: "Betalingsoversikt"
    },
    {
      applicationName: "condo-bankaccounttransaction.html",
      className: "Menu15",
      text: "Banktransaksjoner"
    },
    {
      applicationName: "condo-importfile.html",
      className: "Menu16",
      text: "Importer transaksjoner"
    },
    {
      applicationName: "condo-annualaccount.html",
      className: "Menu17",
      text: "Årsregnskap"
    }
  ];

  // array of menu for administration
  arrayAdministrationMenu = [
    {
      applicationName: "condo-news.html",
      className: "Menu1",
      text: "Nyheter"
    },
    {
      applicationName: "condo-emptyingcalendar.html",
      className: "Menu2",
      text: "Tømmekalender"
    }
  ];

  // Validate application name
  set applicationName(validatedApplicationName) {

    if (typeof validatedApplicationName === 'string' && validatedApplicationName.length >= 3) {

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
  inputTableColumn(className, style, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

    return `
    <td 
      class="left" 
      colspan="${colspan}" 
      rowspan="${rowspan}"
    >
      <input
        class="${className} center one-line"
        type="text"
        maxlength="${maxlength}"
        value="${value}"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'readonly'}
      >
    </td>`;
  }

    // Show input
  inputTableColumnNew(className, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

    return `
    <td 
      class="left" 
      colspan="${colspan}" 
      rowspan="${rowspan}"
    >
      <input
        class="${className} center one-line"
        type="text"
        maxlength="${maxlength}"
        value="${value}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    </td>`;
  }

  // Show textarea
  textAreaTableColumn(className, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

    return `
    <td 
      colspan="${colspan}" 
      rowspan="${rowspan}" 
    >
      <textarea 
        rows="6"
        class="${className} news-text"
        maxlength="${maxlength}"
        value=""
      >
        ${value}
      </textarea>
    </td>`;
  }

  // Show password input
  inputTableColumnPassword(className, style, value, maxlength) {

    return `
    <td class="center">
      <input
        class="${className} center one-line"
        type="password"
        maxlength="${maxlength}"
        value="${value}"
        ${(style) ? `style="${style}"` : "style='width:175px;'"}
      >
    </td>`;
  }

  // Show password
  inputTablePassword(className, style, value, maxlength) {
    return `
    <td class="center">
      <input
        class="${className} center one-line"
        type="password"
        maxlength="${maxlength}"
        value="${value}"
        ${(style) ? `style="${style}"` : `style="width:175px;"`}
      >
    </td>`;
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
    document.querySelector(`.div-${className}`).innerHTML = html;
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

  // Show button
  showButton(style, className, text) {

    return `
    <td 
      class="center"
    >
      <button 
        class="${className} center one-line"
        ${(style) ? `style="${style}"` : 'style="width:175px;"'}
      >
        ${text}
      </button>
    </td>`;
  }

  // Show button
  showButtonNew(className, text) {

    return `
    <td 
      class="center"
    >
      <button 
        class="${className} center one-line button"
        style="width="50px"
      >
        ${text}
      </button>
    </td>`;
  }

  // Valid text
  validateText(className, text, minLenght, maxLength, object, style, message) {

    let valid = true;

    // Check for string
    if (typeof text !== "string") valid = false;

    // Check length
    if (!(text.length >= minLenght) && (text.length <= maxLength)) valid = false;

    // Check allowed characters (letters, numbers, spaces)
    const regex = /^[a-zA-ZæøåÆØÅ0-9.,\-+_%!:#"'\\/ ]*$/
    if (!regex.test(text)) valid = false;

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid) this.showMessage(object, style, message);

    return valid;
  }

  // validate bank account
  validateBankAccount(className, bankAccount, object, style, message) {

    const bankAccountPattern = /^\d{11}$/;
    const valid = bankAccountPattern.test(bankAccount);

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid) this.showMessage(object, style, message);

    return valid;
  }

  // Select bank account
  selectBankAccountId(bankAccountId, className) {

    // Check if account id exist
    const rowNumberBankAccount = this.arrayBankAccounts.findIndex(bankAccounts => bankAccounts.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

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

  // Select interval number
  selectInterval(className, style, fromNumber, toNumber, selectedNumber, enableChanges) {

    let selectedOption = false;

    let html = `
    <td class="center"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : `style="width:175px;"`}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    for (let number = fromNumber; number <= toNumber; number++) {
      if (number === selectedNumber) {

        html += `
        <option 
          value="${number}"
          selected>${number}</option>`;
        selectedOption = true;
      } else {

        html += `<option value="${number}">${number}</option>`;
      }
    };

    html += `</select ></td>`;

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

  /*
  // Select numbers
  showSelectedNumbers(className, style, fromNumber, toNumber, selectedNumber, enableChanges) {

    selectedNumber = Number(selectedNumber);
    let html = `
    <td
      class="center"
    >
      <select
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style="${style}"` : `style="width:175px;"`}
      >`;

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

    html += `
        </select >
      </td>
    `;

    return html;
  }
  */

  // Select numbers
  showSelectedNumbersNew(className, fromNumber, toNumber, selectedNumber, enableChanges) {

    selectedNumber = Number(selectedNumber);
    let html = `
    <td
      class="center"
    >
      <select
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}>`;

    for (let number = fromNumber; number <= toNumber; number++) {
      if (number === selectedNumber) {

        html += `
        <option 
          value="${number}"
          selected
          >
          ${number}
        </option>`;
      } else {

        html += `
          <option 
            value="${number}"
            >
            ${number}
          </option>`;
      }
    };

    html += `
      </select >
    </td>`;

    return html;
  }

  // Select months
  showSelectedMonths(className, style, selectedMonth, enableChanges) {

    selectedMonth = Number(selectedMonth);
    let html = `
    <td
      class="center"
    >
      <select
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style="${style}"` : `style="width:175px;"`}
      >`;

    for (let month = 1; month < 13; month++) {

      html += `
      <option 
        value="${month}"
        ${month === selectedMonth ? 'selected' : ''}
      >
        ${findNameOfMonth(month)}
      </option>`;
    };

    html += `
        </select >
      </td>
    `;

    return html;
  }

  // Select months
  showSelectedMonthsNew(className, selectedMonth, enableChanges) {

    selectedMonth = Number(selectedMonth);
    let html = `
    <td
      class="centerCell one-line left"
    >
      <select 
        class="${className} center news-text"
        ${(enableChanges) ? '' : "disabled"}
      >`;

    for (let month = 1; month < 13; month++) {

      html += `
      <option 
        value="${month}"
        ${month === selectedMonth ? 'selected' : ''}
      >
        ${findNameOfMonth(month)}
      </option>`;
    };

    html += `
        </select >
      </td>
    `;

    return html;
  }

  // Select choices like Yes, No, Ignore
  showSelectedValues(className, style, enableChanges, selected, ...choices) {

    let html = `
    <td
      class="center"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style="${style}"` : `style="width:175px;"`}>`;

    choices.forEach((choice) => {

      html += `
        <option 
          value=${choice}
          ${(choice === selected) ? 'selected' : ''}
        >
          ${choice}
        </option>
      `;
    });

    html += `
      </select >
    </td>`;

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
    const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber);
    if (rowNumberBankAccount !== -1) {

      bankAccountName = objBankAccount.arrayBankAccounts[rowNumberBankAccount].name;
    }

    if (!bankAccountName) {

      // Bank account name from supplier table
      const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.bankAccount === bankAccountNumber);
      if (rowNumberSupplier !== -1) {

        bankAccountName = objSupplier.arraySuppliers[rowNumberSupplier].name;
      }
    }

    if (!bankAccountName) {

      // Bank account name from user bank account
      const rowNumberBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccountNumber);
      if (rowNumberBankAccount !== -1) {

        bankAccountName = objUserBankAccount.arrayUserBankAccounts[rowNumberBankAccount].name;
      }
    }

    bankAccountName = (bankAccountName) ? bankAccountName : bankAccountNumber;
    //return (bankAccountName) ? bankAccountName : "-";
    return (bankAccountName);
  }

  // get condo Id from From Bank Account
  getCondoId(fromBankAccount) {

    let condoId = 0;

    // Validate Bank Account
    const bankAccountPattern = /^\d{11}$/;
    if ((bankAccountPattern.test(fromBankAccount))) {

      const rowNumberBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === fromBankAccount);
      if (rowNumberBankAccount !== -1) {

        const userId = Number(objUserBankAccount.arrayUserBankAccounts[rowNumberBankAccount].userId);

        if (userId >= 0) {

          const rowNumberUser =
            objUser.arrayUsers.findIndex(user => user.userId === userId);
          if (rowNumberUser !== -1) {

            condoId =
              Number(objUser.arrayUsers[rowNumberUser].condoId);
          }
        }
      }
    }
    return condoId;
  }

  // Show icon
  showIcon(className, iconName) {

    // Set the PNG file
    const inputElement = document.querySelector(`.${className}`);
    inputElement.style.backgroundRepeat = `no-repeat`;

    inputElement.style.backgroundImage = `url('icons/${iconName}')`;
  }

  getClassByPrefix(element, prefix) {
    return [...element.classList].find(cls => cls.startsWith(prefix));
  }

  // Show table header including menu
  showTableHeaderMenu(style, menuNumber, menuType, ...texts) {

    let html = "<tr>";

    if (menuType === this.accountMenu) html += this.showAccountMenu(menuNumber);
    if (menuType === this.administrationMenu) html += this.showAdministrationMenu(menuNumber);
    texts.forEach((text) => {

      html += `
      <td 
        class="no-border center"
        ${(style) ? `style="${style}"` : 'style="width:175px;"'}
      >
        ${text}
      </td>`;
    });

    html += "</tr>";
    return html;
  }

  // Show table header including menu
  showTableHeaderMenuNew(menuNumber, menuType, ...texts) {

    let html = "<tr>";

    if (menuType === this.accountMenu) html += this.showAccountMenu(menuNumber);
    if (menuType === this.administrationMenu) html += this.showAdministrationMenu(menuNumber);
    texts.forEach((text) => {

      html += `
      <td 
        class="no-border center"
      >
        ${text}
      </td>`;
    });

    html += "</tr>";
    return html;
  }

  // Validate interval
  validateInterval(className, value, fromValue, toValue, object, style, message) {

    let valid = true;

    value = Number(value);
    fromValue = Number(fromValue);
    toValue = Number(toValue);

    if ((fromValue > toValue) || (value < fromValue) || (value > toValue)) valid = false;

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid) this.showMessage(object, style, message);

    return valid;
  }

  // Show the rest of the menu
  showRestMenu(menuNumber, menuType) {

    let html = "";
    if (menuType === this.accountMenu) {
      if (this.arrayAccountMenu.length >= menuNumber) {
        for (; this.arrayAccountMenu.length >= menuNumber; menuNumber++) {

          html += "<tr>";

          // Show menu
          html += this.showAccountMenu(menuNumber);
          html += "</tr>"
        }
      }
    }

    if (menuType === this.administrationMenuMenu) {
      if (this.arrayAdministrationMenu.length >= menuNumber) {
        for (; this.arrayAdministrationMenu.length >= menuNumber; menuNumber++) {

          html += "<tr>";

          // Show menu
          html += this.showAdministrationMenu(menuNumber);
          html += "</tr>"
        }
      }
    }
    // The end of the table
    return html;
  }

  // Validate number
  validateNumber(className, number, min, max, object, style, message, showMessage = true) {

    let valid = (Number(number) >= Number(min) && Number(number) <= Number(max));

    // Invalid number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) inputElement.classList.toggle('input-error', !valid);
      if ((valid === false) && showMessage) this.showMessage(object, style, message);
    }

    return valid;
  }

  // validate the norwegian date format dd.mm.yyyy
  validateNorDate(className, date, object, style, message) {

    let valid = true;

    // Check for valid date String
    if (date === '' || typeof date === 'undefined') valid = false;
    if (valid) {

      // Regular expression for valuating the dd.mm.yyyy format
      const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/
      const match = date.match(regex);

      if (!match) valid = false;

      if (valid) {

        // Extract day, month, and year
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Check if month is between 1 and 12
        if (day < 1 || day > 31) valid = false;
        if (month < 1 || month > 12) valid = false;
        if (year < 1900 || year > 2099) valid = false;
      }
    }

    // Invalid/ valid phone number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'message' class
        //inputElement.classList.toggle('input-error', !valid);
        inputElement.classList.toggle('message', !valid);
      }
    }

    if ((!valid) && (message.lenght > 0)) this.showMessage(object, style, message);
    return valid;
  }

  // Validate phone number 
  validatePhone(className, phone) {

    // Validate phone number
    phone = phone.replace(/\s+/g, "");
    const valid = /^\d{8,15}$/.test(phone);

    // Invalid/ valid phone number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        inputElement.classList.toggle('input-error', !valid);
      }
    }
    return valid;
  }

  // Validate E-mail
  validateEmail(className, eMail, object, style, message) {

    // Validate eMail
    const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = ((eMailRegex.test(eMail))) ? true : false;

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid) this.showMessage(object, style, message);

    return valid;
  }

  // Validate organization number
  validateOrganizationNumber(className, organizationNumber) {

    // Validate organization number Organization Number
    const organizationNumberPattern = /^\d{9}$/;
    const valid = (organizationNumberPattern.test(organizationNumber)) ? true : false;

    // Invalid/ Valid organization number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        inputElement.classList.toggle('input-error', !valid);
      }
    }
    return valid;
  }

  // Validate filename
  validateFileName(className, fileName) {
    const fileNameRegex = /^(?:[a-zA-Z]:\\)?(?:[^<>:"/\\|?*\x00-\x1F]+\\)*[^<>:"/\\|?*\x00-\x1F]*$/;
    const valid = fileNameRegex.test(fileName);

    // Invalid/ Valid  filename
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        inputElement.classList.toggle('input-error', !valid);
      }
    }
    return valid;
  }

  // Show blank header row
  showBlankHeaderRow(style, menuNumber, ...texts) {

    let html = "<tr>";

    html += this.showAccountMenu(menuNumber);

    texts.forEach((text) => {

      if (text === '') html += `<td class="no-border center" style="${style}">${text}</td>`;
      if (text !== '' && style !== '') html += `<td class="no-border center bold" style="${style}">${text}</td>`;
      if (text !== '' && style === '') html += `<td class="no-border center bold">${text}</td>`;
    });

    html += "</tr>";
    return html;
  }

  // Start of table
  startTable(style) {

    return `
    <table 
      ${(style) ? `style="${style}"` : ""}>`;
  }

  // Initializing of a table
  initializeTable(...columnWidths) {

    let tableWith = 0;
    columnWidths.forEach((columnWidth) => {
      tableWith += columnWidth;
    });

    let html = `
    <table 
      style="table-layout: fixed; width: ${tableWith}px;">`;

    html += '<colgroup>';

    columnWidths.forEach((columnWidth) => {
      html += `<col style="width: ${columnWidth}px;">`;
    });

    html += '</colgroup>';
    return html;
  }

  // Show main header table not including menu
  showTableHeader(style, menuType, ...texts) {

    let html = `<tr>`;

    texts.forEach((text) => {

      if (text === '' && style === '') html += `<th class="no-border">${text}</th>`;
      if (text === '' && style !== '') html += `<th class="no-border" style="${style}">${text}</th>`;
      if (text !== '' && style === '') html += `<th class="no-border center">${text}</th>`;
      if (text !== '' && style !== '') html += `<th class="no-border center" style="${style}">${text}</th>`;
    });

    // empty row
    html += this.insertTableRow('', 0, 0, '');
    html += "</tr>";
    return html;
  }

  // Show main header table
  showTableHeaderLogOut(style, ...texts) {

    let html = `<tr>`;

    texts.forEach((text) => {

      if (text === '' && style === '') html += `<th class="no-border">${text}</th>`;
      if (text === '' && style !== '') html += `<th class="no-border" style="${style}">${text}</th>`;
      if (text !== '' && style === '') html += `<th class="no-border center">${text}</th>`;
      if (text !== '' && style !== '') html += `<th class="no-border center" style="${style}">${text}</th>`;
    });

    html += `
    <th 
      class="right no-border"
    >
      <button 
        class="logOut right one-line"
        style="width:75px;"}
      >
        Logg ut
      </button>
    </th>`;

    return html;
  }

  // end table header
  endTableHeader() {

    return `</th></tr></thead>`;
  }

  // Start body table
  startTableBody() {

    return "<tbody>";
  }

  // insert a table row
  // and show account menu or administration menu
  insertTableRow(style, menuNumber, menuType, ...texts) {

    let html = "<tr>";

    // if menuNumber is invalid do not show menu
    if (menuNumber > 0) {
      if (menuType === this.accountMenu) html += this.showAccountMenu(menuNumber);
      if (menuType === this.administrationMenu) html += this.showAdministrationMenu(menuNumber);
    }

    texts.forEach((text) => {

      html += (style === '')
        ? `<td class="center no-border">${text}</td>`
        : `<td class="center no-border" style="${style}">${text}</td>`;
    });

    return html;
  }

  // insert a table row
  // and show account menu or administration menu
  insertTableRowNew(menuNumber, menuType, ...texts) {

    let html = "<tr>";

    // if menuNumber is invalid do not show menu
    if (menuNumber > 0) {
      if (menuType === this.accountMenu) html += this.showAccountMenu(menuNumber);
      if (menuType === this.administrationMenu) html += this.showAdministrationMenu(menuNumber);
    }

    texts.forEach((text) => {

      html += `<td class="center no-border">${text}</td>`
    });

    return html;
  }

  // insert menu at start of a row 
  insertMenu(menuNumber, className, style, menuType, ...texts) {

    let html = "<tr>";

    if (menuNumber > 0) {
      if (menuType === this.accountMenu) html += this.showAccountMenu(menuNumber);
      if (menuType === this.administrationMenu) html += this.showAdministrationMenu(menuNumber);
    }
    texts.forEach((text) => {

      html += (style === '')
        ? `<td class="center no-border ${className}">${text}</td>`
        : `<td class="center no-border ${className}" style="${style}">${text}</td>`;
    });

    return html;
  }

  // end body table
  endTableBody() {

    return "</tbody>";
  }
  // End of the table
  endTable() {

    return `</table>`;
  }

  // check if server is started
  async checkServer() {

    const URL = (this.serverStatus === 1) ? '/api/health' : 'http://localhost:3000/health';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      return response.ok;
    } catch (err) {

      return false;
    }
  }

  // check if file exist
  async checkIfFileExist(fileName) {

    const URL = (this.serverStatus === 1)
      ? '/api/checkIfFileExist'
      : 'http://localhost:3000/checkIfFileExist';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: fileName
        })
      });

      return response.ok;
    } catch (err) {

      return false;
    }
  }

  // Check if class is defined
  isClassDefined(className) {

    const element = document.querySelector(`.${className}`);      // Select the element
    if (element !== null) {
      return (element.classList.contains(`${className}`)) ? true : false;
    } else {
      return false;
    }
  }

  // Show vertical account menu
  showAccountMenu(menuNumber) {

    let html = "";

    // Check of menu exists
    if (this.arrayAccountMenu.length >= menuNumber && menuNumber > 0) {

      const URL = (this.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';

      const applicationName = this.arrayAccountMenu[menuNumber - 1].applicationName;
      const text = this.arrayAccountMenu[menuNumber - 1].text;
      const className = this.arrayAccountMenu[menuNumber - 1].className;

      html += `
        <td class="one-line menu"
          style = "width:175px;">
          <a href="${URL}${applicationName}">
            ${text}
          </a>
        </td>`;
    } else {

      // Do not show menu
      html += `
        <td 
          style = "width:175px;">
          <a></a>
        </td>`;
    }

    return html;
  }

  // Show vertical administration menu
  showAdministrationMenu(menuNumber) {

    let html = "";

    // Check of menu exists
    if (this.arrayAdministrationMenu.length >= menuNumber && menuNumber > 0) {

      const URL = (this.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';

      const applicationName = this.arrayAdministrationMenu[menuNumber - 1].applicationName;
      const text = this.arrayAdministrationMenu[menuNumber - 1].text;
      const className = this.arrayAdministrationMenu[menuNumber - 1].className;

      html += `
      <td class="one-line menu">
        <a href="${URL}${applicationName}">
          ${text}
        </a>
      </td>`;
    } else {

      // Do not show menu
      html += `<td></td>`;
    }

    return html;
  }

  // Format norwegian date (11.05.1983) to number (19830511)
  formatNorDateToNumber(norDate) {

    return norDate.substring(6,) + norDate.substring(3, 5) + norDate.substring(0, 2);
  }

  // Show message
  showMessage(object, style, message) {

    // Start table
    style = (style) ? style : 'width:600px;';
    let html = object.startTable(style);

    // show main header
    html += object.showTableHeader('width:250px;', this.accountMenu, message);

    // The end of the table
    html += object.endTable();
    document.querySelector('.message').innerHTML = html;
  }

  // Remove message
  removeMessage() {

    document.querySelector(".message").style.display = "none";
  }

  // Show horizontal menu
  showHorizontalMenu() {

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';

    let html = `
    <nav class="navbar">
      <ul class="nav-links">`;

    this.arrayHorizontalMenu.forEach((horizontalMenu) => {
      html += (Number(horizontalMenu.className) === 1)
        ? `<li><a href="${URL}/${horizontalMenu.applicationName}" class="active">${horizontalMenu.text}</a></li>`
        : `<li><a href="${URL}/${horizontalMenu.applicationName}">${horizontalMenu.text}</a></li>`;
    });

    html += `
      </ul>
    </nav>`;

    return html;
  }
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

// Format date dd.mm.yyyy (European date format) to yyyymmdd ("Basic ISO 8601 format)
function convertDateToISOFormat(date) {
  if (date.includes('.')) {
    const dateParts = date.split(".");
    date = `${dateParts[2]}${dateParts[1]}${dateParts[0]}`;
    date = (isNumeric(date))
      ? date
      : 0;
  } else {
    date = '';
  }
  return date;
}

// Format date from yyyymmdd (Basic ISO 8601 format) -> dd.mm.yyyy (European date format)
function formatNumberToNorDate(date) {

  date = String(date);
  const formatedDate = date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
  return (formatedDate.includes('..')) ? '' : formatedDate;
}

// Check if class is defined
function isClassDefined(className) {

  const element = document.querySelector(`.${className}`);      // Select the element
  if (element !== null) {
    return (element.classList.contains(`${className}`)) ? true : false;
  } else {
    return false;
  }
}

function findNameOfMonth(month) {

  let nameOfMonth = '';

  if (month === 1) nameOfMonth = 'Januar';
  if (month === 2) nameOfMonth = 'Februar';
  if (month === 3) nameOfMonth = 'Mars';
  if (month === 4) nameOfMonth = 'April';
  if (month === 5) nameOfMonth = 'Mai';
  if (month === 6) nameOfMonth = 'Juni';
  if (month === 7) nameOfMonth = 'Juli';
  if (month === 8) nameOfMonth = 'August';
  if (month === 9) nameOfMonth = 'September';
  if (month === 10) nameOfMonth = 'Oktober';
  if (month === 11) nameOfMonth = 'November';
  if (month === 12) nameOfMonth = 'Desember';

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

  return Number(kroner + ore);
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

  return norDate.substring(6,) + norDate.substring(3, 5) + norDate.substring(0, 2);

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

// exit application after 1 hour
function exitIfNoActivity() {

  clearTimeout(this.inactivityTimeout);

  inactivityTimeout = setTimeout(() => {

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/condo-login.html'
      : 'http://localhost/condo-login.html';
    window.location.href = URL;

    //window.location.href =
    //  'condo-login.html'
  }, 1 * 60 * 60 * 1000); // 1 hour
}

// Listen for user activity
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, exitIfNoActivity);
});

