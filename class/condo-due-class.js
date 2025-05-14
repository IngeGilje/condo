
// Due maintenance
class Due extends Condos {

  // Due information
  dueArray = undefined;

  // Show all dues
  showAllDues(className, dueId) {

    let html = `
    <form action="/submit" method="POST">
      <label class="label-${className}"
        for="onthlyPaymentId">
          Velg forfall
      </label>
      <select class="select-${className}" 
      >
    `;

    // Check if monthly payment array is empty
    const numberOfRows = dueArray.length;
    if (numberOfRows > 1) {
      dueArray.forEach((due) => {
        if (due.dueId > 1) {
          if (due.dueId === dueId) {

            html += `
          <option 
            value="${due.dueId}"
            selected
            >
            ${due.dueId} - ${due.text}
          </option>
        `;
          } else {
            html += `
          <option 
            value="${due.dueId}">
            ${due.dueId} - ${due.text}
          </option>
        `;
          }
        }
      });

    } else {

      html += `
        <option value="0" 
          selected
        >
          Ingen forfall
        </option>
      `;
    }

    html += `
        </select >
      </form>
    `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  /*
  // Get all monthly payments from MySQL database
  getDues(socket) {

    const SQLquery = `
      SELECT * FROM due
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }
  */

  // Find selected due id
  getSelectedDueId(columnName) {

    let dueId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      dueId =
        Number(document.querySelector(`.${className}`).value);
      dueId = (dueId === 0) ? dueArray.at(-1).dueId : dueId;
    } else {

      // Get last id in last object in monthly payment array
      dueId = dueArray.at(-1).dueId;
    }

    return dueId;
  }
}
