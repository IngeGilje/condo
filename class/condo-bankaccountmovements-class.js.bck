class BankAccountMovements extends Condos {

  // bank account movement information
  bankAccountMovementsArray;

  // Show all selected bank account movements
  showAllSelectedAccountMovements(columnName, bankAccountMovementId) {

    let html = `
      <form 
        id="bankaccountmovement"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${columnName}"
          for="bankaccountmovement"
          id="bankaccountmovement"
        >
            Velg kontobevegelse
        </label>
        <select 
          class="select-${columnName}" 
        >
    `;

    let lineNumber = 0;

    // Check if bank account movement array is empty
    const numberOfRows = this.bankAccountMovementsArray.length;
    if (numberOfRows > 0) {
      this.bankAccountMovementsArray.forEach((bankAccountMovement) => {

        lineNumber++;
        if (bankAccountMovement.bankAccountMovementId === bankAccountMovementId) {

          html +=
            `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}"
                selected
              >
                ${lineNumber} - ${bankAccountMovement.bankAccountMovementId}
              </option>
            `;
        } else {

          html +=
            `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}">
                ${lineNumber} - ${bankAccountMovement.bankAccountMovementId}
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
  getSelectedBankAccountMovements(columnName) {

    let bankAccountMovementId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      bankAccountMovementId =
        Number(document.querySelector(`.${className}`).value);
    } else {

      // Get last id in last object in bank account movement array
      bankAccountMovementId = this.bankAccountMovementsArray.at(-1).bankAccountMovementId;
    }

    return bankAccountMovementId;
  }

  // Show all bank account movements
  showAllBankAccountMovements(className, bankAccountMovementId, alternativeSelect) {

    document.querySelector(`.div-${className}`).innerHTML = "";
    let html =
      `
        <form 
          id="bankAccountMovementId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="bankAccountMovementId"
            id="bankAccountMovementId"
          >
            Velg kontobevegelse
          </label>
          <select 
            class="select-${className}" 
            id="bankAccountMovementId"
            name="bankAccountMovementId"
          >
      `;

    let lineNumber = 0;

    let selectedOption = false;

    // Check if bank account movement array is empty
    const numberOfRows = this.bankAccountMovementsArray.length;
    if (numberOfRows > 0) {
      this.bankAccountMovementsArray.forEach((bankaccountmovement) => {

        lineNumber++;
        if (bankaccountmovement.bankAccountMovementId === bankAccountMovementId) {

          html +=
            `
                <option 
                  value=${bankaccountmovement.bankAccountMovementId}
                  selected
                >
                  ${lineNumber} - ${bankaccountmovement.bankAccountMovementId} 
                </option>
              `;
          selectedOption = true;
        } else {

          html +=
            `
              <option 
                value="${bankaccountmovement.bankAccountMovementId}">
                ${lineNumber} - ${bankaccountmovement.bankAccountMovementId} 
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
  getSelectedBankAccountMovementId(className) {

    let bankAccountMovementId = 0;

    // Check if class exist
    if (isClassDefined(className)) {

      bankAccountMovementId = Number(document.querySelector(`.${className}`).value);
      if (this.bankAccountMovementsArray.length > 0) {
        bankAccountMovementId = (bankAccountMovementId === 0) ? this.bankAccountMovementsArray[0].bankAccountMovementId : bankAccountMovementId;
      }
    } else {

      // Get first id in bank Account Movement array
      if (this.bankAccountMovementsArray.length > 0) {
        bankAccountMovementId = this.bankAccountMovementsArray[0].bankAccountMovementId;
      }
    }

    return bankAccountMovementId;
  }

  // get bank account movements
  async loadBankAccountMovementsTable(condominiumId,condoId,accountId,amount,fromDate,toDate) {

    try {

      const response = await fetch(`http://localhost:3000/bankaccountmovements?action=select&condominiumId=${condominiumId}&condoId=${condoId}&accountId=${accountId}&amount=${amount}&fromDate=${fromDate}&toDate=${toDate}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.bankAccountMovementsArray = await response.json();
    } catch (error) {
      console.log("Error loading bank account movement:", error);
    }
  }

  // update bank account movement row
  async updateBankAccountMovementsTable(bankAccountMovementId, condominium, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccountmovements?action=update&bankAccountMovementId=${bankAccountMovementId}&condominium=${condominium}&user=${user}&lastUpdate=${lastUpdate}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&numberKWHour=${numberKWHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (bank account movement)");
      this.bankAccountMovementsArray = await response.json();
    } catch (error) {
      console.log("Error updating bank account movement:", error);
    }
  }

  // insert bank account movement row
  async insertBankAccountMovementsTable(bankAccountMovementId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccountmovements?action=insert&bankAccountMovementId=${bankAccountMovementId}&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&numberKWHour=${numberKWHour}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (bankaccountmovements)");
      this.bankAccountMovementsArray = await response.json();
    } catch (error) {
      console.log("Error inserting bank account movement:", error);
    }
  }

  // delete bank account movement row
  async deleteBankAccountMovementsTable(bankAccountMovementId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccountmovements?action=delete&bankAccountMovementId=${bankAccountMovementId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (bankaccountmovements)");
      this.bankAccountMovementsArray = await response.json();
    } catch (error) {
      console.log("Error deleting bank account movement:", error);
    }
  }
}

