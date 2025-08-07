// server.js
const express = require("express");
const cors = require("cors");
const { Low, JSONFile } = require("lowdb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inizializza LowDB
const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Avvia DB e imposta struttura iniziale
async function initDB() {
  await db.read();
  db.data ||= { claims: [] };
  await db.write();
}

initDB();

// Salva un nuovo claim (QR code)
app.post("/api/claim", async (req, res) => {
  const { id, prize, phone, used, timestamp } = req.body;
  if (!id || !prize) {
    return res.status(400).json({ error: "Dati mancanti" });
  }

  const claim = { id, prize, phone, used, timestamp };
  db.data.claims.push(claim);
  await db.write();
  res.json({ message: "Claim salvato con successo", claim });
});

// Recupera un claim
app.get("/api/claim/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const claim = db.data.claims.find((c) => c.id === id);
  if (!claim) {
    return res.status(404).json({ error: "QR non trovato" });
  }
  res.json(claim);
});

// Marca come usato
app.post("/api/claim/:id/use", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const claim = db.data.claims.find((c) => c.id === id);
  if (!claim) {
    return res.status(404).json({ error: "QR non trovato" });
  }
  if (claim.used) {
    return res.status(400).json({ error: "QR già usato" });
  }
  claim.used = true;
  await db.write();
  res.json({ message: "QR marcato come usato", claim });
});

// Avvio server
app.listen(PORT, () => {
  console.log("Server in ascolto su porta", PORT);
});
