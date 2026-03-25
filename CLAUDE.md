# DAIRIA Conclusions — Guidelines pour Claude

## Mode de travail
- Autonomie totale. Ne pose jamais de questions.
- Code tout, ouvre une PR, deploie sur Render.

## Contexte
DAIRIA Conclusions est un outil ULTRA-SPECIALISE de generation de conclusions prud homales en defense employeur.
Il est connecte a dairia-tool (le gestionnaire de dossiers) via un bouton "Generer les conclusions".
Il utilise l API Claude (Anthropic SDK) pour generer le contenu juridique.

## Charte graphique DAIRIA
- Fond : #f8f8f6 / Navy : #1e2d3d / Orange : #e8842c / Gris : #6b7280
- Design professionnel, epure

## Stack
- Next.js 16 + TypeScript + Tailwind CSS v4
- Supabase (URL: https://noqzwkkdfpbmglewsozo.supabase.co)
- Claude API (Anthropic SDK) pour la generation
- Deploy : Render

## METHODOLOGIE DE REDACTION DES CONCLUSIONS (OBLIGATOIRE)

### Structure des conclusions (article 768 CPC)
1. EN-TETE : Juridiction, N RG, Audience, POUR (societe defenderesse + DAIRIA Avocats Barreau de Lyon), CONTRE (salarie demandeur + son avocat)
2. TABLE DES MATIERES avec renvois aux pages
3. EXPOSE DES FAITS : chronologie favorable a l employeur, narration positive, passe compose
4. DISCUSSION : pour chaque chef de demande adverse, structure EN DROIT puis EN FAIT
5. PAR CES MOTIFS : dispositif avec JUGER, DEBOUTER, CONDAMNER
6. BORDEREAU DE PIECES

### Module 1 — Tactique judiciaire
- Ne pas contester chaque point adverse, construire autour des points forts
- Selectionner les combats : evaluer la force de chaque argument adverse
- Reconnaitre strategiquement les points faibles pour renforcer la credibilite
- Reduire les consequences potentielles : proposer des montants moderes si condamnation inevitable
- Construire une argumentation centree sur les points forts de l employeur
- Utiliser la jurisprudence de maniere strategique

### Module 2 — Structuration
- Pretentions en defense : viser le rejet total ou partiel, obtenir un jugement declaratif
- Arguments en fait : contestation des faits allegues, presentation de faits alternatifs, chronologie
- Arguments en droit : dispositions legales, jurisprudence, principes juridiques
- Synthese des moyens : max 10% du volume, max 1000 mots
- Pieces numerotees sequentiellement, referencees precisement
- Moyens nouveaux mis en evidence
- Conclusions recapitulatives : synthetiques mais exhaustives

### Module 3 — Analyse des faits
- Etape 1 : Collecte integrale des faits (ecoute active, notes detaillees, documents)
- Etape 2 : Construction chronologique (ordonnancement, selection critique, optimisation de la presentation)
- Etape 3 : Narration positive (choix des mots favorables, mise en contexte des decisions de l employeur, souligner les initiatives positives, anticiper les contre-arguments, neutraliser les elements negatifs)

### Module 4 — Construction de l argumentation
- Etape 1 : Questions juridiques posees (decouler des faits, orienter vers les arguments cles)
- Etape 2 : Ecriture des arguments (une phrase = une idee, synthese et concision, passe compose, paragraphes distincts, espacement)
- Creativite : exploiter les zones grises du droit, interpretations alternatives, jurisprudence creative, arguments a fortiori, analogies
- Attention a la credibilite : fondement juridique solide, coherence et logique

### Regles de redaction
- Langage juridique precis mais accessible
- Passe compose pour les faits
- Chaque fait etaye par une piece (Piece adverse n X / Piece n X)
- Chaque argument en droit cite un article de loi ou une jurisprudence Cass. soc.
- Ton professionnel, assertif mais mesure
- Ne jamais etre agressif envers la partie adverse
- Signature : Dairia avocats / Sofiane COLY / Avocat Associe / s.coly@dairia-avocats.com

## Deploiement et notification
- Deploy sur Render, iterer jusqu au succes
- Poster URL + identifiants quand termine
