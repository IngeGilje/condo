// class for remote heating price
class RemoteHeatingPrice extends Condos {

  // remote heating information
  arrayRemoteHeatingPrices;

  // get remoteheatingprices
  async loadRemoteHeatingPricesTable(condominiumId) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatingprices' : 'http://localhost:3000/remoteheatingprices';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/remoteheatingprices?action=select&condominiumId=${condominiumId}`);
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
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error loading remoteheatingprices:", error);
    }
  }

  // update a remoteheatingprices row
  async updateRemoteHeatingPricesTable(user, remoteHeatingPriceId, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatingprices' : 'http://localhost:3000/remoteheatingprices';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          remoteHeatingPriceId: remoteHeatingPriceId,
          year: year,
          priceKilowattHour: priceKilowattHour
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error updating remoteheatingprices:", error);
    }
  }

  // insert remoteheatingprices row
  async insertRemoteHeatingPricesTable(condominiumId, user, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatingprices' : 'http://localhost:3000/remoteheatingprices';
    try {

      //const response = await fetch(`${URL}:3000/remoteheatingprices?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&priceKilowattHour=${priceKilowattHour}`);
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
          priceKilowattHour: priceKilowattHour
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error insert remoteheatingprices:", error);
    }
  }

  // delete a remoteheatingprices row
  async deleteRemoteHeatingPricesTable(remoteHeatingPriceId, user) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatingprices' : 'http://localhost:3000/remoteheatingprices';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      //const response = await fetch(`${URL}:3000/remoteheatingprices?action=delete&remoteHeatingPriceId=${remoteHeatingPriceId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          remoteHeatingPriceId: remoteHeatingPriceId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error delete remoteheatingprices:", error);
    }
  }
}