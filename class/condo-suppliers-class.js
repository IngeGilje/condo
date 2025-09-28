// class for suppliers
class Suppliers extends Condos {

  // supplier information
  suppliersArray;

  // Show all suppliers
  showAllSuppliers(classValue, supplierId) {

    let html = `
      <form 
        id="supplier"
        action="/submit"
        method="POST"
      >
        <label class="label-${classValue}"
          id="supplier"
          for="supplier">
            Velg leverandør
        </label>
        <select class="select-${classValue}" 
          id="supplier"
          name="supplier"
        >
    `;

    let selectedOption =
      false;

    // Check if supplier array is empty
    const numberOfRows = this.suppliersArray.length;
    if (numberOfRows > 0) {
      this.suppliersArray.forEach((supplier) => {
        if (supplier.supplierId >= 0) {
          if (supplier.supplierId === supplierId) {

            html += `
            <option 
              value="${supplier.supplierId}"
              selected
              >
              ${supplier.supplierId} - ${supplier.name}
            </option>
          `;
            selectedOption =
              true;
          } else {
            html += `
            <option 
              value="${supplier.supplierId}">
              ${supplier.supplierId} - ${supplier.name}
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
        Ingen leverandører
      </option>
    `;
      selectedOption =
        true;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${classValue}`).innerHTML = html;
  }

  // Find selected supplier id
  getSelectedSupplierId(classValue) {

    let supplierId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      supplierId =
        Number(document.querySelector(`.${classValue}`).value);
      supplierId = (supplierId === 0) ? this.suppliersArray.at(-1).supplierId : supplierId;
    } else {

      // Get last id in last object in user array
      supplierId = this.suppliersArray.at(-1).supplierId;
    }
    return supplierId;
  }

  // get suppliers
  async loadSuppliersTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/suppliers?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.suppliersArray = await response.json();
    } catch (error) {
      console.log("Error loading suppliers:", error);
    }
  }

  // update supplier row
  async updateSuppliersTable(supplierId,condominiumId,user,lastUpdate,name,street,address2,postalCode,city,email,phone,bankAccount,accountId,account2Id,amount) {

    try {
      console.log('accountid: ',accountId);
      const response = await fetch(`http://localhost:3000/suppliers?action=update&supplierId=${supplierId}&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&email=${email}&phone=${phone}&bankAccount=${bankAccount}&accountId=${accountId}&account2Id=${account2Id}&amount=${amount}`);
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.suppliersArray = await response.json();
    } catch (error) {
      console.log("Error updating supplier:", error);
    }
  }

  // insert supplier row
    async insertSuppliersTable(condominiumId,user,lastUpdate,name,street,address2,postalCode,city,email,phone,bankAccount,accountId,account2Id,amount) {

    try {
      const response = await fetch(`http://localhost:3000/suppliers?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&email=${email}&phone=${phone}&bankAccount=${bankAccount}&accountId=${accountId}&account2Id=${account2Id}&amount=${amount}`);
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.suppliersArray = await response.json();
    } catch (error) {
      console.log("Error inserting supplier:", error);
    }
  }

  // delete supplier row
  async deleteSuppliersTable(supplierId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/suppliers?action=delete&supplierId=${supplierId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.suppliersArray = await response.json();
    } catch (error) {
      console.log("Error deleting supplier:", error);
    }
  }
}

