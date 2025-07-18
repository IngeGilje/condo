
class Budget extends Condos {

  // Budget information
  budgetArray = [];

  // Show all budgets
  showAllBudgets(className, budgetId) {

    let html =
      `
        <form 
          id ="Budget"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className} 
            label-${className}"
            for="Budget"
            id ="Budget"
          >
            Velg budsjett
          </label>
          <select 
            class="select-${className}"
            id ="Budget" 
          >
    `;

    let selectedOption =
      false;

    // Check if budget array is empty
    const numberOfRows =
      budgetArray.length;

    if (numberOfRows > 0) {
      budgetArray.forEach((budget) => {
        if (budget.budgetId >= 0) {

          // get account name
          const accountName =
            objBudget.getAccountName(budget.accountId);

          if (budget.budgetId === budgetId) {

            html +=
              `
                <option 
                  value="${budget.budgetId}"
                  selected
                  >
                  ${budget.budgetId} - ${accountName}
                </option>
              `;
            selectedOption =
              true;
          } else {

            html +=
              `
              <option 
                value="${budget.budgetId}">
                ${budget.budgetId} - ${accountName}
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
          Ingen budsjett er valgt
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

  // Find selected budget id
  getSelectedBudgetId(className) {

    let budgetId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      budgetId =
        Number(document.querySelector(`.${className}`).value);
      budgetId =
        (budgetId === 0) ? budgetArray.at(-1).budgetId : budgetId;
    } else {

      // Get last id in last object in budget array
      budgetId =
        (budgetArray.length > 0) ? budgetArray.at(-1).budgetId : 0;
    }

    return budgetId;
  }
}

