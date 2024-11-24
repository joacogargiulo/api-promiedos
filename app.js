const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const scraper = require('./scraper');

app.get('/', function (req, res) {
    res.json('Web scraper para obtener la tablas de posiciones de https://www.promiedos.com.ar/primera ');
});

app.get('/posiciones', async (req, res) => {
    await scraper.getPosiciones(req, res);
});

// app.get('/partidos', async (req, res) => {
//     await scraper.getPartidos(req, res);
// });

app.get('/partido', async (req, res) => {
    await scraper.getFecha(req, res);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
