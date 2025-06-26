
class Overview extends Condos {

  // Find selected bankAccountMovement Id
  getSelectedBankAccountMovementId(className) {

    let bankAccountMovementId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      bankAccountMovementId =
        Number(document.querySelector(`.select-${className}`).value);
      bankAccountMovementId =
        (bankAccountMovementId === 0) ? accountArray.at(-1).bankAccountMovementId : bankAccountMovementId;
    } else {

      // Get last id in last object in bank account movement array
      bankAccountMovementId =
        accountArray.at(-1).bankAccountMovementId;
    }

    return bankAccountMovementId;
  }
}
