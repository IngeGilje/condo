
// Due maintenance
class Due extends Condos {

  // Due information
  dueArray;

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

    // Check if due array is empty
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
            
            html +=
              `
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
  getSelectedDueId(className) {

    let dueId = 0;

    // Check if HTML class exist
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

  // Show all selected dues
  showAllSelectedDues(className, dueId) {

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

    // Check if bank account movement array is empty
    const numberOfRows =
      dueArray.length;
    if (numberOfRows > 0) {
      dueArray.forEach((due) => {

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

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }
}

