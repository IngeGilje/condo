
// Due
class Dues extends Condos {

  // Due information
  arrayDues = Array;
  #arrayDues = Array;

  // Find selected due id
  getSelectedDueId(className) {

    let dueId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      dueId =
        Number(document.querySelector(`.${className}`).value);
      dueId = (dueId === 0) ? this.arrayDues.at(-1)?.dueId ?? 0 : dueId;
    } else {

      // Get last id in last object in monthly payment array
      dueId = (this.arrayDues.length > 0)
        ? this.arrayDues.at(-1)?.dueId ?? 0
        : 0;
    }

    return dueId;
  }

  // get dues
  async loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate, alternativArray = false) {

    const URL = (this.serverStatus === 1)
      ? '/api/dues'
      : 'http://localhost:3000/dues';

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
          accountId: accountId,
          condoId: condoId,
          fromDate: fromDate,
          toDate: toDate
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      (alternativArray)
        ? this.#arrayDues = await response.json()
        : this.arrayDues = await response.json()
    } catch (error) {

      console.log("Error loading dues:", error);
    }
  }

  // Show dues
  showSelectedDuesNew(label, className, style, dueId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <div class="field" style="width:250px;margin-left:35px;margin-bottom:5px;">
    <label>
      ${label}
    </label>
    <select 
      class="${className} center one-line"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if dues array is empty
    if (this.arrayDues.length > 0) {
      this.arrayDues.forEach((due) => {

        html += `
        <option 
          value=${due.dueId}
          ${(due.dueId === dueId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${due.text.trim()}&nbsp;&nbsp;
        </option>`;

        if (due.dueId === dueId) selectedValue = true;
      });
    } else {

      // No dues
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;Ingen Konti&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayDues.length > 0)) {

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
    if (selectNone && (this.arrayDues.length > 0)) {
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

  // Get the highest ID in the table
  async getHighestDueId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/dues'
      : 'http://localhost:3000/dues';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestDueId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayDues = await response.json();
    } catch (error) {
      console.log("Error selecting dues:", error);
    }
  }

  // update due row in dues table
  async updateDuesTable(dueId, user, condoId, accountId, amount, date, kilowattHour, text) {

    const URL = (this.serverStatus === 1)
      ? '/api/dues'
      : 'http://localhost:3000/dues';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          dueId: dueId,
          user: user,
          condoId: condoId,
          accountId: accountId,
          amount: amount,
          date: date,
          kilowattHour: kilowattHour,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error updating dues:", error);
    }
  }

  // insert due row in dues table
  async insertDuesTable(condominiumId, user, condoId, accountId, amount, date, kilowattHour, text) {

    const URL = (this.serverStatus === 1) ? '/api/dues' : 'http://localhost:3000/dues';
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
          condoId: condoId,
          user: user,
          accountId: accountId,
          amount: amount,
          date: date,
          kilowattHour: kilowattHour,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error inserting dues:", error);
    }
  }
  // delete due row
  async deleteDuesTable(dueId, user) {

    const URL = (this.serverStatus === 1) ? '/api/dues' : 'http://localhost:3000/dues';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          dueId: dueId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error deleting dues:", error);
    }
  }

  // get dues from start (20200101) to toDate
  async getDues(condominiumId, condoId, toDate) {

    let openingBalance = 0;

    await this.loadDuesTable(condominiumId, this.nineNine, condoId, 20200101, toDate, true);
    this.#arrayDues.forEach((due) => {

      openingBalance -= due.amount;
    });

    return openingBalance;
  }
}