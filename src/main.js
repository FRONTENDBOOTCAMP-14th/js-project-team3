// import { renderHeader } from './components/header/header.js';
// import { renderFooter } from './components/footer/footer.js';
import { renderNewsPage } from './components/news/news.js';

// function getHeaderElement() {
//   return document.getElementById('header');
// }

function getMainElement() {
  return document.getElementById('main');
}

// function getFooterElement() {
//   return document.getElementById('footer');
// }

export async function routeTo(page) {
  const main = getMainElement();
  if (page === 'news') {
    await renderNewsPage(main);
  } else {
    main.innerHTML = '<h1>404 Not Found</h1>';
  }
}

export async function initApp() {
  //await renderHeader(getHeaderElement());
  await routeTo('news');
  //await renderFooter(getFooterElement());
  window.routeTo = routeTo;
}

document.addEventListener('DOMContentLoaded', initApp);
