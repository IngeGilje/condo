class Transactions extends Condos {

  constructor(className) {
    super(className);
  }

  // Transactions information
  arrayTransactions = Array;
  #arrayTransactions = Array;

  // Show transactions
  showSelectedTransactionsNew(className, transactionId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedTransactionsNew -->
    <select 
      class="${className}"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if transactions array is empty
    if (this.arrayTransactions.length > 0) {
      this.arrayTransactions.forEach((transaction) => {

        html += `
        <option 
          value=${transaction.transactionId}
          ${(transaction.transactionId === transactionId) ? 'selected' : ''}
        >
          ${transaction.transactionId}
        </option>`;
        if (transaction.transactionId === transactionId) selectedValue = true;
      });
    } else {

      // No transactions
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen Konti
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayTransactions.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayTransactions.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
    </select>
    <!-- end showSelectedTransactionsNew -->
    `;

    return html;
  }

  // get transactions
  async loadTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, projectId, amount, fromDate, toDate, alternativeArray = false) {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';

    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          orderBy: orderBy,
          condominiumId: condominiumId,
          deleted: deleted,
          condoId: condoId,
          accountId: accountId,
          projectId: projectId,
          amount: amount,
          fromDate: fromDate,
          toDate: toDate
        })
      });
      if (!response.ok) throw new Error("Network error (transactions)");
      (alternativeArray)
        ? this.#arrayTransactions = await response.json()
        : this.arrayTransactions = await response.json();

    } catch (error) {
      console.log("Error loading Transactions:", error);
    }
  }

  // get transactions from transactions table
  async loadTransactionTable(condominiumId, fixedCost) {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';
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
          fixedCost: fixedCost
        })
      });

      if (!response.ok) throw new Error("Network error (transactions)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error loading transactions:", error);
    }
  }

  // get last row in transactions table
  async loadLastRowTransactionsTable(condominiumId) {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';

    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'selectLastRow',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (Transactions)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error loading Transactions:", error);
    }
  }


  // update Transactions row
  async updateTransactionsTable(transactionId, condominiumId, user, condoId, accountId, projectId, income, payment, kilowattHour, date, text) {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          transactionId: transactionId,
          condominiumId: condominiumId,
          user: user,
          condoId: condoId,
          accountId: accountId,
          projectId: projectId,
          income: income,
          payment: payment,
          kilowattHour: kilowattHour,
          date: date,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (Transactions)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error updating Transactions:", error);
    }
  }

  // update Voucher FileName
  async updateVoucherFileName(user, transactionId, voucherFileName) {

    const URL = (this.serverStatus === 1)
      ? '/api/updateVoucherFileName'
      : 'http://localhost:3000/updateVoucherFileName';
    try {
      //const response = await fetch(`${URL}:3000/updateVoucherFileName?user=${user}&transactionId=${transactionId}&voucherFileName=${voucherFileName}`, {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: user,
          transactionId: transactionId,
          voucherFileName: voucherFileName
        })
      });

      return (response.statusText === 'OK') ? true : false;
    } catch (error) {
      console.log("Error updateVoucherFileName:", error);
    }
  }

  // insert Transactions row
  async insertTransactionsTable(condominiumId, user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, imported = 'Y') {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          condoId: condoId,
          accountId: accountId,
          projectId: projectId,
          income: income,
          payment: payment,
          kilowattHour: kilowattHour,
          date: date,
          text: text,
          imported: imported
        })
      });
      if (!response.ok) throw new Error("Network error (transactions)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error inserting Transactions:", error);
    }
  }

  // delete Transactions row
  async deleteTransactionsTable(transactionId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/transactions?action=delete&transactionId=${transactionId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          transactionId: transactionId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (transactions)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error deleting Transactions:", error);
    }
  }

  // get Transactions from start (20200101) to toDate
  async getTransactions(condominiumId, condoId, toDate) {

    let openingBalance = 0;

    const orderBy = 'date ASC';
    await this.loadTransactionsTable(orderBy, condominiumId, 'N', condoId, this.nineNine, this.nineNine, 0, 20200101, toDate, true);
    objTransactions.#arrayTransactions.forEach((bankAccountMovement) => {

      openingBalance += bankAccountMovement.income;
      openingBalance += bankAccountMovement.payment;
    });

    return openingBalance;
  }

  // Get the highest ID in the table
  async getHighestTransactionId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/transactions'
      : 'http://localhost:3000/transactions';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestTransactionId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (accounts)");
      this.arrayTransactions = await response.json();
    } catch (error) {
      console.log("Error selecting accounts:", error);
    }
  }

  // What was the bank balance on last day of each month this year
  // date of format yyyyymmdd
  getBankBalance(date) {

    // get opening balance
    let bankBalance = 0;
    const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objTransactions.condominiumId);
    if (rowNumberBankAccount !== -1) bankBalance += Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance);

        // get opening date
    const fromDate = Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate);

    // Get all Bank transactions from 01.01.2020 to selected date
    this.arrayTransactions.forEach(transaction => {

      // Accoumulate all transactions up to the selected date
      if ( (transaction.date >= fromDate) && (transaction.date <= date) ) {

        // Add payment and income to bank balance
        bankBalance += transaction.income + transaction.payment;
      }
    });

    if (bankBalance !== 0) bankBalance = bankBalance / 100;

    return bankBalance;
  }
}
