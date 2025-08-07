const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const claimsFilePath = path.join(__dirname, "claims.json");

// Assicurati che il file claims.json esista
if (!fs.existsSync(claimsFilePath)) {
  fs.writeFileSync(claimsFilePath, "[]");
}

// API per registrare una vincita
app.post("/api/claim", (req, res) => {
  const newClaim = req.body;
  const claims = JSON.parse(fs.readFileSync(claimsFilePath));
  claims.push(newClaim);
  fs.writeFileSync(claimsFilePath, JSON.stringify(claims, null, 2));
  res.json({ success: true });
});

// API per recuperare una vincita tramite ID
app.get("/api/claim/:id", (req, res) => {
  const claims = JSON.parse(fs.readFileSync(claimsFilePath));
  const claim = claims.find((c) => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "QR non trovato" });
  }
  res.json(claim);
});

// API per segnare una vincita come "usata"
app.post("/api/claim/:id/use", (req, res) => {
  const claims = JSON.parse(fs.readFileSync(claimsFilePath));
  const index = claims.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "QR non trovato" });
  }
  claims[index].used = true;
  fs.writeFileSync(claimsFilePath, JSON.stringify(claims, null, 2));
  res.json({ success: true });
});

// ✅ Endpoint per cron-job: tiene sveglio Render
app.get("/keepalive", (req, res) => {
  res.status(200).send("🟢 Backend attivo");
});

// Avvio server sulla porta dinamica fornita da Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server in ascolto sulla porta ${PORT}`);
});
