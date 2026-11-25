import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

// A deliberately selective staging tree: unrelated uncommitted work is excluded.
const repo = process.cwd();
const context = process.argv.includes('--production') ? 'production' : 'deploy-preview';
const buildDir = mkdtempSync(join(tmpdir(), 'tgb64-ab-'));
const baseCommit = execFileSync('git', ['rev-parse', process.env.HOME_EXPERIMENT_BASE_REF || '2c942fe8cc1f7f9b3a4c4e831d0b286fc43e68cf'], { cwd: repo, encoding: 'utf8' }).trim();
const archive = execFileSync('git', ['archive', baseCommit], { cwd: repo, maxBuffer: 64 * 1024 * 1024 });
execFileSync('tar', ['-x', '-C', buildDir], { input: archive });
const files = [
  'src/components/blocks/HeroHeader.astro', 'src/components/preview/HomeIntroSequence.astro',
  'src/lib/home-intro-sequence.ts', 'src/pages/home-beta/[...preview].astro',
  'src/pages/index.astro', 'src/pages/home-experiment/[variant].astro',
  'src/components/analytics/HomeEngagement.astro', 'src/lib/home-experiment.ts',
  'src/lib/home-engagement-client.ts', 'netlify/edge-functions/home-intro-test.js',
  'netlify/lib/home-experiment-schedule.mjs',
];
for (const file of files) {
  const destination = join(buildDir, file);
  mkdirSync(dirname(destination), { recursive: true }); cpSync(resolve(repo, file), destination);
}
const layout = join(buildDir, 'src/layouts/BaseLayout.astro');
let source = readFileSync(layout, 'utf8');
function insert(oldText, newText) {
  if (source.includes(newText)) return;
  if (source.split(oldText).length !== 2) throw new Error('BaseLayout changed: review the selective staging patch before deploying.');
  source = source.replace(oldText, newText);
}
insert("import CookieConsentHead from '../components/consent/CookieConsentHead.astro';", "import CookieConsentHead from '../components/consent/CookieConsentHead.astro';\nimport HomeEngagement from '../components/analytics/HomeEngagement.astro';");
insert('  heroPreload?: { srcset: string; sizes: string };', '  heroPreload?: { srcset: string; sizes: string };\n  canonicalPath?: string;');
insert('  heroPreload,', '  heroPreload,\n  canonicalPath,');
insert('buildLocalizedMetadata(Astro.url.pathname,', 'buildLocalizedMetadata(canonicalPath ?? Astro.url.pathname,');
insert('    <CookieConsentBanner locale={locale} />', '    <CookieConsentBanner locale={locale} />\n    <HomeEngagement />');
writeFileSync(layout, source);
symlinkSync(join(repo, 'node_modules'), join(buildDir, 'node_modules'), 'dir');
if (existsSync(join(repo, '.env'))) symlinkSync(join(repo, '.env'), join(buildDir, '.env'));
// Previews never deploy the unrelated mail/webhook functions. A production
// staging tree retains the committed functions from the baseline archive.
if (context !== 'production') rmSync(join(buildDir, 'netlify/functions'), { recursive: true, force: true });
writeFileSync(join(buildDir, '.home-experiment-build.json'), JSON.stringify({ baseCommit, files, context }, null, 2));
if (process.argv.includes('--build')) {
  execFileSync('npm', ['run', 'build'], { cwd: buildDir, stdio: 'inherit', env: {
    ...process.env, CONTEXT: context, HOME_INTRO_EXPERIMENT_BUILD: '1', HOME_BETA: context === 'production' ? '0' : '1',
  } });
}
process.stdout.write(JSON.stringify({ buildDir, baseCommit, context }) + '\n');
