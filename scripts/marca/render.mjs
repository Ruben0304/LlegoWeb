// uso: node render.mjs <svg> <png> <tamaño> [transparente]
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const [,, svg, png, size, transp] = process.argv;
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: +size, height: +size } });
await p.setContent(`<html><body style="margin:0;background:transparent">${readFileSync(svg,'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
await p.screenshot({ path: png, omitBackground: !!transp });
await b.close();
