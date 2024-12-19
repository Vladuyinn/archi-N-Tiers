const net = require("net");

// Port de la socket pour le serveur
const PORT = 5001;

// Création du serveur
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");

  // Écouter les requêtes RPC du client
  socket.on("data", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Requête reçue:", message);

      if (message.request === "echo" && message.params?.text) {
        const response = {
          response: message.params.text,
        };
        socket.write(JSON.stringify(response));
      } else {
        socket.write(JSON.stringify({ error: "Requête invalide" }));
      }
    } catch (error) {
      console.log("Erreur parsing JSON:", error.message);
      socket.write(JSON.stringify({ error: "Format JSON invalide" }));
    }
  });

  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Démarre le serveur
server.listen(PORT, () => {
  console.log(`Serveur RPC en écoute sur le port ${PORT}`);
});
