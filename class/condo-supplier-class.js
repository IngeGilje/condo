// class for supplier
class Supplier extends Condos {

  // supplier information
  supplierArray = Array;

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
    const numberOfRows = supplierArray.length;
    if (numberOfRows > 0) {
      supplierArray.forEach((supplier) => {
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

    document.querySelector(`.div-${classValue}`).innerHTML =
      html;
  }

  // Find selected supplier id
  getSelectedSupplierId(classValue) {

    let supplierId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      supplierId =
        Number(document.querySelector(`.${classValue}`).value);
      supplierId = (supplierId === 0) ? supplierArray.at(-1).supplierId : supplierId;
    } else {

      // Get last id in last object in user array
      supplierId = supplierArray.at(-1).supplierId;
    }
    return supplierId;
  }
}

