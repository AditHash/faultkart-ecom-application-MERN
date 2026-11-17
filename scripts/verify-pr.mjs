import assert from 'node:assert/strict';
import fs from 'node:fs';

const eventPath = process.env.GITHUB_EVENT_PATH;
assert.ok(eventPath && fs.existsSync(eventPath), 'GitHub PR event payload is required');
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const pr = event.pull_request;
assert.ok(pr, 'This gate must run on a pull_request event');
const base = pr.base?.ref;
const head = pr.head?.ref;
const body = pr.body || '';
assert.equal(base, 'main', 'Pull request must target main');
assert.ok(head && head !== 'main', 'Intern must work on a separate feature branch');
assert.match(head, /^(fix|bugfix|intern|feature|security)\/[\w.-]+$/, 'Use an explicit fix/, bugfix/, intern/, feature/, or security/ branch');
const required = ['Bugs fixed', 'Evidence', 'Test results', 'Security review', 'Remaining risks'];
for (const section of required) {
  assert.ok(new RegExp('^##\\s+' + section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'mi').test(body), 'Missing PR section: ' + section);
}
assert.match(body, /\bFK-\d{3,}\b/i, 'PR must cite one or more bug IDs');
const stripped = body.replace(/<!--[\s\S]*?-->/g, '');
assert.ok(!/REPLACE WITH|\bREPLACE\b/.test(stripped), 'Replace every placeholder in PR template');
for (const field of ['Reproduction before fix:', 'Regression test(s) and file paths:', 'Unit/integration/CI link:', 'Secret scan:', 'ZAP findings:']) {
  assert.ok(stripped.includes(field), 'Missing evidence field: ' + field);
}
assert.match(stripped, /- \[x\] Every issue has a reproducible before\/after demonstration\./i, 'Complete the PR checklist before requesting review');
console.log('PR evidence structure accepted. This validates FORMAT only, not the truth or completeness of findings.');
