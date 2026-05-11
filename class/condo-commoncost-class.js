// class for commoncosts
class CommonCost extends Condos {

  // common cost information
  arrayCommonCost;

  // Get selected common cost id
  getSelectedCommonCostId(className) {

    letcommonCostId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      commonCostId = Number(document.querySelector(`.${className}`).value);
      commonCostId = (commonCostId === 0) ? this.arrayCommonCosts.at(-1).commonCostId : commonCostId;
    } else {

      // Get last id in last object in commonCost array
      commonCostId = this.arrayCommonCosts.at(-1).commonCostId;
    }

    returncommonCostId;
  }

  /*
  // Select common cost Id
  selectCommonCostId(commonCostId, className) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCost !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;
      return true;
    } else {

      return false;
    }
  }
  */

  /*
  // Select commonCost Id
  selectCommonCostId(commonCostId) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCost !== -1) commonCostId = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;

    returncommonCostId;
  }
  */

  // get commoncosts
  async loadCommonCostsTable(condominiumId) {

    const URL = (this.serverStatus === 1) ? '/api/commoncosts' : 'http://localhost:3000/commoncosts';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/commoncosts?action=select&condominiumId=${condominiumId}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error loading commoncosts:", error);
    }
  }

  // update a commoncosts row
  async updateCommonCostsTable(user, commonCostId, year, commonCostSquareMeter, fixedCostCondo) {

    const URL = (this.serverStatus === 1) ? '/api/commoncosts' : 'http://localhost:3000/commoncosts';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/commoncosts?action=update&user=${user}&commonCostId=${commonCostId}&year=${year}&commonCostSquareMeter=${commonCostSquareMeter}&fixedCostCondo=${fixedCostCondo}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          commonCostId: commonCostId,
          year: year,
          commonCostSquareMeter: commonCostSquareMeter,
          fixedCostCondo: fixedCostCondo
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error updating commoncosts:", error);
    }
  }

  // insert commoncosts row
  async insertCommonCostsTable(condominiumId, user, year, commonCostSquareMeter, fixedCostCondo) {

    const URL = (this.serverStatus === 1) ? '/api/commoncosts' : 'http://localhost:3000/commoncosts';
    try {

      //const response = await fetch(`${URL}:3000/commoncosts?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&commonCostSquareMeter=${commonCostSquareMeter}&fixedCostCondo=${fixedCostCondo}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          year: year,
          commonCostSquareMeter: commonCostSquareMeter,
          fixedCostCondo: fixedCostCondo
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error insert commoncosts:", error);
    }
  }

  // delete a commoncosts row
  async deleteCommonCostsTable(commonCostId, user) {

    const URL = (this.serverStatus === 1) ? '/api/commoncosts' : 'http://localhost:3000/commoncosts';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      //const response = await fetch(`${URL}:3000/commoncosts?action=delete&commonCostId=${commonCostId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          commonCostId: commonCostId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error delete commoncosts:", error);
    }
  }
}