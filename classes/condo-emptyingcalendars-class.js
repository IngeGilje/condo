// Show emptying calendar
class EmptyingCalendars extends Condos {

  // Emptying Calendar
  arrayEmptyingCalendars;

  // Find selected emptying calendar id
  getSelectedEmptyingCalendarId(className) {

    let emptyingCalendarId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      emptyingCalendarId = Number(document.querySelector(`.${className}`).value);
      emptyingCalendarId = (emptyingCalendarId === 0) ? this.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0 : emptyingCalendarId;
    } else {

      // Get last id in last object in emptying calendar array
      emptyingCalendarId = this.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
    }

    return emptyingCalendarId;
  }

  // Select emptying calendar Id
  selectEmptyingCalendarId(emptyingCalendarId, className) {

    // Check if emptying calendar id exist
    const rowNumberEmptyingCalendar = this.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      document.querySelector(`.select-${className}`).value =
        emptyingCalendarId;
      return true;
    } else {

      return false;
    }
  }

  // Show selected emptycaledars
  showSelectedEmptyCalendarsNew(label, className, style, date, selectNone, selectAll, enableChanges) {

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

    // Check if emptyalendars array is empty
    if (this.arrayEmptyingCalendars.length > 0) {
      this.arrayEmptyingCalendars.forEach((emptyCalendar) => {

        html += `
        <option 
          value=${emptyCalendar.date}
          ${(emptyCalendar.date === date) ? 'selected' : ''}
        >`;
        if (emptyCalendar.date === date) selectedValue = true;

        date = emptyCalendar.date;
        date = formatNumberToNorDate(date);

        html += `
          &nbsp;&nbsp;${date}&nbsp;&nbsp;
        </option>`;

      });
    } else {

      // No emptyCalendars
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;Ingen Dato&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayEmptyingCalendars.length > 0)) {

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
    if (selectNone && (this.arrayEmptyingCalendars.length > 0)) {
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

  // get emtying calendar table
  async loadEmptyingCalendarTable(condominiumId, year, month, date) {

    // Get emptying calendar
    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendars'
      : 'http://localhost:3000/emptyingcalendars';
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
          year: year,
          month: month,
          date: date
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendars)");
      this.arrayEmptyingCalendars = await response.json();
    } catch (error) {
      console.log("Error loading emptying calendar:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestEmptyingCalendarId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendars'
      : 'http://localhost:3000/emptyingcalendars';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestEmptyingCalendarId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendars)");
      this.arrayEmptyingCalendars = await response.json();
    } catch (error) {
      console.log("Error selecting emptying calendars:", error);
    }
  }

  // update emptying calendar row in emptying calendar table
  async updateEmptyingCalendarTable(emptyingCalendarId, user, condoId, date, residualWaste, paper, food, plastic, christmasTree) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendars'
      : 'http://localhost:3000/emptyingcalendars';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          emptyingCalendarId: emptyingCalendarId,
          user: user,
          condoId: condoId,
          date: date,
          residualWaste: residualWaste,
          paper: paper,
          food: food,
          plastic: plastic,
          christmasTree: christmasTree
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendars)");
      this.arrayEmptyingCalendars = await response.json();
    } catch (error) {
      console.log("Error updating emptying calendar:", error);
    }
  }

  // insert emptying calendar row in emptying calendar table
  async insertEmptyingCalendarTable(condominiumId, user, condoId, date, residualWaste, paper, food, plastic, christmasTree) {
    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendars'
      : 'http://localhost:3000/emptyingcalendars';
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
          date: date,
          condoId: condoId,
          residualWaste: residualWaste,
          paper: paper,
          food: food,
          plastic: plastic,
          christmasTree: christmasTree
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendars)");
      this.arrayEmptyingCalendars = await response.json();
    } catch (error) {
      console.log("Error inserting emptying calendar:", error);
    }
  }

  // delete emptying calendar row
  async deleteEmptyingCalendarTable(emptyingCalendarId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendars'
      : 'http://localhost:3000/emptyingcalendars';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          emptyingCalendarId: emptyingCalendarId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendars)");
      this.arrayEmptyingCalendars = await response.json();
    } catch (error) {
      console.log("Error deleting emptying calendar:", error);
    }
  }
}