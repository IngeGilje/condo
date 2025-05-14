
class Payment extends Condos {

  // Payment information
  paymentArray = Array;

  // Show all payments
  showAllPayments(columnName, paymentId) {

    let html = `
    <form action="/submit" method="POST">
      <label class="label-payment-${columnName} label-payment-${columnName}"
        for="Payment">
          Velg betaling
      </label>
      <select class="select-payment-${columnName} select-payment-${columnName}" 
      >
    `;

    // Check if payment array is empty
    const numberOfRows = paymentArray.length;
    if (numberOfRows > 1) {
      paymentArray.forEach((payment) => {
        if (payment.paymentId > 1) {
          if (payment.paymentId === paymentId) {

            html += `
          <option 
            value="${payment.paymentId}"
            selected
            >
            ${payment.paymentId} - ${payment.text}
          </option>
        `;
          } else {
            html += `
          <option 
            value="${payment.paymentId}">
            ${payment.paymentId} - ${payment.textext}
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
          Ingen betalinger
        </option>
      `;
    }

    html += `
        </select >
      </form>
    `;

    document.querySelector(`.div-payment-${columnName}`).innerHTML = html;
  }

  /*
  // Get all payments from MySQL database
  getPayments(socket) {

    const SQLquery = `
      SELECT * FROM payment
      ORDER BY paymentText;
    `;
    socket.send(SQLquery);
  }
  */

  // Find selected payment id
  getSelectedPaymentId(columnName) {

    let paymentId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      paymentId =
        Number(document.querySelector(`.${className}`).value);
      paymentId = (paymentId === 0) ? paymentArray.at(-1).paymentId : paymentId;
    } else {

      // Get last id in last object in payment array
      paymentId = paymentArray.at(-1).paymentId;
    }

    return paymentId;
  }
}

