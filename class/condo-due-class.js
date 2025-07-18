
// Due maintenance
class Due extends Condos {

  // Due information
  dueArray = undefined;

  // Show all dues
  showAllDues(className, dueId) {

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

    let selectedOption =
      false;

    // Check if monthly payment array is empty
    const numberOfRows = dueArray.length;
    if (numberOfRows > 0) {
      dueArray.forEach((due) => {
        if (due.dueId >= 0) {
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
            selectedOption =
              true;
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
      selectedOption =
        true;
    }

    html += `
        </select >
      </form>
    `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

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
