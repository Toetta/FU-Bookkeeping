# Copilot-instruktion: Applicera FU-BookKeeping färgtema på fler sidor

Mål: Återanvänd samma färgtema som i `FU-Bookkeeping.html` på övriga HTML-sidor i repo:t (och/eller andra sidor där appen bäddas in), så att bakgrund + kort/paneler matchar logotypens bakgrund.

## Källvärden (tema)
Utgå från dessa CSS-variabler (matchar loggans bakgrund):

```css
:root{
  /* Basbakgrund (samplad från FU-BookKeeping.png) */
  --bg:#191717;
  --bg2:#141212;
  --bg-rgb:25,23,23;

  /* Ytor/kort */
  --card:#211F1F;
  --card-rgb:33,31,31;
  --card2:#282626;
  --card2-rgb:40,38,38;

  /* Befintliga tokens (behåll om de redan finns) */
  --muted:#94a3b8;
  --text:#e5e7eb;
  --line:#223044;
  --ok:#22c55e;
  --bad:#ef4444;
  --accent:#60a5fa;
}
```

## Steg 1: Sätt sidbakgrund och header
Byt sidans bakgrund till variablerna:

```css
body{
  background: linear-gradient(180deg, var(--bg), var(--bg2));
  color: var(--text);
}
```

Om sidan har en toppbar/header, matcha den mot basen:

```css
header{
  background: rgba(var(--bg-rgb), .98);
}
```

## Steg 2: Byt “blå” panel-/kortbakgrunder till varma ytor
I många av mina tidigare stilar låg ytor på `rgba(17,24,38, …)` (blåaktigt). Byt dem till varma ytor enligt nedan:

- Standardkort/panel: `background: rgba(var(--card-rgb), 0.94);`
- Secondary/elevated (modal, flyout, toast): `background: rgba(var(--card2-rgb), 0.98);`
- Dropdown/pill: `background: rgba(var(--card-rgb), 0.85);`

Konkreta exempel (typiska mappingar):

```css
/* Kort/panel */
.card{ background: rgba(var(--card-rgb), .94); }

/* Sidebar */
.sidebar{ background: rgba(var(--card-rgb), .90); }

/* Flyouts/overlays */
.navFlyout{ background: rgba(var(--card2-rgb), .96); }
.modal{ background: rgba(var(--card2-rgb), .98); }
.toast{ background: rgba(var(--card2-rgb), .98); }

/* Select “pill” */
select.pill{ background: rgba(var(--card-rgb), .85); }
```

## Steg 3: Hitta och ersätt rätt ställen (praktiskt arbetssätt)
När du ber Copilot göra jobbet på en annan sida, be den:

1. Lägga in variablerna i `:root` (eller en gemensam CSS-fil om ni har en sådan).
2. Byta `body`-gradienten till `var(--bg)`/`var(--bg2)`.
3. Söka efter och ersätta alla `rgba(17,24,38, …)`-bakgrunder för ytor med `rgba(var(--card-rgb), …)` eller `rgba(var(--card2-rgb), …)`.

Sökord att leta efter i filer:
- `rgba(17,24,38` (gamla ytor)
- `linear-gradient(180deg,#0b0f14` (gamla bakgrunden)
- `background:rgba(11,15,20` (header/bas)

## Steg 4: Valfri finjustering (om UI känns “kallt”)
`--line` är fortfarande blå (`#223044`). Om du vill värma upp även borders kan du byta den till en mer neutral mörkgrå (men gör det sist, eftersom det påverkar många komponenter).

## Exakt Copilot-prompt (copy/paste)
Använd denna prompt när du vill att Copilot ska theme:a en annan sida:

> Applicera samma färgtema som i `FU-Bookkeeping.html`: lägg in `:root`-variablerna `--bg/#191717`, `--bg2/#141212`, `--bg-rgb:25,23,23`, `--card/#211F1F` (`--card-rgb:33,31,31`), `--card2/#282626` (`--card2-rgb:40,38,38`). Byt sidans `body`-bakgrund till `linear-gradient(180deg,var(--bg),var(--bg2))`. Byt alla panel-/kort-/modal-/flyout-/toast-/select-bakgrunder som använder `rgba(17,24,38,…)` till `rgba(var(--card-rgb),…)` eller `rgba(var(--card2-rgb),…)` med samma alpha som innan. Ändra inte layout eller funktionalitet, bara färger.
