// class for all applications for the condominium system
class Condos {

  constructor(applicationName) {

    this.applicationName = applicationName;
  }

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

  // const serverStatus = 1; // http://ingegilje.no
  // const serverStatus = 2; // http://localhost
  serverStatus = 2;

  inactivityTimeout = false;

  nineNine = 999999998;
  minusNineNine = -999999998;

  // User info
  condominiumId = Number(sessionStorage.getItem("condominiumId"));
  user = sessionStorage.getItem("user");
  securityLevel = Number(sessionStorage.getItem("securityLevel"));
  userId = Number(sessionStorage.getItem("userId"));

  // array of horizontal news menu
  arrayMenuNews = [
    {
      applicationName: 'condo-shownews.html',
      className: "condo-shownews",
      text: "Vis Nyheter"
    },
    {
      applicationName: 'condo-news.html',
      className: "condo-news",
      text: "Rediger Nyheter"
    },
    {
      applicationName: 'condo-news.html',
      className: "condo-news",
      text: "Menyvalg"
    },
  ];

  // array of horizontal empty calendar menu
  arrayMenuEmptyCalendar = [
    {
      applicationName: 'condo-emptycalendars.html',
      className: "condo-emptycalendars",
      text: "Vis Tømmekalender"
    },
    {
      applicationName: 'condo-emptycalendar.html',
      className: "condo-emptycalendar",
      text: "Rediger Tømmekalender"
    },
    {
      applicationName: 'condo-emptycalendar.html',
      className: "condo-emptycalendar",
      text: "Menyvalg"
    },
  ];

  // menu array for condominium
  arrayMenuCondominium = [
    {
      applicationName: 'condo-condominium.html',
      className: "condo-condominium",
      text: "Rediger Sameie"
    },
    {
      applicationName: 'condo-bankaccount.html',
      className: "condo-bankaccount",
      text: "Rediger Bankkonto"
    },
    {
      applicationName: 'condo-accounts.html',
      className: "condo-accounts",
      text: "Vis Konti"
    },
    {
      applicationName: 'condo-account.html',
      className: "condo-account",
      text: "Rediger Konto"
    },
    {
      applicationName: 'condo-condominium.html',
      className: "condo-condominium",
      text: "Menyvalg"
    },

  ];

  // menu array for user
  arrayMenuUser = [
    {
      applicationName: 'condo-user.html',
      className: "condo-user",
      text: "Rediger Bruker"
    },
    {
      applicationName: 'condo-password.html',
      className: "condo-password",
      text: "Rediger Passord"
    },
    {
      applicationName: 'condo-condo.html',
      className: "condo-condo",
      text: "Rediger Leilighet"
    },
    {
      applicationName: 'condo-userbankaccount.html',
      className: "condo-userbankaccount",
      text: "Rediger Bankkonto"
    },
    {
      applicationName: 'condo-user.html',
      className: "condo-user",
      text: "Menyvalg"
    },
  ];

  // menu array for transactions
  arrayMenuTransaction = [
    {
      applicationName: 'condo-transactions.html',
      className: "condo-transactions",
      text: "Vis Transaksjoner"
    },
    {
      applicationName: 'condo-transaction.html',
      className: "condo-transaction",
      text: "Rediger Transaksjon"
    },
    {
      applicationName: 'condo-projects.html',
      className: "condo-projects",
      text: "Vis Prosjekter"
    },
    {
      applicationName: 'condo-project.html',
      className: "condo-project",
      text: "Rediger Prosjekt"
    },
    {
      applicationName: 'condo-budgets.html',
      className: "condo-budgets",
      text: "Vis Budsjett"
    },
    {
      applicationName: 'condo-annualaccount.html',
      className: "condo-annualaccount",
      text: "Vis Årsregnskap"
    },
    {
      applicationName: 'condo-importfile.html',
      className: "condo-importfile",
      text: "Hent transaksjoner"
    },
    {
      applicationName: 'condo-liquidity.html',
      className: "condo-liquidity",
      text: "Vis Likviditet"
    },
    {
      applicationName: 'condo-transactions.html',
      className: "condo-transactions",
      text: "Menyvalg"
    },
  ];

  // menu array for due
  arrayMenuDue = [
    {
      applicationName: 'condo-dues.html',
      className: "condo-dues",
      text: "Vis Forfall"
    },
    {
      applicationName: 'condo-supplier.html',
      className: "condo-supplier",
      text: "Rediger Leverandør"
    },
    {
      applicationName: 'condo-commoncosts.html',
      className: "condo-commoncosts",
      text: "Vis Felleskostnader"
    },
    {
      applicationName: 'condo-commoncost.html',
      className: "condo-commoncost",
      text: "Rediger Felleskostnad"
    },
    {
      applicationName: 'condo-overview.html',
      className: "condo-overview",
      text: "Vis Betalingsoversikt"
    },
    {
      applicationName: 'condo-dues.html',
      className: "condo-dues",
      text: "Menyvalg"
    },
  ];

  // menu array for remote heating
  arrayMenuRemoteHeating = [
    {
      applicationName: 'condo-remoteheating.html',
      className: "condo-remoteheating",
      text: "Rediger Fjernvarme"
    },
    {
      applicationName: 'condo-remoteheatings.html',
      className: "condo-remoteheatings",
      text: "Vis Fjernvarme"
    },
    {
      applicationName: 'condo-remoteheatingprice.html',
      className: "condo-remoteheatingprice",
      text: "Rediger  Fjernvarmepris"
    },
    {
      applicationName: 'condo-remoteheating.html',
      className: "condo-remoteheating",
      text: "Menyvalg"
    },
  ];

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
        value="${(value ?? '').trim()}"
        ${(enableChanges) ? '' : 'readonly'}
      >
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
        value="${(value ?? '').trim()}"
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
        value="${(value ?? '').trim()}"
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
          ${number.toString().trim()}
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

  // Select choices like Yes, No, Ignore
  showSelectedValues(className, enableChanges, selected, ...choices) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line center"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    choices.forEach((choice) => {

      html += `
      <option 
        value="${(selected ?? '').trim()}"
        ${(choice === selected) ? 'selected' : ''}
      >
        ${choice}
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
      const rowNumberBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccountNumber);
      if (rowNumberBankAccount !== -1) {

        bankAccountName = objUserBankAccounts.arrayUserBankAccounts[rowNumberBankAccount].name;
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

      const rowNumberBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === fromBankAccount);
      if (rowNumberBankAccount !== -1) {

        const userId = Number(objUserBankAccounts.arrayUserBankAccounts[rowNumberBankAccount].userId);

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
  showTableHeader(direction = "center", ...texts) {

    let html = "<tr>";

    texts.forEach((text) => {

      html += `
      <td>
       ${text}
      </td>`;
    });

    html += "</tr>";
    return html;
  }

  // Validate values ('Yes','No','Ignore')
  validateValues(className, columnWidths, style, errorMessage, showMessage = true, selectedValue, ...values) {

    let isValid = false;

    values.forEach((value) => {

      if (value === selectedValue) isValid = true;
    });

    const inputElement = document.querySelector(`.${className}`);

    // remove/ add 'input-error' class
    if (inputElement) inputElement.classList.toggle('input-error', !isValid);
    if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);

    return isValid;
  }

  // validate the norwegian date format dd.mm.yyyy
  validateNorDate(className, date, errorMessage) {

    let isValid = true;

    // Check for isValid date String
    if (date === '' || typeof date === 'undefined') isValid = false;
    if (isValid) {

      // Regular expression for valuating the dd.mm.yyyy format
      const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/
      const match = date.match(regex);

      if (!match) isValid = false;

      if (isValid) {

        // Extract day, month, and year
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Check if month is between 1 and 12
        if (day < 1 || day > 31) isValid = false;
        if (month < 1 || month > 12) isValid = false;
        if (year < 1900 || year > 2099) isValid = false;
      }
    }

    // Invalid/ isValid phone number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        inputElement.classList.toggle('message', !isValid);
      }
    }

    if ((!isValid) && (errorMessage.length > 0)) showMessageNew(errorMessage);
    return isValid;
  }

  // Validate phone number 
  validatePhone(className, phone) {

    // Validate phone number
    phone = phone.replace(/\s+/g, "");
    const isValid = /^\d{8,15}$/.test(phone);

    // Invalid/ isValid phone number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        if (inputElement) inputElement.classList.toggle('input-error', !isValid);
      }
    }
    return isValid;
  }

  // Validate E-mail
  validateEmail(className, eMail, style, message) {

    // Validate eMail
    const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = ((eMailRegex.test(eMail))) ? true : false;

    const inputElement = document.querySelector(`.${className}`);

    // remove/ add 'input-error' class
    if (inputElement) inputElement.classList.toggle('input-error', !isValid);
    //if (inputElement) inputElement.classList.toggle('error-text', !isValid);
    if (!isValid) showMessageNew(errorMessage);

    return isValid;
  }

  // Validate organization number
  validateOrganizationNumber(className, organizationNumber) {

    // Validate organization number Organization Number
    const organizationNumberPattern = /^\d{9}$/;
    const isValid = (organizationNumberPattern.test(organizationNumber)) ? true : false;

    // Invalid/ Valid organization number
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        if (inputElement) inputElement.classList.toggle('input-error', !isValid);
      }
    }
    return isValid;
  }

  // Validate filename
  validateFileName(className, fileName) {

    const fileNameRegex = /^(?:[a-zA-Z]:\\)?(?:[^<>:"/\\|?*\x00-\x1F]+\\)*[^<>:"/\\|?*\x00-\x1F]*$/;
    const isValid = fileNameRegex.test(fileName);

    // Invalid/ Valid  filename
    if (this.isClassDefined(className)) {

      const inputElement = document.querySelector(`.${className}`);
      if (inputElement) {

        // remove/ add 'input-error' class
        if (inputElement) inputElement.classList.toggle('input-error', !isValid);
      }
    }
    return isValid;
  }


  // Start of table
  startTable(style) {

    return `
    <table 
      ${(style) ? style = "${style}" : ''}
    >`;
  }

  // Initializing of a table
  initializeTable(columnWidths) {

    // Calculate total table width
    let tableWidth = 0;
    columnWidths.forEach((columnWidth) => {
      tableWidth += (columnWidth + 10);
    });

    let html = `
    <div class="table-container">
      <table 
        class="transaction-table"
      >
    `;

    html += '<colgroup>';

    columnWidths.forEach((columnWidth) => {
      html += `<col style="width: ${columnWidth}px;">`;
    });

    html += '</colgroup>';
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
        ${(style) ? `style="${style};"` : ''}
      >
        ${text}
      </td>`
    });

    return html;
  }

  // end body table
  endTableBody() {

    return "</tbody>";
  }
  // End of the table
  endTable() {

    return `
      </table>
    </div>
    `;
  }

  // check if server is started
  async checkServer() {

    const URL = (this.serverStatus === 1)
      ? '/api/health'
      : 'http://localhost:3000/health';
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

    if (date) {
      if ((date.includes('.')) || date.includes('-')) {
        if (date.includes('.')) {
          const [day, month, year] = date.split('.');
          return Number(`${year}${month}${day}`);
        }

        if (date.includes('-')) {
          return Number(date.replaceAll('-', ''));
        }
      } else {

        // invalid date format
        return Number('0');
      }
    } else {

      // invalid date format
      return Number('0');
    }
  }

  // mark activated application
  markActivatedApplication(arrayMenu, className) {

    // Mark menuitem in main menu
    // Get first class name in arrayMenu (second menu)
    let firstClassName = "main-" + arrayMenu[0].className;
    this.arrayMainMenu.forEach((array) => {
      if (array.className === firstClassName) {

        const element = document.querySelector(`.${array.className}`);
        element.style.backgroundColor = "#38bdf8";
        element.style.color = "white";
      }
    });

    // Mark menuitem in second menu
    arrayMenu.forEach((array) => {
      if (array.className === className) {

        const element = document.querySelector(`.${className}`);
        element.style.backgroundColor = "#38bdf8";
        element.style.color = "white";
      }
    });
  }

  /*
  // Show horizontal menu
  showHorizontalMenu(className, arrayMenu) {

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';

    let html = `
    <nav class="navbar horizontalMenu">
      <ul 
        class="nav-links"
      >
    `;

    arrayMenu.forEach((array) => {

      const className = array.className;
      html += `
      <li>
        <a 
          class="${className}"
          href="${URL}${array.applicationName}"
        >
          ${array.text.trim()}
        </a>
      </li>`;
    });

    html += `
      </ul>
    </nav>
  </div>
  `;
    return html;
  }
  */

  /*
  // Show vertical menu
  showMenu(applicationName) {

    // Start frame
    let html = startFrame("menu-frame");

    // Vertical menu
    html += '<div class="menu-row">';
    html += this.showVerticalMenu('news', this.arrayMenuNews, "Nyheter", applicationName);
    html += this.showVerticalMenu('emptycalendar', this.arrayMenuEmptyCalendar, "Tømmekalender", applicationName);
    html += this.showVerticalMenu('condominium', this.arrayMenuCondominium, "Sameie", applicationName);
    html += this.showVerticalMenu('user', this.arrayMenuUser, "Bruker", applicationName);
    html += this.showVerticalMenu('transaction', this.arrayMenuTransaction, "Transaksjoner", applicationName);
    html += this.showVerticalMenu('due', this.arrayMenuDue, "Forfall", applicationName);
    html += this.showVerticalMenu('remoteHeating', this.arrayMenuRemoteHeating, "Fjernvarme", applicationName);
    html += '</div>';

    // End frame
    html += "</div>";

    return html;
  }
  */

  // Show vertical menu
  showMenu(applicationName) {

    // Start frame
    let html = `
    <!-- start showMenu -->
    <section 
      class="card"
    >
      <h2 
        class="card-title"
      >
        Meny
      </h2>
      <div 
        class="grid grid-menu"
      >
    `;

    html += this.showVerticalMenu('news', this.arrayMenuNews, "Nyheter", "Menyvalg");
    html += this.showVerticalMenu('emptycalendar', this.arrayMenuEmptyCalendar, "Tømmekalender", "Menyvalg");
    html += this.showVerticalMenu('condominium', this.arrayMenuCondominium, "Sameie", "Menyvalg");
    html += this.showVerticalMenu('user', this.arrayMenuUser, "Bruker", "Menyvalg");
    html += this.showVerticalMenu('transaction', this.arrayMenuTransaction, "Transaksjoner", "Menyvalg");
    html += this.showVerticalMenu('due', this.arrayMenuDue, "Forfall", "Menyvalg");
    html += this.showVerticalMenu('remoteHeating', this.arrayMenuRemoteHeating, "Fjernvarme", "Menyvalg");

    html += `
      </div>
    </section>
    <!-- end showMenu -->
    `;

    return html;
  }

  /*
  // Show vertical menu
  showVerticalMenu(className, arrayMenu, label, applicationName) {

    let menuSelected = false;

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';

    let html = `
    <div 
      class="field"
    >
      <label for="${className}-${className}">
        ${label}
      </label>
      <select 
        id="${className}-${className}"
        class="${className} center one-line"
        onchange="window.location.href=this.value"
      >
    `;

    arrayMenu.forEach((menu) => {

      //menuNumber++;
      html += `
        <option 
          value="${URL}${menu.applicationName}"
          ${(menu.applicationName.includes(applicationName) && menuSelected === false)
          ? 'selected'
          : ''}
        >
          ${menu.text.trim()}
        </option>`;
      if (menu.applicationName.includes(applicationName)) menuSelected = true;
    });

    html += `
      </select >
    </div>`;

    return html;
  }
  */

  // Show vertical menu
  showVerticalMenu(className, arrayMenu, label, applicationName) {

    let menuSelected = false;

    const URL = (this.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';

    let html = `
    <div 
      class="field"
    >
      <label 
        for="${className}-${className}"
      >
        ${label}
      </label>
      <select 
        id="${className}-${className}"
        onchange="window.location.href=this.value"
      >`;

    arrayMenu.forEach((menu) => {

      html += `
        <option 
          value="${URL}${menu.applicationName}"
          ${(menu.text.includes(applicationName) && menuSelected === false)
          ? 'selected'
          : ''}
        >
          ${menu.text.trim()}
        </option>`;
      if (menu.text.includes(applicationName)) menuSelected = true;
    });

    html += `
      </select>
    </div>
    `;

    return html;
  }
}

// input number
function inputNumber(className, label, value, enableChanges) {

  html = `
    <!-- start inputNumber --> 
    <div
     class="field"
    >
      <label
        for="${className}"
      >
        ${label}
      </label>
      <input 
        type="number"
        class="${className}"
        id="${className}"
        value="${value}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    </div>
    <!-- end inputNumber --> 
    `;

  return html
}

// input text
function inputText(className, label, value, enableChanges) {

  html = `
    <!-- start inputText --> 
    <div
     class="field"
    >
      <label
        for="${className}"
      >
        ${label}
      </label>
      <input 
        type="text"
        class="${className}"
        id="${className}"
        value="${value}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    </div>
    <!-- end inputText --> 
    `;

  return html
}

// show text
function showText( value) {

  html = `
    <!-- start showText --> 
      <input 
        type="text"
        value="${value}"
      >
    <!-- end showText --> 
    `;

  return html
}

// input text
function inputTextTabel(className, value, enableChanges) {

  html = `
    <!-- start inputText --> 

      <input 
        type="text"
        class="${className}"
        value="${value}"
        ${(enableChanges) ? '' : 'readonly'}
      >

    <!-- end inputText --> 
    `;

  return html
}

// input date
function inputDate(className, label, value, enableChanges) {

  let html = `
    <!-- start inputDate -->
    <div
      class="field"
    >
      <label
        for="${className}"
      >
        ${label}
      </label>
      <input 
        type="date"
        class="${className}"
        id="${className}" 
        value="${value}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    </div>
    <!-- end inputDate -->
  `;
  return html;
}

// Input text
function inputTableText(className, value, enableChanges) {

  return `
  <!-- start inputTableText -->
  <td>
    <input
      class="${className} center one-line input"
      type="text"
      value="${value}"
      ${(enableChanges) ? '' : 'readonly'}
    >
  </td>
  <!-- end inputTableText -->
  `;
}

// Show text in table
function showTableText(className, value) {

  return `
  <!-- start showTableText -->
  <td>
    <input
      class="${className} center one-line input"
      type="text"
      value="${value}"
      readonly
    >
  </td>
  <!-- end showTableText -->
  `;
}

function showTableIcon(className, color) {
  return `
  <!-- start showTableIcon -->
  <td>
    <span
      class="waste-icon waste-icon--food"
      role="img"
      aria-label="Matavfall hentes"
    >
      <i 
        class="${className}"
        style="color: ${color}; font-size: 29px;"
        aria-hidden="true"
      >
      </i>
    </span>
  </td>
  <!-- end showTableIcon -->
  `;
}

function endTable() {
  return `
  <!-- start endtable -->
        </table>
      </div>
    </section>
  </main>
  <!-- end endtable -->
  `;
}

function showTableButton(className, text, month, year) {

  const monthName = findNameOfMonth(month);
  return `
    <!-- start showTableButton -->
    <td>
      <button 
        type="button"
        class="${className} center button"
        aria-label="Rediger 1. ${monthName} ${year}">
        <i
          class="bi bi-pencil"
          aria-hidden="true"
        >
      </i>
        ${text}
    </button>
  </td>
  <!-- end showTableButton -->
  `;
}

// Input wide text
function inputWideText(className, label, value, colSpan, enableChanges) {

  const colspan = `wide wide${colSpan}`;
  let html = `
    <!-- start inputWideText -->
    <div 
      class="field ${colspan}"
    >
    <label
      for="${className}"
    >
      ${label}
    </label>
    <input
      type="text"
      class="${className}"
      id="${className}"
      value="${value}"
      ${(enableChanges) ? '' : 'readonly'}
    >
    </div>
    <!-- end inputWideText -->

  `;

  return html;
}


// Start buttons
function startButtons() {

  return `
  <!-- start startButtons -->
  <div 
    class="actions"
  >
  <!-- end startButtons -->
  `;
}

// primary Button
function primaryButton(text) {

  return `
  <button
    class="primary"
    type="submit"
  >
    ${text}
  </button>
  `;
}

// Button
function inputButton(className, text, buttonType) {

  // Check for valid button type
  if (buttonType !== "submit" && buttonType !== "button" && buttonType !== "reset") {
    buttonType = "button";
  }

  return `
  <!-- start inputButton -->
  <button
    class="${className}"
    type="${buttonType}"
  >
    ${text}
  </button>
  <!-- end inputButton -->
  `;
}

// End buttons
function endButtons() {

  return `
  <!-- start endButtons -->
    </div>
  <!-- end endButtons -->
  `;
}

/*
// Show selected numbers (from number - to number)
function showSelectedMonthsNew(label, className, style, selectedMonth, enableChanges) {

  let selectedValue = false;

  let html = `
  <div class="field field-position" 
  >
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
        ${findNameOfMonth(month).trim()}
      </option>`;
  };

  html += `
      </select >
    </div>`;

  return html;
}
*/

// Show all months for a year (1-12) with selected month
function showSelectedMonthsNew(className, label, selectedMonth, enableChanges) {

  let html = `
    <!-- start showSelectedCondosNew -->
    <div 
      class="field"
    >
      <label for="${className}">
        ${label}
      </label>
      <select 
        id="${className}"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

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
    </div>
    <!-- end showSelectedCondosNew -->
  `;

  return html;
}

// Show input
function editTableCell(className, value, maxlength, enableChanges, colspan = 1, rowspan = 1) {

  return `
    <!-- start editTableCell -->
    <td 
      class="center one-line" 
      colspan="${colspan}" 
      rowspan="${rowspan}"
    >
      <input
        class="${className} center one-line input"
        type="text"
        maxlength="${maxlength}"
        ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
        ${(enableChanges) ? '' : 'readonly'}
      >
    </td>
    <!-- end editTableCell -->
    `;
}

// Show amount
function showAmount(label, className, value, enableChanges) {

  return `
    <div 
      class="field field-position"
    >
      <label>
        ${label}
      </label>
      <input 
        type="text"
        style="height: 52px;"
        inputmode="decimal" 
        autocomplete="off"
        class="${className} center one-line"
        ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
        ${(enableChanges) ? '' : 'readonly'}
      >
      <label>${label}</label>
    </div>`;
}

// Show textarea
function showTextArea(label, className, value, maxlength, enableChanges, rows = 1) {

  return `
  <div 
    class="field field-position" 
  >
    <label>
      ${label}
    </label>
    <textarea 
      rows="${rows}"
      class="${className} news-text"
      maxlength="${maxlength}"
      style="border-radius: 20px;"
    >
      ${value}
    </textarea>
  </div>`;
}

// Remove message
function removeMessage() {

  document.querySelector(".showMessage").style.display = "none";
}

// Show message
function showMessageNew(message) {

  // Start frame
  let html = startFrame();

  // Show message
  html += message;

  // End filter
  html += "</div>";

  document.querySelector('.showMessage').innerHTML = html;
}

/*
// Show selected numbers (from number - to number)
function inputSelectedNumbers(label, className, fromNumber, toNumber, selectedNumber, enableChanges) {

  let selectedValue = false;

  let html = `
  <div 
    class="field field-position" 
  >
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
          ${number}
        </option>`;

    if (number === selectedNumber) selectedValue = true;
  };

  html += `
      </select >
    </div>`;

  return html;
}
*/

// Show selected numbers (from number - to number)
function inputSelectedNumbers(className, label, fromNumber, toNumber, selectedNumber, enableChanges) {

  let html = `
    <!-- start inputSelectedNumbers -->
    <div 
      class="field"
    >
      <label for="${className}">
        ${label}
      </label>
      <select 
        id="${className}"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

  // show interval of numbers
  for (let number = fromNumber; number <= toNumber; number++) {

    html += `
        <option 
          value=${number}
          ${(number === selectedNumber) ? 'selected' : ''}
        >
          ${number}
        </option>`;

    if (number === selectedNumber) selectedValue = true;
  };

  html += `
      </select >
    </div>
    <!-- end inputSelectedNumbers -->
    `;

  return html;
}

// Validate organization number
function validateOrganizationNumberNew(className, organizationNumber) {

  // Validate organization number Organization Number
  const organizationNumberPattern = /^\d{9}$/;
  const isValid = (organizationNumberPattern.test(organizationNumber)) ? true : false;

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate E-mail
function validateEmailNew(className, eMail, style, errorMessage) {

  // Validate eMail
  const eMailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = ((eMailRegex.test(eMail))) ? true : false;

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate phone number 
function validatePhoneNew(className, phone, errorMessage) {

  // Validate phone number
  phone = phone.replace(/\s+/g, "");
  const isValid = /^\d{8,15}$/.test(phone);

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// validate bank account
function validateBankAccountNew(className, showMessage = true, bankAccount, style, errorMessage) {

  const bankAccountPattern = /^\d{11}$/;
  const isValid = bankAccountPattern.test(bankAccount);

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate values ('Yes','No','Ignore')
function validateValuesNew(className, errorMessage, showMessage = true, selectedValue, ...values) {

  let isValid = false;

  values.forEach((value) => {

    if (value === selectedValue) isValid = true;
  });

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// validate the iso date format yyyy-mm-dd
function validateISODate(className, date, showMessage = true, errorMessage) {

  let isValid = true;

  // Check for isValid date String
  if (date === '' || typeof date === 'undefined') isValid = false;
  if (isValid) {

    // Regular expression for valuating the yyyy-mm-dd format
    const regex = /^(\d{4})\-(\d{2})\-(\d{2})$/
    const match = date.match(regex);
    if (!match) isValid = false;

    if (isValid) {

      // Extract day, month, and year
      const [year, month, day] = date.split('-');

      // Check if month is between 1 and 12
      if (day < 1 || day > 31) isValid = false;
      if (month < 1 || month > 12) isValid = false;
      if (year < 1900 || year > 2099) isValid = false;
    }
  }

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate number
function validateIntervalNew(className, style, errorMessage, showMessage = true, number, minNumber, maxNumber) {

  number = Number(number);
  let isValid = (Number(number) >= Number(minNumber) && Number(number) <= Number(maxNumber));

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate text
function validateTextNew(className, style, errorMessage, showMessage = true, value, minLength, maxLength) {

  value = value.trim();

  let isValid = true;

  // Check for string
  if (typeof value !== "string") isValid = false;

  // Check length
  if (!(value.length >= minLength) && (value.length <= maxLength)) isValid = false;

  // Check allowed characters (letters, numbers, spaces)
  //const regex = /^[a-zA-ZæøåÆØÅ0-9.,\-+_%!:#"'\\/ ]*$/
  const regex = /^[a-zA-ZæøåÆØÅ0-9.,+\-_%!:#"'*/\\\s]*$/;
  if (!regex.test(value)) isValid = false;

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Validate number
function validateNumberNew(className, style, errorMessage, showMessage = true, number, minValue, maxValue) {

  let isValid = (Number(number) >= Number(minValue) && Number(number) <= Number(maxValue));

  const inputElement = document.querySelector(`.${className}`);
  if (inputElement) {

    (isValid)
      ? inputElement.style.backgroundColor = "white"
      : inputElement.style.backgroundColor = " #ffe5e5";
  }

  if (!isValid && showMessage && errorMessage.length > 0) showMessageNew(errorMessage);
  return isValid;
}

// Format date from yyyy-mm-dd (ISO format) -> yyyymmdd
function formatISODateToNumber(date) {

  date = String(date);
  (date.includes('-'))
    ? [year, month, day] = date.split('-')
    : [year, month, day] = date.split('.')
  return Number(`${year}${month}${day}`);
}

// Format date from dd.mm.yyyy -> yyyymmdd
function formatNorDateToNumber(date) {

  if (date.includes('-')) [day, month, year] = date.split('-');
  if (date.includes('.')) [day, month, year] = date.split('.');
  return Number(`${year}${month}${day}`);
}

// Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
function formatNumberToISODate(date) {

  date = String(date);
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6,)}`;
}

/*
// Show Date
function showDate(label, className, value, enableChanges) {

  const html = `
  <div 
    class="field field-position"
  >
    <label>
      ${label}
    </label>
    <input 
      type="date" 
      style="height: 52px"
      class="${className} center one-line input"
      ${(typeof value) ? `value="${value}"` : `value="${value.trim()}"`}
      ${(enableChanges) ? '' : 'readonly'}
    >
  </div>`;
  return html;
}
*/

// Start frame
function startFrame(className) {

  return `
  <!-- start startFrame -->
  <div 
    class="${className}"
  >
  <!-- end startFrame -->
  `;
}

// Start frame
function startFilter(label) {

  return `
  <!-- start startFilter -->
  <aside 
    class="card filter-card"
    >
    <h2 
      class="card-title"
    >
      Filter
    </h2>
    <div 
      class="grid grid-voucher"
    >
      <div 
        class="field">
        <label>
          ${label}
        </label>
  <!-- end startFilter -->
  `;
}

function endFilter() {

  return `
    <!-- start endFilter -->
        </div>
      </div>
    </aside>
    <!-- end endFilter -->
  `;
}

function startContent(text) {

  return `
  <!-- start startContent -->
  <section class="card">
    <h2 
      class="card-title"
    >
      ${text}
    </h2>
    <form>
      <div 
        class="grid grid-form"
      >
  <!-- end startContent -->
  `;
}

function endContent() {

  return `
  <!-- start endContent -->
      </div>
    </form>
  </section>
  <!-- end endContent -->
  `;
}

// start line (<div>)
function startLine() {
  return `<div class="line">`;
}

// empty line
function emptyLine() {

  return `<p>&nbsp;</p>`;
}

// Change frame title
function setFrameTitle(className, label) {

  /*
  const frameElement = document.querySelector(`.${className}`);
  frameElement.style.setProperty("--title", `"${label}"`);
  */
}

// Show button
function showButtonNew(className, text) {

  return `
  <button 
    class="${className} filter-btn primary"
    style="width:250px;margin-left: 35px;background-color: #38bdf8"
  >
    ${text}
  </button>`;
}

// Show text
function showTextNew(className, label, value, enableChanges, placeholder = "") {

  value = (typeof value === 'string')
    ? value.trim()
    : value;
  return `
  <div 
    class="field field-position" 
   >
    <input 
      type="text"
      autocomplete="off"
      class="${className} center one-line"
      value="${value}"
      placeholder="${placeholder}"
      ${(enableChanges ? '' : 'readonly')}
    >
    <label>
      ${label.trim()}
    </label>
  </div>`;
}

/*
// Show selected values 
function inputValues(label, className, style, enableChanges, selectedValue, ...values) {

  let selected = false;

  let html = `
    <div 
    class="field field-position" 
    >
      <label>
        ${label}
      </label>
      <select 
        class="${className} center one-line"
        ${(enableChanges) ? '' : 'readonly'}
      >`;

  values.forEach((value) => {

    html += `
      <option 
        value="${(value ?? '').trim()}"
        ${value === selectedValue ? 'selected' : ''}
      >
        ${value}
      </option>`;
    if (value === selectedValue) selected = true;
  });

  html += `
      </select >
    </div>`;

  return html;
}
*/

// Show selected values 
function inputValues(label, className, enableChanges, selectedValue, ...values) {

  let html = `
    <!-- start inputValues -->
    <div 
      class="field"
    >
      <label 
        for="${className}"
      >
        ${label}
      </label>
      <select 
        id="${className}"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

  values.forEach((value) => {

    html += `
    <option 
      value="${(value ?? '').trim()}"
      ${value === selectedValue ? 'selected' : ''}
    >
      ${value.trim()}
    </option>`;
    if (value === selectedValue) selected = true;
  });

  html += `
      </select >
    </div>
    <!-- end inputValues -->
    `;

  return html;
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
  return (amount === '000')
    ? '00'
    : amount;
}

// Format date from yyyymmdd -> dd.mm.yyyy (European date format)
function formatNumberToNorDate(date) {

  date = String(date);
  const formatedDate = date.slice(6, 8) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
  return (formatedDate.includes('..')) ? '' : formatedDate;
}

/*
// Check if class is defined
function isClassDefined(className) {

  const element = document.querySelector(`.${className} `);      // Select the element
  if (element !== null) {
    return (element.classList.contains(`${className} `)) ? true : false;
  } else {
    return false;
  }
}
*/
// Check if class is defined
function isClassDefined(className) {
  for (let sheet of document.styleSheets) {
    try {
      let rules = sheet.cssRules;
      for (let rule of rules) {
        if (rule instanceof CSSStyleRule && rule.selectorText === `.${className}`) {
          return true;
        }
      }
    } catch (e) {

      // Some stylesheets (e.g., cross-origin) may throw errors
      continue;
    }
  }
  return false;
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

    // Valid isValid phone number
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

// Get current date in ISO date format (yyyy-mm-dd)
function getCurrentISODate() {

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
function formatStringToNorAmount(amount) {

  amount = (amount.includes(","))
    ? amount.replace(",", ".")
    : amount;
  amount = (amount.includes("."))
    ? amount.replace(".", ",")
    : amount;
  amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return amount;
}


// Format number (1234567) to norwegian amount (1 2345,67)
function formatNumberToNorAmount(amount) {

  amount = this.removeComma(String(amount));
  amount = String(Number(amount) / 100);
  amount = Number(amount).toFixed(2);
  return formatStringToNorAmount(amount);
}

/*
// Format number (1234567) to norwegian amount (1 2345,67)
function formatNumberToNorAmount(amount) {
 
  amount = this.removeComma(String(amount));
  amount = String(Number(amount) / 100);
  amount = Number(amount).toFixed(2);
  return formatNumberToNorAmount(amount);
}
*/

// Format norwegian kroner (12 345,67) to number (1234567)
function formatNorAmountToNumber(amount) {

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

/*
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
*/

/*
// Format norwegian date (11.05.1983) to number (19830511)
function formatDateToNumber(norDate) {
 
  return norDate.substring(6,) + norDate.substring(3, 5) + norDate.substring(0, 2);
}
*/

// Generate password
function generatePassword(passwordLength, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {

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


  if (Number(passwordLength) < 1) {

    return "Oppgi lengden på passordet.";
  }

  if (Number(allowedChars.length) < 1) {

    return "Oppgi minimum et sett av karakterer";
  }

  for (let i = 0; i < Number(passwordLength); i++) {

    const randomIndex = Math.floor(Math.random() * Number(allowedChars.length));
    password += allowedChars[randomIndex];
  }
  return password;
}

// Removes the iframe
function removeIframe() {
  const iframe = document.getElementById("div-condo-login");
  if (iframe) {
    iframe.remove();
  }
}

// Enable/ disable button
function disableButton(className, disabled = false, color = '#38bdf8') {
  document.querySelector(`.${className}`).disabled = disabled;
  const button = document.querySelector(`.${className}`);
  color = button.style.backgroundColor = (disabled) ? 'lightgrey' : color;
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

/*
// Table handling
function startTable(year, month, text) {

  const monthName = findNameOfMonth(month);
  return `
  <!-- start startTable -->
  <main class="waste-page">
    <section
      class="waste-card"
      aria-labelledby="waste-title"
    >

      <header
        class="waste-heading"
      >
        <h1
          id="waste-title"
        >
          ${text}
        </h1>
        <p>
          ${monthName} ${year}
        </p>
      </header>

      <div
        class="waste-scroll"
        role="region"
        aria-label="${text} for ${monthName} ${year}"
        tabindex="0"
      >
        <table class="transaction-table">
    <!-- end startTable -->
  `;
}
*/

// start table
function startTable(header, underHeader) {

  return `
  <!-- start startTable -->
  <main class="waste-page">
    <section
      class="waste-card"
      aria-labelledby="waste-title"
    >

      <header
        class="waste-heading"
      >
        <h1
          id="waste-title"
        >
          ${header}
        </h1>
        <p>
          ${underHeader}
        </p>
      </header>

      <div
        class="waste-scroll"
        role="region"
        aria-label="${underHeader}"
        tabindex="0"
      >
        <table class="transaction-table">
    <!-- end startTable -->
  `;
}

function tableHeader(columnWidths, ...texts) {

  // Calculate total table width
  let tableWidth = 0;
  columnWidths.forEach((columnWidth) => {
    tableWidth += (columnWidth + 10);
  });

  let html = `
    <!-- start tableHeader -->
    <colgroup>
  `;

  // Colomn widths
  columnWidths.forEach((columnWidth) => {
    html += `<col style="width: ${columnWidth}px;">`;
  });

  html += '</colgroup>';

  html += `
      <thead>
    <tr>
  `;

  texts.forEach((text) => {

    html += `
      <th 
        scope="col"
      >
        ${text.trim()}
      </th>
      `;
  });

  html += `
         </tr>
      </thead>
    <!-- end tableHeader -->
  `;

  return html;
}


// Show horizontal filter
function startHorizontalFilter() {

  let html = `
    <!-- start startTableFilter -->
    <section 
      class="card"
    >
      <h2 
        class="card-title"
      >
        Filter
      </h2>
      <div 
        class="grid grid-menu"
      >
      <!-- end startTableFilter -->
      `;
  return html;
}


// Show horizontal filter
function endHorizontalFilter() {

  let html = `
    <!-- end showTableFilter -->
      </div>
    </section>
    <!-- end showTableFilter -->
    `;

  return html;
}