class BankAccountTransactions extends Condos {

  // bank account movement information
  bankAccountTranactionsArray;

  // Show all selected bank account movements
  showAllSelectedAccountTransactions(columnName, bankAccountTransactionId) {

    let html = `
      <form 
        id="bankaccounttransactions"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${columnName}"
          for="bankaccounttransactions"
          id="bankaccounttransactions"
        >
            Velg kontobevegelse
        </label>
        <select 
          class="select-${columnName}" 
        >
    `;

    let lineNumber = 0;

    // Check if bank account movement array is empty
    const numberOfRows = this.bankAccountTranactionsArray.length;
    if (numberOfRows > 0) {
      this.bankAccountTranactionsArray.forEach((bankAccountTransaction) => {

        lineNumber++;
        if (bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId) {

          html +=
            `
              <option 
                value="${bankAccountTransaction.bankAccountTransactionId}"
                selected
              >
                ${lineNumber} - ${bankAccountTransaction.bankAccountTransactionId}
              </option>
            `;
        } else {

          html +=
            `
              <option 
                value="${bankAccountTransaction.bankAccountTransactionId}">
                ${lineNumber} - ${bankAccountTransaction.bankAccountTransactionId}
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
            Ingen banktransaksjoner
          </option>
        `;
    }

    html +=
      `
          </select >
        </form>
      `;

    document.querySelector(`.div-${columnName}`).innerHTML = html;
  }

  // Find selected bank account movement id
  getSelectedBankAccountTransactions(columnName) {

    let bankAccountTransactionId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      bankAccountTransactionId =
        Number(document.querySelector(`.${className}`).value);
    } else {

      // Get last id in last object in bank account movement array
      bankAccountTransactionId = this.bankAccountTranactionsArray.at(-1).bankAccountTransactionId;
    }

    return bankAccountTransactionId;
  }

  // Show all bank account movements
  showAllBankAccountTransactions(className, bankAccountTransactionId, alternativeSelect) {

    document.querySelector(`.div-${className}`).innerHTML = "";
    let html =
      `
        <form 
          id="bankAccountTransactionId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="bankAccountTransactionId"
            id="bankAccountTransactionId"
          >
            Velg kontobevegelse
          </label>
          <select 
            class="select-${className}" 
            id="bankAccountTransactionId"
            name="bankAccountTransactionId"
          >
      `;

    let lineNumber = 0;

    let selectedOption = false;

    // Check if bank account movement array is empty
    const numberOfRows = this.bankAccountTranactionsArray.length;
    if (numberOfRows > 0) {
      this.bankAccountTranactionsArray.forEach((bankaccounttransaction) => {

        lineNumber++;
        if (bankaccounttransaction.bankAccountTransactionId === bankAccountTransactionId) {

          html +=
            `
                <option 
                  value=${bankaccounttransaction.bankAccountTransactionId}
                  selected
                >
                  ${lineNumber} - ${bankaccounttransaction.bankAccountTransactionId} 
                </option>
              `;
          selectedOption = true;
        } else {

          html +=
            `
              <option 
                value="${bankaccounttransaction.bankAccountTransactionId}">
                ${lineNumber} - ${bankaccounttransaction.bankAccountTransactionId} 
              </option>
            `;
        }
      });
    } else {

      html +=
        `
          <option 
            value="0" 
            selected
          >
            Ingen banktransaksjoner
          </option>
        `;
      selectedOption = true;
    }

    // Alternative select
    if (alternativeSelect && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
          <option 
            value=999999999
          >
            ${alternativeSelect}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=999999999
              selected
            >
              ${alternativeSelect}
            </option>
          `;
      }
    }

    html +=
      `
          </select >
        </form>
      `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected Bank Account Movement Id
  getSelectedBankAccountTransactionId(className) {

    let bankAccountTransactionId = 0;

    // Check if class exist
    if (isClassDefined(className)) {

      bankAccountTransactionId = Number(document.querySelector(`.${className}`).value);
      if (this.bankAccountTranactionsArray.length > 0) {
        bankAccountTransactionId = (bankAccountTransactionId === 0) ? this.bankAccountTranactionsArray[0].bankAccountTransactionId : bankAccountTransactionId;
      }
    } else {

      // Get first id in bank Account Movement array
      if (this.bankAccountTranactionsArray.length > 0) {
        bankAccountTransactionId = this.bankAccountTranactionsArray[0].bankAccountTransactionId;
      }
    }

    return bankAccountTransactionId;
  }

  // get bank account movements
  async loadBankAccountTransactionsTable(condominiumId,condoId,accountId,amount,fromDate,toDate) {

    try {

      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=select&condominiumId=${condominiumId}&condoId=${condoId}&accountId=${accountId}&amount=${amount}&fromDate=${fromDate}&toDate=${toDate}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.bankAccountTranactionsArray = await response.json();
    } catch (error) {
      console.log("Error loading bank account movement:", error);
    }
  }

  // update bank account movement row
  async updateBankAccountTransactionsTable(bankAccountTransactionId, condominium, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=update&bankAccountTransactionId=${bankAccountTransactionId}&condominium=${condominium}&user=${user}&lastUpdate=${lastUpdate}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&numberKWHour=${numberKWHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (bank account movement)");
      this.bankAccountTranactionsArray = await response.json();
    } catch (error) {
      console.log("Error updating bank account movement:", error);
    }
  }

  // insert bank account movement row
  async insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=insert&bankAccountTransactionId=${bankAccountTransactionId}&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&numberKWHour=${numberKWHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.bankAccountTranactionsArray = await response.json();
    } catch (error) {
      console.log("Error inserting bank account movement:", error);
    }
  }

  // delete bank account movement row
  async deleteBankAccountTransactionsTable(bankAccountTransactionId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=delete&bankAccountTransactionId=${bankAccountTransactionId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.bankAccountTranactionsArray = await response.json();
    } catch (error) {
      console.log("Error deleting bank account movement:", error);
    }
  }
}

