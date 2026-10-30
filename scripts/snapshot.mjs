// Writes one self-contained HTML file per page: the prerendered page from build/, with its
// stylesheets inlined and the client scripts dropped. That is the page as the desk sees it.
// Usage: node scripts/snapshot.mjs <page path under build/, e.g. kb/incidents/4471/problems>
import fs from 'node:fs';
import path from 'node:path';

const page = process.argv[2];
const file = path.join('build', `${page}.html`);
let html = fs.readFileSync(file, 'utf8');

html = html.replace(/<link href="([^"]+\.css)" rel="stylesheet">/g, (_, href) => {
  const css = fs.readFileSync(path.join(path.dirname(file), href), 'utf8');
  return `<style>${css}</style>`;
});
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');
html = html.replace(/<script>[\s\S]*?<\/script>/g, '');

const out = path.join('rendered', `${page.replaceAll('/', '-')}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(out);
