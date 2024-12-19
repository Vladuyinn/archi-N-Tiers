let isInterruptible = true; // Indique si le processus peut être arrêté

// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
  if (isInterruptible) {
    console.log(`Signal ${signal} reçu. Nettoyage en cours...`);
    setTimeout(() => {
      console.log("Le processus va maintenant se terminer.");
      process.exit(0);
    }, 5000);
  } else {
    console.log(`Signal ${signal} reçu, mais l'arrêt est impossible pour le moment.`);
  }
}

// Écoute des signaux SIGINT et SIGTERM
process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));

// Simulation d'un état changeant toutes les 5 secondes
setInterval(() => {
  isInterruptible = !isInterruptible;
  if (isInterruptible) {
    console.log("Le processus est maintenant dans un état où il peut être arrêté.");
  } else {
    console.log("Le processus est maintenant dans un état critique, il ne peut pas être arrêté.");
  }
}, 5000);

// Override de SIGTERM lorsque l'état est critique
process.on("SIGTERM", () => {
  if (!isInterruptible) {
    console.log("Signal SIGTERM reçu, mais ignoré car le processus est dans un état critique.");
  } else {
    handleSignal("SIGTERM");
  }
});

// Simulation d'une application active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal ou utilisez 'Stop-Process -Id <PID>' sous Windows.");