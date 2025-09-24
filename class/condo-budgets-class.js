
class Budgets extends Condos {

  // Budget information
  budgetsArray = [];

  // Find selected budget id
  getSelectedBudgetId(className) {

    let budgetId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      budgetId =
        Number(document.querySelector(`.${className}`).value);
      budgetId =
        (budgetId === 0) ? budgetsArray.at(-1).budgetId : budgetId;
    } else {

      // Get last id in last object in budget array
      budgetId =
        (budgetsArray.length > 0) ? budgetsArray.at(-1).budgetId : 0;
    }

    return budgetId;
  }

  // Show all selected budgets
  showAllSelectedBudgets(className, budgetId) {

    let html = `
      <form 
        id="budgets"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${className}"
          for="budgets"
          id="budgets"
        >
            Velg budsjett
        </label>
        <select 
          class="select-${className}" 
        >
    `;

    let lineNumber = 0;

    let selectedOption =
      false;

    // Check if budget array is empty
    const numberOfRows =
      budgetsArray.length;
    if (numberOfRows > 0) {
      budgetsArray.forEach((budget) => {

        lineNumber++;

        if (budget.budgetId === budgetId) {

          html +=
            `
              <option 
                value="${budget.budgetId}"
                selected
              >
                ${lineNumber} - ${budget.budgetId}
              </option>
            `;
          selectedOption =
            true;
        } else {

          html +=
            `
              <option 
                value="${budget.budgetId}">
                ${lineNumber} - ${budget.budgetId}
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
            Ingen budsjett
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
