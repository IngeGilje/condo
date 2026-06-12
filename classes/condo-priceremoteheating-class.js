// class for remote heating price
class PriceRemoteHeating extends Condos {

  // remote heating information
  arrayPriceRemoteHeatings;

  // get priceremoteheatings
  async loadPriceRemoteHeatingTable(condominiumId) {

    const URL = (this.serverStatus === 1)
      ? '/api/priceremoteheatings'
      : 'http://localhost:3000/priceremoteheatings';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/priceremoteheatings?action=select&condominiumId=${condominiumId}`);
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
      if (!response.ok) throw new Error("Network error (priceremoteheatings)");
      this.arrayPriceRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error loading priceremoteheatings:", error);
    }
  }

  // update a priceremoteheatings row
  async updatePriceRemoteHeatingTable(user, priceRemoteHeatingsId, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1) ? '/api/priceremoteheatings' : 'http://localhost:3000/priceremoteheatings';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          priceRemoteHeatingsId: priceRemoteHeatingsId,
          year: year,
          priceKilowattHour: priceKilowattHour
        })
      });
      if (!response.ok) throw new Error("Network error (priceremoteheatings)");
      this.arrayPriceRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error updating priceremoteheatings:", error);
    }
  }

  // insert priceremoteheatings row
  async insertPriceRemoteHeatingTable(condominiumId, user, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1) ? '/api/priceremoteheatings' : 'http://localhost:3000/priceremoteheatings';
    try {

      //const response = await fetch(`${URL}:3000/priceremoteheatings?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&priceKilowattHour=${priceKilowattHour}`);
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
      if (!response.ok) throw new Error("Network error (priceremoteheatings)");
      this.arrayPriceRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error insert priceremoteheatings:", error);
    }
  }

  // delete a priceremoteheatings row
  async deletePriceRemoteHeatingTable(priceRemoteHeatingsId, user) {

    const URL = (this.serverStatus === 1) ? '/api/priceremoteheatings' : 'http://localhost:3000/priceremoteheatings';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      //const response = await fetch(`${URL}:3000/priceremoteheatings?action=delete&priceRemoteHeatingsId=${priceRemoteHeatingsId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          priceRemoteHeatingsId: priceRemoteHeatingsId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (priceremoteheatings)");
      this.arrayPriceRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error delete priceremoteheatings:", error);
    }
  }
}