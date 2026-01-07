import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_NAME = 'isoatthetop';
const outputRoot = path.join(process.cwd(), 'dist', PROJECT_NAME, 'browser');

const sharedScript = `
  (function () {
    var isLocale = function (s) { return s === 'fr' || s === 'en'; };
    var parts = location.pathname.split('/').filter(Boolean);
    var project = parts.length >= 2 && isLocale(parts[1]) ? parts[0] : '';
    var locale = project ? parts[1] : (isLocale(parts[0]) ? parts[0] : '');
    var base = '/' + (project ? project + '/' : '') + (locale ? locale + '/' : '');
    return { project: project, locale: locale, base: base, parts: parts };
  })()
`;

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Iso At The Top</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0;url=en/">
    <script>
      (function () {
        var info = ${sharedScript};
        var locale = info.locale;
        if (!locale) {
          try {
            var nav = (navigator.language || '').toLowerCase();
            locale = nav.startsWith('fr') ? 'fr' : 'en';
          } catch (e) {
            locale = 'en';
          }
        }
        var target = '/' + (info.project ? info.project + '/' : '') + locale + '/';
        location.replace(target);
      })();
    </script>
  </head>
  <body></body>
</html>
`;

const notFoundHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting…</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      (function () {
        var isLocale = function (s) { return s === 'fr' || s === 'en'; };
        var parts = location.pathname.split('/').filter(Boolean);

        // Try to infer project + locale from the 404 path.
        var project = parts.length >= 2 && isLocale(parts[1]) ? parts[0] : '';
        var locale = project ? parts[1] : (isLocale(parts[0]) ? parts[0] : '');

        if (!locale) {
          try {
            var nav = (navigator.language || '').toLowerCase();
            locale = nav.startsWith('fr') ? 'fr' : 'en';
          } catch (e) {
            locale = 'en';
          }
        }

        var base = '/' + (project ? project + '/' : '') + locale + '/';
        var original = location.pathname + location.search + location.hash;
        location.replace(base + '?ghp=' + encodeURIComponent(original));
      })();
    </script>
  </head>
  <body></body>
</html>
`;

await fs.mkdir(outputRoot, { recursive: true });
await fs.writeFile(path.join(outputRoot, 'index.html'), indexHtml, 'utf8');
await fs.writeFile(path.join(outputRoot, '404.html'), notFoundHtml, 'utf8');
console.log(`Wrote GitHub Pages root files to ${outputRoot}`);

