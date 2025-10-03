// class for bankaccount
class BankAccounts extends Condos {

  // bankaccount information
  bankAccountsArray = [];

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
    const numberOfRows = this.bankAccountsArray.length;
    if (numberOfRows > 0) {
      this.bankAccountsArray.forEach((bankaccount) => {
        if (bankaccount.bankAccountId >= 0) {
          if (bankaccount.bankAccountId === bankAccountId) {

            html +=
              `
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

      html +=
        `
          <option value="0" 
            selected
          >
            Ingen bankkonti
          </option>
        `;
    }

    html +=
      `
          </select >
        </form>
      `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected bankaccount id
  getSelectedBankAccountId(className) {

    let bankAccountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      bankAccountId =
        Number(document.querySelector(`.${className}`).value);
      bankAccountId = (bankAccountId === 0) ? this.bankAccountsArray.at(-1).bankAccountId : bankAccountId;
    } else {

      // Get last id in last object in bankaccount array
      bankAccountId = (this.bankAccountsArray.length > 0) ? this.bankAccountsArray.at(-1).bankAccountId : 0;
    }

    return bankAccountId;
  }
  
  // Show bank accounts with alternative select options
  async loadBankAccountsTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounts?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (bank accounts)");
      this.bankAccountsArray = await response.json();
    } catch (error) {
      console.log("Error loading bank accounts:", error);
    }
  }
  // update bank accounts row
  async updateBankAccountsTable(bankAccountId,condominium,user,lastUpdate,bankAccount,name,openingBalance,openingBalanceDate,closingBalance,closingBalanceDate) {

    try {
      const response = await fetch(`http://localhost:3000/bankaccounts?action=update&bankAccountId=${bankAccountId}&condominium=${condominium}&user=${user}&lastUpdate=${lastUpdate}&bankAccount=${bankAccount}&name=${name}&openingBalance=${openingBalance}&openingBalancedate=${openingBalanceDate}&closingBalance=${closingBalance}&closingBalanceDate=${closingBalanceDate}`);
      if (!response.ok) throw new Error("Network error (bank account)");
      this.bankAccountsArray = await response.json();
    } catch (error) {
      console.log("Error updating bank account:", error);
    }
  }
}

