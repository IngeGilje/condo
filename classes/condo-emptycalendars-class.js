// Show empty calendar
class EmptyCalendars extends Condos {

  // Empty Calendar
  arrayEmptyCalendars;

  // Find selected empty calendar id
  getSelectedEmptyCalendarId(className) {

    let emptyCalendarId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      emptyCalendarId = Number(document.querySelector(`.${className}`).value);
      emptyCalendarId = (emptyCalendarId === 0) ? this.arrayEmptyCalendars.at(-1)?.emptyCalendarId ?? 0 : emptyCalendarId;
    } else {

      // Get last id in last object in empty calendar array
      emptyCalendarId = this.arrayEmptyCalendars.at(-1)?.emptyCalendarId ?? 0;
    }

    return emptyCalendarId;
  }

  // Select empty calendar Id
  selectEmptyCalendarId(emptyCalendarId, className) {

    // Check if empty calendar id exist
    const rowNumberEmptyCalendar = this.arrayEmptyCalendars.findIndex(emptycalendar => emptycalendar.emptyCalendarId === emptyCalendarId);
    if (rowNumberEmptyCalendar !== -1) {

      document.querySelector(`.select-${className}`).value =
        emptyCalendarId;
      return true;
    } else {

      return false;
    }
  }


  /*
  // Show selected emptycaledars
  showSelectedEmptyCalendarsNew(label, className, style, emptyCalendarId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;
    let emptyCalendarDate = "20200101";

    let html = `
    <div 
      class="field field-position" 
    >
    <label>
      ${label}
    </label>
    <select 
      class="${className} center one-line"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if emptyalendars array is empty
    if (this.arrayEmptyCalendars.length > 0) {
      this.arrayEmptyCalendars.forEach((emptyCalendar) => {

        html += `
        <option 
          value=${emptyCalendar.date}
          ${((emptyCalendar.emptyCalendarId === emptyCalendarId)) ? 'selected' : ''}
        >`;
        if (emptyCalendar.emptyCalendarId === emptyCalendarId) selectedValue = true;

        emptyCalendarDate = formatNumberToNorDate(emptyCalendar.date);
        html += `
          &nbsp;&nbsp;${emptyCalendarDate}&nbsp;&nbsp;
        </option>
        `;
      });

      // If not match of date
      // try start of the month
      if (!selectedValue) {

        emptyCalendarDate = getCurrentDate();
        const year = String(emptyCalendarDate).slice(6, 10);
        const month = String(emptyCalendarDate).slice(3, 5);
        const fromDate = Number(year + month + "01");
        const toDate = Number(year + month + "31");

        this.arrayEmptyCalendars.forEach((emptyCalendar) => {

          if (emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) {

            html += `
            <option 
              value=${emptyCalendar.date}
              ${((emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) && !selectedValue) ? 'selected' : ''}
            >`;
            if ((emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) && !selectedValue) selectedValue = true;

            const emptyCalendarDate = formatNumberToNorDate(emptyCalendar.date);
            html += `
              &nbsp;&nbsp;${emptyCalendarDate}&nbsp;&nbsp;
            </option>
            `;
          }
        });
      }
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
    if (selectAll && (this.arrayEmptyCalendars.length > 0)) {

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
    if (selectNone && (this.arrayEmptyCalendars.length > 0)) {
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
  */

  // show EmptyCalendar
  showSelectedEmptyCalendarsNew(label, className, emptyCalendarId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;
    let emptyCalendarDate = "20200101";

    let html = `
    <!-- start showSelectedEmptyCalendarsNew -->
    <div 
      class="field"
    >
      <label for="apartment">
        ${label}
      </label>
      <select 
        id="apartment"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

    // Check if emptyalendars array is empty
    if (this.arrayEmptyCalendars.length > 0) {
      this.arrayEmptyCalendars.forEach((emptyCalendar) => {

        html += `
        <option 
          value=${emptyCalendar.date}
          ${((emptyCalendar.emptyCalendarId === emptyCalendarId)) ? 'selected' : ''}
        >`;
        if (emptyCalendar.emptyCalendarId === emptyCalendarId) selectedValue = true;

        emptyCalendarDate = formatNumberToNorDate(emptyCalendar.date);
        html += `
          &nbsp;&nbsp;${emptyCalendarDate}&nbsp;&nbsp;
        </option>
        `;
      });

      // If not match of date
      // try start of the month
      if (!selectedValue) {

        emptyCalendarDate = getCurrentDate();
        const year = String(emptyCalendarDate).slice(6, 10);
        const month = String(emptyCalendarDate).slice(3, 5);
        const fromDate = Number(year + month + "01");
        const toDate = Number(year + month + "31");

        this.arrayEmptyCalendars.forEach((emptyCalendar) => {

          if (emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) {

            html += `
            <option 
              value=${emptyCalendar.date}
              ${((emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) && !selectedValue) ? 'selected' : ''}
            >`;
            if ((emptyCalendar.date >= fromDate && emptyCalendar.date <= toDate) && !selectedValue) selectedValue = true;

            const emptyCalendarDate = formatNumberToNorDate(emptyCalendar.date);
            html += `
              ${emptyCalendarDate}
            </option>
            `;
          }
        });
      }
    } else {

      // No emptyCalendars
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen leiligheter
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayEmptyCalendars.length > 0)) {

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
    if (selectNone && (this.arrayEmptyCalendars.length > 0)) {
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
    <!-- end showSelectedEmptyCalendarsNew -->
    `;

    return html;
  }

  // get emtying calendar table
  async loadEmptyCalendarsTable(condominiumId, orderBy) {

    // Get empty calendar
    const URL = (this.serverStatus === 1)
      ? '/api/emptycalendars'
      : 'http://localhost:3000/emptycalendars';
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
          orderBy: orderBy
        })
      });
      if (!response.ok) throw new Error("Network error (emptycalendars)");
      this.arrayEmptyCalendars = await response.json();
    } catch (error) {
      console.log("Error loading empty calendar:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestEmptyCalendarId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/emptycalendars'
      : 'http://localhost:3000/emptycalendars';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestEmptyCalendarId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (emptycalendars)");
      this.arrayEmptyCalendars = await response.json();
    } catch (error) {
      console.log("Error selecting empty calendars:", error);
    }
  }

  // update empty calendar row in empty calendar table
  async updateEmptyCalendarTable(emptyCalendarId, user, condoId, date, residualWaste, paper, food, plastic, christmasTree) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptycalendars'
      : 'http://localhost:3000/emptycalendars';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          emptyCalendarId: emptyCalendarId,
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
      if (!response.ok) throw new Error("Network error (emptycalendars)");
      this.arrayEmptyCalendars = await response.json();
    } catch (error) {
      console.log("Error updating empty calendar:", error);
    }
  }

  // insert empty calendar row in empty calendar table
  async insertEmptyCalendarTable(condominiumId, user, condoId, date, residualWaste, paper, food, plastic, christmasTree) {
    const URL = (this.serverStatus === 1)
      ? '/api/emptycalendars'
      : 'http://localhost:3000/emptycalendars';
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
      if (!response.ok) throw new Error("Network error (emptycalendars)");
      this.arrayEmptyCalendars = await response.json();
    } catch (error) {
      console.log("Error inserting empty calendar:", error);
    }
  }

  // delete empty calendar row
  async deleteEmptyCalendarTable(emptyCalendarId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptycalendars'
      : 'http://localhost:3000/emptycalendars';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          emptyCalendarId: emptyCalendarId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (emptycalendars)");
      this.arrayEmptyCalendars = await response.json();
    } catch (error) {
      console.log("Error deleting empty calendar:", error);
    }
  }
}