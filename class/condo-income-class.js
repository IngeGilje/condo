
class Income extends Condos {

  // Income information
  incomeArray = Array;

  // Show all incomes
  showAllIncomes(className, incomeId) {

    let html = `
    <form 
      id="Income"
      action="/submit"
      method="POST"
    >
      <label 
        id="Income"
        class="label-${className} 
        label-${className}"
        for="Income">
          Velg innbetaling
      </label>
      <select 
        id="Income"
        class="select-${className}" 
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

    document.querySelector(`.div-${className}`).innerHTML =
     html;
  }

  // Find selected income id
  getSelectedIncomeId(className) {

    let incomeId = 0;

    // Check if HTML class exist
    className = `select-${className}`;
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

