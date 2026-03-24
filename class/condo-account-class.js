// class for account
class Account extends Condos {

  // accounts information
  arrayAccounts;

  // Get selected account id
  getSelectedAccountId(className) {

    let accountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      accountId = Number(document.querySelector(`.${className}`).value);
      accountId = (accountId === 0) ? this.arrayAccounts.at(-1).accountId : accountId;
    } else {

      // Get last id in last object in account array
      accountId = this.arrayAccounts.at(-1).accountId;
    }

    return accountId;
  }

  // Select account
  selectAccountId(accountId, className) {

    // Check if account id exist
    const rowNumberAccount = this.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayAccounts[rowNumberAccount].accountId;
      return true;
    } else {

      return false;
    }
  }

  // Select account Id
  selectAccountIdNew(accountId) {

    // Check if account id exist
    const rowNumberAccount = this.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) accountId = this.arrayAccounts[rowNumberAccount].accountId;

    return accountId;
  }

  // get account id from bank account and suppliers
  getAccountIdFromBankAccount(bankAccountNumber, payment, text) {

    let accountId = 0;

    // Bank Account <> Condominium Bank Account
    let rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber);
    if (rowNumberBankAccount !== -1) {

      //accountId = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].accountId;
    }

    // Check user bank account
    const rowNumberUserBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.bankAccount === bankAccountNumber);
    if (rowNumberUserBankAccount !== -1) {

      accountId = objUserBankAccounts.arrayUserBankAccounts[rowNumberUserBankAccount].accountId;
    }

    let rowNumberSupplier;
    // get Account Id from supplier amount
    rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.bankAccount === bankAccountNumber);
    if (rowNumberSupplier !== -1) {

      accountId = objSuppliers.arraySuppliers[rowNumberSupplier].accountId;

      // get Account Id from supplier amount
      const amount = (objSuppliers.arraySuppliers[rowNumberSupplier].amount) ? Number(objSuppliers.arraySuppliers[rowNumberSupplier].amount) : 0;

      accountId = (amount === Number(payment)) ? Number(objSuppliers.arraySuppliers[rowNumberSupplier].amountAccountId) : accountId;
    }

    // get Account Id from supplier text
    if (accountId === 0) {

      objSuppliers.arraySuppliers.forEach((supplier) => {

        if (supplier.text === text) {

          accountId = supplier.textAccountId;
        }
      });
    }

    return accountId;
  }

  // get account name
  getAccountName(accountId) {

    let accountName = "-";

    // Account name from account table
    const rowNumberAccount = this.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      accountName = objAccounts.arrayAccounts[rowNumberAccount].name;
    }

    return accountName;
  }

  // Get account name
  getAccountName(accountId) {

    accountId = Number(accountId);
    let accountName = '';
    const rowNumberAccount = this.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      accountName = this.arrayAccounts[rowNumberAccount].name;
    }
    return accountName;
  }

  showSelectedAccounts(className, style, accountId, selectNone, selectAll, disabled = false) {

    let selectedValue = false;

    let html = `
    <td
      class="centerCell one-line center"
    >
      <select 
        class="${className} center"
        ${(disabled) ? 'disabled' : ''}
        ${(style) ? `style=${style}` : 'style=width:175px;'}
      >`;

    const numberOfRows = this.arrayAccounts.length;

    // Check if accounts array is empty
    if (numberOfRows > 0) {
      this.arrayAccounts.forEach((account) => {

        html += `
          <option 
            value=${account.accountId}
            ${(account.accountId === accountId) ? 'selected' : ''}
          >
            ${account.name}
          </option>`;
        if (account.accountId === accountId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen konti
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayAccounts.length > 1)) {

      html += `
      <option 
        value=${this.nineNine}
        selected
      >
        ${selectAll}
      </option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayAccounts.length > 1)) {
      html += `
        <option 
          value=0
          ${(selectedValue) ? selectNone : ''}
        >
          ${selectNone}
        </option>`;
      selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }

  // get accounts from accounts table
  async loadAccountsTable(condominiumId, fixedCost) {

    const URL = (this.serverStatus === 1) ? '/api/accounts' : 'http://localhost:3000/accounts';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/accounts?action=select&condominiumId=${condominiumId}&fixedCost=${fixedCost}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId,
          fixedCost: fixedCost
        })
      });

      if (!response.ok) throw new Error("Network error (users)");
      this.arrayAccounts = await response.json();
    } catch (error) {
      console.log("Error loading accounts:", error);
    }
  }

  // update account row
  async updateAccountsTable(user, accountId, fixedCost, accountName) {

    const URL = (this.serverStatus === 1) ? '/api/accounts' : 'http://localhost:3000/accounts';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/accounts?action=update&user=${user}&accountId=${accountId}&fixedCost=${fixedCost}&accountName=${accountName}`);

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          accountId: accountId,
          fixedCost: fixedCost,
          accountName: accountName
        })
      });
      if (!response.ok) throw new Error("Network error (accounts)");
      this.arrayAccounts = await response.json();
    } catch (error) {
      console.log("Error updating accounts:", error);
    }
  }

  // insert account row
  async insertAccountsTable(condominiumId, user, accountName, fixedCost) {

    const URL = (this.serverStatus === 1) ? '/api/accounts' : 'http://localhost:3000/accounts';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/accounts?action=insert&condominiumId=${condominiumId}&user=${user}&accountName=${accountName}&fixedCost=${fixedCost}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          accountName: accountName,
          fixedCost: fixedCost
        })
      });

      if (!response.ok) throw new Error("Network error (accounts)");
      this.arrayAccounts = await response.json();
    } catch (error) {
      console.log("Error insert accounts:", error);
    }
  }

  // delete account row
  async deleteAccountsTable(accountId, user) {

    const URL = (this.serverStatus === 1) ? '/api/accounts' : 'http://localhost:3000/accounts';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/accounts?action=delete&accountId=${accountId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          accountId: accountId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (accounts)");
      this.arrayAccounts = await response.json();
    } catch (error) {
      console.log("Error delete accounts:", error);
    }
  }


}