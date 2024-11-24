const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core')
const chromium = require('@sparticuz/chromium')
const url = 'https://www.promiedos.com.ar/primera';

async function getPosiciones(req, res) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const posiciones = {
            tablaPuntosPrimera: [],
            tablaAnual: [],
        };

        // Extraer la "Tabla pts Primera" - clase "tablesorter1"
        $('.tablesorter1 tbody tr').each(function () {
            const pos = parseInt($(this).find('td').eq(0).text().trim());
            const equipo = $(this).find('td').eq(1).text().trim();
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
        $('#fixturein table tr').each((index, element) => {
            const $row = $(element);
            
            const hora = $row.find('.game-time')?.text().trim();
            const equipo1 = $row.find('.game-t1 .datoequipo[id^="t1_"]').text().trim();
            const equipo2 = $row.find('.game-t1 .datoequipo[id^="t2_"]').text().trim();
            
            if (hora && equipo1 && equipo2) {
                res.json({equipo1, equipo2})
                return false
            }
        })
        

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getPosiciones,
    getFecha,
};
