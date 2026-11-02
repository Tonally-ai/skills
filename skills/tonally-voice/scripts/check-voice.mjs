#!/usr/bin/env node
// Checks a Tonally voice file before it is pasted into Tonally - against the limits
// Tonally itself applies (extension/background/voicefile.js, the Sell your voice form)
// and against the patterns that make replies read as machine-written
// (references/natural-writing.md). No dependencies; Node 18 or later.
//
//   node check-voice.mjs <file>                       a voice file, or a voice-to-sell file
//   node check-voice.mjs <tonally-export.json>        lists the voices in a Tonally export
//   node check-voice.mjs extract <export> "<name>" [out.json]
//                                                     writes one voice of an export as a voice file
//
// Exit code 1 when something must be fixed; warnings alone exit 0. The checks are
// exported too (check, voicesIn, voiceFile), so they can be tested without Node.

const TEXT_FIELDS = ['summary', 'industry', 'emojiPolicy', 'replyGuidelines', 'postGuidelines', 'quoteGuidelines', 'extraContext'];
const LIST_FIELDS = ['toneTraits', 'styleRules', 'vocabulary', 'doList', 'dontList', 'examples'];
const KNOWN = new Set([...TEXT_FIELDS, ...LIST_FIELDS]);

let errors = [];
let warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const short = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// The JSON in a file's text - also an answer pasted with words around it (the
// outermost { ... }). null when there is none.
export function parse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(text.slice(a, b + 1));
      } catch { /* none */ }
    }
    return null;
  }
}

// ---- patterns ------------------------------------------------------------------------------

const LINK = /\bhttps?:\/\/|\bwww\.|\b[a-z0-9-]+\.(com|io|ai|co|net|org|app|dev|xyz)\b/i;
const MENTION = /(^|[^\w])@\w{2,}/;
const HASHTAG = /(^|\s)#\w{2,}/;
const EM_DASH = /—/;
const LABEL = /^\s*(pro tip|quick tip|hot take|unpopular opinion|underrated|worth adding|reminder|psa)\s*[:\-]/i;
// A reply that opens on praise ("Great point!", "Love this.") or is only "This." - not "love that the fix...".
const PRAISE = /^\s*(?:(?:great (?:point|question|post|thread|list|take)|love (?:this|that)|so true|well said|couldn'?t agree more)\s*[!.,:]|this[.!]*\s*$)/i;
const NOT_BUT = /\b(it'?s|this is|that'?s) not (just |only |about )?[^.,;!?]{1,40}[,;-]\s*(it'?s|but)\b|\bnot [^.,;!?]{1,30}, but\b/i;
const STOCK = /\b(game[- ]?changer|delve|leverage|elevate|unlock(ing)? (the|your)|journey|crucial|in today'?s (world|landscape)|let'?s dive|dive in|supercharge|seamless(ly)?|synergy)\b/i;
const MEME = /(?:^|\W)(nobody:|the audacity|me pretending|plot twist|in this economy|it'?s giving)/i;
const RESULT = /\b(saved (me|us) (months|weeks|years|hours|days)|\d+x(ed)?\b|\d+(\.\d+)?k (followers|users|mrr|arr|subscribers)|\$\d+(\.\d+)?[km]\b)/i;
const SENSITIVE = /\b(diagnos\w*|adhd|autis\w*|depress\w*|anxiety disorder|bipolar|cancer|hiv|pregnan\w*|christian|muslim|jewish|hindu|atheist|religio\w*|gay|lesbian|bisexual|transgender|democrat\w*|republican\w*|liberal|conservative|trade union|union member|convicted|criminal record)\b/i;
const IMITATES = /\b(inspired by|sounds like|in the style of|channel(?:l)?ing)\b/i;
const EXPERT = /\b(as (a|your) (doctor|physician|lawyer|attorney|financial advis[eo]r|therapist)|medical advice|legal advice|financial advice|investment advice)\b/i;
const CAMPAIGN = /\b(vote (for|against)|elect(ing)? |re-?elect|campaign(ing)? for|support (the )?(candidate|party))\b/i;

function textChecks(where, s, { example = false } = {}) {
  if (EM_DASH.test(s)) warn(`${where}: has an em dash (—) - use a hyphen, comma or full stop: "${short(s)}"`);
  if (STOCK.test(s)) warn(`${where}: stock word "${s.match(STOCK)[0]}" reads as AI: "${short(s)}"`);
  if (RESULT.test(s)) warn(`${where}: invented-sounding result "${s.match(RESULT)[0]}" - the AI would claim it in the user's name: "${short(s)}"`);
  if (SENSITIVE.test(s)) warn(`${where}: "${s.match(SENSITIVE)[0]}" - a voice describes how someone writes, never health, beliefs, origin or orientation: "${short(s)}"`);
  if (!example) return;
  if (LINK.test(s)) err(`${where}: has a link: "${short(s)}"`);
  if (MENTION.test(s)) err(`${where}: has an @mention: "${short(s)}"`);
  if (HASHTAG.test(s)) err(`${where}: has a hashtag: "${short(s)}"`);
  if (s.length > 280) err(`${where}: ${s.length} characters - keep it under 280: "${short(s)}"`);
  if (LABEL.test(s)) warn(`${where}: opens with a label ("${s.match(LABEL)[1]}") - reads as AI: "${short(s)}"`);
  if (PRAISE.test(s)) warn(`${where}: opens with praise - reads as AI: "${short(s)}"`);
  if (NOT_BUT.test(s)) warn(`${where}: "not X, it's Y" line - reads as AI: "${short(s)}"`);
  if (MEME.test(s)) warn(`${where}: stock meme format "${s.match(MEME)[1]}": "${short(s)}"`);
}

// ---- a voice -----------------------------------------------------------------------------------

function checkVoice(name, voice) {
  if (typeof name !== 'string' || !name.trim()) err('name: missing.');
  else if (name.length > 24) err(`name: ${name.length} characters - Tonally keeps 24: "${name}"`);
  if (!voice || typeof voice !== 'object' || Array.isArray(voice)) {
    err('voice: missing - the fields go inside "voice": { ... }.');
    return;
  }
  for (const k of Object.keys(voice)) if (!KNOWN.has(k)) warn(`voice.${k}: not a field Tonally reads - it is dropped.`);
  for (const f of TEXT_FIELDS) {
    const v = voice[f];
    if (v === undefined || v === '') continue;
    if (typeof v !== 'string') { err(`voice.${f}: should be text.`); continue; }
    if (v.length > 4000) err(`voice.${f}: ${v.length} characters - Tonally keeps 4000.`);
    textChecks(`voice.${f}`, v);
  }
  for (const f of LIST_FIELDS) {
    const v = voice[f];
    if (v === undefined) continue;
    if (!Array.isArray(v)) { err(`voice.${f}: should be a list of short lines.`); continue; }
    if (v.length > 40) err(`voice.${f}: ${v.length} entries - Tonally keeps 40.`);
    v.forEach((line, i) => {
      if (typeof line !== 'string') return err(`voice.${f}[${i + 1}]: should be text.`);
      if (line.length > 600) err(`voice.${f}[${i + 1}]: ${line.length} characters - Tonally keeps 600.`);
      // The don't list names the bad patterns on purpose.
      if (f !== 'dontList') textChecks(`voice.${f}[${i + 1}]`, line, { example: f === 'examples' });
    });
  }
  const has = (f) => (Array.isArray(voice[f]) ? voice[f].length > 0 : Boolean(String(voice[f] || '').trim()));
  if (!has('summary')) err('voice.summary: missing.');
  if (!has('toneTraits')) err('voice.toneTraits: missing.');
  if (!has('styleRules')) err('voice.styleRules: missing.');
  else if (voice.styleRules.length < 4) warn(`voice.styleRules: only ${voice.styleRules.length} - concrete habits (length, punctuation, capitalisation) make the voice consistent.`);

  const vocab = Array.isArray(voice.vocabulary) ? voice.vocabulary : [];
  if (vocab.length > 5) warn(`voice.vocabulary: ${vocab.length} entries - the AI reaches for every one of them; keep a few plain words.`);
  // One longer phrase is fine ("what worked for me"); several are catchphrases the AI repeats.
  const phrases = vocab.filter((w) => typeof w === 'string' && w.trim().split(/\s+/).length >= 4);
  if (phrases.length >= 2) warn(`voice.vocabulary: catchphrases (${phrases.map((w) => `"${w}"`).join(', ')}) - they would turn up in every reply; keep plain words.`);

  const ex = Array.isArray(voice.examples) ? voice.examples.filter((x) => typeof x === 'string') : [];
  if (ex.length < 5) warn(`voice.examples: ${ex.length} - write 5 to 8, varied in length and opening.`);
  if (ex.length > 8) warn(`voice.examples: ${ex.length} - Tonally shows the AI the first 8.`);
  const seen = new Set();
  ex.forEach((e, i) => { const k = e.trim().toLowerCase(); if (seen.has(k)) err(`voice.examples[${i + 1}]: appears twice.`); seen.add(k); });
  const firsts = {};
  for (const e of ex) { const w = (e.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z']/g, ''); if (w) firsts[w] = (firsts[w] || 0) + 1; }
  for (const [w, n] of Object.entries(firsts)) if (n >= 3) warn(`voice.examples: ${n} start with "${w}" - vary the openings.`);
}

// ---- a listing (voice to sell) ------------------------------------------------------------------

function checkListing(listing, voice) {
  if (!listing || typeof listing !== 'object') return err('listing: missing - a voice to sell needs its listing.');
  const name = String(listing.name || '');
  if (!name.trim()) err('listing.name: missing.');
  else if (name.length > 40) err(`listing.name: ${name.length} characters - the form takes 40.`);
  const d = String(listing.description || '');
  if (!d.trim()) err('listing.description: missing.');
  else if (d.length > 300) err(`listing.description: ${d.length} characters - the form takes 300.`);
  const tags = Array.isArray(listing.tags) ? listing.tags : [];
  if (!tags.length) warn('listing.tags: none - buyers browse by them.');
  if (tags.length > 6) err(`listing.tags: ${tags.length} - the form takes 6.`);
  tags.forEach((t, i) => { if (String(t).length > 24) err(`listing.tags[${i + 1}]: longer than 24 characters.`); });
  const samples = Array.isArray(listing.samples) ? listing.samples : [];
  if (!samples.length) err('listing.samples: none - at least one sample reply is needed.');
  if (samples.length > 3) err(`listing.samples: ${samples.length} - the form takes 3.`);
  const examples = new Set((voice?.examples || []).map((e) => String(e).trim().toLowerCase()));
  samples.forEach((s, i) => {
    const where = `listing.samples[${i + 1}]`;
    if (!String(s?.reply || '').trim()) return err(`${where}.reply: missing.`);
    if (String(s.post || '').length > 280) err(`${where}.post: longer than 280 characters.`);
    textChecks(`${where}.reply`, String(s.reply), { example: true });
    if (examples.has(String(s.reply).trim().toLowerCase())) err(`${where}.reply: the same as one of the voice's examples - write new ones.`);
  });
  const all = [name, d, ...tags, ...samples.flatMap((s) => [s?.post, s?.reply]), JSON.stringify(voice || {})].join('\n');
  if (IMITATES.test(all)) err(`"${all.match(IMITATES)[0]}…" - a voice for sale may not imitate a real person or brand.`);
  if (EXPERT.test(all)) err(`"${all.match(EXPERT)[0]}" - no persona that gives medical, legal or financial advice.`);
  if (CAMPAIGN.test(all)) err(`"${all.match(CAMPAIGN)[0]}" - no political campaigning.`);
  if (MENTION.test(all) || LINK.test(all)) warn('an @handle or link somewhere in the voice or listing - real brands and people are not allowed.');
}

// ---- whole files -----------------------------------------------------------------------------

// { errors, warnings, selling } for a voice file, or a voice-to-sell file.
export function check(data) {
  errors = [];
  warnings = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    err('not a voice file - expected { "format": "tonally-voice", "version": 1, "name": ..., "voice": { ... } }.');
    return { errors, warnings, selling: false };
  }
  if (data.format && !['tonally-voice', 'tonally-voice-submission'].includes(data.format)) err(`format: "${data.format}" - expected "tonally-voice", or "tonally-voice-submission" for a voice to sell.`);
  if (!data.format) warn('format: missing - add "format": "tonally-voice".');
  if (data.version !== undefined && data.version !== 1) warn(`version: ${data.version} - expected 1.`);
  const selling = data.format === 'tonally-voice-submission';
  checkVoice(data.name, data.voice);
  if (selling) checkListing(data.listing, data.voice);
  return { errors, warnings, selling };
}

const fromPosts = (p) => ['import', 'corpus'].includes(p?.source) || p?.fromPosts === true;

// The voices in a Tonally export (License & Advanced -> Data -> Export settings +
// profile): [{ name, kind }], or null when it is not one.
export function voicesIn(data) {
  if (!Array.isArray(data?.voiceProfiles)) return null;
  return data.voiceProfiles.filter((p) => p && typeof p === 'object').map((p) => ({
    name: String(p.name || ''),
    kind: fromPosts(p) ? 'posts' : p.builtin ? 'built-in' : 'own',
  }));
}

// One voice of an export as a voice file - { file, fromPosts } - or null.
export function voiceFile(data, name) {
  const p = (data?.voiceProfiles || []).find((v) => String(v?.name).toLowerCase() === String(name || '').toLowerCase());
  if (!p) return null;
  const voice = {};
  for (const f of [...TEXT_FIELDS, ...LIST_FIELDS]) if (p[f] !== undefined && p[f] !== '') voice[f] = p[f];
  return { file: { format: 'tonally-voice', version: 1, name: String(p.name).slice(0, 24), voice }, fromPosts: fromPosts(p) };
}

// ---- the command line -------------------------------------------------------------------------

async function main(args) {
  const fs = await import('node:fs');
  const read = (path) => {
    if (!fs.existsSync(path)) return [null, `No file at ${path}.`];
    const data = parse(fs.readFileSync(path, 'utf8'));
    return data ? [data, ''] : [null, `${path} is not valid JSON.`];
  };
  if (!args.length || args[0] === '-h' || args[0] === '--help') {
    console.log('Usage: node check-voice.mjs <voice file | tonally export>\n       node check-voice.mjs extract <export> "<name>" [out.json]');
    return args.length ? 0 : 1;
  }
  if (args[0] === 'extract') {
    const [data, problem] = read(args[1]);
    if (!data) return console.error(`✗ ${problem}`), 1;
    if (!voicesIn(data)) return console.error(`✗ ${args[1]} is not a Tonally export (no voiceProfiles).`), 1;
    const got = voiceFile(data, args[2]);
    if (!got) return console.error(`✗ No voice "${args[2]}" in ${args[1]}. Run without "extract" to list them.`), 1;
    const target = args[3] || `${got.file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'voice'}.tonally-voice.json`;
    fs.writeFileSync(target, `${JSON.stringify(got.file, null, 2)}\n`);
    console.log(`✓ Wrote "${got.file.name}" to ${target}.`);
    if (got.fromPosts) console.log('! This voice was built from imported posts: it can be improved for your own use, but never sold.');
    return 0;
  }
  const [data, problem] = read(args[0]);
  if (!data) return console.error(`✗ ${problem}`), 1;
  const voices = voicesIn(data);
  if (voices) {
    const KIND = { posts: 'built from imported posts - cannot be sold', 'built-in': 'built-in', own: 'your own' };
    console.log(`A Tonally export with ${voices.length} voice${voices.length === 1 ? '' : 's'}:`);
    for (const v of voices) console.log(`  - "${v.name}" (${KIND[v.kind]})`);
    if (Array.isArray(data.corpus)) console.log('\n! It also holds imported posts (corpus). Do not use them as examples or samples.');
    console.log('\nTo work on one: node check-voice.mjs extract <export> "<name>" [out.json]');
    return 0;
  }
  const res = check(data);
  for (const m of res.errors) console.log(`✗ ${m}`);
  for (const m of res.warnings) console.log(`! ${m}`);
  if (!res.errors.length) console.log(`✓ ${res.selling ? 'Voice and listing' : 'Voice'} ready${res.warnings.length ? ` - ${res.warnings.length} thing${res.warnings.length === 1 ? '' : 's'} worth a look` : ''}.`);
  return res.errors.length ? 1 : 0;
}

// Run as a command, not when imported (the checks' tests import it in a browser).
if (typeof process !== 'undefined' && /check-voice\.mjs$/.test(process.argv?.[1] || '')) {
  process.exitCode = await main(process.argv.slice(2));
}
