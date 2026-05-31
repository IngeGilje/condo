class Transaction extends Condos {

  constructor(className) {
    super(className);
  }

  // Transactions information
  arrayTransactions = Array;;
  #arrayTransactions = Array;

  // Show all selected transactions
  showSelectedTransactions(className, style, transactionId, selectNone, selectAll, enableChanges = false) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    // Check if transaction array is empty
    if (this.arrayTransactions.length > 0) {
      this.arrayTransactions.forEach((bankTransaction) => {
        if (bankTransaction.transactionId === transactionId) {

          html += `<option value=${bankTransaction.transactionId} selected>${bankTransaction.transactionId}</option>`;
          selectedValue = true;
        } else {

          let date = (bankTransaction.date)
            ? formatNumberToNorDate(bankTransaction.date)
            : '';
          let amount = '';
          if (bankTransaction.income !== 0) amount = formatOreToKroner(bankTransaction.income);
          if (bankTransaction.payment !== 0) amount = formatOreToKroner(bankTransaction.payment);
          html += `
          <option value=${bankTransaction.transactionId}>
            ${bankTransaction.transactionId}
          </option>`;
        }
      });
    } else {

      html += `
      <option 
        value=0 
        ${(!selectedValue) ? 'selected' : ''}
      >
        Ingen leilighet
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayTransactions.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayTransactions.length > 1)) {
      if (selectedValue) {
        html += `
        <option
          value=0
          ${(!selectedValue) ? 'selected' : ''}
        >
          ${selectNone}
        </option>`;
        if (!selectedValue) selectedValue = true;
      } else {

        html += `
        <option
          value=0
          ${(!selectedValue) ? 'selected' : ''}
        >
          ${selectNone}
        </option>`;
        if (!selectedValue) selectedValue = true;
      }
    }

    html += `</select></td>`;

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
    objTransaction.#arrayTransactions.forEach((bankAccountMovement) => {

      openingBalance += bankAccountMovement.income;
      openingBalance += bankAccountMovement.payment;
    });

    return openingBalance;
  }
}

