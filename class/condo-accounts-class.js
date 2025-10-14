// class for account
class Accounts extends Condos {

  // accounts information
  accountsArray;

  // Show all selected accounts
  showSelectedAccounts(className, accountId, alternativeSelect, alternativeSelect2) {

    let selectedOption = false;

    let html =
      `
        <form 
          id="accountId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="accountId"
            id="accountId"
          >
            Velg konto
          </label>
          <select 
            class="select-${className}" 
            id="accountId"
            name="accountId"
          >
      `;

    // Check if account movement array is empty
    const numberOfRows = this.accountsArray.length;
    if (numberOfRows > 0) {
      this.accountsArray.forEach((account) => {
        if (account.accountId === accountId) {

          html +=
            `
              <option 
                value=${account.accountId}
                selected
              >
                ${account.accountId} - ${account.name}
              </option>
            `;
          selectedOption = true;
        } else {

          html +=
            `
              <option 
                value="${account.accountId}">
                ${account.accountId} - ${account.name}
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
            Ingen konti
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
        selectedOption = true;
      }
    }

    // Alternative select
    if (alternativeSelect2 && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
          <option 
            value=0
          >
            ${alternativeSelect2}
          </option>
        `;
      } else {

        html +=
          `
          <option 
            value=0
            selected
          >
            ${alternativeSelect2}
          </option>
        `;
        selectedOption = true;
      }
    }

    html +=
      `
          </select >
        </form>
      `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Get selected account id
  getSelectedAccountId(className) {

    let accountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      accountId = Number(document.querySelector(`.${className}`).value);
      accountId = (accountId === 0) ? this.accountsArray.at(-1).accountId : accountId;
    } else {

      // Get last id in last object in account array
      accountId = this.accountsArray.at(-1).accountId;
    }

    return accountId;
  }


  // Show all accounts
  showSelectedAccountsHTML(className, accountId, selectAll) {

    accountId = Number(accountId);

    let html =
      `
        <div>
          <label 
          >
            Velg Konto
          </label>
          <select
            class="${className}"
          > 
      `;

    // Check if account array is empty
    const numberOfRows = this.accountsArray.length;
    if (numberOfRows > 0) {
      this.accountsArray.forEach((account) => {

        if (account.accountId === accountId) {
          html +=
            `
              <option
                value = "${account.accountId}"
                selected
              >
                ${account.accountId} - ${account.name}
              </option >
            `;

        } else {

          html +=
            `
            <option
              value = "${account.accountId}"
            >
              ${account.accountId} - ${account.name}
            </option >
          `;
        }
      });

    } else {

      html +=
        `
          <option 
            value = "0"
            selected
          >
            Ingen leiligheter
          </option >
        `;
    }

    // Select all
    if (selectAll) {

      html +=
        `
        <option 
          value=999999999
          selected
        >
          ${selectAll}
        </option>
      `;
    }

    html +=
      `
        </select >
      </div>
    `;

    return html;
  }

  // Select account
  selectAccountId(accountId, className) {

    // Check if account id exist
    const objAccountNumber = this.accountsArray.findIndex(account => account.accountId === accountId);
    if (objAccountNumber !== -1) {

      document.querySelector(`.select-${className}`).value = this.accountsArray[objAccountNumber].accountId;
      return true;
    } else {

      return false;
    }
  }

  // get account id from bank account
  getAccountIdFromBankAccount(bankAccount, payment) {

    let accountId = 0;

    // Bank Acoount <> Condominium Bank Account
    let bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccount);
    if (bankAccountRowNumber === -1) {

      // Check user bank account
      const bankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccount);
      if (bankAccountRowNumber !== -1) {

        accountId = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].accountId;
      }

      // get Account Id from supplier
      const supplierRowNumber = objSuppliers.arraySuppliers.findIndex(supplier => supplier.bankAccount === bankAccount);
      if (supplierRowNumber !== -1) {

        accountId = objSuppliers.arraySuppliers[supplierRowNumber].accountId;

        // get Account Id from supplier amount
        const amount = (objSuppliers.arraySuppliers[supplierRowNumber].amount) ? Number(objSuppliers.arraySuppliers[supplierRowNumber].amount) : 0;

        accountId = (amount === Number(payment)) ? Number(objSuppliers.arraySuppliers[supplierRowNumber].amountAccountId) : accountId;
      }
    }
    return accountId;
  }

  // get account name
  getAccountName(accountId) {

    let accountName = "-";

    // Account name from account table
    const accountRowNumberObj = objAccounts.accountsArray.findIndex(account => account.accountId === accountId);
    if (accountRowNumberObj !== -1) {

      accountName = objAccounts.accountsArray[accountRowNumberObj].name;
    }

    return (accountName) ? accountName : "-";
  }

  // get accounts
  async loadAccountsTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/accounts?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error loading users:", error);
    }
  }

  // update account row
  async updateAccountsTable(user, accountId, fixedCost, lastUpdate, accountName) {

    try {
      const response = await fetch(`http://localhost:3000/accounts?action=update&user=${user}&accountId=${accountId}&fixedCost=${fixedCost}&lastUpdate=${lastUpdate}&accountName=${accountName}`);
      if (!response.ok) throw new Error("Network error (accounts)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error updating accounts:", error);
    }
  }

  // insert account row
  async insertAccountsTable(condominiumId, user, lastUpdate, accountName, fixedCost) {

    try {
      const response = await fetch(`http://localhost:3000/accounts?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&accountName=${accountName}&fixedCost=${fixedCost}`);
      if (!response.ok) throw new Error("Network error (accounts)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error insert accounts:", error);
    }
  }

  // delete account row
  async deleteAccountsTable(accountId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/accounts?action=delete&accountId=${accountId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (accounts)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error delete accounts:", error);
    }
  }


}