## Import Postman (collection + environment)

### Fichiers à importer

- **Collection (tous les endpoints)**: `AFI_LISTEN_ALL_ENDPOINTS.postman_collection.json` (à la racine du repo)
- **Environment (prod Render)**: `postman/AFI_LISTEN_PROD.postman_environment.json`

### Étapes (Postman)

1) Ouvrir Postman
2) Cliquer **Import**
3) Onglet **File** → sélectionner **d’abord** `AFI_LISTEN_ALL_ENDPOINTS.postman_collection.json`
4) Refaire **Import** → sélectionner `postman/AFI_LISTEN_PROD.postman_environment.json`
5) En haut à droite, choisir l’environment **`AFI_LISTEN (PROD)`**
6) Dans la collection, lancer **Run** (Collection Runner)

### Si tu ne vois pas la collection après import

- Assure-toi d’importer le fichier **collection** (celui qui contient `"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"`).
- Essaie l’import via **drag & drop** du fichier collection dans Postman.
- Vérifie que Postman n’est pas en mode “workspace filtré” (ex: un autre workspace sélectionné).

