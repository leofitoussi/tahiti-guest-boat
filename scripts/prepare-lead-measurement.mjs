import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Retain the exact live homepage experiment and committed mail function. Do not
// publish the unrelated attribution, consent, CMS or email work in this checkout.
const production = process.argv.includes('--production');
const result = execFileSync(process.execPath, ['scripts/prepare-home-experiment.mjs', ...(production ? ['--production'] : [])], { encoding: 'utf8' });
const { buildDir, baseCommit, context } = JSON.parse(result);
const files = ['src/lib/confirmed-lead-client.ts', 'src/lib/tally-submission.ts'];
for (const file of files) copyFileSync(file, join(buildDir, file));
const patch = (file, replacements) => {
  let source = readFileSync(join(buildDir, file), 'utf8');
  for (const [before, after] of replacements) {
    if (source.split(before).length !== 2) throw new Error(`Review the selective lead patch: ${file}`);
    source = source.replace(before, after);
  }
  writeFileSync(join(buildDir, file), source);
};
patch('src/components/ConfirmationPage.astro', [
  ['    data-confirmation', '    data-confirmation\n    data-lead-measurement-enabled={String(process.env.CONTEXT === \'production\')}'],
  ["  import { consumeTallySubmission } from '../lib/tally-submission';", "  import { takeTallySubmission } from '../lib/tally-submission';\n  import { trackConfirmedUmamiLead } from '../lib/confirmed-lead-client';"],
  ['if (formId && submissionId && conversionDestination)', 'if (formId && submissionId)'],
  ['const isConfirmedSubmission = consumeTallySubmission(', 'const proof = takeTallySubmission('],
  ['      if (isConfirmedSubmission && gtag) {', `      if (proof && confirmation?.dataset.leadMeasurementEnabled === 'true') {
        trackConfirmedUmamiLead({ formId, submissionId, locale: formId === 'eqOGYl' ? 'en' : 'fr', formPagePath: proof.formPagePath || '/' });
      }
      if (proof && gtag && conversionDestination) {`],
]);
patch('src/components/TallyEmbed.astro', [
  ['      if (!formId) continue;', "      if (!formId || event.source !== form.contentWindow) continue;"],
  ['rememberTallySubmission(window.sessionStorage, submission, Date.now())', 'rememberTallySubmission(window.sessionStorage, { ...submission, formPagePath: window.location.pathname }, Date.now())'],
]);
writeFileSync(join(buildDir, '.lead-measurement-build.json'), JSON.stringify({ baseCommit, context, files, patched: ['src/components/ConfirmationPage.astro', 'src/components/TallyEmbed.astro'] }, null, 2));
if (process.argv.includes('--build')) {
  execFileSync('npm', ['run', 'build'], { cwd: buildDir, stdio: 'inherit', env: {
    ...process.env, CONTEXT: context, HOME_INTRO_EXPERIMENT_BUILD: '1', HOME_BETA: production ? '0' : '1',
  } });
}
process.stdout.write(JSON.stringify({ buildDir, baseCommit, context }) + '\n');
