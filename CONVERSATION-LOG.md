# Pro Se Legal Clarity — build conversation log

A record of how this project came together, session by session. Kept as a reference for what exists, why it exists, and what's still open.

**Location:** `D:\Kfir Programs\Self represented help\Prompts\legal-selfrep`
**Live file:** `index.html` (single-file app, no backend, bring-your-own Anthropic API key)
**Local test path:** `serve.js` (run `node serve.js`, open `http://localhost:8455`)

---

## 1. Origin: the system prompt suite

Started from a five-part system prompt spec for a legal self-representation platform (jurisdiction auto-fetch, advice chatbot, three-sided case analyzer, judge/corruption-fighting engine, NotebookLM deep context) aimed at a Next.js/Postgres/S3 stack.

Built instead as a single static HTML file, bring-your-own-key, no backend — because:
- Statute auto-scraping was replaced with cite-then-verify (hallucinated citations are the single biggest risk to a pro se litigant).
- "Corruption engine" framing was replaced with "discretion & record-building" (teaches how to win, not how to file bias motions that backfire).
- No AWS/Postgres/S3 needed for a client-side tool with the user's own key.

## 2. The California prompt refinement

The user brought a detailed, already-strong California family law practitioner prompt (Stanley Mosk Courthouse focus) for personal use, plus a matching California appellate practitioner prompt. Both were reviewed and improved:

**Trial prompt fixes:** added record discipline (cite facts to the uploaded case file), fixed a self-contradiction (no strategy without a citation vs. no hallucinated citations), added the Statement of Decision / preserving-the-record guidance, corrected the standard-of-review framing (layered: de novo / substantial evidence / abuse of discretion, not just "deferential"), softened hardcoded dates that would go stale.

**Appellate prompt:** kept largely as written — it was already excellent — including two hard-won correction notes from real past errors: CRC 8.153 (lending the record to the respondent) and CRC 8.25 (serving the trial judge).

Then split cleanly: trial-level and appellate practice are different jobs (different standards, different failure modes), so they became two separate, non-overlapping system prompts rather than one merged one.

## 3. Building the website

Turned the two prompts into a working app with three modes (Advice Chat, Three-Sided Analyzer, Judge Perspective) crossed with case-type-specific modules, each a full "how this expert thinks" manual, not just a citation list:

- Custody and visitation
- Child support
- Spousal / partner support (added — genuinely different rules from child support)
- Property and debt division
- Domestic violence restraining order (added — safety-first framing)
- Appeal (separate base prompt)

All six modules share one anti-hallucination core (verify-flag on every citation, record discipline, no flattery, (a)-(d) claim triage, no em dashes, drafting discipline) so the safety rules can't drift between categories.

Standalone `.md` prompt files were generated in `prompts/` for reference/pasting elsewhere, built by a script (`build-prompts.js`) that pulls straight from the constants in `index.html`, so the reference files can never go stale relative to the live site.

## 4. Made it work for any U.S. state

Original build was California-only. Generalized every prompt (the trial core, all six modules, the appellate base) to remove hardcoded California statute numbers, form numbers, and case citations, replacing them with instructions to establish the actual governing law by search for whichever state the user selects.

Wired in Anthropic's built-in `web_search_20260209` tool (no beta header, works on Sonnet 5 / Opus 4.8) so the app does real, live search against official state sources before answering, instead of relying on the model's training-data memory. Handles the `pause_turn` server-side search loop.

Runtime jurisdiction header injects the selected state/county and instructs: search official primary sources first, cite URLs, never guess a statute or form number.

## 5. Mock Hearing / Mock Oral Argument (the vision expansion)

User's stated vision: a self-represented user should be able to compare both sides against the law with a virtual judge, get category-specific advice, and practice with a virtual judge who asks questions like a real hearing.

First three were already built. Added the fourth: **Mock Hearing** mode.
- Trial case types: AI plays the judicial officer, asks one question at a time (realistic pressure, cuts off rambling, rules on objections), optional opposing counsel, ends on "END HEARING," then gives a blunt debrief (what helped, what hurt quoted back, missing evidence, three answers to rehearse).
- Appeal case type: becomes **Mock Oral Argument** with a rotating hot bench of 2-3 judges pressing on the record, standard of review, and prejudice.

PRODUCT.md was written at this point (required by the design skill used later) capturing the full vision, users, and design principles.

## 6. Visual design pass (Impeccable skill)

User wanted the site to look professional, not like a developer tool, and removed the model-picker (no need to expose "what kind of AI" to end users — hardcoded to Sonnet 5).

Full redesign using the `impeccable` skill: light, calm, court-adjacent visual identity.
- OKLCH color tokens, indigo primary (hue ~290) as the brand anchor, teal badge style reserved for verify-citation flags so they visually stand out.
- Serif wordmark "Pro Se *Legal Clarity*," restructured layout (case-setup panel, mode-selector panel, API-key panel on the left; chat on the right).
- Per-mode welcome screens with three clickable example questions each, so a new user immediately understands what each tool does.
- Markdown rendering for AI answers (headings, bold, lists, links, verify-flag badges) instead of a plain-text wall.
- Mobile-responsive (tools become a 2x2 grid, 44px touch targets, no horizontal scroll), WCAG AA contrast verified (~7.8:1 body text).
- Model selector removed entirely.

## 7. Prompt content audit

Asked directly: "did we create the best prompt for all the sections?" Audit found and fixed four real gaps:

1. **"Other family law" was silently using the custody module** — wrong expert for divorce process, enforcement of ignored orders, parentage, guardianship. Built a dedicated general module, with enforcement (contempt, wage garnishment, license suspension, violation logs) as a first-class topic since it's one of the most common pro se problems and was previously missing entirely.
2. **No safety line in the shared core** — DVRO module had "call 911" but other categories didn't. Added a safety-first paragraph to the shared trial core so it applies everywhere.
3. **No answer-format discipline** — added "lead with the answer, calibrate length to the question" so simple questions don't get essay-length responses.
4. **No triage path** — added guidance for the AI to help a lost user name their problem and route to the right tool.

`build-prompts.js` was written to regenerate all `prompts/*.md` files from the live `index.html` constants on demand.

## 8. Kickstart mode

User liked the "guided intake" idea. Built as a fifth mode, made the **default** mode (first thing a new visitor sees), with its own dedicated interview prompt (separate versions for trial and appeal case types):

- Interviews the user in short, 2-3-question rounds (never an interrogation), with a built-in gentle safety check if the story hints at danger.
- Delivers a structured plan: what you have → where you are procedurally → deadlines first → next three moves (with real state form names, found by search) → evidence to gather now → which of the site's other tools to use next → human help (self-help center, legal aid).
- Appeal version runs the threshold gates as plain questions and is honest when a deadline has already passed rather than offering false hope.

Intended user journey: **Start here** → get a plan → **Get advice** on each step → **Compare both sides** once papers arrive → **Judge's analysis** before filing → **Practice courtroom** before appearing.

## 9. State pre-selection

Replaced the free-text State field with a dropdown of all 50 states + DC (51 options), defaulting to California. Added localStorage persistence so state, county, and case type are remembered between visits.

Confirmed live in-browser that selecting a different state (tested: Florida) correctly changes the system prompt's governing-jurisdiction instruction and search directive — the app answers under the selected state's actual law, not California's, for every one of the 51 choices.

## 10. Local testing without an API key (Ollama)

User has Ollama running locally and wanted to test the site for free before spending on the API. Added a "Test locally with Ollama (no key)" checkbox in the API-key panel:

- Auto-detects installed Ollama models via `/api/tags` and lets the user pick one.
- Routes chat through `http://localhost:11434/api/chat` instead of Anthropic when enabled.
- Because local models can't run the web-search tool, the jurisdiction header swaps to a stricter "you have no search tool — never guess, always point to the official source" instruction in local mode.
- Visible on-screen warning that local mode is for testing the experience only, not for real legal reliance (no live law search).

**Follow-up fixes after real usage surfaced two bugs:**
- Local model context was hardcoded to 16,384 tokens and failed on a 32.5k-token request. Fixed by reading each model's real max context from Ollama and sizing the request dynamically (min 16k, up to the model's cap).
- A 149k-token case file still exceeded even a 131k-token model's maximum (a genuine hardware ceiling, not a bug). Fixed the error handling: warn the user at attach time (before waiting for a response) with the estimated token count and clear next steps (attach less, paste key pages, or switch to the real API key which comfortably handles large files), and removed a confusing "is Ollama running?" line from an error that had nothing to do with Ollama being down.

**Practical guidance settled on:** local/Ollama mode is good for testing flows, Kickstart interviews, and moderate single documents; the paid API path (Sonnet 5, 1M token context, live search) is the right tool for full case files and real reliance.

## 11. Free path + published live

Verified there is no way to give visitors free Claude usage *inside* the site (no free API tier; "Sign in with Claude" draws from prepaid credits that free accounts don't get). Built the honest alternative: a "Use free on Claude.ai" button that copies the full expert prompt (case type + state, always with the live-search instructions) and opens claude.ai, where a free account works. Panel sits above the API-key panel; API path relabeled "Full experience."

Deployed to GitHub Pages: repo `kfirmelamed1-rgb/legal-clarity` (public, MIT), live at **https://kfirmelamed1-rgb.github.io/legal-clarity/**. Zero hosting cost. To update the live site: commit and `git push`; Pages rebuilds in about a minute. Donation button agreed in principle — waiting on the user to create a GitHub Sponsors or Ko-fi link; wording must be "Support this project" (not tax-deductible; no registered 501(c)(3)).

---

## Current architecture summary

- **Single file:** `index.html` — all HTML, CSS (OKLCH tokens), and JS inline. No build step, no framework.
- **Five modes:** Kickstart (default), Advice, Three-Sided Analyzer, Judge Perspective, Mock Hearing/Oral Argument.
- **Seven case-type modules:** custody, child support, spousal support, property division, domestic violence/protective order, general/other (divorce process, enforcement, parentage), appeal.
- **Two backends:** Anthropic API (`claude-sonnet-5`, live web search, user's own key) or local Ollama (no key, no search, context auto-sized).
- **State-adaptive:** 51-option dropdown, persisted, drives a runtime jurisdiction header that changes both the governing-law instruction and the search behavior.
- **Reference exports:** `prompts/*.md`, one file per case type, regenerated from the live app via `build-prompts.js`.
- **Design:** light, professional, OKLCH-token-based, WCAG AA, mobile-responsive.
- **PRODUCT.md:** the design-system source of truth for register, users, purpose, and principles.

## Open items / offered but not yet built

- Deep California-specific reference file (the original detailed Family Code / form-number / case-citation content) as a standalone companion document for the user's own case, since the live app now generalizes and searches rather than hardcoding it.
- Dark mode / theme toggle for late-night case prep (design system uses tokens, so this would be a contained addition).
- Possible future tools discussed but not built: "explain what I just got served" (upload + explain a filing), hearing countdown checklist, evidence organizer (dated exhibit list), objection coach.

---

*Log generated 2026-07-11 at the end of a multi-session build. Not legal content itself — a project history for whoever picks this codebase up next, including future-Claude.*
