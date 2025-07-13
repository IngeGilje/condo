
class Budget extends Condos {

  // Budget information
  budgetArray = [];

  // Show all budgets
  showAllBudgets(columnName, budgetId) {

    let html =
      `
        <form 
          id ="Budget"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-budget-${columnName} 
            label-budget-${columnName}"
            for="Budget"
            id ="Budget"
          >
            Velg budsjett
          </label>
          <select 
            class="select-budget-${columnName}"
            id ="Budget" 
          >
    `;

    // Check if budget array is empty
    const numberOfRows = budgetArray.length;
    if (numberOfRows > 0) {
      budgetArray.forEach((budget) => {
        if (budget.budgetId >= 0) {
          if (budget.budgetId === budgetId) {

            html += `
          <option 
            value="${budget.budgetId}"
            selected
            >
            ${budget.budgetId} - ${budget.text}
          </option>
        `;
          } else {
            html += `
          <option 
            value="${budget.budgetId}">
            ${budget.budgetId} - ${budget.text}
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
          Ingen budsjett
        </option>
      `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-budget-${columnName}`).innerHTML = html;
  }

  // Find selected budget id
  getSelectedBudgetId(className) {

    let budgetId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      budgetId =
        Number(document.querySelector(`.${className}`).value);
      budgetId = (budgetId === 0) ? budgetArray.at(-1).budgetId : budgetId;
    } else {

      // Get last id in last object in budget array
      budgetId = budgetArray.at(-1).budgetId;
    }

    return budgetId;
  }
}

