---
name: tonally-voice
description: Create, improve or prepare for sale a writing voice for Tonally, the Chrome add-on that suggests replies on X in a voice the user picks. Use when the user wants a Tonally voice or voice file, wants to turn how they (or a persona) write into a voice for replies on X, wants to improve a voice they exported from Tonally, or wants to make a voice to sell in Tonally's voice marketplace. Interviews the user, studies writing samples they point to, tests the voice on sample posts, checks it with a script, and saves a file they paste into Tonally.
---

# Make a Tonally voice

Tonally writes reply suggestions on X in a *voice*: a description of how someone writes, which
an AI model follows for every reply. You help the user make one and save it as a file they paste
into Tonally under **Settings → Voice Profile → Add a voice from text**. Everything in the file
is what Tonally reads; it takes nothing else.

## 0. Which kind of voice

Ask first, in one question, unless the user already said:

- **For themselves** - a voice that writes like them, or like a persona, for their own replies.
- **To sell** - a voice for Tonally's voice marketplace, where creators keep 80% of every sale.
  Read `references/selling.md` before going on: it has the creator rules and the listing.
- **Improve an existing voice** - they have a voice in Tonally already. Ask them to export it:
  **Settings → License & Advanced → Data → Export settings + profile** saves a
  `tonally-export-….json`. Then run `node scripts/check-voice.mjs <that file>` to list its voices,
  and `node scripts/check-voice.mjs extract <that file> "<voice name>"` to pull one out. Continue
  at step 3 with that voice as the starting point, and keep what already works.

## 1. Interview

Ask these one or two at a time and wait for the answers. Skip what the user already told you.

1. Who is the voice - what does this person or persona do, and who are they talking to?
2. Which topics do they post and reply about?
3. How do they sound? (for example dry, warm, punchy, nerdy, playful, blunt)
4. How long are their replies, and how do they use capital letters, punctuation, emojis and hashtags?
5. Words or phrases they use a lot - and ones they would never use.
6. How do they reply to others: agree and add, challenge, joke, ask a question?
7. Optional: things they wrote - pasted into the chat, or files and folders they point you to
   (notes, blog posts, newsletters). Read only the files they point you to, and learn the *style*
   from them - length, rhythm, punctuation, vocabulary, how they open and close - not the content.

For a voice **to sell**, also ask: who would buy it, and in which situations would they use it?

## 2. Rules

- Describe how the voice writes, not private facts about a person: nothing about health,
  political or religious beliefs, ethnic origin, sexual orientation, union membership or crimes.
- Write 5 to 8 NEW example replies. Never copy or lightly reword the samples, posts on X or
  anything else.
- No links, no @mentions, no hashtags of the user's accounts or products, and no instruction to
  promote anything.
- If asked for the voice of a real, named person other than the user, say no - Tonally does not
  allow that. A made-up persona, or a style described in general terms, is fine.
- For a voice to sell, the creator rules in `references/selling.md` apply on top - above all: no
  real brands or people, original lines only, and never a voice built from imported posts.

## 3. Write it so it sounds like a person

Read `references/natural-writing.md` and follow it. In short: rules concrete enough that a
stranger could imitate the voice from them alone; a short, plain vocabulary (no catchphrases);
no poster lines like "hire slow, fire fast" or "it's not X, it's Y"; no "Pro tip:" labels or
"Great point!" openers; no invented personal results like "saved me months"; examples that vary
in length and opening and pick up a detail from the post they answer.

## 4. Test it before saving

Write replies in the voice to 4 or 5 made-up posts in the user's niche - posts you invent, not
real ones from X. Mix the situations: a question, a take to agree with, one to push back on, a
frustrated post, something light. Show them as `Post: …` / `Reply: …`.

Ask the user to point at anything that does not sound like them (or, for a voice to sell, like
the voice they want). Fix the **rules** that caused it, not just that one reply, and test again.
At most two rounds - then save; Tonally keeps learning from the suggestions they edit.

## 5. The file

For a voice **for themselves** (or one improved for their own use):

```json
{
  "format": "tonally-voice",
  "version": 1,
  "name": "the voice's name, up to 24 characters",
  "voice": {
    "summary": "2-4 sentences: how this voice writes",
    "industry": "the niche and topics",
    "toneTraits": ["short tone words"],
    "styleRules": ["concrete habits: length, punctuation, capitalisation, slang"],
    "vocabulary": ["a few plain words it uses"],
    "emojiPolicy": "how emojis, hashtags and links are used",
    "replyGuidelines": "how it replies to others: angle, humour, how pointed",
    "postGuidelines": "how it writes its own posts",
    "quoteGuidelines": "how it writes quote posts",
    "doList": ["things to do"],
    "dontList": ["things never to do"],
    "examples": ["5 to 8 new example replies, each under 280 characters"]
  }
}
```

For a voice **to sell**, the same with `"format": "tonally-voice-submission"` and the listing
added next to `voice`:

```json
  "listing": {
    "name": "name in the marketplace, up to 40 characters",
    "description": "one or two sentences, up to 300: who it sounds like and when it fits",
    "tags": ["up to 6 lowercase tags"],
    "samples": [{ "post": "a post (optional)", "reply": "the voice's reply - new, not one of its examples" }]
  }
```

Save it as `<name-in-lowercase-with-hyphens>.tonally-voice.json` in the current folder. Ask
before overwriting a file that exists.

## 6. Check it

Run the checker that comes with this skill (Node, which `npx skills` already needs):

```
node scripts/check-voice.mjs <the file>
```

It checks the file against the limits Tonally applies, and flags what reads as machine-written
or breaks the creator rules. Fix every `✗`. Look at each `!` and fix it unless there is a good
reason (for example, the user really does say that phrase). Run it again until it ends with `✓`.
If Node is not available, go through the same points by hand: `references/natural-writing.md`,
and the limits in the template above.

## 7. Hand it over

For a voice for themselves:

1. Open Tonally's settings → **Voice Profile** → **Add a voice from text**.
2. Paste the whole file, from `{` to `}`.
3. Pick the voice, or give it to one of their accounts under **Accounts**.

For a voice to sell:

1. Add it the same way (**Voice Profile → Add a voice from text**), and try it on x.com.
2. Then **Marketplace → Sell your voice**: set up payouts once, pick the voice, and copy the
   listing's name, description, tags and sample replies into the form.
3. Tonally reviews it; approved, it is on sale at once.

Offer to copy the file to the clipboard (`pbcopy` on macOS, `clip` on Windows, `xclip` or
`wl-copy` on Linux) - only if they say yes. They can edit the voice in Tonally at any time.

## Good to know

- The voice stays in the user's browser, like every voice in Tonally.
- Creator rules: https://tonal.ly/creators · Format reference: https://tonal.ly/voice-format
