import "./style.css";
import "./components/header/header.css";
import "./components/footer/footer.css";
import "./components/news/news.css";
import "./components/live/live.css";
import "./components/home/home.css";
import "./components/main-visual/main-visual.css";
import "./components/team-introduction/team-introduction.css";
import "./components/convention/convention.css";
import "./components/main-button/main-button.css";
import "./components/record/record.css";
import "./components/searchbar/search-Bar.css";
import "./components/user-info/user-Info.css";
import "./components/other-info/other-Info.css";
import "./components/score-info/score-info.css";
import "./components/total-statistics/total-statistics.css";
import "./components/score-detail/score-detail.css";

import { renderHeader } from "./components/header/header.js";
import { renderFooter } from "./components/footer/footer.js";
import { renderNewsPage } from "./components/news/news.js";
import { renderLivePage } from "./components/live/live.js";
import { renderHomePage } from "./components/home/home.js";
import { renderScorePage } from "./components/score/score.js";

function getHeaderElement() {
  return document.getElementById("header");
}

function getMainElement() {
  return document.getElementById("main");
}

function getFooterElement() {
  return document.getElementById("footer");
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlParams.entries());
}

function updateURL(path, params = {}) {
  const url = new URL(window.location);
  url.pathname = path;
  
  url.search = "";
  
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.set(key, params[key]);
    }
  });
  
  window.history.pushState({}, "", url);
}

export async function routeTo(page, params = {}) {
  const main = getMainElement();
  
  updateURL(`/${page}`, params);
  
  if (page === "home" || page === "") {
    await renderHomePage(main);
  } else if (page === "news") {
    await renderNewsPage(main);
  } else if (page === "live") {
    await renderLivePage(main);
  } else if (page === "score") {
    await renderScorePage(main, params);
  } else {
    main.innerHTML = "<h1>404 Not Found</h1>";
  }
}

function handlePopState() {
  const path = window.location.pathname.slice(1) || "home";
  const params = getUrlParams();
  routeTo(path, params);
}

export async function initApp() {
  await renderHeader(getHeaderElement());
  
  const path = window.location.pathname.slice(1) || "home";
  const params = getUrlParams();
  await routeTo(path, params);
  
  await renderFooter(getFooterElement());
  
  window.routeTo = routeTo;
  
  window.addEventListener("popstate", handlePopState);
}

document.addEventListener("DOMContentLoaded", initApp);
