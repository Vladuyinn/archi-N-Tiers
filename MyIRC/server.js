const net = require("net");

const PORT = 6667;
const clients = []; // Liste des clients connectés
const pseudos = new Map(); // Associe les sockets à leurs pseudos
const channels = { global: [] }; // Canaux avec leurs membres

// Création du serveur TCP
const server = net.createServer((socket) => {
    socket.write("Bienvenue sur le serveur IRC ! Quel est votre pseudo ?\n");

    let pseudo = null; // Pseudo de l'utilisateur
    let currentChannel = "global"; // Canal actuel, par défaut 'global'
    let buffer = ""; // Buffer pour stocker les messages temporaires

    // Diffuser un message aux utilisateurs d'un canal spécifique
    const broadcastToChannel = (channel, message, sender) => {
        channels[channel]?.forEach((client) => {
            if (client !== sender) {
                client.write(message);
            }
        });
    };

    // Fonction pour envoyer un message privé (/whisper)
    const whisper = (targetPseudo, message, sender) => {
        const targetSocket = Array.from(pseudos.entries()).find(
            ([_, name]) => name === targetPseudo
        )?.[0];

        if (targetSocket) {
            targetSocket.write(`[Whisper][${pseudo}] ${message}\n\r`);
            sender.write(`[Whisper][à ${targetPseudo}] ${message}\n\r`);
        } else {
            sender.write(`Utilisateur "${targetPseudo}" introuvable.\n\r`);
        }
    };

    // Fonction pour gérer les données reçues
    socket.on("data", (data) => {
        buffer += data.toString();

        if (buffer.includes("\n")) {
            const message = buffer.trim();
            buffer = "";

            if (!pseudo) {
                // Première interaction : définir le pseudo
                pseudo = message;
                pseudos.set(socket, pseudo);

                // Ajouter l'utilisateur au canal global
                if (!channels.global) channels.global = [];
                channels.global.push(socket);

                clients.push(socket);
                socket.write(`Bienvenue ${pseudo} ! Vous êtes dans le canal #global.\n\r`);
                console.log(`${pseudo} vient de se connecter.`);
                broadcastToChannel("global", `-- ${pseudo} a rejoint le chat --\n\r`, socket);
            } else if (message === "/list") {
                // Liste des utilisateurs connectés
                const userList = Array.from(pseudos.values()).join(", ");
                socket.write(`Utilisateurs connectés : ${userList}\n\r`);
            } else if (message.startsWith("/whisper")) {
                // Envoyer un message privé
                const parts = message.split(" ");
                const targetPseudo = parts[1];
                const whisperMessage = parts.slice(2).join(" ");
                whisper(targetPseudo, whisperMessage, socket);
            } else if (message.startsWith("/channels")) {
                const parts = message.split(" ");
                const command = parts[1];

                if (command === "list") {
                    // Liste des canaux
                    const channelList = Object.keys(channels).join(", ");
                    socket.write(`Canaux disponibles : ${channelList}\n\r`);
                } else if (command === "create" && parts[2]) {
                    // Créer un nouveau canal
                    const newChannel = parts[2];
                    if (!channels[newChannel]) {
                        channels[newChannel] = [];
                        socket.write(`Canal #${newChannel} créé avec succès.\n\r`);
                        console.log(`Canal #${newChannel} a été créé.`);
                    } else {
                        socket.write(`Le canal #${newChannel} existe déjà.\n\r`);
                    }
                } else if (command === "join" && parts[2]) {
                    // Rejoindre un canal
                    const targetChannel = parts[2];
                    if (channels[targetChannel]) {
                        // Retirer l'utilisateur de son canal actuel
                        channels[currentChannel] = channels[currentChannel].filter(
                            (client) => client !== socket
                        );
                        broadcastToChannel(
                            currentChannel,
                            `-- ${pseudo} a quitté le canal #${currentChannel} --\n\r`,
                            socket
                        );

                        // Ajouter au nouveau canal
                        currentChannel = targetChannel;
                        channels[currentChannel].push(socket);
                        socket.write(`Vous avez rejoint le canal #${currentChannel}.\n\r`);
                        broadcastToChannel(
                            currentChannel,
                            `-- ${pseudo} a rejoint le canal #${currentChannel} --\n\r`,
                            socket
                        );
                    } else {
                        socket.write(`Le canal #${targetChannel} n'existe pas.\n\r`);
                    }
                } else {
                    socket.write(`Commande invalide. Utilisation : /channels list | create <nom> | join <nom>\n\r`);
                }
            } else if (message === "/help") {
                // Affiche la liste des commandes disponibles
                const helpMessage = `
Commandes disponibles :\n\r
/list                     - Liste des utilisateurs connectés.\n\r
/whisper <pseudo> <msg>   - Envoyer un message privé.\n\r
/channels list            - Liste les canaux disponibles.\n\r
/channels create <nom>    - Créer un nouveau canal.\n\r
/channels join <nom>      - Rejoindre un canal existant.\n\r
/help                     - Afficher cette aide.
\n\r`;
                socket.write(helpMessage);
            } else {
                // Diffuser un message dans le canal actuel
                console.log(`[${currentChannel}] ${pseudo}: ${message}`);
                broadcastToChannel(currentChannel, `[${pseudo}]: ${message}\n\r`, socket);
            }
        }
    });

    // Gestion de la déconnexion
    socket.on("end", () => {
        console.log(`${pseudo} s'est déconnecté.`);
        channels[currentChannel] = channels[currentChannel].filter((client) => client !== socket);
        pseudos.delete(socket);
        clients.splice(clients.indexOf(socket), 1);
        broadcastToChannel(currentChannel, `-- ${pseudo} a quitté le canal #${currentChannel} --\n\r`, socket);
    });

    // Gestion des erreurs
    socket.on("error", (err) => {
        console.error(`Erreur avec ${pseudo}: ${err.message}`);
    });
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});
