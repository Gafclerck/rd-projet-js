# Mon Projet JS - Script Interactif RodiumAi (Avec SDK)

Ce projet permet de realiser des operations successives de Chat, de generation d'image et de video via le SDK officiel JavaScript de RodiumAi.
L'utilisateur pilote son parcours en direct dans le terminal via un menu interactif lui permettant de rejouer, revenir en arriere ou progresser.

## Installation des dependances

Le projet a ete concu pour Node.js 18 ou version superieure (teste avec succes sous Node 26).
Installez les dependances requises a l'aide de npm :

```bash
npm install
```

## Configuration du .env

Copiez le fichier d'exemple .env.example pour creer votre fichier .env local :

```bash
cp .env.example .env
```

Renseignez votre cle d'API RodiumAi au sein du fichier .env :

```env
RODIUMAI_API_KEY=rd_sk_votre_cle
```

## Lancement du script

Lancez l'execution du script avec la commande suivante :

```bash
node main.js
```
