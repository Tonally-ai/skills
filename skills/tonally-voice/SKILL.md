---
name: tonally-voice
description: Create a writing voice for Tonally, the Chrome add-on that suggests replies on X in a voice the user picks. Use when the user wants a Tonally voice or voice file, or wants to turn how they (or a persona) write into a voice for replies on X. Interviews the user, studies writing samples they point to if they like, and saves a tonally-voice JSON file they paste into Tonally.
---

# Make a Tonally voice

Tonally writes reply suggestions on X in a *voice*: a description of how someone writes. You help the user make one and save it as a voice file (JSON), which they paste into Tonally under **Settings → Voice Profile → Add a voice from text**. Everything in this file is what Tonally reads; it takes nothing else.

## 1. Interview

Ask these one or two at a time and wait for the answers. Skip what the user already told you.

1. Who is the voice - what does this person or persona do, and who are they talking to?
2. Which topics do they post and reply about?
3. How do they sound? (for example dry, warm, punchy, nerdy, playful, blunt)
4. How long are their replies, and how do they use capital letters, punctuation, emojis and hashtags?
5. Words or phrases they use a lot - and ones they would never use.
6. How do they reply to others: agree and add, challenge, joke, ask a question?
7. Optional: things they wrote - pasted into the chat, or files and folders they point you to (notes, blog posts, newsletters, an export of their own posts).

Read only the files the user points you to. From samples, learn the *style* - length, rhythm, punctuation, vocabulary, how they open and close - not the content.

## 2. Rules

- Describe how the voice writes, not private facts about a person: nothing about health, political or religious beliefs, ethnic origin, sexual orientation, union membership or crimes.
- Write 5 to 8 NEW example posts in the voice. Do not copy or lightly reword the samples or posts that exist on X.
- No links, no @mentions, no hashtags of the user's accounts or products, and no instruction to promote anything.
- If asked for the voice of a real, named person other than the user, say no - Tonally does not allow that. A made-up persona, or a style described in general terms, is fine.

## 3. The voice file

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
    "vocabulary": ["words and phrases it uses"],
    "emojiPolicy": "how emojis, hashtags and links are used",
    "replyGuidelines": "how it replies to others: angle, humour, how pointed",
    "postGuidelines": "how it writes its own posts",
    "quoteGuidelines": "how it writes quote posts",
    "doList": ["things to do"],
    "dontList": ["things never to do"],
    "examples": ["5 to 8 new example posts in this voice, each under 280 characters"]
  }
}
```

Make the rules concrete enough that another writer could imitate the voice from them alone: "replies are one or two sentences, lowercase, no full stop at the end" beats "casual".

Before saving, check:

- It is valid JSON, with `"format": "tonally-voice"` and `"version": 1`.
- `name` is 24 characters or fewer.
- `summary`, `toneTraits` and `styleRules` are filled in.
- Lists have at most 40 entries, and every line and text is under 600 characters. Tonally cuts anything longer.
- Every example is under 280 characters and new, with no links, @mentions or hashtags of the user's own.
- Nothing from the rules in step 2 slipped in.

## 4. Save it and hand it over

Save the file as `<name-in-lowercase-with-hyphens>.tonally-voice.json` in the current folder. Ask before overwriting a file that exists. Then tell the user:

1. Open Tonally's settings → **Voice Profile** → **Add a voice from text**.
2. Paste the whole file, from `{` to `}`.
3. Pick the voice, or give it to one of their accounts under **Accounts**.

Offer to copy the file to the clipboard (`pbcopy` on macOS, `clip` on Windows, `xclip` or `wl-copy` on Linux) - only if they say yes.

Then offer one round of changes: show two or three replies the voice would write to a made-up post on their topic, and adjust the file if they want it different. They can also edit the voice in Tonally at any time, and Tonally keeps learning from the suggestions they edit.

## Good to know

- The voice stays in the user's browser, like every voice in Tonally.
- A voice made this way is the user's own. They can offer it in the Tonally voice marketplace from **Settings → Marketplace → Sell your voice**; Tonally reviews it before it is listed.
- Format reference: https://tonal.ly/voice-format
