# black-friday-deal-finder-01

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/ddsopian018-hue/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/ddsopian018-hue/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Verified-deal board: 39 store-checked Black Friday prices with deal-verdict signals. Every deal on the board was found and price-checked on Black Friday itself, 27 November 2026, against a live deals source that names the store and the price. Each deal shows its sale price, its usual price, its discount, a verdict on whether it is really a deal (NEW LOW / STRONG DEAL / SOLID DEAL, with the evidence), the store, a link to the store, and the UTC time the price was checked. Search and filters by category, store and minimum discount all work; the board is a static site with no network requests at runtime, and it works on desktop and phone layouts.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no dependencies.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=15w4cn26&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
