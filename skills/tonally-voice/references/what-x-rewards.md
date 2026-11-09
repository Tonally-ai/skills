# What X does with a reply

X publishes the code behind its For You feed and the systems that label posts
(https://github.com/xai-org/x-algorithm, read in November 2026). The prompts and some rules are
left out on purpose, so this is what the code shows - and what it means for a voice. None of it is
a trick: every point comes down to writing replies a person would be glad to get.

## 1. Every reply is read by a model

X scores replies with a language model that reads the whole thread, the reply, and a few facts
about the reply's author: how many replies they sent in the last 24 hours, how many people blocked
them, whether the reply was pasted. Under posts from big accounts (over 250,000 followers in the
code) that model is Grok, scoring from 0 to 3; under smaller ones it is a smaller model. The
lowest score marks the reply as spam.

**For the voice:** a reply has to make sense under this post and no other. Pick up a detail from
it, add something, or answer what was asked. A line that would fit under any post - "so true",
"great thread", "this" - is exactly what such a model is built to catch.

## 2. Near-identical replies are grouped as copy-paste spam

X clusters replies whose wording is nearly the same and labels them copy-paste spam. Many people
can use the same voice under the same post, so a voice with fixed phrases produces near-twins.

**For the voice:** no stock openers, sign-offs or catchphrases; examples that differ in length,
opening and kind; and a rule to work from the post's own details, which makes every reply
different by itself.

## 3. Conversations count more than likes

The feed adds up how likely someone is to take each action on a post. A reply counts about seven
times a like, and replies between people who follow each other count several times more again.
Accounts grow through conversations, not through likes.

**For the voice:** the best reply is one the author wants to answer - a specific point, a fact
from experience, or a real question. A question tacked on to get engagement ("Thoughts?", "Agree?")
is not that, and the scoring model sees it for what it is.

## 4. Annoying someone costs far more than a like earns

Against a like's weight of about 0.7, "not interested" weighs -53, a mute -59, a block -31 and a
report -234. These multiply predicted likelihoods rather than counts, but the direction is plain.
X also labels accounts from the blocks and reports they collect relative to their likes over the
past two to four weeks.

**For the voice:** never dunk, never mock the poster, no unasked-for selling under strangers'
posts. Disagree in one calm sentence with a reason.

## 5. Links and tagging strangers

A post with a low-quality link that @mentions people who do not follow the author is labelled spam.

**For the voice:** no links and no @mentions in replies by default. A voice meant to promote
something can allow them, in some replies, never all.

## 6. Pace

X reads each account's actions in order, with their timing, to tell people from bots: bursts and
mechanical rhythm stand out. The reply model also sees how many replies the account sent today.

**For the voice:** nothing to write into it - but worth telling the user: a few good replies beat
many fast ones.

## 7. Where a reply is seen

For You leaves out replies from accounts the viewer does not follow, and shows replies from
accounts they follow less often. A reply is read in the conversation itself and by the replier's
own followers.

**For the voice:** write for the author and the people reading that thread - not for a feed of
strangers.
