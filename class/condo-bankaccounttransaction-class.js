class BankAccountTransaction extends Condos {

  // Bank account transactions information
  arrayBankAccountTransactions;

  /*
  // Show all selected bank account transactions
  showSelectedAccountTransactionsounts(columnName, bankAccountTransactionId) {

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

    let rowNumber = 0;

    // Check if Bank account transactions array is empty
    const numberOfRows = this.arrayBankAccountTransactions.length;
    if (numberOfRows > 0) {
      this.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

        rowNumber++;
        if (bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId) {

          html +=
            `
              <option 
                value="${bankAccountTransaction.bankAccountTransactionId}"
                selected
              >
                ${rowNumber} - ${bankAccountTransaction.text}
              </option>
            `;
        } else {

          html +=
            `
              <option 
                value="${bankAccountTransaction.bankAccountTransactionId}">
                ${rowNumber} - ${bankAccountTransaction.text}
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

  // Find selected Bank account transactions id
  getSelectedBankAccountTransactions(columnName) {

    let bankAccountTransactionId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      bankAccountTransactionId =
        Number(document.querySelector(`.${className}`).value);
    } else {

      // Get last id in last object in Bank account transactions array
      bankAccountTransactionId = this.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;
    }

    return bankAccountTransactionId;
  }
  */

  // Show all bank account transactions
  showSelectedBankAccountTransactions(className, bankAccountTransactionId, alternativeSelect) {

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

    let rowNumber = 0;

    let selectedOption = false;

    // Check if Bank account transactions array is empty
    const numberOfRows = this.arrayBankAccountTransactions.length;
    if (numberOfRows > 0) {
      this.arrayBankAccountTransactions.forEach((bankaccounttransaction) => {

        rowNumber++;
        if (bankaccounttransaction.bankAccountTransactionId === bankAccountTransactionId) {

          html +=
            `
                <option 
                  value=${bankaccounttransaction.bankAccountTransactionId}
                  selected
                >
                  ${rowNumber} - ${bankaccounttransaction.text} 
                </option>
              `;
          selectedOption = true;
        } else {

          html +=
            `
              <option 
                value="${bankaccounttransaction.bankAccountTransactionId}">
                ${rowNumber} - ${bankaccounttransaction.text} 
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
            value=${this.nineNine}
          >
            ${alternativeSelect}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=${this.nineNine}
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
      if (this.arrayBankAccountTransactions.length > 0) {
        bankAccountTransactionId = (bankAccountTransactionId === 0) ? this.arrayBankAccountTransactions[0].bankAccountTransactionId : bankAccountTransactionId;
      }
    } else {

      // Get first id in bank Account Movement array
      if (this.arrayBankAccountTransactions.length > 0) {
        bankAccountTransactionId = this.arrayBankAccountTransactions[0].bankAccountTransactionId;
      }
    }

    return bankAccountTransactionId;
  }

  // get bank account transactions
  async loadBankAccountTransactionsTable(orderBy,condominiumId,deleted,condoId,accountId,amount,fromDate,toDate) {

    try {

      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=select&orderBy=${orderBy}&condominiumId=${condominiumId}&deleted=${deleted}&condoId=${condoId}&accountId=${accountId}&amount=${amount}&fromDate=${fromDate}&toDate=${toDate}`);

      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error loading Bank account transactions:", error);
    }
  }

  // update Bank account transactions row
  async updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=update&bankAccountTransactionId=${bankAccountTransactionId}&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&kilowattHour=${kilowattHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (Bank account transactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error updating Bank account transactions:", error);
    }
  }

  // insert Bank account transactions row
  async insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=insert&bankAccountTransactionId=${bankAccountTransactionId}&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&kilowattHour=${kilowattHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error inserting Bank account transactions:", error);
    }
  }

  // delete Bank account transactions row
  async deleteBankAccountTransactionsTable(bankAccountTransactionId, user) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounttransactions?action=delete&bankAccountTransactionId=${bankAccountTransactionId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error deleting Bank account transactions:", error);
    }
  }
}

