// class for bankaccount
class BankAccount extends Condos {

  // bankaccount information
  bankAccountArray = [];

  // Show bankaccounts
  showAllBankAccounts(className, bankAccountId) {

    let html = `
      <form
        id="bankAccountId"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${className}"
          for="bankAccountId"
          id="bankAccountId"
        >
          Velg bankkonto
        </label>
        <select 
          class="select-${className}" 
          name="bankAccountId"
          id="bankAccountId"
        >
    `;

    // Check if bank account array is empty
    const numberOfRows = bankAccountArray.length;
    if (numberOfRows > 0) {
      bankAccountArray.forEach((bankaccount) => {
        if (bankaccount.bankAccountId >= 0) {
          if (bankaccount.bankAccountId === bankAccountId) {

            html += `
            <option 
              value="${bankaccount.bankAccountId}"
              selected
              >
              ${bankaccount.bankAccountId} - ${bankaccount.name}
            </option>
          `;
          } else {
            html += `
            <option 
              value="${bankaccount.bankAccountId}">
              ${bankaccount.bankAccountId} - ${bankaccount.name}
            </option>
          `;
          }
        }
      });

    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen bankkonti
      </option>
    `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Find selected bankaccount id
  getSelectedBankAccountId(columnName) {

    let bankAccountId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      bankAccountId =
        Number(document.querySelector(`.${className}`).value);
      bankAccountId = (bankAccountId === 0) ? bankAccountArray.at(-1).bankAccountId : bankAccountId;
    } else {

      // Get last id in last object in bankaccount array
      bankAccountId = bankAccountArray.at(-1).bankAccountId;
    }

    return bankAccountId;
  }
}

