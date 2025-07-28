
showButton('condominium-cancel', 'Cancel');

//document.querySelector(`.div-condominium-save`).innerHTML =
//`<i class="fa-regular fa-file"></i>`

// Show button
function showButton(className, buttonText) {

  let iconClass
  iconClass =
    className.includes("-insert") ? "fa-regular fa-plus" : '';
  iconClass =
    className.includes("-save") ? "fa-regular fa-download" : iconClass;
  iconClass =
    className.includes("-cancel") ? "fa-regular fa-trash" : iconClass;

  document.querySelector(`.div-${className}`).innerHTML =
    `
      <button 
        class="${iconClass} button-${className}" 
      >
        ${buttonText}       
      </button>
    `;
}