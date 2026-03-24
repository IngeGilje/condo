class BankAccountTransaction extends Condos {

  // Bank account transactions information
  arrayBankAccountTransactions;

  // Show all selected bank account transactions
  showSelectedBankAccountTransactions(className, style, bankAccountTransactionId, selectNone, selectAll, disabled = false) {

    let selectedValue = false;

    let html = `
      <td 
        class="center one-line">
          <select class="${className} center"
            ${(disabled) ? 'disabled' : ''}
            ${(style) ? `style="${style}"` : ''}
          >`;

    // Check if bank account transaction array is empty
    const numberOfRows = this.arrayBankAccountTransactions.length;
    if (numberOfRows > 0) {
      this.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {
        if (bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId) {

          html += `<option value=${bankAccountTransaction.bankAccountTransactionId} selected>${bankAccountTransaction.bankAccountTransactionId}</option>`;
          selectedValue = true;
        } else {

          html += `<option value=${bankAccountTransaction.bankAccountTransactionId}>${bankAccountTransaction.bankAccountTransactionId}</option>`;
        }
      });
    } else {

      html += `<option value=0 selected>Ingen leilighet</option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html += `<option value=${this.nineNine} selected>${selectAll}</option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
        html += `<option value=0>${selectNone}</option>`;
      } else {

        html += `<option value=0 selected>${selectNone}</option>`;
        selectedValue = true;
      }
    }

    html += `</select></td>`;

    return html;
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
  async loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate) {

    const URL = (this.serverStatus === 1) ? '/api/bankaccounttransactions' : 'http://localhost:3000/bankaccounttransactions';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/bankaccounttransactions?action=select&orderBy=${orderBy}&condominiumId=${condominiumId}&deleted=${deleted}&condoId=${condoId}&accountId=${accountId}&amount=${amount}&fromDate=${fromDate}&toDate=${toDate}`);
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
          amount: amount,
          fromDate: fromDate,
          toDate: toDate
        })
      });
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error loading Bank account transactions:", error);
    }
  }

  // update Bank account transactions row
  async updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text) {

    const URL = (this.serverStatus === 1) ? '/api/bankaccounttransactions' : 'http://localhost:3000/bankaccounttransactions';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/bankaccounttransactions?action=update&bankAccountTransactionId=${bankAccountTransactionId}&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&kilowattHour=${kilowattHour}&date=${date}&text=${text}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          bankAccountTransactionId: bankAccountTransactionId,
          condominiumId: condominiumId,
          user: user,
          condoId: condoId,
          accountId: accountId,
          income: income,
          payment: payment,
          kilowattHour: kilowattHour,
          date: date,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (Bank account transactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error updating Bank account transactions:", error);
    }
  }

  // update Voucer FileName
  async updateVoucerFileName(user, bankAccountTransactionId, voucerFileName) {

    const URL = (this.serverStatus === 1) ? '/api/updateVoucerFileName' : 'http://localhost:3000/updateVoucerFileName';
    try {
      //const response = await fetch(`${URL}:3000/updateVoucerFileName?user=${user}&bankAccountTransactionId=${bankAccountTransactionId}&voucerFileName=${voucerFileName}`, {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: user,
          bankAccountTransactionId: bankAccountTransactionId,
          voucerFileName: voucerFileName
        })
      });
      
      return (response.statusText === 'OK') ? true : false;
    } catch (error) {
      console.log("Error updateVoucerFileName:", error);
    }
  }

  // insert Bank account transactions row
  async insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text) {

    const URL = (this.serverStatus === 1) ? '/api/bankaccounttransactions' : 'http://localhost:3000/bankaccounttransactions';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/bankaccounttransactions?action=insert&bankAccountTransactionId=${bankAccountTransactionId}&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&accountId=${accountId}&income=${income}&payment=${payment}&kilowattHour=${kilowattHour}&date=${date}&text=${text}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          bankAccountTransactionId: bankAccountTransactionId,
          condominiumId: condominiumId,
          user: user,
          condoId: condoId,
          accountId: accountId,
          income: income,
          payment: payment,
          kilowattHour: kilowattHour,
          date: date,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error inserting Bank account transactions:", error);
    }
  }

  // delete Bank account transactions row
  async deleteBankAccountTransactionsTable(bankAccountTransactionId, user) {

    const URL = (this.serverStatus === 1) ? '/api/bankaccounttransactions' : 'http://localhost:3000/bankaccounttransactions';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/bankaccounttransactions?action=delete&bankAccountTransactionId=${bankAccountTransactionId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          bankAccountTransactionId: bankAccountTransactionId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (bankaccounttransactions)");
      this.arrayBankAccountTransactions = await response.json();
    } catch (error) {
      console.log("Error deleting Bank account transactions:", error);
    }
  }
}

