const net = require("net");

const PORT = 6667;
const clients = []; // Liste des clients connectés
const pseudos = new Map(); // Associe les sockets à leurs pseudos
const channels = { global: [] }; // Canaux avec leurs membres

// Fonction pour notifier tous les clients avant la fermeture
const notifyClientsBeforeShutdown = () => {
    clients.forEach((client) => {
        client.write("Le serveur va fermer dans 5 secondes. Merci de vous reconnecter plus tard.\n");
    });
};

// Création du serveur TCP
const server = net.createServer((socket) => {
    socket.write("Bienvenue sur le serveur IRC ! Quel est votre pseudo ?\n");

    let pseudo = null; // Pseudo de l'utilisateur
    let currentChannel = "global"; // Canal actuel, par défaut 'global'
    let buffer = ""; // Buffer pour stocker les messages temporaires

    const broadcastToChannel = (channel, message, sender) => {
        channels[channel]?.forEach((client) => {
            if (client !== sender) {
                client.write(message);
            }
        });
    };

    const whisper = (targetPseudo, message, sender) => {
        const targetSocket = Array.from(pseudos.entries()).find(
            ([_, name]) => name === targetPseudo
        )?.[0];

        if (targetSocket) {
            targetSocket.write(`[Whisper][${pseudo}] ${message}\n`);
            sender.write(`[Whisper][à ${targetPseudo}] ${message}\n`);
        } else {
            sender.write(`Utilisateur "${targetPseudo}" introuvable.\n`);
        }
    };

    socket.on("data", (data) => {
        buffer += data.toString();

        if (buffer.includes("\n")) {
            const message = buffer.trim();
            buffer = "";

            if (!pseudo) {
                pseudo = message;
                pseudos.set(socket, pseudo);

                if (!channels.global) channels.global = [];
                channels.global.push(socket);

                clients.push(socket);
                socket.write(`Bienvenue ${pseudo} ! Vous êtes dans le canal #global.\n`);
                console.log(`${pseudo} vient de se connecter.`);
                broadcastToChannel("global", `-- ${pseudo} a rejoint le chat --\n`, socket);
            } else if (message === "/list") {
                const userList = Array.from(pseudos.values()).join(", ");
                socket.write(`Utilisateurs connectés : ${userList}\n`);
            } else if (message.startsWith("/whisper")) {
                const parts = message.split(" ");
                const targetPseudo = parts[1];
                const whisperMessage = parts.slice(2).join(" ");
                whisper(targetPseudo, whisperMessage, socket);
            } else if (message === "/help") {
                const helpMessage = `
Commandes disponibles :
/list                     - Liste des utilisateurs connectés.
/whisper <pseudo> <msg>   - Envoyer un message privé.
/help                     - Afficher cette aide.
\n`;
                socket.write(helpMessage);
            } else {
                console.log(`[${currentChannel}] ${pseudo}: ${message}`);
                broadcastToChannel(currentChannel, `[${pseudo}]: ${message}\n`, socket);
            }
        }
    });

    socket.on("end", () => {
        console.log(`${pseudo} s'est déconnecté.`);
        channels[currentChannel] = channels[currentChannel].filter((client) => client !== socket);
        pseudos.delete(socket);
        clients.splice(clients.indexOf(socket), 1);
        broadcastToChannel(currentChannel, `-- ${pseudo} a quitté le canal #${currentChannel} --\n`, socket);
    });

    socket.on("error", (err) => {
        console.error(`Erreur avec ${pseudo}: ${err.message}`);
    });
});

// Gestion du signal SIGINT (CTRL+C)
const handleShutdown = () => {
    console.log("Signal SIGINT reçu. Fermeture du serveur...");
    notifyClientsBeforeShutdown();

    setTimeout(() => {
        console.log("Arrêt du serveur.");
        process.exit(0);
    }, 5000);
};

process.on("SIGINT", handleShutdown);

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});
