// HTML for the deal board, built from the deal data. Every value is escaped before it goes into the page.
// The board's job is to prove each deal in one frame: price, usual price, discount, the verdict with
// its evidence, the store, and when and where the price was checked. Prices were read on
// 27 November 2026 from the sources named on each deal; a second source is named wherever one
// confirmed the same price, so a single mistyped listing cannot put a deal on the board.

import { CATEGORIES, STORES, VERDICTS, deals } from "./data.js";

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const pct = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const when = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
const per = (d) => (d.per ? `/${d.per}` : "");

export function stats() {
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  const totalSaved = deals.reduce((sum, d) => sum + saved(d), 0);
  const best = [...deals].sort((a, b) => pct(b) - pct(a))[0];
  return { count: deals.length, newLows, totalSaved, best, stores: STORES.length, categories: CATEGORIES.length };
}

function verdictChip(d) {
  const v = VERDICTS[d.verdict];
  return `<span class="verdict verdict-${d.verdict}" title="${escape(v.blurb)}">${escape(v.label)}</span>`;
}

function card(d) {
  return `<li class="card">
  <a class="card-title" href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
  <div class="card-meta"><span class="store">${escape(d.store)}</span><span class="cat">${escape(d.category)}</span></div>
  <div class="card-price"><strong>${usd(d.price)}${per(d)}</strong> <s>${usd(d.was)}${per(d)}</s> <span class="off">−${pct(d)}%</span></div>
  <div class="card-save">You save ${usd(saved(d))}${per(d)}</div>
  <div class="card-verdict">${verdictChip(d)}</div>
  <p class="card-note">${escape(d.note)}</p>
  <p class="card-checked">Checked ${when(d.checked)}</p>
</li>`;
}

export function rows(list) {
  if (list.length === 0) return '<li class="empty">No deal matches those filters. Try clearing the search or lowering the minimum discount.</li>';
  return list.map(card).join("");
}

export function applyFilters(query, category, store, minOff, sort) {
  const q = query.trim().toLowerCase();
  let list = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (category !== "All" && d.category !== category) return false;
    if (store !== "All" && d.store !== store) return false;
    if (minOff > 0 && pct(d) < minOff) return false;
    return true;
  });
  if (sort === "discount") list = [...list].sort((a, b) => pct(b) - pct(a));
  else if (sort === "saving") list = [...list].sort((a, b) => saved(b) - saved(a));
  else if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

function options(values, current) {
  return values.map((v) => `<option value="${escape(v)}"${v === current ? " selected" : ""}>${escape(v)}</option>`).join("");
}

export function listPage(f) {
  const s = stats();
  const shown = applyFilters(f.q, f.cat, f.store, f.min, f.sort);
  return `<section class="hero">
  <p class="kicker">BLACK FRIDAY · FRIDAY 27 NOVEMBER 2026 · PRICES CHECKED TODAY</p>
  <h1>Real Black Friday deals, checked today</h1>
  <p class="lede">Every price on this board was verified against a live deals source on Black Friday itself.
  Each deal carries its usual price, its discount, a verdict on whether it is really a deal — with the
  evidence — and the time it was checked. No was-price is invented here.</p>
  <ul class="statbar">
    <li><strong>${s.count}</strong> verified deals</li>
    <li><strong>${s.newLows}</strong> new all-time lows</li>
    <li><strong>${s.stores}</strong> stores</li>
    <li><strong>${s.categories}</strong> categories</li>
    <li><strong>${usd(s.totalSaved)}</strong> total savings if you bought one of each</li>
  </ul>
  <p class="best">Biggest cut on the board: <a href="#/deal/${encodeURIComponent(s.best.id)}">${escape(s.best.title)}</a> — ${pct(s.best)}% off.</p>
</section>
<section class="controls" aria-label="Find a deal">
  <label class="search">Search <input id="q" type="search" placeholder="AirPods, TV, Dyson…" value="${escape(f.q)}"></label>
  <label>Category <select id="cat">${options(["All", ...CATEGORIES], f.cat)}</select></label>
  <label>Store <select id="store">${options(["All", ...STORES], f.store)}</select></label>
  <label>At least <select id="min">
    <option value="0"${f.min === 0 ? " selected" : ""}>any discount</option>
    <option value="25"${f.min === 25 ? " selected" : ""}>25% off</option>
    <option value="40"${f.min === 40 ? " selected" : ""}>40% off</option>
    <option value="50"${f.min === 50 ? " selected" : ""}>50% off</option>
  </select></label>
  <label>Sort <select id="sort">
    <option value="discount"${f.sort === "discount" ? " selected" : ""}>biggest discount</option>
    <option value="saving"${f.sort === "saving" ? " selected" : ""}>biggest saving ($)</option>
    <option value="price-low"${f.sort === "price-low" ? " selected" : ""}>lowest price</option>
    <option value="price-high"${f.sort === "price-high" ? " selected" : ""}>highest price</option>
  </select></label>
</section>
<p class="count" role="status">${shown.length} of ${deals.length} deals shown${shown.length < deals.length ? ' · <a href="#/">Clear filters</a>' : ""}</p>
<ul class="grid">${rows(shown)}</ul>
<section class="how">
  <h2>How to read a verdict</h2>
  <dl>
    <dt><span class="verdict verdict-new-low">NEW LOW</span></dt>
    <dd>The source says this is the lowest price it has ever tracked for the item.</dd>
    <dt><span class="verdict verdict-strong">STRONG DEAL</span></dt>
    <dd>A big, verified cut off the usual price — roughly 30% or more, or $100+ saved.</dd>
    <dt><span class="verdict verdict-solid">SOLID DEAL</span></dt>
    <dd>A real cut, but a modest one, or the value sits in a bundle rather than the price.</dd>
  </dl>
  <p>Usual prices come from the same source that reported the sale price — a store release, a deals
  desk's price check, or the product's list price as the source states it. Streaming deals are priced
  per month. Prices move during Black Friday week; the checked time on each deal is the moment its
  price was read.</p>
</section>`;
}

export function dealPage(d) {
  const v = VERDICTS[d.verdict];
  return `<p class="back"><a href="#/">&larr; All ${deals.length} deals</a></p>
<article class="detail">
  <p class="kicker">${escape(d.category)} · ${escape(d.store)}</p>
  <h1>${escape(d.title)}</h1>
  <p class="detail-price"><strong>${usd(d.price)}${per(d)}</strong> <s>usually ${usd(d.was)}${per(d)}</s> <span class="off">−${pct(d)}% · save ${usd(saved(d))}${per(d)}</span></p>
  <p>${verdictChip(d)} <strong>${escape(v.blurb)}.</strong> ${escape(d.note)}</p>
  <dl class="facts">
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}${per(d)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}${per(d)}</dd>
    <dt>Discount</dt><dd>${pct(d)}% off — ${usd(saved(d))} saved</dd>
    <dt>Checked</dt><dd>${when(d.checked)}</dd>
    <dt>Verified in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="buy" href="${escape(d.url)}" rel="noopener">Find it at ${escape(d.store)} &rarr;</a></p>
  <p class="fine">The link goes to the store's search for this product. Prices can change during Black Friday week — the checked time above is when this price was read.</p>
</article>`;
}

export function missingPage() {
  return `<h1>Not found</h1><p>There is no deal at this address. <a href="#/">See all ${deals.length} deals</a>.</p>`;
}
