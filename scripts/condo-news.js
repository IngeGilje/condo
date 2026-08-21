// News maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objNews = new News('news');

const enableChanges = (objNews.securityLevel > 5);
const applicationName = "condo-news";

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

            // Show vertical menu
      let html = objNews.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objNews.showHorizontalMenu("filter-frame", objNews.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show news menu
      html = objNews.showHorizontalMenu("filter-frame", objNews.arrayMenuNews);
      document.querySelector('.menuNews').innerHTML = html;
      objNews.markActivatedApplication(objNews.arrayMenuNews, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objNews.condominiumId, resident, objNews.nineNine);
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = 0;
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews[0].newsId;

      // Show filter
      showFilter(newsId);

      // Show news
      showNews(newsId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for news
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterNewsId')) {

      const newsId = Number(document.querySelector('.filterNewsId').value);
      showNews(newsId);
    };
  });

  // update/insert a news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a news row
      const newsId = document.querySelector('.filterNewsId').value;
      updateNewsRow(newsId);
    };
  });

  // Delete news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let newsId = Number(document.querySelector('.filterNewsId').value);
      await deleteNewsRow(newsId);

      // Show last row in news tabel
      await objNews.getHighestNewsId(objNews.condominiumId);
      newsId = objNews.arrayNews.at(-1)?.newsId ?? 0;
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      // Show filter
      showFilter(newsId);

      // Show news
      showNews(newsId);
    };
  });

  // insert a new news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Insert new news row
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

      // Show filter
      showFilter(newsId);

      // show news
      showNews(newsId);
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

// Show filter
function showFilter(newsId) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show news
  html += objNews.showSelectedNewsNew('Nyhet', 'filterNewsId', '', newsId, '', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show news
function showNews(newsId) {

  // row number news array
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);

  // Empty line
  let html = emptyLine();

  // news date
  html += startLine();
  let newsDate = objNews.arrayNews[rowNumberNews]?.date ?? 0;
  newsDate = formatNumberToISODate(newsDate);
  html += showDate('Dato', 'newsDate', newsDate, enableChanges);
  html += "</div>";

  // userId
  html += startLine();
  const userId = objNews.arrayNews[rowNumberNews]?.userId ?? 0;
  html += objUser.showSelectedUsersNew('Forfatter', 'userId', '', userId, 'Velg forfatter', '', true);
  html += "</div>";

  // title
  html += startLine();
  const title = objNews.arrayNews[rowNumberNews]?.title ?? '';
  html += showTextArea('Tittel', 'title', title, 45, enableChanges, 2);
  html += "</div>";

  // content
  html += startLine();
  const content = objNews.arrayNews[rowNumberNews]?.content ?? '';
  html += showTextArea('Innhold', 'content', content, 512, enableChanges, 6);
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showNews').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterNewsId', false, 'white');
  }
}

// Update a news row
async function updateNewsRow(newsId) {

  if (newsId === '') newsId = -1
  newsId = Number(newsId);
  const validNewsId = validateIntervalNew('newsId', '', 'Ugyldig Leilighet', true, newsId, 0, objNews.nineNine);

  // validate title
  const title = document.querySelector('.title').value.trim();
  const validTitle = validateTextNew('title',    '', 'Ugyldig Tittel',               true, title, 3, 45);
 
  // validate date
  let date = document.querySelector('.newsDate').value;
  date = Number(objNews.formatDateToNumber(date));
  const validDate = validateIntervalNew('date', '', 'Ugyldig Dato', true, date, 1, objNews.nineNine);

  // validate userId  
  const userId = Number(document.querySelector('.userId').value);
  const validUserId = validateIntervalNew('userId', '', 'Ugyldig forfatter', true, userId, 1, objNews.nineNine);

  // clean content
  let content = document.querySelector('.content').value.trim();
  //content = content.replace(/<[^>]*>?/gm, "");
  const validContent = validateTextNew('content', '', 'Ugyldig innhold', true, content, 3, 512);

  if (validTitle && validDate && validUserId && validContent) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the newsId exist
    const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {

      // update the news row
      await objNews.updateNewsTable(newsId, objNews.user, date, userId, title, content, '');
      await objNews.loadNewsTable(objNews.condominiumId, newsId);
    } else {

      // Insert the news row in news table
      await objNews.insertNewsTable(objNews.condominiumId, objNews.user, date, userId, title, content, '');
      await objNews.getHighestNewsId(objNews.condominiumId);
      newsId = objNews.arrayNews.at(-1)?.newsId ?? 0;
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);
    }

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterNewsId', false, 'white');
    }

    // Show filter
    showFilter(newsId);

    // Show news
    showNews(newsId);
  }
  */
    document.querySelector('.showMessage').style.display = "none";

    // Check if the news row exist
    const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {

      // update the news row
      await objNews.updateNewsTable(newsId, objNews.user, date, userId, title, content, '');
    } else {

      // Insert a news row
      await objNews.insertNewsTable(objNews.condominiumId, objNews.user, date, userId, title, content, '');
      await objNews.getHighestNewsId(objNews.condominiumId);
      newsId = objNews.arrayNews.at(-1)?.newsId ?? 0;
    }

    await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterNewsId', false);
    }

    // Show filter
    showFilter(newsId);

    // Show news
    showNews(newsId);
  }
}

// Reset all values for news
function resetValues() {

  document.querySelector('.filterNewsId').value = '';

  // news date
  const newsDate = getCurrentISODate();
  document.querySelector('.newsDate').value = newsDate;

  // title
  document.querySelector('.title').value = '';

  //  content
  document.querySelector('.content').value = '';

  // userId
  document.querySelector('.userId').value = '';

  document.querySelector('.filterNewsId').disabled = true;

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterNewsId', true);
  }
}

// Delete news row
async function deleteNewsRow(newsId) {

  // Check if news number exist
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
  if (rowNumberNews !== -1) {

    // delete a news row
    await objNews.deleteNewsTable(newsId, objNews.user);
  }
}