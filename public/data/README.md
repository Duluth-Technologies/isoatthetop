# Données éditables

- `data/config.json` : email/téléphone, nom de marque, endpoint de formulaire (optionnel).
- `data/weeks.json` : une entrée par semaine du samedi au samedi (`start`/`end` en ISO `YYYY-MM-DD`, `end` = départ), `season` (`winter`/`summer`), `price` (total du séjour en EUR ; `null` si le tarif n'est pas renseigné, affiché « — »), `status` (`available`/`option`/`booked`), `holidays` (zones scolaires en vacances : ex `["A","B"]` ; `[]` = hors vacances).
- `data/media.json` : éléments de galerie (src + alt/caption FR/EN) séparés par saison.
- `data/reviews.json` : avis (cartes), saisis manuellement (source Airbnb).

## Hiver 2026–2027

- Séjours du 5 décembre 2026 au 17 avril 2027 (dernier départ), sans semaine après la fermeture de la station.
- Tarifs de départ issus des captures du calendrier Airbnb. Le 5 décembre, hors capture, reprend les 300 €/nuit visibles du 6 au 18 décembre.
- Calcul des prix affichés : `tarif Airbnb par nuit × 7 × 0,85 × 0,845 + 150 €`, puis arrondi au plus petit entier supérieur ou égal se terminant par 9. Cela applique une réduction de 15 %, déduit 15,5 % de frais Airbnb du logement uniquement et ajoute 150 € de ménage sans réduction ni déduction de frais sur le ménage. Exemple d'arrondi : 1 131,75 € → 1 139 € ; un montant déjà entier et terminé par 9 reste inchangé.
- Le taux de 15,5 % correspond aux frais uniques habituels publiés par [Airbnb](https://www.airbnb.com/help/article/1857), vérifiés le 29 octobre 2026. Le taux propre au compte n'a pas été vérifié ; Airbnb indique que certains comptes ont une autre structure. L'exclusion du ménage de la déduction est la règle demandée pour ces tarifs directs.
- Séjours réservés : 26 décembre–2 janvier, 6–13 février et 27 mars–3 avril. Le tarif Airbnb du 6–13 février, confirmé séparément, est de 238 €/nuit ; le total direct affiché est de 1 349 € après ajustements.
- Zones de vacances mises à jour selon le [calendrier scolaire officiel 2026–2027](https://www.service-public.gouv.fr/particuliers/actualites/A18563), pour les semaines complètes de vacances.
- Les tarifs d'été sont indépendants et ne sont pas recalculés.

| Tarif Airbnb par nuit | Total hebdomadaire direct, ménage inclus |
| --- | --- |
| 300 € | 1 659 € |
| 230 € | 1 309 € |
| 165 € | 989 € |
| 238 € | 1 349 € |
| 280 € | 1 559 € |
| 320 € | 1 759 € |
| 150 € | 909 € |
