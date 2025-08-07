const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new Map();

// Salva un nuovo claim
app.post("/api/save-claim", (req, res) => {
  const { id, prize, phone, used = false, timestamp } = req.body;
  if (!id || !prize) return res.status(400).json({ error: "Dati mancanti" });

  db.set(id, { id, prize, phone, used, timestamp });
  res.json({ message: "Salvato con successo", id });
});

// Verifica stato QR
app.get("/api/claim/:id", (req, res) => {
  const entry = db.get(req.params.id);
  if (!entry) return res.status(404).json({ error: "QR non trovato" });
  res.json(entry);
});

// Segna come usato
app.post("/api/claim/:id/use", (req, res) => {
  const entry = db.get(req.params.id);
  if (!entry) return res.status(404).json({ error: "QR non trovato" });

  entry.used = true;
  db.set(req.params.id, entry);
  res.json({ message: "QR aggiornato", entry });
});

app.listen(PORT, () => {
  console.log(`✅ Server in ascolto sulla porta ${PORT}`);
});
