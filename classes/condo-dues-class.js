
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

  // get dues
  //async loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate, alternativArray = false) {
  async loadDuesTable(condominiumId) {

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
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayDues = await response.json();
    } catch (error) {

      console.log("Error loading dues:", error);
    }
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
  async updateDuesTable(user, dueId, condoId, accountId, projectId, amount, date, kilowattHour, text) {

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
          projectId: projectId,
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
  async insertDuesTable(condominiumId, user, condoId, accountId, projectId, amount, date, kilowattHour, text) {

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
          projectId: projectId,
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

     this.arrayDues.forEach((due) => {
      if ((due.condominium === condominiumId)
        && (due.condominium === condominiumId)
        && (due.condoId === condoId)
        && (due.date >= 20200101 && due.date <= toDate)) {

        openingBalance -= due.amount;
      }
    });

    return openingBalance;
  }

  // Show dues
  showSelectedDuesNew(className, label, dueId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedDuesNew -->
    <div 
      class="field"
    >
      <label for="${className}">
        ${label}
      </label>
      <select 
        id="${className}"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

    // Check if dues array is empty
    if (this.arrayDues.length > 0) {
      this.arrayDues.forEach((due) => {

        html += `
        <option 
          value=${due.dueId}
          ${(due.dueId === dueId) ? 'selected' : ''}
        >
          ${due.text.trim()}
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
        Ingen forfall
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
        ${selectAll}
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
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
    </div>
    <!-- end showSelectedDuesNew -->
    `;

    return html;
  }

  // get first dueId for fromDate, toDate, condoId,projectId
  getFirstDueId(fromDate, toDate, condoId, projectId) {

    let dueId = 0;
    this.arrayDues.forEach((due) => {

      if (((due.date >= fromDate) && (due.date <= toDate))
        && ((dueId.condoId === condoId) || (condoId === 0))
        && ((dueId.projectId === projectId) || (projectId === 0))) {

        dueId = due.dueId;
      }
    });

    return dueId;
  }
}