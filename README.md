Comment trouver le PID d'un processus Node.js sous Windows

Lorsqu'un script Node.js est en cours d'exécution, il est identifié par un PID (Process ID). Voici les instructions pour trouver ce PID et envoyer un signal SIGTERM sur Windows :

Étape 1 : Lancer le script Node.js

Assurez-vous que votre script Node.js est en cours d'exécution. Vous pouvez le lancer via un terminal ou un éditeur comme VS Code. Une fois le script actif, il apparaîtra dans la liste des processus.

Étape 2 : Trouver le PID via le Gestionnaire des tâches

Ouvrir le Gestionnaire des tâches :

Appuyez sur CTRL+SHIFT+ESC pour ouvrir directement le Gestionnaire des tâches.

Naviguer vers l'onglet "Détails" :

Cliquez sur l'onglet Détails (ou Processes dans les versions antérieures de Windows).

Chercher le processus Node.js :

Recherchez node.exe dans la liste des processus.

Identifiez votre script à l'aide des informations fournies (par exemple, l'heure de démarrage si plusieurs processus Node.js sont actifs).

Noter le PID :

Le PID (Process ID) apparaît dans la colonne "PID".

Étape 3 : Envoyer un signal SIGTERM via PowerShell

Ouvrir PowerShell :

Tapez PowerShell dans la barre de recherche Windows et appuyez sur Entrée.

Utiliser la commande Stop-Process :

Exécutez la commande suivante en remplaçant <PID> par l'identifiant trouvé précédemment :

Stop-Process -Id <PID>

Vérifier l'arrêt du processus :

Le processus Node.js devrait se terminer proprement, et vous devriez voir les messages de nettoyage s'afficher dans le terminal.

Note importante

Si vous ne voyez pas de colonne "PID" dans le Gestionnaire des tâches, effectuez un clic droit sur l'en-tête des colonnes, choisissez Sélectionner les colonnes, puis activez l'option PID (Identifiant du processus).