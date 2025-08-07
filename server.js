
const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

const CLAIMS_FILE = "claims.json";

// Salva una vincita
app.post("/api/save-claim", async (req, res) => {
  try {
    const data = await fs.readJson(CLAIMS_FILE);
    data.push(req.body);
    await fs.writeJson(CLAIMS_FILE, data, { spaces: 2 });
    res.status(200).json({ message: "Claim salvato" });
  } catch (error) {
    res.status(500).json({ error: "Errore nel salvataggio" });
  }
});

// Ottieni info su un QR
app.get("/api/claim/:id", async (req, res) => {
  try {
    const data = await fs.readJson(CLAIMS_FILE);
    const claim = data.find(c => c.id === req.params.id);
    if (!claim) return res.status(404).json({ error: "QR non trovato" });
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: "Errore nella lettura" });
  }
});

// Segna un QR come usato
app.post("/api/use-claim", async (req, res) => {
  try {
    const data = await fs.readJson(CLAIMS_FILE);
    const index = data.findIndex(c => c.id === req.body.id);
    if (index === -1) return res.status(404).json({ error: "QR non trovato" });

    data[index].used = true;
    await fs.writeJson(CLAIMS_FILE, data, { spaces: 2 });
    res.status(200).json({ message: "QR segnato come usato" });
  } catch (error) {
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Server in ascolto su http://${HOST}:${PORT}`);
});
