# Correctifs du déploiement IONOS

Le serveur statique utilise un chemin absolu pour sa configuration et une réécriture SPA compatible avec serve. Les routes /Artists, /Partners, /Programme, /Billetterie et /Gallery restent accessibles après rechargement direct ; les fichiers réels sont servis normalement. Le listing des dossiers est désactivé. robots.txt et sitemap.xml sont de vrais fichiers.

Ces corrections ne réparent pas le backend Supabase historique, qui refuse encore les appels : inscriptions et administration restent à reprendre séparément.
