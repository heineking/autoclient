import fs from 'fs';
import path from 'path';
import hbs from 'handlebars';
import { transform } from './transform';
import { Client } from './types';

const [openApiUrl, outpath] = process.argv.slice(2);

const config = {
  sources: {
    client: fs.readFileSync(path.resolve(__dirname, './assets/client.g.ts.hbs')).toString(),
  },
  files: {
    client: fs.readFileSync(path.resolve(__dirname, './assets/client.ts')).toString(),
    types: fs.readFileSync(path.resolve(__dirname, './assets/types.ts')).toString(),
  },
};

const template = hbs.compile<Client>(config.sources.client, { noEscape: true });

(async () => {
  const { requests, paths, models } = await transform(openApiUrl);

  const output = template({
    requests,
    paths,
    models,
    path: paths.map(p => `"${p}"`).join(' |\n  '),
    files: config.files,
  });

  fs.writeFileSync(outpath, output);
  console.log(`file: ${outpath} created`);
})();

