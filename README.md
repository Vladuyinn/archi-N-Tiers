# Comment trouver le PID d'un processus Node.js sous Windows

Lorsqu'un script Node.js est en cours d'exécution, il est identifié par un PID (Process ID). Ce guide explique comment trouver ce PID et envoyer un signal SIGTERM sur Windows.

---

## Étape 1 : Lancer le script Node.js

Assurez-vous que votre script Node.js est en cours d'exécution. Vous pouvez le lancer via un terminal ou un éditeur comme **VS Code**. Une fois le script actif, il apparaîtra dans la liste des processus.

---

## Étape 2 : Trouver le PID via le Gestionnaire des tâches

1. **Ouvrir le Gestionnaire des tâches** :
   - Appuyez sur `CTRL+SHIFT+ESC` pour ouvrir directement le Gestionnaire des tâches.

2. **Naviguer vers l'onglet "Détails"** :
   - Cliquez sur l'onglet **Détails** (ou **Processes** dans les versions antérieures de Windows).

3. **Chercher le processus Node.js** :
   - Recherchez `node.exe` dans la liste des processus.
   - Identifiez votre script à l'aide des informations fournies (par exemple, l'heure de démarrage si plusieurs processus Node.js sont actifs).

4. **Noter le PID** :
   - Le PID (Process ID) apparaît dans la colonne **PID**.

**Note** : Si vous ne voyez pas de colonne **PID** :
   - Effectuez un clic droit sur l'en-tête des colonnes.
   - Choisissez **Sélectionner les colonnes**.
   - Activez l'option **PID (Identifiant du processus)**.

---

## Étape 3 : Envoyer un signal SIGTERM via PowerShell

1. **Ouvrir PowerShell** :
   - Tapez `PowerShell` dans la barre de recherche Windows et appuyez sur Entrée.

2. **Utiliser la commande Stop-Process** :
   - Exécutez la commande suivante en remplaçant `<PID>` par l'identifiant trouvé précédemment :
     ```powershell
     Stop-Process -Id <PID>
     ```

3. **Vérifier l'arrêt du processus** :
   - Le processus Node.js devrait se terminer proprement, et vous devriez voir les messages de nettoyage s'afficher dans le terminal.

---

## Remarque importante

L'arrêt du processus avec un signal SIGTERM est une méthode propre pour fermer un script Node.js. Assurez-vous de sauvegarder votre travail si nécessaire avant de fermer le processus.
