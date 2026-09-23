# Fashionist'ART — Bible ADN canonique

Statut : **production / documenté depuis le site publié**  
Dernier alignement : 2026-09-23

## Identité
- Nom public : **Fashionist'ART**
- Univers : mode, art, événementiel, galerie et créativité contemporaine.
- Style : sombre, éditorial, premium, énergique ; fuchsia signature + touches or.
- Ne pas transformer la marque en identité JS-Innov.IA : JS-Innov.IA reste un crédit technique lorsqu'il est utilisé.

## Palette canonique actuelle
- Fuchsia : `#FF2D8A`
- Fuchsia clair : `#FF6BB3`
- Or : `#D4AF37`
- Noir principal : `#0A0A0F`
- Noir secondaire : `#12121A`
- Cartes : `rgba(255,255,255,0.04)`
- Bordures : `rgba(255,255,255,0.08)`
- Blanc : `#FFFFFF`

La barre arc-en-ciel visible dans le runtime est un élément décoratif secondaire, pas une palette de remplacement.

## Typographies
- Corps : **Inter**
- Titres / navigation / labels : **Montserrat**
- Mot « Fashionist' » dans le hero : **Playfair Display**, italique
- Script décoratif ponctuel : **Dancing Script**
- « ART » : Montserrat, très gras

## Logo
Le composant `src/components/shared/Logo.jsx` déclare comme logo officiel une image externe Base44 :
`https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png`

Cette URL est actuellement la référence runtime, mais le master n'est pas versionné localement dans Git. Un agent ne doit jamais reconstruire le logo. À terme, le master validé devrait être copié dans le dépôt et le manifeste mis à jour.

## Règles de composition
- Fonds noirs dominants, respirants.
- Fuchsia pour CTA, labels et énergie visuelle.
- Or pour accents premium / badges.
- Éviter l'usage massif du rainbow gradient.
- Conserver un fort contraste et des blocs éditoriaux nets.

## Règles Elynea / agents
Lire `brand/brand.manifest.json` puis cette Bible, puis `src/globals.css`. Ne jamais reprendre les couleurs Miss & Mister Dour ou JS-Innov.IA sous prétexte qu'elles figurent dans le même écosystème.
