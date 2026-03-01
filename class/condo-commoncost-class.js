// class for commoncosts
class CommonCost extends Condos {

  // common cost information
  arrayCommonCost;

  // Show all selected commoncosts
  showSelectedCommonCosts(className, style,commonCostId, selectNone, selectAll) {

    let selectedValue = false;

    let html = `
    <td
      class="center one-line"
    >
      <select 
        class="${className} center"
        ${(style) ? `style=${style}` : 'style=width:175px;'}
      >`;

    // Check if commoncosts array is empty
    const numberOfRows = this.arrayCommonCosts.length;
    if (numberOfRows > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {
        if (commonCost.commonCostId ===commonCostId) {

          html +=
            `
              <option 
                value=${commonCost.commonCostId}
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
                value="${commonCost.commonCostId}">
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

    letcommonCostId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

     commonCostId = Number(document.querySelector(`.${className}`).value);
     commonCostId = (commonCostId === 0) ? this.arrayCommonCosts.at(-1).commonCostId :commonCostId;
    } else {

      // Get last id in last object in commonCost array
     commonCostId = this.arrayCommonCosts.at(-1).commonCostId;
    }

    returncommonCostId;
  }

  // Show all CommonCosts
  showSelectedCommonCostsHTML(className,commonCostId, selectAll) {

   commonCostId = Number(commonCostId);

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

        if (commonCost.commonCostId ===commonCostId) {
          html +=
            `
              <option
                value = "${commonCost.commonCostId}"
                selected
              >
                ${commonCost.commonCostId} - ${commonCost.name}
              </option >
            `;
          selectedValue = true;
        } else {

          html +=
            `
            <option
              value = "${commonCost.commonCostId}"
            >
              ${commonCost.commonCostId} - ${commonCost.name}
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
  selectCommonCostId(commonCostId, className) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId ===commonCostId);
    if (rowNumberCommonCost !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;
      return true;
    } else {

      return false;
    }
  }

  // Select commonCost Id
  selectCommonCostIdNew(commonCostId) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId ===commonCostId);
    if (rowNumberCommonCost !== -1)commonCostId = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;

    returncommonCostId;
  }

  // Show all selected commoncosts
  showSelectedCommonCosts(className, style,commonCostId, selectNone, selectAll) {

    let selectedValue = false;

    let html = `
    <td
      class="centerCell one-line center"
    >
      <select 
        class="${className} center"
        ${(style) ? `style=${style}` : 'style="width:175px;"'}
      >`;

    // Check if CommonCosts array is empty
    if (this.arrayCommonCosts.length > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {
        if (commonCost.commonCostId ===commonCostId) {

          html +=
            `
              <option 
                value=${commonCost.commonCostId}
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
                value="${commonCost.commonCostId}">
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
  async updateCommonCostsTable(user, commonCostId, year, commonCostSquareMeter, fixedCostCondo) {

    try {
      const response = await fetch(`http://localhost:3000/commoncosts?action=update&user=${user}&commonCostId=${commonCostId}&year=${year}&commonCostSquareMeter=${commonCostSquareMeter}&fixedCostCondo=${fixedCostCondo}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error updating commoncosts:", error);
    }
  }

  // insert commoncosts row
  async insertCommonCostsTable(condominiumId, user, year, commonCostSquareMeter, fixedCostCondo) {

    try {
      const response = await fetch(`http://localhost:3000/commoncosts?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&commonCostSquareMeter=${commonCostSquareMeter}&fixedCostCondo=${fixedCostCondo}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error insert commoncosts:", error);
    }
  }

  // delete a commoncosts row
  async deleteCommonCostsTable(commonCostId, user) {

    try {
      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      const response = await fetch(`http://localhost:3000/commoncosts?action=delete&commonCostId=${commonCostId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error delete commoncosts:", error);
    }
  }
}