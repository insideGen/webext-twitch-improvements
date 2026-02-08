# WebExtension - Twitch improvements

Extension pour navigateur qui ajoute des améliorations à Twitch.

## Fonctionnalités

### Sur toutes les pages Twitch

- **Collecte automatique des points de communauté** : clique automatiquement sur le bouton de points de chaine.
- **Mute de l'onglet par double-clic** : un double-clic sur le bouton mute/unmute du lecteur coupe ou rétablit le son de l'onglet entier. Le bouton devient rouge lorsque l'onglet est muet.
- **Durée du stream** : affiche le temps de diffusion en cours dans l'overlay d'information du stream.

### En fenêtre popup

Ces fonctionnalités ne s'activent que lorsque le stream est ouvert dans une fenêtre popup (via le menu contextuel).

- **Titre de fenêtre** : remplace le titre par "Streamer – Jeu – Titre du stream".
- **En-tête du chat masqué** : cache l'en-tête de la section chat pour gagner de l'espace.
- **Mode Studio persistant** : maintient le mode Studio activé automatiquement.

### Menus contextuels (clic droit)

- **Rouvrir la fenêtre en tant que popup** : disponible sur les pages Twitch, ouvre la page courante dans une fenêtre popup.
- **Ouvrir le lien en tant que popup** : disponible sur les liens Twitch, ouvre le lien dans une fenêtre popup.

## Installation

Télécharger la dernière version depuis la [page des releases](https://github.com/insideGen/webext-twitch-improvement/releases/latest).

### Chrome

1. Télécharger le fichier `twitch-improvement-*-chrome.zip` depuis la page des releases.
2. Extraire le contenu du zip dans un dossier.
3. Ouvrir `chrome://extensions/`.
4. Activer le **Mode développeur**.
5. Cliquer sur **Charger l'extension non empaquetée** et sélectionner le dossier extrait.

### Firefox

Télécharger le fichier `twitch-improvement-*-firefox.xpi` depuis la page des releases et l'ouvrir avec Firefox.

Ou manuellement :

1. Télécharger le fichier `twitch-improvement-*-firefox.zip` depuis la page des releases.
2. Ouvrir `about:debugging#/runtime/this-firefox`.
3. Cliquer sur **Charger un module temporaire** et sélectionner le fichier `manifest.json` contenu dans le zip.
