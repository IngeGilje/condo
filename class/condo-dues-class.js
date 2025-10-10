
// Due maintenance
class Dues extends Condos {

  // Due information
  arrayDues;

  /*
  // Show selected dues
  showAllDues(className, dueId) {

    dueId = Number(dueId);

    let html = `
    <form 
      id="monthlyPaymentId"
      action="/submit"
      method="POST"
    >
      <label 
        id="monthlyPaymentId"
        class="label-${className}"
        for="monthlyPaymentId"
      >
          Velg forfall
      </label>
      <select 
        class="select-${className}" 
        id="monthlyPaymentId"
      >
    `;

    // Check if due array is empty
    const numberOfRows = this.arrayDues.length;
    if (numberOfRows > 0) {
      this.arrayDues.forEach((due) => {
        if (due.dueId === dueId) {

          html +=
            `
              <option 
                value="${due.dueId}"
                selected
              >
                ${due.dueId} - ${due.text}
              </option>
            `;
        } else {

          html +=
            `
              <option 
                value="${due.dueId}">
                ${due.dueId} - ${due.text}
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
            Ingen forfall
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
  */

  // Find selected due id
  getSelectedDueId(className) {

    let dueId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      dueId =
        Number(document.querySelector(`.${className}`).value);
      dueId = (dueId === 0) ? this.arrayDues.at(-1).dueId : dueId;
    } else {

      // Get last id in last object in monthly payment array
      dueId = this.arrayDues.at(-1).dueId;
    }

    return dueId;
  }

  // Show selected dues
  showSelectedDues(className, dueId) {

    let html = `
      <form 
        id="due"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${className}"
          for="due"
          id="due"
        >
            Velg forfall
        </label>
        <select 
          class="select-${className}" 
        >
    `;

    let lineNumber = 0;

    let selectedOption =
      false;

    // Check if Bank account transactions array is empty
    const numberOfRows = this.arrayDues.length;
    if (numberOfRows > 0) {
      this.arrayDues.forEach((due) => {

        lineNumber++;
        if (due.dueId === dueId) {

          html +=
            `
              <option 
                value="${due.dueId}"
                selected
              >
                ${lineNumber} - ${due.dueId}
              </option>
            `;
          selectedOption =
            true;
        } else {

          html +=
            `
              <option 
                value="${due.dueId}">
                ${lineNumber} - ${due.dueId}
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
            Ingen banktransaksjoner
          </option>
        `;
      selectedOption =
        true;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // get dues
  async loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate) {

    try {

      const response = await fetch(`http://localhost:3000/dues?action=select&condominiumId=${condominiumId}&accountId=${accountId}&condoId=${condoId}&fromDate=${fromDate}&toDate=${toDate}`);
      if (!response.ok) throw new Error("Network error (dues)");
      this.arrayDues = await response.json();
    } catch (error) {

      console.log("Error loading dues:", error);
    }
  }

  // update due row in dues table
  async updateDuesTable(dueId, user, lastUpdate, condoId, accountId, amount, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/dues?action=update&dueId=${dueId}&user=${user}&lastUpdate=${lastUpdate}&condoId=${condoId}&accountId=${accountId}&amount=${amount}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (dues)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error updating dues:", error);
    }
  }

  // insert due row in dues table
  async insertDuesTable(condominiumId, user, lastUpdate, condoId, accountId, amount, date, text) {

    try {
      const response = await fetch(`http://localhost:3000/dues?action=insert&condominiumId=${condominiumId}&condoId=${condoId}&user=${user}&lastUpdate=${lastUpdate}&accountId=${accountId}&amount=${amount}&date=${date}&text=${text}`);
      if (!response.ok) throw new Error("Network error (dues)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error inserting dues:", error);
    }
  }
  // delete due row
  async deleteDuesTable(dueId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/dues?action=delete&dueId=${dueId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (dues)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error deleting dues:", error);
    }
  }
}

