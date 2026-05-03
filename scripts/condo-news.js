// News maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objNews = new News('news');

const enableChanges = (objNews.securityLevel > 5);
//const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objNews.condominiumId === 0) || (objNews.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show horizonal menu
      let html = objNews.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objNews.condominiumId, resident, objNews.nineNine);
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = 0;
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews.at(-1).newsId;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, newsId);

      // Show news
      menuNumber = showNews(menuNumber, newsId);

      // Events
      events();
    }
  } else {

    objNews.showMessage(objNews, '', 'Server er ikke startet.');
  }
}

// Events for news
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterNewsId')) {

      const newsId = Number(document.querySelector('.filterNewsId').value);
      showNews(2, newsId);
    };
  });

  // update/insert a news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a news row
      const newsId = document.querySelector('.filterNewsId').value;
      updateCondoRow(newsId);
    };
  });

  // Delete news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondoRow();

      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let menuNumber = 0;

      // Show filter
      const newsId = (objNews.arrayNews.length > 0)
        ? objNews.arrayNews.at(-1).newsId
        : 0;
      menuNumber = showFilter(menuNumber, newsId);
      menuNumber = showNews(menuNumber, newsId);
    };
  });

  // Insert a news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload news table
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = Number(document.querySelector('.filterNewsId').value);
      if (newsId === 0) newsId = objNews.arrayNews.at(-1).newsId;

      showNews(2, newsId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objNews.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  //let html = objNews.startTable(tableWidth);
  let html = objNews.initializeTable(175,350,75);

  // start table body
  html += objNews.startTableBody();

  // show main header
  html += objNews.showTableHeaderLogOut('width:175px;', '1', '2Nyheter');
  html += "</tr>";

  // end table body
  html += objNews.endTableBody();

  // The end of the table
  html += objNews.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, newsId) {

  // Start table
  //let html = objNews.startTable(tableWidth);
  let html = objNews.startTable();

  // Header filter
  menuNumber++;
  html += objNews.showTableHeaderMenu('width:175px;', menuNumber, objNews.administrationMenu, '2Velg nyhet', '3');

  // start table body
  html += objNews.startTableBody();

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // news
  html += objNews.showSelectedNews('filterNewsId', 'width:175px;', newsId, '', '', true)
  html += "<td>3</td></tr>";

  // table header
  menuNumber++;
  html += objNews.showTableHeaderMenu("width:175px;", menuNumber, objNews.administrationMenu, '2', '3');

  // end table body
  html += objNews.endTableBody();

  // The end of the table
  html += objNews.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show news
function showNews(menuNumber, newsId) {

  // start table
  //let html = objNews.startTable(tableWidth);
  let html = objNews.startTable();

  // row number news array
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);

  // date
  html += "<tr>";

  menuNumber++;
  html += objNews.showTableHeaderMenu("width:175px;", menuNumber, objNews.administrationMenu, 'Dato', 'Forfatter');

  // Date, userId
  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // date
  let date = (rowNumberNews === -1)
    ? getCurrentDate()
    : objNews.arrayNews[rowNumberNews].date;
  date = formatNumberToNorDate(date);
  html += objNews.inputTableColumn('date', '', date, 10, enableChanges);

  // userId
  const userId = (rowNumberNews === -1)
    ? Number(objNews.userId)
    : Number(objNews.arrayNews[rowNumberNews].userId);
  html += objUser.showSelectedUsers('userId', 'width:175px;', userId, 'Velg forfatter', '', enableChanges);
  html += "</tr>";

  menuNumber++;
  html += objNews.insertMenu(menuNumber, '', '', objNews.administrationMenu);
  html += "<td>2</td><td>3</td></tr>";

  // title
  menuNumber++;
  html += objNews.showTableHeaderMenu("width:175px;", menuNumber, objNews.administrationMenu, '2Tittel', '3');

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  const title = (rowNumberNews === -1)
    ? ''
    : objNews.arrayNews[rowNumberNews].title;
  html += objNews.inputTableColumn('title', 'width:460px;', title, 255, enableChanges, 2);
  html += "</tr>";

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // image
  menuNumber++;
  html += objNews.showTableHeaderMenu("width:175px;", menuNumber, objNews.administrationMenu, '2Bilde', '3');

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  const image = (rowNumberNews === -1)
    ? ''
    : objNews.arrayNews[rowNumberNews].image;
  html += objNews.inputTableColumn('image', 'width:460px;', image, 255, enableChanges, 2);
  html += "</tr>";

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);
  html += "<td>2</td><td>3</td></tr>";

  // content
  menuNumber++;
  html += objNews.showTableHeaderMenu("width:175px;", menuNumber, objNews.administrationMenu, '2Innhold', '3');

  // insert a table row
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  const content = (rowNumberNews === -1)
    ? ''
    : objNews.arrayNews[rowNumberNews].content;
  html += objNews.textAreaTableColumn('content', content, 512, enableChanges, 2, 3);
  html += "</tr>";

  menuNumber++;
  html += objNews.insertMenu(menuNumber, '', '', objNews.administrationMenu);
  html += "</tr>";

  menuNumber++;
  html += objNews.insertMenu(menuNumber, '', '', objNews.administrationMenu);
  html += "</tr>";

  // Show buttons
  if (enableChanges) {

    // insert a table row
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);
    html += "<td>2</td><td>3</td></tr>";

    // insert a table row
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

    html += objNews.showButton('width:175px;', 'update', 'Oppdater');
    html += objNews.showButton('width:175px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert a table row
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

    html += objNews.showButton('width:175px;', 'delete', 'Slett');
    html += objNews.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objNews.showRestMenu(menuNumber, objNews.administrationMenu);

  // The end of the table
  html += objNews.endTable();
  document.querySelector('.news').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;

  return menuNumber;
}

// Update a news row
async function updateCondoRow(newsId) {

  if (newsId === '') newsId = -1
  newsId = Number(newsId);
  const validNewsId = objNews.validateNumber('newsId', newsId, -1, objNews.nineNine, objNews, '', 'Ugyldig leilighet');

  // validate title
  const title = document.querySelector('.title').value;
  const validTitle = objNews.validateText('title', title, 3, 45, objNews, '', 'Ugyldig tittel');

  // validate date
  let date = document.querySelector('.date').value;
  date = Number(objNews.formatNorDateToNumber(date));
  const validDate = objNews.validateNumber('date', date, 1, objNews.nineNine, objNews, '', 'Ugyldig dato');

  // validate userId  
  const userId = document.querySelector('.userId').value;
  const validUserId = objNews.validateNumber('userId', userId, 1, objNews.nineNine, objNews, '', 'Ugyldig forfatter');

  // validate image
  const image = document.querySelector('.image').value.trim();
  const validImage = objNews.validateText('image', image, 0, 255, objNews, '', 'Ugyldig bilde');

  // clean content
  let content = document.querySelector('.content').value.trim();
  content = content.replace(/<[^>]*>?/gm, "");

  if (validNewsId && validTitle && validDate && validUserId && validImage) {

    document.querySelector('.message').style.display = "none";

    // Check if the newsId exist
    const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {

      // update the news row
      await objNews.updateNewsTable(newsId, objNews.user, date, userId, title, content, image);
      await objNews.loadNewsTable(objNews.condominiumId, newsId);
    } else {

      // Insert the news row in news table
      await objNews.insertNewsTable(objNews.condominiumId, objNews.user, date, userId, title, content, image);
      await objNews.loadNewsTable(objNews.condominiumId, newsId);
      newsId = objNews.arrayNews.at(-1).newsId;
      document.querySelector('.filterNewsId').value = newsId;
    }

    menuNumber = 0;
    menuNumber = showFilter(menuNumber, newsId);
    menuNumber = showNews(menuNumber, newsId);

    objNews.removeMessage();
    document.querySelector('.filterNewsId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

// Reset all values for news
function resetValues() {

  document.querySelector('.filterNewsId').value = '';

  // date
  document.querySelector('.date').value = '';

  // title
  document.querySelector('.title').value = '';

  //  content
  document.querySelector('.content').value = '';

  //image  
  document.querySelector('.image').value = '';

  // userId
  document.querySelector('.userId').value = '';

  document.querySelector('.filterNewsId').disabled = true;

  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Delete news row
async function deleteCondoRow() {

  // newsId
  const newsId = Number(document.querySelector('.filterNewsId').value);

  // Check if news number exist
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
  if (rowNumberNews !== -1) {

    // delete a news row
    await objNews.deleteNewsTable(newsId, objNews.user);
  }
}