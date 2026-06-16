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

  // User info
  condominiumId = Number(sessionStorage.getItem("condominiumId"));
  user = sessionStorage.getItem("user");
  securityLevel = Number(sessionStorage.getItem("securityLevel"));
  userId = Number(sessionStorage.getItem("userId"));

  // array of horizontal main menu
  arrayMenuMain = [
    {
      applicationName: "condo-shownews.html",
      className: "Menu1",
      text: "Nyheter"
    },
    {
      applicationName: "condo-showemptyingcalendar.html",
      className: "Menu2",
      text: "Tømmekalender"
    },
    {
      applicationName: "condo-condominium.html",
      className: "Menu3",
      text: "Sameie"
    },
    {
      applicationName: "condo-user.html",
      className: "Menu4",
      text: "Bruker"
    },
    {
      applicationName: "condo-showtransaction.html",
      className: "Menu5",
      text: "Transaksjoner"
    },
    {
      applicationName: "condo-due.html",
      className: "Menu6",
      text: "Forfall"
    }
  ];

  // array of horizontal news menu
  arrayMenuNews = [
    {
      applicationName: "condo-shownews.html",
      className: "Menu1",
      text: "Vis Nyheter"
    },
    {
      applicationName: "condo-news.html",
      className: "Menu2",
      text: "Nyheter"
    },
  ];

  // array of horizontal emptying calendar menu
  arrayMenuEmptyingCalendar = [
    {
      applicationName: "condo-showemptyingcalendar.html",
      className: "Menu1",
      text: "Vis Tømmekalender"
    },
    {
      applicationName: "condo-emptyingcalendar.html",
      className: "Menu2",
      text: "Tømmekalender"
    },
  ];

  // menu array for condominium
  arrayMenuCondominium = [
    {
      applicationName: "condo-condominium.html",
      className: "Menu1",
      text: "Sameie"
    },
    {
      applicationName: "condo-bankaccount.html",
      className: "Menu2",
      text: "Bankkonto"
    },
    {
      applicationName: "condo-account.html",
      className: "Menu3",
      text: "Konto"
    }
  ];

  // menu array for user
  arrayMenuUser = [
    {
      applicationName: "condo-user.html",
      className: "Menu1",
      text: "Bruker"
    },
    {
      applicationName: "condo-password.html",
      className: "Menu2",
      text: "Passord"
    },
    {
      applicationName: "condo-condo.html",
      className: "Menu3",
      text: "Leilighet"
    },
    {
      applicationName: "condo-userbankaccount.html",
      className: "Menu4",
      text: "Bankkonto"
    }
  ];

  // menu array for account
  arrayMenuAccount = [
    {
      applicationName: "condo-showtransaction.html",
      className: "Menu1",
      text: "Vis Transaksjoner"
    },
    {
      applicationName: "condo-transaction.html",
      className: "Menu2",
      text: "Transaksjoner"
    },
    {
      applicationName: "condo-remoteheating.html",
      className: "Menu3",
      text: "Fjernvarme"
    },
    {
      applicationName: "condo-priceremoteheating.html",
      className: "Menu4",
      text: "Pris Fjernvarme"
    },
    {
      applicationName: "condo-annualaccount.html",
      className: "Menu5",
      text: "Årsregnskap"
    },
    {
      applicationName: "condo-importfile.html",
      className: "Menu6",
      text: "Hent transaksjoner"
    },
  ];

  // menu array for due
  arrayMenuDue = [
    {
      applicationName: "condo-due.html",
      className: "Menu4",
      text: "Forfall"
    },
    {
      applicationName: "condo-supplier.html",
      className: "Menu1",
      text: "Leverandør"
    },
    {
      applicationName: "condo-commoncost.html",
      className: "Menu2",
      text: "Felleskostnad"
    },
    {
      applicationName: "condo-overview.html",
      className: "Menu3",
      text: "Betalingsoversikt"
    }
  ];

  // menu array for annual report
  arrayMenuAnnualReport = [
    {
      applicationName: "condo-budget.html",
      className: "Menu1",
      text: "Budsjett"
    },
    {
      applicationName: "condo-annualreport.html",
      className: "Menu2",
      text: "Årsrapport"
    }
  ];

  // menu array for bank account transactions
  arrayMenuTransaction = [
    {
      applicationName: "condo-showtransaction.html",
      className: "Menu1",
      text: "Vis transaksjoner"
    },
    {
      applicationName: "condo-importtransaction.html",
      className: "Menu2",
      text: "Importer transaksjoner"
    },
    {
      applicationName: "condo-transaction.html",
      className: "Menu3",
      text: "Transaksjoner"
    },
   ];

  // menu array for projects
  arrayMenuProject = [
    {
      applicationName: "condo-project.html",
      className: "Menu1",
      text: "Vis transaksjoner"
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
  editTableCell(className, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

    return `
    <td 
      class="center one-line" 
      colspan="${colspan}" 
      rowspan="${rowspan}"
    >
      <input
        class="${className} center one-line"
        type="text"
        maxlength="${maxlength}"
        ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
        ${(enableChanges) ? '' : 'readonly'}
      >
    </td>`;
  }

  // start input row (<div>)
  startRow() {
    return `
    <p>&nbsp;</p>
    <div 
      class="row"
    >
    `;
  }

  // Show Date
  editDate(label, className, value, enableChanges) {

    let html = `
    <div class="field date" style="margin-left:25px; width:175px;">
      <label>
        ${label}
      </label>
      <input 
        type="date" 
        class="${className} center one-line"
        ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
        ${(enableChanges) ? '' : 'readonly'}
      >
    </div>`;
    return html;
  }

  // Show amount
  editAmount(label, className, value, enableChanges) {

    let html = `
    <div class="field date" style="margin-left:25px; width:175px;">
      <label>
        ${label}
      </label>
      <input 
        type="text"
        inputmode="decimal" 
        autocomplete="off"
        class="${className} center one-line"
        ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
        ${(enableChanges) ? '' : 'readonly'}
      >
      <label>${label}</label>
    </div>`;
    return html;
  }

   // Show selected numbers (from number - to number)
  showSelectedNumbersNew(label, className, style, fromNumber, toNumber, selectedNumber, enableChanges) {

    let selectedValue = false;

    let html = `
    <div class="field status" style="max-width:175px">
      <label>
        ${label}
      </label>
      <select 
        class="${className} center one-line"
        ${(enableChanges) ? '' : 'readonly'}
      >`;

    // show interval of numbers
    for (let number = fromNumber; number <= toNumber; number++) {

      html += `
        <option 
          value=${number}
          ${(number === selectedNumber) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${number}&nbsp;&nbsp;
        </option>`;

      if (number === selectedNumber) selectedValue = true;
    };

    html += `
      </select >
    </div>`;

    return html;
  }

  // end input row (</div>)
  endRow() {
    return "</div><p>&nbsp;</p>";
  }

  // Show input (<td></td>) with center text
  editTableCellCenter(className, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

    return `
    <td 
      class="center" 
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
      >
        ${value}
      </textarea>
    </td>`;
  }

  // Show password input
  inputTableCellPassword(className, value, maxlength) {

    return `
    <td class="center">
      <input
        class="${className} center one-line"
        type="password"
        maxlength="${maxlength}"
        value="${value}"
      >
    </td>`;
  }

  // Show password
  inputTablePassword(className, value, maxlength) {
    return `
    <td class="center">
      <input
        class="${className} center one-line"
        type="password"
        maxlength="${maxlength}"
        value="${value}"
      >
    </td>`;
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
  showButton(className, text) {

    let html = `
    <td class="one-line center"
    >
      <button 
        class="${className} center button"
      >
        ${text}
      </button>
    </td>`;

    return html;
  }

  // Valid text
  validateText(className, columnWidths, style, message, showMessage = true, text, minLenght, maxLength) {

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
    if (!valid && showMessage) this.showMessageNew(columnWidths, style, message)

    return valid;
  }

  // validate bank account
  validateBankAccount(className, columnWidths, showMessage, bankAccount, style, message) {

    const bankAccountPattern = /^\d{11}$/;
    const valid = bankAccountPattern.test(bankAccount);

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid && showMessage) this.showMessageNew(columnWidths, style, message);

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
  showSelectedNumbers(className, style, fromNumber, toNumber, selectedNumber, enableChanges) {

    selectedNumber = Number(selectedNumber);

    let html = `
    <td
      class="one-line center"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}>`;

    for (let number = fromNumber; number <= toNumber; number++) {

      html += `
      <option 
        value="${number}"
        ${(number === selectedNumber) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${number.toString().trim()}&nbsp;&nbsp;
      </option>`;
    }
    html += `
      </select >
    </td>`;

    return html;
  };

  // Select months
  showSelectedMonths(className, style, selectedMonth, enableChanges) {

    selectedMonth = Number(selectedMonth);
    let selectedValue = false;

    let html = `
    <td
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
      >`;
    for (let month = 1; month < 13; month++) {

      html += `
      <option 
        value="${month}"
        ${month === selectedMonth ? 'selected' : ''}
      >
        ${findNameOfMonth(month).trim()}
      </option>`;
    };

    html += `
        </select >
      </td>
    `;

    return html;
  }

  // Show selected numbers (from number - to number)
  showSelectedMonthsNew(label, className, style, selectedMonth, enableChanges) {

    let selectedValue = false;

    let html = `
    <div class="field status" style="max-width:175px">
      <label>
        ${label}
      </label>
      <select 
        class="${className} center one-line"
        ${(enableChanges) ? '' : 'readonly'}
      >`;

    for (let month = 1; month < 13; month++) {

      html += `
      <option 
        value="${month}"
        ${month === selectedMonth ? 'selected' : ''}
      >
        &nbsp;&nbsp;${findNameOfMonth(month).trim()}&nbsp;&nbsp;
      </option>`;
    };

    html += `
      </select >
    </div>`;

    return html;
  }

  // Select choices like Yes, No, Ignore
  showSelectedValues(className, style, enableChanges, selected, ...choices) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line center"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    choices.forEach((choice) => {

      html += `
      <option 
        value="${choice}"
        ${(choice === selected) ? 'selected' : ''}
      >
        &nbsp;&nbsp;${choice}&nbsp;&nbsp;
      </option>`;
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

          const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === userId);
          if (rowNumberUser !== -1) condoId = Number(objUser.arrayUsers[rowNumberUser].condoId);
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

  // Show table header including menu (<tr></tr>)
  showTableHeaderMenu(color, direction = "center", ...texts) {

    let html = "<tr>";

    texts.forEach((text) => {

      html += `
      <td 
        style="vertical-align:bottom;font-size:14px;color:#333;${(color) ? `background-color:${color};` : " "}"
        class="no-border ${direction} bold one-line"
      >
        ${text}
      </td>`;
    });

    html += "</tr>";
    return html;
  }

  // Validate values ('Yes','No','Ignore')
  validateValues(className, columnWidths, style, message, showMessage = true, selectedValue, ...values) {

    let valid = false;

    values.forEach((value) => {

      if (value === selectedValue) valid = true;
    });

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid && showMessage) this.showMessageNew(columnWidths, style, message);

    return valid;
  }

  // Validate number
  validateInterval(className, columnWidths, style, message, showMessage = true, number, min, max) {

    let valid = (Number(number) >= Number(min) && Number(number) <= Number(max));

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid && showMessage) this.showMessageNew(columnWidths, style, message);

    return valid;
  }


  // validate the norwegian date format dd.mm.yyyy
  validateNorDate(className, date, style, message) {

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

    if ((!valid) && (message.lenght > 0)) this.showMessageNew(columnWidths, style, message);
    return valid;
  }

  // validate the iso date format yyyy-mm-dd
  validateIsoDate(className, date, style, message) {

    let valid = true;

    // Check for valid date String
    if (date === '' || typeof date === 'undefined') valid = false;
    if (valid) {

      // Regular expression for valuating the yyyy-mm-dd format
      const regex = /^(\d{4})\-(\d{2})\-(\d{2})$/
      const match = date.match(regex);

      if (!match) valid = false;

      if (valid) {

        // Extract day, month, and year
        const [year, month, day] = date.split('-');
        //const day = parseInt(match[1], 10);
        //const month = parseInt(match[2], 10);
        //const year = parseInt(match[3], 10);

        // Check if month is between 1 and 12
        if (day < 1 || day > 31) valid = false;
        if (month < 1 || month > 12) valid = false;
        if (year < 1900 || year > 2099) valid = false;
      }
    }

    // remove/ add 'message' 
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'message' class
        inputElement.classList.toggle('message', !valid);
      }
    }

    // Show error message?
    if ((!valid) && (message.lenght > 0)) this.showMessageNew(columnWidths, style, message);
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
  validateEmail(className, eMail, style, message) {

    // Validate eMail
    const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = ((eMailRegex.test(eMail))) ? true : false;

    const inputElement = document.querySelector(`.${className}`);
    if (inputElement) inputElement.classList.toggle('input-error', !valid);
    if (!valid) this.showMessageNew(columnWidths, style, message);

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

  // Start of table
  startTable(style) {

    return `
    <table 
      ${(style) ? `style="${style}"` : ""}>`;
  }

  // Initializing of a table
  initializeTable(columnWidths) {

    let tableWidth = 0;
    columnWidths.forEach((columnWidth) => {
      tableWidth += (columnWidth + 10);
    });

    //style="table-layout: fixed; width: 1110px; border:1;">
    let html = `
    <table 
      style="table-layout: fixed;
      width: ${tableWidth}px;
      border: 1px;">`;
    html += '<colgroup>';

    columnWidths.forEach((columnWidth) => {
      html += `<col style="width: ${columnWidth}px;">`;
    });

    html += '</colgroup>';
    return html;
  }

  // Show main header table not including menu
  showTableHeader(style, ...texts) {

    let html = `<tr>`;

    texts.forEach((text) => {

      if (text === '' && style === '') html += `<th class="no-border">${text}</th>`;
      if (text === '' && style !== '') html += `<th class="no-border" style="${style}">${text}</th>`;
      if (text !== '' && style === '') html += `<th class="no-border center">${text}</th>`;
      if (text !== '' && style !== '') html += `<th class="no-border center" style="${style}">${text}</th>`;
    });

    // empty row
    html += this.insertTableRow('', '');
    html += "</tr>";
    return html;
  }

  // Show main header table
  showTableHeaderLogOut(...texts) {

    let html = `<tr>`;

    texts.forEach((text) => {

      if (text === '') html += `<th class="no-border">${text}</th>`;
      if (text !== '') html += `<th class="no-border center">${text}</th>`;
    });

    html += `
    <th 
      class="right no-border"
    >
      <button 
        class="logOut right one-line"
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

  // insert a table row (<tr></td>)
  insertTableRow(style, ...texts) {

    let html = "<tr>";

    texts.forEach((text) => {

      html += `
      <td 
        class="center no-border"
        ${(style) ? `style="${style}"` : ''}
      >
        ${text}
      </td>`
    });

    return html;
  }

  /*
  // insert menu at start of a row 
  insertMenu(className, style, menuType, ...texts) {

    let html = "<tr>";

    texts.forEach((text) => {

      html += (style === '')
        ? `<td class="center no-border ${className}">${text}</td>`
        : `<td class="center no-border ${className}" style="${style}">${text}</td>`;
    });

    return html;
  }
  */

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

  // Format date (11.05.1983/1983-05-11) to number (19830511)
  formatDateToNumber(date) {

    if (date.includes('.')) {
      const [day, month, year] = date.split('.');
      return Number(`${year}${month}${day}`);
    }

    if (date.includes('-')) {
      return Number(date.replaceAll('-', ''));
    }

    return 0; // invalid format
  }

  // Show message
  showMessageNew(columnWidths, style, message) {

    let tableWidth = 0;
    columnWidths.forEach((columnWidth) => {
      tableWidth += (columnWidth + 10);
    });

    // Start table
    style = (style) ? style : `width:${tableWidth}px;`;
    let html = this.startTable(style);

    // show main header
    html += this.showTableHeaderMenu('', 'center', '');

    html += this.showTableHeader(`width:${tableWidth}px;`, message);

    // The end of the table
    html += this.endTable();
    document.querySelector('.message').innerHTML = html;
  }

  // Remove message
  removeMessage() {

    document.querySelector(".message").style.display = "none";
  }

  // Show horizontal menu
  showHorizontalMenu(arrayMenu) {

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';

    let html = `
    <nav class="navbar horizontalMenu">
      <ul class="nav-links">`;

    arrayMenu.forEach((array) => {
      html += (Number(array.className) === 1)
        ? `<li><a href="${URL}/${array.applicationName}" class="active">${array.text}</a></li>`
        : `<li><a href="${URL}/${array.applicationName}">${array.text}</a></li>`;
    });

    html += `
      </ul>
    </nav>`;

    return html;
  }

  // Format amount (1 234 567,89)
  formatAmount(amount) {

    //let value = amount.value.replace(/\D/g, '');
    amount = String(amount);
    if (!amount) {
      return ' ';
    }

    while (amount.length < 3) {
      value = '0' + value;
    }

    // decimal
    const decimals = amount.slice(-2);

    // Integer
    let integerPart = amount.slice(0, -2);

    integerPart = integerPart.replace(/^0+/, '') || '0';

    integerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ' '
    );

    return `${integerPart},${decimals}`;
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

/*
// Format date dd.mm.yyyy (European date format) to yyyymmdd ("Basic ISO 8601 format)
function formatDateToNumber(date) {
  if (date.includes('.')) {
    const dateParts = date.split(".");
    date = `${dateParts[2]}${dateParts[1]}${dateParts[0]} `;
    date = (isNumeric(date))
      ? date
      : 0;
  } else {
    date = '';
  }
  return date;
}
*/

// Format date from yyyymmdd (Basic ISO 8601 format) -> dd.mm.yyyy (European date format)
function formatNumberToNorDate(date) {

  date = String(date);
  const formatedDate = date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
  return (formatedDate.includes('..')) ? '' : formatedDate;
}

// Format date from yyyymmdd -> yyyy-mm-dd (Iso format)
function formatNumberToIsoDate(date) {

  date = String(date);
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6,)}`;
}

// Check if class is defined
function isClassDefined(className) {

  const element = document.querySelector(`.${className} `);      // Select the element
  if (element !== null) {
    return (element.classList.contains(`${className} `)) ? true : false;
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
    if (this.isClassDefined(`label - ${className} `)) {

      document.querySelector(`.label - ${className} `).outerHTML =
        `< div class="label-${className}-red" >
            * Ugyldig ${labelText}
          </div > `;
    }
    return false;
  } else {

    // Valid valid phone number
    if (this.isClassDefined(`label - ${className} -red`)) {

      document.querySelector(`.label - ${className} -red`).outerHTML =
        `< div class="label-${className} label-${className}" >
            * ${labelText}
          </div > `;
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

// Get current date in Iso date format (yyyy-mm-dd)
function getCurrentIsoDate() {

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

  return `${year}-${month}-${day}`;  // Output in dd.mm.yyyy format
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

  amount = String(amount);
  amount.replaceAll(' ', '');
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
  amount = (amount === '000')
    ? '0'
    : amount;
  amount = (isNumeric(amount))
    ? amount
    : '0';
  amount = Number(amount);
  //return String(amount);
  return Number(amount);
}

// Format amount
function formatAmount() {
  let value = amountInput.value.replace(/\D/g, '');

  if (!value) {
    amountInput.value = '';
    return;
  }

  while (value.length < 3) {
    value = '0' + value;
  }

  const decimals = value.slice(-2);
  let integerPart = value.slice(0, -2);

  integerPart = integerPart.replace(/^0+/, '') || '0';

  integerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ' '
  );

  amountInput.value = `${integerPart},${decimals}`;
}
/*
// Format norwegian date (11.05.1983) to number (19830511)
function formatDateToNumber(norDate) {

  return norDate.substring(6,) + norDate.substring(3, 5) + norDate.substring(0, 2);
}
*/

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

