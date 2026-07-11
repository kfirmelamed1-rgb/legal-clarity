// Regenerates prompts/*.md from the constants inside index.html so the
// reference files never drift from what the site actually uses.
// Run: node build-prompts.js
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const slice = script.slice(script.indexOf('const TRIAL_CORE'), script.indexOf('const TAILS'));
const { TRIAL_CORE, TOPICS, APPEAL_BASE } =
  new Function(slice + '; return {TRIAL_CORE, TOPICS, APPEAL_BASE};')();

const header = `GOVERNING JURISDICTION: [YOUR STATE], [YOUR COUNTY] County. Apply the family law of [YOUR STATE].
Before giving substantive analysis, search official primary sources for [YOUR STATE] - the state legislature's official code website and the state court system's official website (and your county court's site) - to establish the current controlling authorities, and cite them with URLs. Never rely on memory for a statute, rule, form, or case number; verify it on the official source. If you have no web search tool, tell the user the exact official source to look each item up on.`;

const files = {
  'custody.md':             ['Custody & Visitation', TOPICS.custody],
  'child-support.md':       ['Child Support', TOPICS.childsupport],
  'spousal-support.md':     ['Spousal / Partner Support', TOPICS.spousalsupport],
  'property-division.md':   ['Property & Debt Division', TOPICS.property],
  'protective-order.md':    ['Domestic Violence / Protective Order', TOPICS.dvro],
  'general-family-law.md':  ['General Family Law, Divorce Process & Enforcement', TOPICS.other],
  'appeal.md':              ['Family Law Appeal', null]
};

fs.mkdirSync(path.join(__dirname, 'prompts'), { recursive: true });
for (const [name, [title, topic]] of Object.entries(files)) {
  const body = topic === null
    ? header + '\n\n' + APPEAL_BASE
    : header + '\n\n' + TRIAL_CORE + '\n\n' + topic;
  const md = `# ${title} - system prompt (general, any U.S. state)\n\nPaste everything below the line into your AI as its system prompt. Replace [YOUR STATE] and [YOUR COUNTY]. It is general to any U.S. state and instructs the AI to look up your state's actual law.\n\n---\n\n${body}\n`;
  fs.writeFileSync(path.join(__dirname, 'prompts', name), md, 'utf8');
  console.log(name.padEnd(26), (body.length / 1000).toFixed(1) + 'k chars');
}
