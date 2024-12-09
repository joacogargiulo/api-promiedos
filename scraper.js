const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://www.promiedos.com.ar/primera';

async function getPosiciones(req, res) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const posiciones = {
            tablaPuntosPrimera: [],
            tablaAnual: [],
            tablaPromedios: []
        };

        // Extraer la "Tabla pts Primera" - clase "tablesorter1"
        $('.tablesorter1 tbody tr').each(function () {
            const pos = parseInt($(this).find('td').eq(0).text().trim());
            const equipo = $(this).find('td').eq(1).text().trim();
            const escudo = $(this).find('td').eq(1).find('img').attr('src');
            const pts = parseInt($(this).find('td').eq(2).text().trim());
            const pj = parseInt($(this).find('td').eq(3).text().trim());
            const pg = parseInt($(this).find('td').eq(4).text().trim());
            const pe = parseInt($(this).find('td').eq(5).text().trim());
            const pp = parseInt($(this).find('td').eq(6).text().trim());
            const gf = parseInt($(this).find('td').eq(7).text().trim());
            const gc = parseInt($(this).find('td').eq(8).text().trim());
            const dif = parseInt($(this).find('td').eq(9).text().trim());

            posiciones.tablaPuntosPrimera.push({
                pos,
                equipo,
                escudo,
                pts,
                pj,
                pg,
                pe,
                pp,
                gf,
                gc,
                dif
            });
        });

        // Extraer la "Tabla Anual 2024 (Copas+Descenso)" - clase "tablesorter5"
        $('.tablesorter5 tbody tr').each(function () {
            const pos = parseInt($(this).find('td').eq(0).text().trim());
            const equipo = $(this).find('td').eq(1).text().trim();
            const escudo = $(this).find('td').eq(1).find('img').attr('src');
            const pts = parseInt($(this).find('td').eq(2).text().trim());
            const pj = parseInt($(this).find('td').eq(3).text().trim());
            const pg = parseInt($(this).find('td').eq(4).text().trim());
            const pe = parseInt($(this).find('td').eq(5).text().trim());
            const pp = parseInt($(this).find('td').eq(6).text().trim());
            const gf = parseInt($(this).find('td').eq(7).text().trim());
            const gc = parseInt($(this).find('td').eq(8).text().trim());
            const dif = parseInt($(this).find('td').eq(9).text().trim());

            posiciones.tablaAnual.push({
                pos,
                equipo,
                escudo,
                pts,
                pj,
                pg,
                pe,
                pp,
                gf,
                gc,
                dif
            });
        });

        $('#promedios tbody tr').each(function () {
            const pos = parseInt($(this).find('td').eq(0).text().trim());
            const equipo = $(this).find('td').eq(1).text().trim();
            const escudo = $(this).find('td').eq(1).find('img').attr('src');
            const temporada22 = parseInt($(this).find('td').eq(2).text().trim());
            const temporada23 = parseInt($(this).find('td').eq(3).text().trim());
            const temporada24 = parseInt($(this).find('td').eq(4).text().trim());
            const pts = parseInt($(this).find('td').eq(5).text().trim());
            const pj = parseInt($(this).find('td').eq(6).text().trim());
            const prom = parseFloat($(this).find('td').eq(7).text().trim());

            posiciones.tablaPromedios.push({
                pos,
                equipo,
                escudo,
                temporada22,
                temporada23,
                temporada24,
                pts,
                pj,
                prom
            })
        })

        // Retornar las posiciones como respuesta
        res.json(posiciones);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getFecha(req, res) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let found
        let lastInvalidMatch = null;
        const partidosEnJuego = []

        $('#fixturein table tr').each((index, element) => {
            const $row = $(element);
            
            const hora = $row.find('.game-time')?.text().trim();
            const enJuego = $row.find('.game-play')?.text().trim();
            const equipo1 = $row.find('.game-t1 .datoequipo[id^="t1_"]').text().trim();
            const equipo2 = $row.find('.game-t1 .datoequipo[id^="t2_"]').text().trim();
            
            // Guarda el último partido como inválido si no tiene hora
            if (equipo1 && equipo2) {
                lastInvalidMatch = { equipo1, equipo2 };
            }

            if (enJuego) {
                found = 'jugando'
                const resultado1 =  $row.find('[id^="r1_1"]').text().trim();
                const resultado2 =  $row.find('[id^="r2_1"]').text().trim();
                partidosEnJuego.push({equipo1, equipo2, resultado1, resultado2})
            }
            
            // Si se encuentra un partido válido, devuélvelo y marca como encontrado
            if (!found && hora && equipo1 && equipo2) {
                found = 'proximo';
                res.json({equipo1, equipo2})
                return false
            }
        })

        if (found === 'jugando') {
            res.status(201).json(partidosEnJuego)
        }

        // Si no se encuentra un partido válido, devuelve el último partido inválido
        if (!found) {
            if (lastInvalidMatch) {
                res.status(202).json(lastInvalidMatch);
            } else {
                res.status(404).json({ message: 'No se encontraron partidos.' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getPosiciones,
    getFecha,
};
