
class Budgets extends Condos {

  // Budget information
  budgetsArray = [];

  // Find selected budget id
  getSelectedBudgetId(className) {

    let budgetId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      budgetId = Number(document.querySelector(`.${className}`).value);
      budgetId = (budgetId === 0) ? this.budgetsArray.at(-1).budgetId : budgetId;
    } else {

      // Get last id in last object in budget array
      budgetId = (this.budgetsArray.length > 0) ? this.budgetsArray.at(-1).budgetId : 0;
    }

    return budgetId;
  }

  // Show all selected budgets
  showSelectedBudgets(className, budgetId) {

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
      this.budgetsArray.length;
    if (numberOfRows > 0) {
      this.budgetsArray.forEach((budget) => {

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

  // Select budget
  selectBudgetId(budgetId, className) {

    // Check if budget id exist
    const objBudgetNumber =
      budgetsArray.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetNumber !== -1) {

      document.querySelector(`.select-${className}`).value =
        budgetId;
      return true;
    } else {

      return false;
    }
  }
  
  // get budgets
  async loadBudgetsTable(condominiumId, year, accountId) {

    try {
      
      const response = await fetch(`http://localhost:3000/budgets?action=select&condominiumId=${condominiumId}&year=${year}&accountId=${accountId}`);
      if (!response.ok) throw new Error("Network error (budgets)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error loading budgets:", error);
    }
  }

  // update budget row in budgets table
  async updateBudgetsTable(budgetId, user, lastUpdate, accountId, amount, year) {

    try {
      const response = await fetch(`http://localhost:3000/budgets?action=update&budgetId=${budgetId}&user=${user}&lastUpdate=${lastUpdate}&accountId=${accountId}&amount=${amount}&year=${year}`);
      if (!response.ok) throw new Error("Network error (budgets)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error updateing budgets:", error);
    }
  }

  // insert budget row in budgets table
  async insertBudgetsTable(condominiumId, user, lastUpdate, accountId, amount, year) {

    try {
      const response = await fetch(`http://localhost:3000/budgets?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&accountId=${accountId}&amount=${amount}&year=${year}`);
      if (!response.ok) throw new Error("Network error (budgets)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error inserting budgets:", error);
    }
  }
  // delete budget row
  async deleteBudgetsTable(budgetId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/budgets?action=delete&budgetId=${budgetId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (budgets)");
      this.budgetsArray = await response.json();
    } catch (error) {
      console.log("Error deleting budgets:", error);
    }
  }
}
