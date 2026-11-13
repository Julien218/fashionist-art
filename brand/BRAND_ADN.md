# Fashionist'ART — Bible ADN canonique

Statut : **production / documenté depuis le site publié**  
Dernier alignement : 2026-11-14

## Identité
- Nom public : **Fashionist'ART**
- Univers : mode, art, événementiel, galerie et créativité contemporaine.
- Style : sombre, éditorial, premium, énergique ; fuchsia signature + touches or.
- Ne pas transformer la marque en identité JS-Innov.IA : JS-Innov.IA reste un crédit technique lorsqu'il est utilisé.

## Palette canonique (validée par Julien le 2026-11-14)
La palette suit le logo officiel : son rose est plus proche du fuchsia de la planche ADN que de celui du site.
- Fuchsia : `#E6007A`
- Or : `#D4AF37`
- Noir principal : `#0A0A0F`
- Noir secondaire : `#12121A`
- Blanc : `#FFFFFF`
- Cartes : `rgba(255,255,255,0.04)`, bordures : `rgba(255,255,255,0.08)`

À confirmer (lues sur la planche ADN en basse résolution) : violet `#7B2CBF`, cyan `#00C2FF`. Ne pas les utiliser comme couleurs principales avant confirmation.

Le site publié utilise encore `#FF2D8A` et `#FF6BB3` (`src/globals.css`) : c'est du runtime legacy à migrer, pas la direction artistique.

L'anneau multicolore du logo reste un élément du logo ; la barre arc-en-ciel du site est décorative et secondaire, pas une palette de remplacement.

## Typographies
- Corps : **Inter**
- Titres / navigation / labels : **Montserrat**
- Mot « Fashionist' » dans le hero : **Playfair Display**, italique
- Script décoratif ponctuel : **Dancing Script**
- « ART » : Montserrat, très gras

## Logo
Le composant `src/components/shared/Logo.jsx` déclare comme logo officiel une image externe Base44 :
`https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png`

Cette URL est actuellement la référence runtime. Une copie de secours (200 × 200 px, JPEG) est versionnée dans `brand/assets/fashionist-art-logo-200.jpg` depuis le 2026-11-14 : elle sert de référence visuelle, mais elle est trop petite pour une vidéo HD ou l'impression. Le master haute résolution n'est toujours pas versionné. Un agent ne doit jamais reconstruire le logo. À terme, le master validé devrait être copié dans le dépôt et le manifeste mis à jour.

## Règles de composition
- Fonds noirs dominants, respirants.
- Fuchsia pour CTA, labels et énergie visuelle.
- Or pour accents premium / badges.
- Éviter l'usage massif du rainbow gradient.
- Conserver un fort contraste et des blocs éditoriaux nets.

## Règles Elynea / agents
Lire `brand/brand.manifest.json` puis cette Bible, puis `src/globals.css`. Ne jamais reprendre les couleurs Miss & Mister Dour ou JS-Innov.IA sous prétexte qu'elles figurent dans le même écosystème.
