# RAG — CLEAR REWRITE (the new teaching standard)

Follows TEACHING_CLARITY.md: welcome+promise → problem → wrong fix → core idea+analogy →
step-by-step → real example → common mistakes → recap → CTA. One idea per sentence. Every term defined.

---

**[Welcome + promise]**
Hey, welcome back. Today, you're going to learn how to stop an AI from making things up and lying to your users. By the end of this video, you'll understand a technique called RAG, and you'll know how to build an AI that answers from your real documents — or honestly admits when it doesn't know. Let's get into it.

**[The problem]**
First, let me show you the problem. Imagine you build a chatbot and connect it to your company's help docs. A customer asks it: "What's your refund policy?" The AI answers, very confidently: "You have 30 days to get a refund." Sounds perfect. There's just one issue — you never had a refund policy. The AI made it up. This is called a hallucination. The AI didn't know the answer, so instead of admitting that, it invented one that sounds right. And in front of a real customer, that's a serious problem.

**[Why the obvious fix fails]**
Now, your first instinct might be to just use a smarter, more expensive AI model. But here's the catch: that doesn't fix it. A smarter model doesn't lie less — it just lies more convincingly. The real problem isn't that the AI isn't smart enough. The problem is that it's guessing, when it should be looking things up.

**[Core idea + analogy]**
So here's the fix. It's called RAG, which stands for Retrieval-Augmented Generation. That name sounds complicated, but the idea is simple. Think about the difference between a closed-book exam and an open-book exam. In a closed-book exam, you answer from memory — and if you don't know, you guess. In an open-book exam, you look up the answer in the book first, and then you write it down. RAG turns your AI from a closed-book student into an open-book one. Instead of answering from memory, it looks up your real document first, and answers from that.

**[How it works, step by step]**
Let's walk through how it actually works. It's just two steps: retrieve, then answer.
Step one is retrieve. When the customer asks a question, we don't hand the AI the entire manual. Instead, we search our documents and pull out only the few paragraphs that are most relevant to that question.
Step two is answer. We give those paragraphs to the AI, along with the question, and we give it one clear instruction: answer using only this text, and show where you found it.
That's the whole trick. Because the AI is now reading from the real document, it stops guessing.

**[The crucial extra step]**
But there's one more piece, and this is the part most tutorials skip. What happens when a customer asks something that isn't in your documents at all? A basic RAG setup will still make something up. So we add one simple rule: if the answer isn't in the paragraphs we found, don't answer — just say, "Sorry, I don't have that information." An AI that can admit it doesn't know is the difference between a toy demo and something you can safely put in front of real customers.

**[Real example, start to finish]**
Let me show you a real example, from start to finish. A customer types: "How long do I have to return an item?"
First, we search the docs, and we find the returns paragraph: "Items can be returned within 30 days."
Next, we hand that paragraph to the AI.
The AI replies: "You can return items within 30 days," and it links to that exact policy page. A correct answer, backed by a real source.
Now the customer asks something we don't cover: "Do you ship to the moon?" This time, the search finds nothing. So instead of inventing an answer, the AI says: "I don't have information about that." Honest, and safe.

**[Common mistakes]**
Now, three common mistakes to avoid.
Mistake one: bad chunking. "Chunking" just means how you cut your documents into pieces. If you cut in the wrong spot — like splitting a sentence in half — the AI gets fragments that don't make sense. So cut on natural boundaries, like paragraphs.
Mistake two: trusting the search blindly. The closest matching paragraph isn't always the right one. So you double-check the results and re-order them by how relevant they really are.
Mistake three, and this is the big one: never testing it. You should measure how often your AI's answers are actually backed by the source. That turns "it seems fine" into a real number you can trust.

**[Recap]**
So let's recap what you learned today. One: AIs make things up because they guess instead of looking things up. Two: RAG fixes this by retrieving your real document first, then answering from it. Three: always add the rule that lets the AI say "I don't know." And four: test that your answers are truly grounded in the source. Do those four things, and you have a chatbot that people can actually trust.

**[CTA]**
If you want to build this exact system yourself — for free, right in your browser — head to sageideas dot dev slash academy. That's it for today. Proof, not paper. I'll see you in the next one.
