
class Income extends Condos {

  // Income information
  incomeArray = Array;

  // Show all incomes
  showAllIncomes(columnName, incomeId) {

    let html = `
    <form action="/submit" method="POST">
      <label class="label-income-${columnName} label-income-${columnName}"
        for="Income">
          Velg innbetaling
      </label>
      <select class="select-income-${columnName} select-income-${columnName}" 
      >
    `;

    // Check if income array is empty
    const numberOfRows = incomeArray.length;
    if (numberOfRows > 1) {
      incomeArray.forEach((income) => {
        if (income.incomeId > 1) {
          if (income.incomeId === incomeId) {

            html += `
          <option 
            value="${income.incomeId}"
            selected
            >
            ${income.incomeId} - ${income.text}
          </option>
        `;
          } else {
            html += `
          <option 
            value="${income.incomeId}">
            ${income.incomeId} - ${income.text}
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
          Ingen innbetalinger
        </option>
      `;
    }

    html += `
        </select >
      </form>
    `;

    document.querySelector(`.div-income-${columnName}`).innerHTML =
     html;
  }

  /*
  // Get all incomes from MySQL database
  getIncomes(socket) {

    const SQLquery = `
      SELECT * FROM income
      ORDER BY text;
    `;
    socket.send(SQLquery);
  }
  */

  // Find selected income id
  getSelectedIncomeId(columnName) {

    let incomeId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      incomeId =
        Number(document.querySelector(`.${className}`).value);
        incomeId = (incomeId === 0) ? incomeArray.at(-1).incomeId : incomeId;
    } else {

      // Get last id in last object in income array
      incomeId = incomeArray.at(-1).incomeId;
    }

    return incomeId;
  }
}

