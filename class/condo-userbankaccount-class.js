// class for user Bank Accounts
class UserBankAccount extends Condos {

  // user bank account information
  arrayUserBankAccounts;

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

  // update user bank account row
  async updateUserBankAccountsTable(userBankAccountId, condominiumId, user, userId, accountId, bankAccount) {

    const URL = (this.serverStatus === 1) 
    ? '/api/userbankaccounts' 
    : 'http://localhost:3000/userbankaccounts';
    try {

      //const response = await fetch(`${URL}:3000/userbankaccounts?action=update&userBankAccountId=${userBankAccountId}&condominiumId=${condominiumId}&user=${user}&userId=${userId}&accountId=${accountId}&bankAccount=${bankAccount}`);
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