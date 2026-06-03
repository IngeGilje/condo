// News maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objNews = new News('news');

const enableChanges = (objNews.securityLevel > 5);

const columnWidths = [175, 175, 175, 175];

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
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews[0].newsId;

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

    objNews.showMessageNew(columnWidths, '', 'Server er ikke startet.');
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
        ? objNews.arrayNews[0].newsId
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
      if (newsId === 0) newsId = objNews.arrayNews[0].newsId;

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
  let html = objNews.initializeTable(columnWidths);

  // start table body
  html += objNews.startTableBody();

  // show main header
  html += objNews.showTableHeaderLogOut('', '', 'Nyheter');
  html += "</tr>";

  // end table body
  html += objNews.endTableBody();

  // The end of the table
  html += objNews.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, newsId) {

  // Start table
  let html = objNews.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '','center', 'Velg nyhet', '');

  // start table body
  html += objNews.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // news
  html += objNews.showSelectedNews('filterNewsId', 'width:175px;', newsId, '', '', true);
  html += "<td></td></tr>";

  // Table header (<tr></tr>)
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '', 'center','', '');

  // end table body
  html += objNews.endTableBody();

  // The end of the table
  html += objNews.endTable();
  document.querySelector('.editFilter').innerHTML = html;

  return menuNumber;
}

// Show news
function showNews(menuNumber, newsId) {

  // start table
  let html = objNews.initializeTable(columnWidths);

  // row number news array
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);

  // date
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '','center', 'Dato', 'Forfatter');

  // Date, userId
  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // date
  let date = (rowNumberNews === -1)
    ? getCurrentDate()
    : objNews.arrayNews[rowNumberNews].date;
  date = formatNumberToNorDate(date);
  html += objNews.editTableCell('date',  date, 10, enableChanges);

  // userId
  const userId = (rowNumberNews === -1)
    ? Number(objNews.userId)
    : Number(objNews.arrayNews[rowNumberNews].userId);
  html += objUser.showSelectedUsers('userId', 'width:175px;', userId, 'Velg forfatter', '', enableChanges);
  html += "</tr>";

  menuNumber++;
  html += objNews.insertMenu(menuNumber, '', '', objNews.administrationMenu);
  html += "<td></td><td></td></tr>";

  // title
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '','center', 'Tittel', '');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  const title = (rowNumberNews === -1)
    ? ''
    : objNews.arrayNews[rowNumberNews].title;
  html += objNews.editTableCell('title',  title, 255, enableChanges, 2);
  html += "<td></td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  // image
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '','center', 'Bilde', '');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

  const image = (rowNumberNews === -1)
    ? ''
    : objNews.arrayNews[rowNumberNews].image;
  html += objNews.editTableCell('image', image, 255, enableChanges, 2);
  html += "<td></td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);
  html += "<td></td><td></td></tr>";

  // content
  menuNumber++;
  html += objNews.showTableHeaderMenu(menuNumber, objNews.administrationMenu, '','center', 'Innhold', '');

  // insert a table row (<tr></td>)
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

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);
    html += "<td></td><td></td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

    html += objNews.showButton('update', 'Oppdater');
    html += objNews.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objNews.insertTableRow('', menuNumber, objNews.administrationMenu);

    html += objNews.showButton('delete', 'Slett');
    html += objNews.showButton('insert', 'Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objNews.showRestMenu(menuNumber, objNews.administrationMenu, '', '', '');

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
  const validNewsId = objNews.validateInterval('newsId', columnWidths, '', 'Ugyldig leilighet', true, newsId, -1, objNews.nineNine);

  // validate title
  const title = document.querySelector('.title').value;
  const validTitle = objNews.validateText('title', columnWidths, '', 'Ugyldig tittel', true, title, 3, 45);

  // validate date
  let date = document.querySelector('.date').value;
  date = Number(objNews.formatNorDateToNumber(date));
  const validDate = objNews.validateInterval('date', columnWidths, '', 'Ugyldig dato', true, date, 1, objNews.nineNine);

  // validate userId  
  const userId = Number(document.querySelector('.userId').value);
  const validUserId = objNews.validateInterval('userId', columnWidths,    '', 'Ugyldig forfatter',              true,userId, 1, objNews.nineNine);

  // validate image
  const image = document.querySelector('.image').value.trim();
  const validImage = objNews.validateText('image', columnWidths, '', 'Ugyldig bilde', true, image, 0, 255);

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
      // newsId = objNews.arrayNews.at(-1).newsId;
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