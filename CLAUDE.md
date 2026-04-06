# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# app-dice

Application mobile de lanceur de dés, développée avec React Native + Expo.

## Stack technique
- **React Native** 0.81.5 + **React** 19.1.0
- **Expo** ~54.0.33 (Expo Go compatible)
- Pas de TypeScript — JavaScript pur
- Pas de librairie de navigation (single-screen app)
- Pas de state manager externe (useState/useRef uniquement)

## Commandes

```bash
npm start        # Expo dev server
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

Pas de scripts de test ou de lint configurés.

## Architecture

Toute l'application tient dans `App.js` (composant unique). Deux structures de données pilotent l'UI :

- **`DICE`** — tableau de 6 types de dés (D4→D20) avec `{ label, sides, color }`. Ajouter un type de dé = ajouter une entrée ici et dans `SHAPE_CONFIG`.
- **`SHAPE_CONFIG`** — map `dieType → { w, h, borderRadius, rotate }` qui donne à chaque dé sa forme visuelle distinctive. `rotate` est une string CSS (`'45deg'`) ou `null`.

Le composant interne **`DieFace`** reçoit une `Animated.Value` en prop et applique rotation + scale (avec contre-rotation du contenu textuel pour qu'il reste lisible). L'animation est déclenchée dans `function roll()` : chaque dé fait un `Animated.sequence` (aller-retour), tous lancés en `Animated.parallel`, avec `useNativeDriver: true`.

`anims` est un tableau fixe de 5 `Animated.Value` (taille `MAX_DICE`), créé une seule fois via `useRef`. Seules les `quantity` premières valeurs sont utilisées à chaque lancer.

État géré par `useState` : type de dé sélectionné, quantité (1-5), résultats affichés, historique (30 derniers lancers), état `isRolling`.

## Conventions de code
- Arrow functions pour les composants internes (`DieFace`), `function` déclarée pour les handlers principaux (`roll`)
- Styles définis en bas du fichier dans un seul objet `StyleSheet.create`
- Thème sombre : fond `#1a1a2e`, secondaire `#16213e`, texte `#e0e0e0`
- Couleurs des dés définies dans le tableau `DICE` (D4: #FF6B6B, D6: #FFD93D, D8: #6BCB77, D10: #4D96FF, D12: #C77DFF, D20: #FF9F43)
- Horodatage de l'historique en `fr-FR` via `toLocaleTimeString`
