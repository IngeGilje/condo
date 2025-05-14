

class Pizza {

  // Private for this Pizza class
  #sauce = "traditional";
  constructor(size) {
    this.size = size;
    this.crust = "original";
  }

  // Set pizza crust
  setCrust(crust){

    this.crust = crust;
  }

  // get pizza crust
  getCrust(){

    return this.crust;
  }
}




