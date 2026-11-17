// Instructor-visible CodeQL gate: fail when SARIF contains High/Critical security findings.
// Security severity: >=7.0 High, >=9.0 Critical. Other severities remain for human review.
import fs from 'node:fs';
import path from 'node:path';
const root = process.argv[2];
if (!root || !fs.existsSync(root)) { console.error('Missing CodeQL SARIF output directory'); process.exit(2); }
function allFiles(dir) {
  if (fs.statSync(dir).isFile()) return dir.endsWith('.sarif') ? [dir] : [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? allFiles(p) : e.name.endsWith('.sarif') ? [p] : [];
  });
}
const files = allFiles(root);
if (!files.length) { console.error('CodeQL produced no SARIF files; failing closed'); process.exit(2); }
let total = 0, blocking = 0;
for (const file of files) {
  const sarif = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const run of sarif.runs || []) {
    const rules = run.tool?.driver?.rules || [];
    for (const r of run.results || []) {
      total++;
      const rule = rules.find(x => x.id === r.ruleId) || rules[r.ruleIndex] || {};
      const severity = Number(r.properties?.['security-severity'] ?? rule.properties?.['security-severity']);
      if (Number.isFinite(severity) && severity >= 7) {
        blocking++;
        const location = r.locations?.[0]?.physicalLocation;
        console.error('High/Critical CodeQL finding:', r.ruleId || rule.id, 'severity=' + severity,
          location?.artifactLocation?.uri || '', location?.region?.startLine || '');
      }
    }
  }
}
console.log('CodeQL scan:', files.length, 'SARIF files,', total, 'findings,', blocking, 'high/critical');
if (blocking) process.exit(1);
