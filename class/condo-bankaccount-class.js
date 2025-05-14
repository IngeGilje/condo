// class for bankaccount
class BankAccount extends Condos {

  // bankaccount information
  bankAccountArray = Array;

  // Show all bankaccounts
  showAllBankAccounts(columnName, bankAccountId) {

    let html = `
      <form action="/submit" method="POST">
        <label class="label-bankaccount-${columnName} label-bankaccount-${columnName}"
          for="bankAccountId">
            Velg bankkonto
        </label>
        <select class="select-bankaccount-${columnName} select-bankaccount-${columnName}" 
          id="bankAccountId" name="bankAccountId"
        >
    `;

    // Check if bank account array is empty
    const numberOfRows = bankAccountArray.length;
    if (numberOfRows > 1) {
      bankAccountArray.forEach((bankaccount) => {
        if (bankaccount.bankAccountId > 1) {
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
        Ingen bankkontoer
      </option>
    `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-bankaccount-${columnName}`).innerHTML =
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

