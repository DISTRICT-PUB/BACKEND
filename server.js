const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const dbFile = path.join(__dirname, 'claims.json');

// Rotta per salvare una nuova vincita
app.post('/api/claim', (req, res) => {
  const claim = req.body;

  fs.readFile(dbFile, 'utf8', (err, data) => {
    let claims = [];
    if (!err && data) {
      try {
        claims = JSON.parse(data);
      } catch (e) {
        console.error('Errore parsing JSON:', e);
      }
    }

    claims.push(claim);

    fs.writeFile(dbFile, JSON.stringify(claims, null, 2), (err) => {
      if (err) {
        console.error('Errore salvataggio:', err);
        return res.status(500).json({ error: 'Errore salvataggio' });
      }

      res.status(200).json({ message: 'Claim salvato con successo' });
    });
  });
});

// Rotta per ottenere una vincita specifica
app.get('/api/claim/:id', (req, res) => {
  const claimId = req.params.id;

  fs.readFile(dbFile, 'utf8', (err, data) => {
    if (err || !data) {
      return res.status(404).json({ error: 'Claim non trovato' });
    }

    try {
      const claims = JSON.parse(data);
      const claim = claims.find(c => c.id === claimId);
      if (!claim) return res.status(404).json({ error: 'QR non valido o non trovato' });

      res.status(200).json(claim);
    } catch (e) {
      res.status(500).json({ error: 'Errore lettura claim' });
    }
  });
});

// Rotta per marcare come usato
app.post('/api/claim/:id/use', (req, res) => {
  const claimId = req.params.id;

  fs.readFile(dbFile, 'utf8', (err, data) => {
    if (err || !data) {
      return res.status(404).json({ error: 'Claim non trovato' });
    }

    try {
      const claims = JSON.parse(data);
      const index = claims.findIndex(c => c.id === claimId);
      if (index === -1) return res.status(404).json({ error: 'Claim non trovato' });

      claims[index].used = true;

      fs.writeFile(dbFile, JSON.stringify(claims, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: 'Errore aggiornamento claim' });
        }
        res.status(200).json({ message: 'Claim marcato come usato' });
      });
    } catch (e) {
      res.status(500).json({ error: 'Errore interno' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su porta ${PORT}`);
});
