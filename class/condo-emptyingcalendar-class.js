
class EmptyingCalendar extends Condos {

  // Emptying Calendar
  arrayEmptyingCalendar;

  // Find selected emptying calendar id
  getSelectedEmptyingCalendarId(className) {

    let emptyingCalendarId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      emptyingCalendarId = Number(document.querySelector(`.${className}`).value);
      emptyingCalendarId = (emptyingCalendarId === 0) ? this.arrayEmptyingCalendar.at(-1).emptyingCalendarId : emptyingCalendarId;
    } else {

      // Get last id in last object in emptying calendar array
      emptyingCalendarId = this.arrayEmptyingCalendar.at(-1).emptyingCalendarId;
    }

    return emptyingCalendarId;
  }

  // Select emptying calendar Id
  selectEmptyingCalendarId(emptyingCalendarId, className) {

    // Check if emptying calendar id exist
    const rowNumberEmptyingCalendar = this.arrayEmptyingCalendar.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      document.querySelector(`.select-${className}`).value =
        emptyingCalendarId;
      return true;
    } else {

      return false;
    }
  }

  showSelectedEmptyingCalendar(className, style, emptyingCalendarId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="centerCell one-line center"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style=${style}` : 'style=width:175px;'}
      >`;

    // Check if emptying calendar array is empty
    if (this.arrayEmptyingCalendar.length > 0) {
      this.arrayEmptyingCalendar.forEach((emptyingCalendar) => {

        html += `
        <option 
          value=${emptyingCalendar.emptyingCalendarId}
          ${(emptyingCalendar.emptyingCalendarId === emptyingCalendarId) ? 'selected' : ''}
        >
          ${emptyingCalendar.title}
        </option>`;
        if (emptyingCalendar.emptyingCalendarId === emptyingCalendarId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen nyheter
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayEmptyingCalendar.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        ${selectAll}
      </option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayEmptyingCalendar.length > 0)) {
      html += `
      <option 
        value=0
        ${(selectedValue) ? selectNone : ''}
        ${(emptyingCalendarId === 0) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }

  // get emtying calendar table
  async loadEmptyingCalendarTable(condominiumId, year,month) {

    // Get emptying calendar
    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendar'
      : 'http://localhost:3000/emptyingcalendar';
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
          month: month
        })
      });
      if (!response.ok) throw new Error("Network error (emptyingcalendar)");
      this.arrayEmptyingCalendar = await response.json();
    } catch (error) {
      console.log("Error loading emptying calendar:", error);
    }
  }

  // update emptying calendar row in emptying calendar table
  async updateEmptyingCalendarTable(emptyingCalendarId, user, condoId,date, residualWaste, paper, food, plastic, christmasTree) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendar'
      : 'http://localhost:3000/emptyingcalendar';
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
      if (!response.ok) throw new Error("Network error (emptyingcalendar)");
      this.arrayEmptyingCalendar = await response.json();
    } catch (error) {
      console.log("Error updating emptying calendar:", error);
    }
  }

  // insert emptying calendar row in emptying calendar table
  async insertEmptyingCalendarTable(condominiumId, user,condoId, date, residualWaste,paper,  food, plastic, christmasTree) {
    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendar'
      : 'http://localhost:3000/emptyingcalendar';
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
      if (!response.ok) throw new Error("Network error (emptyingcalendar)");
      this.arrayEmptyingCalendar = await response.json();
    } catch (error) {
      console.log("Error inserting emptying calendar:", error);
    }
  }

  // delete emptying calendar row
  async deleteEmptyingCalendarTable(emptyingCalendarId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/emptyingcalendar'
      : 'http://localhost:3000/emptyingcalendar';
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
      if (!response.ok) throw new Error("Network error (emptyingcalendar)");
      this.arrayEmptyingCalendar = await response.json();
    } catch (error) {
      console.log("Error deleting emptying calendar:", error);
    }
  }
}