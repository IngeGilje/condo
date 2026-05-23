
class Budget extends Condos {

  // Budget information
  arrayBudgets = [];

  // Find selected budget id
  getSelectedBudgetId(className) {

    let budgetId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      budgetId = Number(document.querySelector(`.${className}`).value);
      budgetId = (budgetId === 0) ? this.arrayBudgets.at(-1).budgetId : budgetId;
    } else {

      // Get last id in last object in budget array
      budgetId = (this.arrayBudgets.length > 0) ? this.arrayBudgets.at(-1).budgetId : 0;
    }

    return budgetId;
  }

  // Select budget
  selectBudgetId(budgetId, className) {

    // Check if budget id exist
    const objBudgetNumber = this.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetNumber !== -1) {

      document.querySelector(`.select-${className}`).value = budgetId;
      return true;
    } else {

      return false;
    }
  }

  // get budgets
  async loadBudgetsTable(condominiumId, year, accountId) {

    const URL = (this.serverStatus === 1)
      ? '/api/budgets'
      : 'http://localhost:3000/budgets';
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
          accountId: accountId
        })
      });
      if (!response.ok) throw new Error("Network error (budgets)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error loading budgets:", error);
    }
  }

  // update budget row in budgets table
  async updateBudgetsTable(budgetId, user, accountId, amount, year, text) {

    const URL = (this.serverStatus === 1)
      ? '/api/budgets'
      : 'http://localhost:3000/budgets';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          budgetId: budgetId,
          user: user,
          accountId: accountId,
          amount: amount,
          year: year,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (budgets)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error updateing budgets:", error);
    }
  }

  // insert budget row in budgets table
  async insertBudgetsTable(condominiumId, user, accountId, amount, year, text) {

    const URL = (this.serverStatus === 1)
      ? '/api/budgets'
      : 'http://localhost:3000/budgets';
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
          accountId: accountId,
          amount: amount,
          year: year,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (budgets)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error inserting budgets:", error);
    }
  }
  // delete budget row
  async deleteBudgetsTable(budgetId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/budgets'
      : 'http://localhost:3000/budgets';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          budgetId: budgetId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (budgets)");
      this.arrayBudgets = await response.json();
    } catch (error) {
      console.log("Error deleting budgets:", error);
    }
  }
}
