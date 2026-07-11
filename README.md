# Pro Se Legal Clarity

A free, nonprofit tool that helps self-represented ("pro se") people in any U.S. state understand their family law case, compare both sides against the law, see their case through a judge's eyes, and practice for hearings — powered by AI, with built-in safeguards against made-up citations.

**This is education, not legal advice.** No AI is a lawyer. Verify every statute, rule, and case on the official source before relying on it in court.

## How it works

- One file (`index.html`), no server, no tracking, no account. Open it and it runs in your browser.
- You bring your own [Anthropic API key](https://console.anthropic.com/) — your conversations go directly from your browser to Anthropic, never through anyone else's server.
- Works for all 50 states + DC: the AI searches official state sources live instead of guessing.

## Five tools

1. **Kickstart** — a guided interview that turns your situation into a step-by-step plan
2. **Get advice** — ask questions about your case type
3. **Compare both sides** — three-sided analysis of your papers vs. theirs
4. **Judge's analysis** — how a judicial officer would likely see it
5. **Practice courtroom** — mock hearing (or mock oral argument for appeals) with a virtual judge

## Run it locally

```
node serve.js
```

Then open http://localhost:8455. Or just double-click `index.html`.

## License

Free for everyone, forever. See [LICENSE](LICENSE).
