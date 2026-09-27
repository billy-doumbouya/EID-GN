# WORKLOG — Refonte EID-GN-SHOP

## Journal des Travaux et Décisions d'Architecture

### 26 Septembre 2026 — Initialisation & Audit de la Page d'Accueil

#### 1. Audit Technique & Identifié
- **Performance & Fonts** :
  - Suppression de l'import CDN `@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono...")` dans `globals.css` (render-blocking, FOUT/FOIT).
  - Migration vers `next/font/google` pour `Inter`, `Space Grotesk` et `JetBrains Mono` dans `src/app/layout.js`.
- **Surcharge JS Client sur la Home** :
  - Retrait du wrapper client global `<PageTransition>`.
  - Élimination des instances multiples de `Swiper` au sein de chaque carte produit (`ProductCard.jsx`).
  - Remplacement des animations 3D tilt sur `mousemove` de `CategoryCard.jsx` et du scroll listener `FloatingCTA.jsx` par des transitions CSS GPU légères.
- **Design System** :
  - Abandon du style neumorphique gris-bleu clair (`#e6eef8` / `#c3cad3`) en faveur de la palette officielle BMW Motorrad / Linear (`navy-950`, `navy-900`, `mechanic-500`, `amber-500`, `offwhite-100`).
  - Ajout des tokens d'élévation et ombres (`--shadow-card`, `--shadow-card-hover`, `--shadow-glow-mechanic`) et de l'animation CSS `@keyframes mesh-shift` dans `globals.css`.
- **Footer Fixe** :
  - Demande utilisateur : Footer complet fixé en permanence en bas de l'écran (`fixed bottom-0`) sans être affecté par le scroll, avec un padding inférieur adaptatif sur le contenu principal pour préserver la lisibilité de 100% du catalogue.

---

### Prochaines étapes
1. Mise en place de `components.json` et `src/lib/utils.js`.
2. Mise à jour de `src/app/layout.js` (polices `next/font`, variables CSS, conteneur avec padding pour footer fixe).
3. Mise à jour de `src/app/globals.css` (tokens de design, mesh gradient CSS GPU, suppression de la police CDN).
4. Création des composants de base UI (`button.jsx`, `badge.jsx`, `skeleton.jsx`).
5. Refonte du Footer (`src/components/Footer.jsx`) au design de la marque, positionné en bas fixe.
6. Implémentation modulaire de la page Home (`src/app/page.js`) en Server Components + Suspense streaming.
7. Validation du build (`npm run build`).
