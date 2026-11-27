// The deal board: a list of verified Black Friday deals with working search and filters,
// and a page for each deal. Hash routes:
//
//   #/                 the board (filters live in the controls)
//   #/?cat=TVs&min=40  the board with filters pre-applied (shareable, and what the
//                      filtered screenshot is taken of)
//   #/deal/<id>        one deal, with its verdict, evidence, checked time and store link
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { deals } from "./data.js";
import { applyFilters, dealPage, listPage, missingPage, rows } from "./views.js";

const app = document.getElementById("app");

function readFilters() {
  const params = new URLSearchParams(location.hash.split("?")[1] ?? "");
  return {
    q: params.get("q") ?? "",
    cat: params.get("cat") ?? "All",
    store: params.get("store") ?? "All",
    min: Number(params.get("min") ?? 0) || 0,
    sort: params.get("sort") ?? "discount",
  };
}

function writeFilters(f) {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.cat !== "All") params.set("cat", f.cat);
  if (f.store !== "All") params.set("store", f.store);
  if (f.min) params.set("min", String(f.min));
  if (f.sort !== "discount") params.set("sort", f.sort);
  const query = params.toString();
  history.replaceState(null, "", query ? `#/?${query}` : "#/");
}

function render() {
  window.__shotReady = false;
  const dealMatch = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : "Not found"} | Real Black Friday Deals`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    const f = readFilters();
    document.title = "Real Black Friday Deals — verified prices, checked 27 Nov 2026";
    app.innerHTML = listPage(f);
    const grid = app.querySelector(".grid");
    const count = app.querySelector(".count");
    const refresh = () => {
      const next = {
        q: app.querySelector("#q").value,
        cat: app.querySelector("#cat").value,
        store: app.querySelector("#store").value,
        min: Number(app.querySelector("#min").value),
        sort: app.querySelector("#sort").value,
      };
      writeFilters(next);
      const shown = applyFilters(next.q, next.cat, next.store, next.min, next.sort);
      grid.innerHTML = rows(shown);
      count.innerHTML = `${shown.length} of ${deals.length} deals shown${shown.length < deals.length ? ' · <a href="#/" id="clear">Clear filters</a>' : ""}`;
      const clear = count.querySelector("#clear");
      if (clear) clear.addEventListener("click", () => history.replaceState(null, "", "#/"));
    };
    app.querySelector("#q").addEventListener("input", refresh);
    for (const id of ["#cat", "#store", "#min", "#sort"]) app.querySelector(id).addEventListener("change", refresh);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
