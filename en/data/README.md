# Données éditables

- `data/config.json` : email/téléphone, nom de marque, endpoint de formulaire (optionnel).
- `data/weeks.json` : une entrée par semaine (`start`/`end` en ISO `YYYY-MM-DD`), `season` (`winter`/`summer`), `price` (EUR), `status` (`available`/`option`/`booked`), `holidays` (zones scolaires en vacances : ex `["A","B"]` ; `[]` = hors vacances).
- `data/media.json` : éléments de galerie (src + alt/caption FR/EN) séparés par saison.
- `data/reviews.json` : avis (cartes), saisis manuellement (source Airbnb).
