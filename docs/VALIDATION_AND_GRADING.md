# Reviewer guide: independent validation and grading

This document is written for the **instructor**. Do not use an intern's own test output or bug counts as the final source of truth.

## What each gate can and cannot prove
1. **PR evidence check**: Confirms that the intern used a feature branch, opened a pull request, referenced bug IDs, and supplied the required report fields. This does not validate whether their claims are true.
2. **Existing FaultKart CI**: Compiles React and exercises a happy-path API checkout with MongoDB. It is a baseline, *not* an exhaustive defect detector.
3. **Security validation**: Gitleaks scans for exposed secrets; npm audit and Trivy find dependency/configuration vulnerabilities; Semgrep finds rule-based security patterns; CodeQL analyzes JavaScript dataflow and records code-scanning alerts.
4. **Runtime security**: OWASP ZAP baseline passively checks a locally started disposable app. This is not comprehensive active penetration testing or an authenticated scan.
5. **Instructor-only acceptance tests**: A separate private test suite, *not committed here*, validates the intentionally planted business and security bugs by exercising the PR candidate. All seeded defects must have passing tests with evidence.

**Important**: Some analyzers report findings without failing their workflow. In particular, a successful CodeQL job means analysis completed; the instructor must still review Code Scanning alerts and severity.

## Trusted grading boundary
- Keep the answer key, seeded-defect manifest and acceptance tests in an **instructor-controlled private repository or offline bundle**, never in this public repo, PR description, public CI log, or an intern-readable branch.
- Test the *exact PR head SHA*, not the current main branch.
- The public PR runner has read-only permissions, no production credentials, and no access to the instructor's private test suite.
- For a stronger adversarial setup, run the candidate in an isolated disposable environment with no instructor credentials or read access to the private tests. Execute private tests from a separate trusted host or network boundary.
- Never use `pull_request_target` to checkout and execute untrusted PR code alongside secrets.
- The instructor publishes only a pass/fail summary, unresolved defect IDs, and requested rework—not the hidden test source.
- After the intern fixes a bug, re-run tests against the updated PR SHA. A successful run against an older SHA is not accepted.

## Suggested grade (100 points)
| Dimension | Points | Requirement |
|---|---:|---|
| Seeded defects | 35 | All instructor-known defects fixed; no regressions |
| Testing and evidence | 20 | Before/after reproduction and meaningful regression tests |
| Security | 20 | Scan results triaged; no unapproved high/critical findings |
| Git workflow | 10 | Correct branch, commits, reviewable PR, no gate bypass |
| Agent orchestration | 15 | Distinct agents, multiple MCPs, approvals, durable audit trail |

Do not approve merge if any required seeded-defect test fails, any scanner's execution fails without investigation, any high/critical finding is unresolved without documented exception, or a test/security workflow was removed or weakened.

## Branch protection — REQUIRED MANUAL SETUP
GitHub Free supports branch protection on this **public** repository. Configure: **Settings → Branches → Add classic branch protection rule**; set branch `main`.

- Enable **Require a pull request before merging**.
- Require **at least one approving review** and **require review from code owners**; make sure the instructor is an actual reviewer distinct from the intern.
- Enable **Dismiss stale approvals** after changes and **Require conversation resolution**.
- Enable **Require status checks to pass** and optionally **Require branches to be up to date**.
- After the first run of every workflow, require these check names:
  - `test-build-and-smoke`
  - `PR evidence check`
  - `Secret scan (Gitleaks)`
  - `Dependency audit (npm)`
  - `Filesystem scan (Trivy)`
  - `Static analysis (CodeQL)`
  - `Security rules (Semgrep)`
  - `Runtime scan (OWASP ZAP)`
- Disable force pushes and branch deletion; enable **Do not allow bypassing the above settings** if available.
- For each required check, select the official expected GitHub Actions source where GitHub allows it.

These checks are a **minimum**, not a hidden-oracle implementation. An instructor must explicitly review and record the private evaluation result before approval. GitHub does not enforce the human's hidden-test conclusion unless a trusted external check is independently configured and required.

## Reviewer merge checklist
- [ ] PR was submitted from an appropriate intern branch.
- [ ] Compare changed files, commits, and PR timeline; confirm the changes are the intern's.
- [ ] No workflow, test, approval gate, tool policy, or scanning exclusion was disabled or weakened.
- [ ] Verify bug register entries against reproducible evidence.
- [ ] Independently run instructor-only seeded-defect tests on current PR SHA; **100% pass**.
- [ ] Review all CodeQL and scanner alerts; no unresolved high/critical finding except an explicitly approved exception.
- [ ] Review residual risk and regression coverage; ask for explanation of untested cases.
- [ ] Only then provide human approval and merge.

## Rescans and known flaws
The starter app intentionally contains functional defects and may have security findings. Security checks are not guaranteed to pass before the intern starts fixing them. Record initial findings as the baseline and require remediation; do not silence them by blanket ignores or `continue-on-error`.

If a scanner fails for operational reasons (registry outage or an action breakage), that is **not** a passing scan. Investigate and rerun it.
