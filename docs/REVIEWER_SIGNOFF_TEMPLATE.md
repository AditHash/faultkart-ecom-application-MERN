# FaultKart — Instructor sign-off (PRIVATE RESULTS, do not commit completed scorecard)

> This is a template. Fill results in a private record for each submitted PR, not in a public issue or PR comment if they reveal hidden tests.

## Submission identity
- Intern GitHub username:
- PR URL:
- Source branch:
- Exact PR head SHA:
- Evaluated UTC date/time:
- Reviewer:
- Test environment/database reset reference:

## Branch and PR integrity
- [ ] Feature branch was used; commits are visible and reviewable
- [ ] PR target is main; no direct pushes to main
- [ ] No reviewer-controlled workflow, test, or scanner was weakened
- [ ] CODEOWNERS review and branch protection are enabled and effective

## Mandatory public checks
| Required status check | Run URL | Status | Findings/action |
|---|---|---|---|
| test-build-and-smoke | | | |
| PR evidence check | | | |
| Secret scan (Gitleaks) | | | |
| Dependency audit (npm) | | | |
| Filesystem scan (Trivy) | | | |
| Static analysis (CodeQL) | | | |
| Security rules (Semgrep) | | | |
| Runtime scan (OWASP ZAP) | | | |

CodeQL job success = analysis succeeded; reviewer must also inspect code-scanning alerts. Skipped, missing or neutral checks are not sufficient proof of executed tests. Review execution logs and **exact SHA** before approval.

## Independent acceptance suite
- Private oracle version/commit:
- Candidate SHA:
- Known seeded defects expected:
- Hidden tests passed:
- Hidden tests failed:
- Regression findings and reproducible evidence:
- Result: PASS / FAIL (require 100% of known seeded defects)

## Human security decision
- Open critical findings:
- Open high findings:
- Accepted exceptions (with rationale and reviewer signature):
- Any scanner outage/failure or excluded scope:
- Security sign-off: PASS / FAIL

## Grade /100
| Category | Points earned | Maximum |
|---|---:|---:|
| Seeded defects | | 35 |
| Testing/evidence | | 20 |
| Security review | | 20 |
| Git workflow and PR | | 10 |
| Agent orchestration and MCP | | 15 |

## Decision
- [ ] Accept and approve PR
- [ ] Request changes; include failing bug IDs but not hidden test implementations
- [ ] Reject submission
- Notes:
- Reviewer signature/date:
