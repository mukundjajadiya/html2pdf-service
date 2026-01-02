import semver from 'semver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredVersion = pkg.engines.node;

if (!semver.satisfies(process.version, requiredVersion)) {
  console.error(`\x1b[31mError: Incompatible Node.js version.\x1b[0m`);
  console.error(`\x1b[31mRequired: ${requiredVersion}\x1b[0m`);
  console.error(`\x1b[31mCurrent: ${process.version}\x1b[0m`);
  console.error(`\x1b[33mPlease update Node.js and try again.\x1b[0m`);
  process.exit(1);
}
