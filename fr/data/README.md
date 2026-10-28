# Données éditables

- `data/config.json` : email/téléphone, nom de marque, endpoint de formulaire (optionnel).
- `data/weeks.json` : une entrée par semaine du samedi au samedi (`start`/`end` en ISO `YYYY-MM-DD`, `end` = départ), `season` (`winter`/`summer`), `price` (total du séjour en EUR ; `null` si le tarif n'est pas renseigné, affiché « — »), `status` (`available`/`option`/`booked`), `holidays` (zones scolaires en vacances : ex `["A","B"]` ; `[]` = hors vacances).
- `data/media.json` : éléments de galerie (src + alt/caption FR/EN) séparés par saison.
- `data/reviews.json` : avis (cartes), saisis manuellement (source Airbnb).

## Hiver 2026–2027

- Séjours du 5 décembre 2026 au 17 avril 2027 (dernier départ), sans semaine après la fermeture de la station.
- Tarifs hebdomadaires calculés à partir des tarifs par nuit des captures fournies, multipliés par 7. Le 5 décembre, hors capture, reprend les 300 €/nuit visibles du 6 au 18 décembre.
- Séjours réservés : 26 décembre–2 janvier, 6–13 février et 27 mars–3 avril. Le tarif du 6–13 février, confirmé séparément, est de 238 €/nuit, soit 1 666 € la semaine.
- Zones de vacances mises à jour selon le [calendrier scolaire officiel 2026–2027](https://www.service-public.gouv.fr/particuliers/actualites/A18563), pour les semaines complètes de vacances.
