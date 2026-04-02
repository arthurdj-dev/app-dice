# app-dice

Application mobile de lanceur de dés, développée avec React Native + Expo.

## Stack technique
- **React Native** 0.81.5 + **React** 19.1.0
- **Expo** ~54.0.33 (Expo Go compatible)
- Pas de TypeScript — JavaScript pur
- Pas de librairie de navigation (single-screen app)
- Pas de state manager externe (useState/useRef uniquement)

## Structure
- `App.js` — composant unique, contient toute la logique et les styles (`StyleSheet.create`)
- `index.js` — point d'entrée Expo (`registerRootComponent`)
- `assets/` — icônes et splash screen

## Conventions de code
- Arrow functions pour les composants internes, `function` déclarée pour les handlers principaux (ex: `function roll()`)
- Styles définis en bas du fichier dans un seul objet `StyleSheet.create`
- Thème sombre : fond `#1a1a2e`, secondaire `#16213e`, texte `#e0e0e0`
- Chaque type de dé a sa propre couleur (définie dans le tableau `DICE`)

## Fonctionnalités actuelles
- Sélection du type de dé : D4, D6, D8, D10, D12, D20
- Lancer de 1 à 5 dés simultanément
- Animation de rotation/scale au lancer (`Animated` API native driver)
- Historique des 30 derniers lancers avec horodatage (fr-FR)
- Bouton "Effacer" l'historique

## Lancer le projet
```bash
npm start        # Expo dev server
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```
