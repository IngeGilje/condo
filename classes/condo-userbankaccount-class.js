// class for user Bank Accounts
class UserBankAccount extends Condos {

  // user bank account information
  arrayUserBankAccounts = [];

  // Show selected user bank accounts
  showSelectedUserBankAccountsNew(label, className, style, userBankAccountId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <div class="field" style="width:250px;margin-left:35px;margin-bottom:25px;">
    <label>
      ${label}
    </label>
    <select 
      class="${className} center one-line"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if user bank accounts array is empty
    if (this.arrayUserBankAccounts.length > 0) {
      this.arrayUserBankAccounts.forEach((userBankAccount) => {

        const userName = objUser.getUserNameById(userBankAccount.userId);
        const accountName = objAccounts.getAccountNameById(userBankAccount.accountId);
        html += `
        <option 
          class="left"
          value=${userBankAccount.userBankAccountId}
          ${(userBankAccount.userBankAccountId === userBankAccountId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${userName.trim()} - ${accountName.trim()}&nbsp;&nbsp;
        </option>`;

        if (userBankAccount.userBankAccountId === userBankAccountId) selectedValue = true;
      });
    } else {

      // No user bank accounts
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;Ingen brukerkontoer&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayUserBankAccounts.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;${selectAll}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayUserBankAccounts.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        &nbsp;&nbsp;${selectNone}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
      <label>
        ${label}
      </label>
    </div>`;

    return html;
  }

  // get user bank accounts
  async loadUserBankAccountsTable(condominiumId, userId, accountId) {

    const URL = (this.serverStatus === 1)
      ? '/api/userbankaccounts'
      : 'http://localhost:3000/userbankaccounts';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId,
          userId: userId,
          accountId: accountId
        })
      });
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error loading user bank account:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestBankAccountId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/accounts'
      : 'http://localhost:3000/accounts';
    try {

       const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestBankAccountId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (bank accounts)");
      this.arrayAccounts = await response.json();
    } catch (error) {
      console.log("Error selecting bank accounts:", error);
    }
  }

  // update user bank account row
  async updateProjectsTable(userBankAccountId, condominiumId, user, userId, accountId, bankAccount) {

    const URL = (this.serverStatus === 1)
      ? '/api/userbankaccounts'
      : 'http://localhost:3000/userbankaccounts';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          userBankAccountId: userBankAccountId,
          condominiumId: condominiumId,
          user: user,
          userId: userId,
          accountId: accountId,
          bankAccount: bankAccount
        })
      });
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error updating user bank accounts:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestUserBankAccountId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/userbankaccounts'
      : 'http://localhost:3000/userbankaccounts';
    try {

       const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestUserBankAccountId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error selecting user bank accounts:", error);
    }
  }

  // insert user bank account row
  async insertUserBankAccountsTable(condominiumId, user, userId, accountId, bankAccount) {

    const URL = (this.serverStatus === 1) ? '/api/userbankaccounts' : 'http://localhost:3000/userbankaccounts';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          userId: userId,
          accountId: accountId,
          name: name,
          bankAccount: bankAccount
        })
      });
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error inserting user bank accounts:", error);
    }
  }

  // delete user bank account row
  async deleteUserBankAccountsTable(userBankAccountId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/userbankaccounts'
      : 'http://localhost:3000/userbankaccounts';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          userBankAccountId: userBankAccountId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error deleting user bank accounts:", error);
    }
  }
}