
// JSON handling of condo info
const accessCondoData = {

  // Name of the key to store
  nameKeyStore: "condo",

  // Remove condos JSON string
  removeCondos() {
    localStorage.removeItem(`${this.nameKeyStore}`);
  },

  createCondosObject() {

    // Check if condos JSON file exist
    let jsonString = this.getJSONScript();

    if (jsonString === null) {

      // Create JSON condos script
      jsonString = this.createCondoInfo();
    }

    // Create objects
    condos = JSON.parse(jsonString);
  },

  // Get JSON script from local storage
  getJSONScript() {

    const jsonString = localStorage.getItem(`${this.nameKeyStore}`);

    // Create object
    condos = JSON.parse(localStorage.getItem(`${this.nameKeyStore}`));

    return jsonString;
  },

  // Save condos JSON script to disk
  saveToStorage() {

    // save JSON script to local storage
    localStorage.setItem(`${this.nameKeyStore}`, JSON.stringify(condos));

    // get JSON script from local storage
    this.getJSONScript();

  },

  // Create condos info array
  // data structure
  createCondoInfo() {
    return `[{
      "condoId": "95A",
      "firstName": "Fabiana",
      "lastName": "Franco",
      "boardMembership": [],
      "address": {
        "street": "Laberget 95A",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [2591, 2591, 2591, 2591, 2591, 2591, 2591, 2591,
                2591, 2591, 2591, 2591],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "95B",
      "firstName": "Inge",
      "lastName": "Gilje",
      "boardMembership": [],
      "address": {
        "street": "Laberget 95B",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [3401, 3401, 3401, 3401, 3401, 3401, 3401, 3401,
                3401, 3401, 3401, 3401],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "97A",
      "firstName": "Kristine",
      "lastName": "Sømme",
      "boardMembership": [],
      "address": {
        "street": "Laberget 97A",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [2537, 2537, 2537, 2537, 2537, 2537, 2537,
                2537, 2537, 2537, 2537, 2537],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "97B",
      "firstName": "Ladan",
      "lastName": "Pazoki",
      "boardMembership": [],
      "address": {
        "street": "Laberget 97B",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [2245, 2245, 2245, 2245, 2245, 2245, 2245,
                2245, 2245, 2245, 2245, 2245],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "97C",
      "firstName": "Oskar",
      "lastName": "Fausk",
      "boardMembership": [],
      "address": {
        "street": "Laberget 97C",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [1811, 1811, 1811, 1811, 1811, 1811, 1811,
                1811, 1811, 1811, 1811, 1811],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "99A",
      "firstName": "Åse",
      "lastName": "Stapnes",
      "boardMembership": [],
      "address": {
        "street": "Laberget 99A",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [3431, 3431, 3431, 3431, 3431, 3431, 3431,
                3431, 3431, 3431, 3431, 3431],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]

      },
      "payment": {
        "amount":[],
        "date": []
      }
    },
    {
      "condoId": "99B",
      "firstName": "Birgit",
      "lastName": "Schober",
      "boardMembership": [],
      "address": {
        "street": "Laberget 99B",
        "postalCode": "4020",
        "city": "Stavanger"
      },
      
      "rentToPay2024": {
        "rent": [3431, 3431, 3431, 3431, 3431, 3431, 3431,
                3431, 3431, 3431, 3431, 3431],
        "date":  ["15.01.2024", "15.02.2024", "15.03.2024", "15.04.2024", "15.05.2024", 
                    "15.06.2024","15.07.2024", "15.08.2024", "15.09.2024", "15.10.2024",
                    "15.11.2024", "15.12.2024"]
      },        
      "payment": {
        "amount":[],
        "date": []
      }
    }
    ]`;
  }
};
