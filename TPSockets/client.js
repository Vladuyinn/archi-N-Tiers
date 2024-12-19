const net = require("net");

// Port et configuration du serveur
const PORT = 5001;

// Connexion au serveur
const client = net.createConnection(PORT, "localhost", () => {
  console.log("--- Connecté au serveur.");

  // Envoie une requête JSON "echo"
  const request = {
    request: "echo",
    params: { text: "This is a test." },
  };

  client.write(JSON.stringify(request));
});

// Réception des réponses du serveur RPC
client.on("data", (data) => {
  const response = JSON.parse(data.toString());
  console.log("Réponse du serveur:", response);

  client.end(); // Terminer la connexion après réception
});

client.on("end", () => {
  console.log("--- Déconnecté du serveur.");
});
