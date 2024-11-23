const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer')
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

async function getPartidos(req, res) {
    try {
        // Lanzar el navegador
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navegar a la página
        await page.goto(url, { waitUntil: 'networkidle2' });

        const partidosTotales = []; // Para almacenar todos los partidos

        for (let i = 1; i <= 27; i++) {
            const fecha = i
            // Ejecutar una función en el navegador para cargar los datos
            await page.evaluate((fecha) => {
                if (typeof irfecha === 'function') {
                    irfecha(fecha); 
                }
            }, `${fecha}_14`); // Pasar el valor de `i` como argumento

            // Esperar a que los elementos dinámicos se carguen en el DOM
            await page.waitForSelector('#fixturein table tr', { timeout: 10000 });

            // Extraer los datos requeridos después de que se ejecutó la función
            const partidos = await page.evaluate((fechaActual) => {
                const partidos = [];
                document.querySelectorAll('#fixturein table tr').forEach((row) => {
                    const hora = row.querySelector('.game-time')?.textContent.trim();
                    const equipo1 = row.querySelector('.game-t1 .datoequipo[id^="t1_"]')?.textContent.trim();
                    const equipo2 = row.querySelector('.game-t1 .datoequipo[id^="t2_"]')?.textContent.trim();
                    
                    if (hora && equipo1 && equipo2) {
                        partidos.push({ hora, equipo1, equipo2, fecha: fechaActual });
                    }
                });
                return partidos;
            }, fecha);

            // Agregar los partidos de la fecha actual a la lista total
            partidosTotales.push(...partidos);
        }

        // Cerrar el navegador
        await browser.close();

        // Devolver los datos como respuesta de la API
        res.json({ partidos: partidosTotales });
    } catch (error) {
        console.error('Error al usar Puppeteer:', error);
        res.status(500).send('Error al obtener los datos dinámicos');
    }
}




module.exports = {
    getPosiciones,
    getPartidos,
};
