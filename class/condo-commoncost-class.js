// class for commoncosts
class CommonCost extends Condos {

  // common cost information
  arrayCommonCost;

  // Show all selected commoncosts
  showSelectedCommonCostsNew(className, style, commonCostsId, selectNone, selectAll) {

    let selectedValue = false;

    let html =
      `
        <td
          class="center one-line"
        >
          <select 
            class="${className} center"
            style="${style}"
          >
      `;

    // Check if commoncosts array is empty
    const numberOfRows = this.arrayCommonCosts.length;
    if (numberOfRows > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {
        if (commonCost.commonCostsId === commonCostsId) {

          html +=
            `
              <option 
                value=${commonCost.commonCostsId}
                selected
              >
                ${commonCost.name}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${commonCost.commonCostsId}">
                ${commonCost.name}
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
            Ingen konti
          </option>
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=${this.nineNine}
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
        html +=
          `
          <option 
            value=0
          >
            ${selectNone}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=0
              selected
            >
              ${selectNone}
            </option>
          `;
        selectedValue = true;
      }
    }

    html +=
      `
          </select >
        </td>
      `;

    return html;
  }
  
  // Get selected common cost id
  getSelectedCommonCostId(className) {

    let commonCostsId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      commonCostsId = Number(document.querySelector(`.${className}`).value);
      commonCostsId = (commonCostsId === 0) ? this.arrayCommonCosts.at(-1).commonCostsId : commonCostsId;
    } else {

      // Get last id in last object in commonCost array
      commonCostsId = this.arrayCommonCosts.at(-1).commonCostsId;
    }

    return commonCostsId;
  }

  // Show all CommonCosts
  showSelectedCommonCostsHTML(className, commonCostsId, selectAll) {

    commonCostsId = Number(commonCostsId);

    let html =
      `
        <div>
          <label 
          >
            Velg Konto
          </label>
          <select
            class="${className}"
          > 
      `;

    // Check if commonCost array is empty
    if (this.arrayCommonCosts.length > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {

        if (commonCost.commonCostsId === commonCostsId) {
          html +=
            `
              <option
                value = "${commonCost.commonCostsId}"
                selected
              >
                ${commonCost.commonCostsId} - ${commonCost.name}
              </option >
            `;
          selectedValue = true;
        } else {

          html +=
            `
            <option
              value = "${commonCost.commonCostsId}"
            >
              ${commonCost.commonCostsId} - ${commonCost.name}
            </option >
          `;
        }
      });

    } else {

      html +=
        `
          <option 
            value = "0"
            selected
          >
            Ingen leiligheter
          </option >
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll) {

      html +=
        `
        <option 
          value=${this.nineNine}
          selected
        >
          ${selectAll}
        </option>
      `;
      selectedValue = true;
    }

    html +=
      `
        </select >
      </div>
    `;

    return html;
  }

  // Select common cost Id
  selectCommonCostId(commonCostsId, className) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostsId === commonCostsId);
    if (rowNumberCommonCost !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayCommonCosts[rowNumberCommonCost].commonCostsId;
      return true;
    } else {

      return false;
    }
  }

  // Select commonCost Id
  selectCommonCostIdNew(commonCostsId) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostsId === commonCostsId);
    if (rowNumberCommonCost !== -1) commonCostsId = this.arrayCommonCosts[rowNumberCommonCost].commonCostsId;

    return commonCostsId;
  }

  // Show all selected commoncosts
  showSelectedCommonCostsNew(className, style, commonCostsId, selectNone, selectAll) {

    let selectedValue = false;

    let html =
      `
        <td
          class="centerCell one-line center"
        >
          <select 
            class="${className} center"
      `;
      if (style !== '') html += `style="${style}"`;
      html += `>`;

    // Check if CommonCosts array is empty
    if (this.arrayCommonCosts.length > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {
        if (commonCost.commonCostsId === commonCostsId) {

          html +=
            `
              <option 
                value=${commonCost.commonCostsId}
                selected
              >
                ${commonCost.name}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${commonCost.commonCostsId}">
                ${commonCost.name}
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
            Ingen konti
          </option>
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCommonCosts.length > 1)) {

      html +=
        `
          <option 
            value=${this.nineNine}
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayCommonCosts.length > 1)) {
      if (selectedValue) {
        html +=
          `
          <option 
            value=0
          >
            ${selectNone}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=0
              selected
            >
              ${selectNone}
            </option>
          `;
        selectedValue = true;
      }
    }

    html +=
      `
          </select >
        </td>
      `;

    return html;
  }

  // get commoncosts
  async loadCommonCostsTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/commoncosts?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error loading commoncosts:", error);
    }
  }

  // update a commoncosts row
  async updateCommonCostsTable(user, commonCostsId, year, amount) {

    try {
      const response = await fetch(`http://localhost:3000/commoncosts?action=update&user=${user}&commonCostsId=${commonCostsId}&year=${year}&amount=${amount}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error updating commoncosts:", error);
    }
  }

  // insert commoncosts row
  async insertCommonCostsTable(condominiumId, user, year, amount) {

    try {
      const response = await fetch(`http://localhost:3000/commoncosts?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&amount=${amount}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error insert commoncosts:", error);
    }
  }

  // delete a commoncosts row
  async deleteCommonCostsTable(commonCostsId, user) {

    try {
      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      const response = await fetch(`http://localhost:3000/commoncosts?action=delete&commonCostsId=${commonCostsId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error delete commoncosts:", error);
    }
  }
}