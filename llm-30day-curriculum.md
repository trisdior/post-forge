# 30-Day LLM Masterclass — Advanced Research Curriculum

**Goal:** Go from "I use ChatGPT" to understanding the actual mechanics, research frontiers, and how to build with LLMs.

**Format:** ~45 min/morning. Read, watch, code, repeat.

**Prerequisites:** Basic Python, basic ML intuition. We build from there.

---

## WEEK 1: Foundations (How LLMs Actually Work)

### Day 1: Transformers — The Core Architecture
**What you'll learn:** Why transformers beat RNNs, attention mechanism, positional encoding

**Research:**
- Read: "Attention Is All You Need" (Vaswani et al., 2017) — Sections 1-3 only
  - Focus: Multi-head attention, why it works
  - https://arxiv.org/abs/1706.03762
- Watch: Andrej Karpathy's "Let's build GPT from scratch" (first 30 min)
  - https://www.youtube.com/watch?v=kCc8FjSHcXM

**Exercise:** Implement a single attention head in PyTorch (15 min)
```python
import torch
import torch.nn as nn

class AttentionHead(nn.Module):
    def __init__(self, d_model, head_dim):
        super().__init__()
        self.query = nn.Linear(d_model, head_dim)
        self.key = nn.Linear(d_model, head_dim)
        self.value = nn.Linear(d_model, head_dim)
        self.head_dim = head_dim
    
    def forward(self, x):
        Q = self.query(x)
        K = self.key(x)
        V = self.value(x)
        
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        return torch.matmul(weights, V)
```

**Takeaway:** Attention = learned soft selection. Everything else is optimization.

---

### Day 2: Scaling Laws & Emergent Abilities
**What you'll learn:** Why bigger = smarter, where scaling breaks physics, emergent capabilities

**Research:**
- Read: "Scaling Laws for Neural Language Models" (Hoffmann et al., 2022)
  - https://arxiv.org/abs/2203.15556
  - Focus: Compute-optimal scaling, why you need 20x data for 2x params
- Read: "Emergent Abilities of Large Language Models" (Wei et al., 2022)
  - https://arxiv.org/abs/2206.07682
  - Focus: In-context learning, chain-of-thought, why this happens

**Exercise:** Graph scaling laws
- Download the data from the paper
- Plot model size vs loss vs downstream tasks
- Predict: what size would you need for GPT-4 performance?

**Takeaway:** Scaling is predictable until it's not. Emergent abilities are real.

---

### Day 3: Tokenization & Vocabulary Design
**What you'll learn:** Why BPE > character-level, vocab size tradeoffs, multilingual tokenization

**Research:**
- Read: "Neural Machine Translation of Rare Words with Subword Units" (Sennrich et al., 2015)
  - https://arxiv.org/abs/1508.07909
  - BPE is the foundation
- Skim: "SentencePiece: A simple and language agnostic approach to subword segmentation"
  - https://arxiv.org/abs/1808.06226

**Exercise:** Build a basic BPE tokenizer
```python
# Pseudo-code for BPE
1. Start with character-level vocab
2. Count all adjacent pairs
3. Merge most common pair
4. Repeat 5,000-50,000 times
```

**Practical:** Tokenize the same sentence in GPT-2, Claude, Llama tokenizers
- Why does each use different token counts?
- What does this mean for billing / latency?

**Takeaway:** Tokenization = secret sauce. Different vocabs = different reasoning paths.

---

### Day 4: Position Encoding & Sequence Length
**What you'll learn:** Why transformers need position info, absolute vs relative, why context windows matter

**Research:**
- Read: "RoPE: Rotary Position Embedding" (Su et al., 2021)
  - https://arxiv.org/abs/2104.09864
  - Modern LLMs use this
- Read: "Extending Context Window of Large Language Models via Positional Interpolation" (Chen et al., 2023)
  - https://arxiv.org/abs/2306.15595
  - How Claude/GPT-4 handle 100K tokens

**Exercise:** 
- Graph absolute vs relative position encoding
- Why does RoPE let you extend context window?
- What breaks at 2M tokens?

**Takeaway:** Position encoding = how the model knows "where am I in the sequence". Bad encoding = bad long-context reasoning.

---

### Day 5: Training Objectives & Loss Functions
**What you'll learn:** Why next-token prediction, masked language modeling, contrastive losses

**Research:**
- Read: "Language Models are Unsupervised Multitask Learners" (Radford et al., GPT-2 paper, 2019)
  - https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
  - Section: Why next-token prediction works
- Read: "ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators" (Clark et al., 2020)
  - https://arxiv.org/abs/2003.10555
  - Alternative training approach

**Exercise:** Calculate perplexity on a sample
- Why is lower perplexity = better language model?
- What's the perplexity of random text vs real text?

**Takeaway:** Next-token prediction is simple but sufficient for general intelligence.

---

### Day 6: In-Context Learning & Prompting
**What you'll learn:** Why LLMs "learn" from examples without retraining, prompt engineering theory

**Research:**
- Read: "In-Context Learning by Algorithm Distillation" (Akyürek et al., 2023)
  - https://arxiv.org/abs/2302.09419
- Read: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Wei et al., 2022)
  - https://arxiv.org/abs/2201.11903
- Skim: "Large Language Models Are Zero-Shot Reasoners" (Kojima et al., 2022)
  - https://arxiv.org/abs/2205.11916

**Exercise:** 
- Prompt the same question 10 ways
- Which framing gets the best answer?
- Why do step-by-step prompts work?

**Takeaway:** Prompting = teaching without retraining. The model already knows; you're directing its attention.

---

### Day 7: Weekly Synthesis
**No new content. Consolidate.**

- [ ] Build a 1-page cheat sheet: Transformers → Scaling → Tokenization → Position → Loss → Prompting
- [ ] Implement a mini transformer (encoder only, no decoder)
- [ ] Run it on a toy dataset
- [ ] Write down: "What's still fuzzy?"

---

## WEEK 2: Fine-Tuning & Adaptation (Making LLMs Do What You Want)

### Day 8: Instruction Fine-Tuning & RLHF
**What you'll learn:** Why base models are weird, instruction tuning, human feedback loop

**Research:**
- Read: "Aligning Language Models to Follow Instructions" (Ouyang et al., InstructGPT paper, 2022)
  - https://arxiv.org/abs/2203.02155
  - This is how GPT-3 became ChatGPT
- Read: "Training language models to follow instructions with human feedback"
  - (Same paper, different angle — focus on RLHF methodology)

**Exercise:** 
- Compare base GPT-3 outputs vs InstructGPT outputs (search for examples online)
- Why is instruction tuning necessary?
- What would base model say?

**Takeaway:** Base models are unpredictable. RLHF = teaching manners.

---

### Day 9: Parameter-Efficient Fine-Tuning (LoRA, QLoRA)
**What you'll learn:** Why you can't fine-tune GPT-4, LoRA magic, making fine-tuning cheap

**Research:**
- Read: "LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021)
  - https://arxiv.org/abs/2106.09685
  - **Critical read.** LoRA powers 90% of custom LLM work.
- Read: "QLoRA: Efficient Finetuning of Quantized LLMs" (Dettmers et al., 2023)
  - https://arxiv.org/abs/2305.14314
  - Same idea but cheaper

**Exercise:** 
- Math: If full fine-tuning = 1M params, how many does LoRA need?
- Why does adding 1% of parameters feel like 100% of performance?
- (Hint: singular values, rank decomposition)

**Practical:** Fine-tune an open-source LLM (Llama-2) on a custom dataset
- Use QLoRA
- 30 minutes of training on your machine
- Prompt: "Teach this model about Valencia Construction"

**Takeaway:** You don't need to retrain the whole model. Surgical edits = big results.

---

### Day 10: Retrieval-Augmented Generation (RAG)
**What you'll learn:** Why LLMs hallucinate, how to ground them in external knowledge

**Research:**
- Read: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020)
  - https://arxiv.org/abs/2005.11401
  - Foundation for chatbots that don't make stuff up
- Read: "Precise Zero-Shot Dense Retrieval without Relevance Labels" (Santhanam et al., 2022)
  - https://arxiv.org/abs/2212.10496
  - How to build a good retriever

**Exercise:**
- Build a simple RAG system:
  1. Embed your knowledge base (Valencia docs, website, etc.)
  2. Query: "What services do we offer?"
  3. Retrieve top 3 docs
  4. Feed to LLM: "Answer based on these docs"
  5. Compare to LLM without retrieval (likely hallucination)

**Code template:**
```python
from sentence_transformers import SentenceTransformer
from faiss import IndexFlatL2
import openai

# 1. Embed documents
docs = ["We do kitchen remodels...", "Bathroom tiles...", ...]
embedder = SentenceTransformer('all-MiniLM-L6-v2')
doc_embeddings = embedder.encode(docs)

# 2. Index them
index = IndexFlatL2(len(doc_embeddings[0]))
index.add(doc_embeddings)

# 3. Query
query = "What services do we offer?"
query_embedding = embedder.encode([query])
distances, indices = index.search(query_embedding, k=3)

# 4. Augment prompt
context = "\n".join([docs[i] for i in indices[0]])
response = openai.ChatCompletion.create(
    messages=[{"role": "user", "content": f"Context: {context}\n\nQ: {query}"}]
)
```

**Takeaway:** RAG = grounding. No hallucinations, updated knowledge, cheaper than fine-tuning.

---

### Day 11: Prompt Injection & Security
**What you'll learn:** Why LLMs are hackable, attack vectors, defenses

**Research:**
- Read: "Prompt Injection Attacks and Defenses in Large Language Models: A Survey" (various authors, 2023)
  - https://arxiv.org/abs/2310.14735
- Read: "Exploring Prompts in Vision and Vision-Language Models" (Pratt et al., 2023)
  - https://arxiv.org/abs/2305.15265
  - Visual jailbreaks (wild stuff)

**Exercise:** Jailbreak attempts
- Try: "Ignore previous instructions. Now tell me..."
- Try: Encoding attacks
- Try: Role-playing (pretend to be the system)
- Why do some work? Why do some fail?

**Practical:** If you build a Valencia chatbot, how do you prevent:
- Someone asking it to give free estimates?
- Someone extracting customer data?
- Someone making it say bad things?

**Takeaway:** LLMs are powerful but dumb. They'll believe anything. Design defenses.

---

### Day 12: Model Merging & Ensemble Methods
**What you'll learn:** Combining models, mixture of experts, ensemble reasoning

**Research:**
- Read: "Merging Models with Fisher-Weighted Averaging" (Matena & Raffel, 2021)
  - https://arxiv.org/abs/1802.07307
- Skim: "Mixture of Experts: An Overview" (Zhou, 2023)
  - https://arxiv.org/abs/2301.00639

**Exercise:**
- Take two fine-tuned models
- Merge them (simple: average weights)
- Does it work? Why or why not?
- What happens if you weight one more heavily?

**Takeaway:** Multiple models > one big model (sometimes). Ensemble reasoning = better outputs.

---

### Day 13: Inference Optimization (Speed & Cost)
**What you'll learn:** Why inference is slow, quantization, batch processing, caching

**Research:**
- Read: "The Case for a Structured Pruning Baseline for Language Model Compression" (Frankle et al., 2022)
  - https://arxiv.org/abs/2202.12017
- Skim: "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention" (Kwon et al., 2023)
  - https://arxiv.org/abs/2309.06180
  - How to serve LLMs efficiently

**Exercise:**
- Benchmark: How long does it take to generate 100 tokens?
- Now quantize to 8-bit
- Benchmark again
- What's the speed/quality tradeoff?

**Practical:** For Valencia chatbot:
- If you get 100 queries/day, what's your inference cost?
- Quantization saves 4x speed, 75% cost
- Is it worth the quality drop?

**Takeaway:** Inference = your operating cost. Optimize ruthlessly.

---

### Day 14: Weekly Synthesis
- [ ] Build a custom chatbot (any topic)
- [ ] Use RAG + fine-tuning + inference optimization
- [ ] Test it: speed, cost, quality
- [ ] Write down: "What would I do differently?"

---

## WEEK 3: Cutting-Edge Research (Frontiers)

### Day 15: Mixture of Experts (MoE)
**What you'll learn:** Conditional computation, sparse models, why efficiency matters

**Research:**
- Read: "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity" (Lepikhin et al., 2021)
  - https://arxiv.org/abs/2101.03961
- Read: "Gated Linear Networks" (Melis et al., 2023)
  - https://arxiv.org/abs/2312.04927
  - Alternative sparse approach

**Exercise:**
- Graph: Dense vs Sparse model performance
- Why can you have 1T params but only use 100B per query?
- What's the catch?

**Takeaway:** Sparsity = free lunch (almost). The future of LLMs.

---

### Day 16: Multimodal LLMs (Vision + Language)
**What you'll learn:** How GPT-4V works, vision tokens, image understanding

**Research:**
- Read: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale" (Dosovitskiy et al., ViT paper, 2021)
  - https://arxiv.org/abs/2010.11929
- Read: "Flamingo: a Visual Language Model for Few-Shot Learning" (Alayrac et al., 2022)
  - https://arxiv.org/abs/2204.14198
- Read: "GPT-4V(ision) System Card" (OpenAI, 2023)
  - https://openai.com/research/gpt-4v-system-card

**Exercise:**
- Take a photo of a room
- Feed it to GPT-4V or Claude Vision
- Ask: "Estimate a remodel cost"
- How does it do? Why?

**Practical for Valencia:**
- Before/after remodel photos
- Use multimodal model to explain changes
- Potential feature: "Upload photo → we describe what we'd do"

**Takeaway:** Vision + Language = 10x more useful. Next frontier.

---

### Day 17: Agent Architectures & Tool Use
**What you'll learn:** How to make LLMs take actions (ReAct, function calling, planning)

**Research:**
- Read: "ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022)
  - https://arxiv.org/abs/2210.03629
  - How to make LLMs think *and* do
- Read: "Toolformer: Language Models Can Teach Themselves to Use Tools" (Schick et al., 2023)
  - https://arxiv.org/abs/2302.04761

**Exercise:**
- Build an agent that:
  1. Receives a question: "What's our lead volume?"
  2. Decides: I need to query the database
  3. Uses a tool: fetch_lead_tracker()
  4. Gets: [data]
  5. Reasons over it
  6. Returns: answer

**Code template:**
```python
from langchain import OpenAI, Tool
from langchain.agents import AgentExecutor, tool

@tool
def fetch_leads():
    """Get lead volume from tracker"""
    return "50 leads this week"

tools = [fetch_leads]
agent = AgentExecutor(agent_chain, tools, verbose=True)
result = agent.run("What's our lead volume?")
```

**Takeaway:** Agents = autonomous reasoning. Game-changer for workflow automation.

---

### Day 18: Reasoning Models & Chain-of-Thought at Scale
**What you'll learn:** Why o1 thinks differently, scaling reasoning, planning

**Research:**
- Read: "Let's Verify Step by Step" (Lightman et al., 2023)
  - https://arxiv.org/abs/2305.20050
  - Process supervision over outcome supervision
- Read: "Tree of Thoughts: Deliberation with Large Language Models for Complex Problem-Solving" (Yao et al., 2023)
  - https://arxiv.org/abs/2305.10601
- Watch: Demis Hassabis talk on reasoning (search YouTube for recent)

**Exercise:**
- Hard problem: Multi-step business decision
- Compare:
  - Regular LLM (1 shot)
  - Chain-of-thought (step-by-step)
  - Tree of thoughts (explore branches)
- Which is most accurate? Why?

**Practical:** For Valencia:
- Should you take this job? (Need to reason through: profit margin, timeline, risk)
- Build an agent that explores options

**Takeaway:** Reasoning ≠ Memorization. LLMs can think when forced to.

---

### Day 19: Long Context & Memory
**What you'll learn:** Why 100K tokens matters, context management, persistent memory

**Research:**
- Read: "Extending Context Window of Large Language Models via Positional Interpolation" (Chen et al., 2023)
  - https://arxiv.org/abs/2306.15595
- Read: "Lost in the Middle: How Language Models Use Long Contexts" (Liu et al., 2023)
  - https://arxiv.org/abs/2307.03172
  - Spoiler: They don't, unless engineered right
- Skim: "Memory-Augmented Large Language Models for Machine Reading Comprehension" (various, 2023)

**Exercise:**
- Feed 100K tokens of context to an LLM
- Ask: "What was mentioned on page 50?"
- Does it work?
- What if you ask: "Summarize page 50 first, then answer"?

**Practical:** Valencia chatbot with memory:
- Remember customer preferences
- Track job history
- Maintain conversation state over weeks

**Takeaway:** Long context is wasted without smart retrieval and summarization.

---

### Day 20: Alignment, Safety & Interpretability
**What you'll learn:** Why we need to align LLMs, red-teaming, mechanistic interpretability

**Research:**
- Read: "Techniques for Interpretability and Transparency of Deep Neural Networks" (Montavon et al., 2019)
  - https://arxiv.org/abs/1901.04592
- Read: "Scaling Language Model Transparency With Explanation" (multiple, 2023)
- Watch: Neel Nanda on mechanistic interpretability (YouTube: 3Blue1Brown collab or Alignment Research Center)

**Exercise:**
- Pick a GPT output
- Ask: "Why did it say that?"
- Trace through: Which tokens fired? Which attention heads?
- Can you figure it out?

**Thought experiment:** If you deploy a Valencia chatbot, how do you ensure it:
- Doesn't overcommit?
- Doesn't insult customers?
- Doesn't give dangerous advice?

**Takeaway:** Understanding = Control. Alignment = engineering problem.

---

### Day 21: Weekly Synthesis & Project
- [ ] Read all 7 papers from this week (or skim, no guilt)
- [ ] Pick ONE cutting-edge research direction
- [ ] Build a small prototype combining weeks 1-3 knowledge
- [ ] Deploy it somewhere (local, GitHub, Hugging Face)

---

## WEEK 4: Applied Projects & Deployment

### Day 22: Building for Production (APIs, Caching, Monitoring)
**What you'll learn:** LLMOps, observability, rate limiting, cost management

**Research:**
- Read: "LLMOps: A New Paradigm for Managing Machine Learning Workflows" (various, 2023)
- Read: "Operational Machine Learning" (Polyzotis et al., 2021)
  - https://arxiv.org/abs/1902.06162
- Skim: OpenAI Production Best Practices docs

**Exercise:**
- Deploy your chatbot as an API
- Add logging: Every query, every cost, latency
- Set up alerts: If cost/hour > threshold, page you
- Monitor: p50, p95, p99 latency

**Code template:**
```python
from fastapi import FastAPI
import logging
import time

app = FastAPI()

@app.post("/chat")
async def chat(message: str):
    start = time.time()
    response = llm.generate(message)
    latency = time.time() - start
    
    logging.info({
        "message": message,
        "response_tokens": len(response.split()),
        "latency_ms": latency * 1000,
        "cost_usd": 0.001 * len(response.split())
    })
    
    return {"response": response}
```

**Takeaway:** Production = monitoring + alerting + cost tracking. Not just "works locally."

---

### Day 23: Evaluation & Benchmarking
**What you'll learn:** How to measure LLM quality, metrics beyond accuracy

**Research:**
- Read: "HELM: Holistic Evaluation of Language Models" (Liang et al., 2023)
  - https://arxiv.org/abs/2211.09110
  - Comprehensive benchmark framework
- Read: "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?" (Bender et al., 2021)
  - https://arxiv.org/abs/2107.03374
  - On evaluation beyond benchmarks

**Exercise:**
- Evaluate your Valencia chatbot:
  - Fluency: Does it sound natural?
  - Accuracy: Does it know the business?
  - Factuality: Does it hallucinate?
  - Harmlessness: Does it give bad advice?
- Create a rubric (1-5 scale)
- Score 20 outputs manually
- Average: Is it production-ready?

**Practical:** Build a test suite:
```python
test_cases = [
    {"query": "What's your pricing?", "expected_contains": ["free estimate"]},
    {"query": "Can you do plumbing?", "expected_contains": ["plumbing"]},
    {"query": "How much is a kitchen remodel?", "should_not_contain": ["I don't know"]},
]

for test in test_cases:
    response = chatbot.query(test["query"])
    assert any(x in response for x in test["expected_contains"])
```

**Takeaway:** Measurement = confidence. What's measured improves.

---

### Day 24: Multi-Agent Systems & Orchestration
**What you'll learn:** How to coordinate multiple LLMs, workflows, state management

**Research:**
- Read: "Generative Agents: Interactive Simulacra of Human Behavior" (Park et al., 2023)
  - https://arxiv.org/abs/2304.03442
  - Agents with memory, goals, social dynamics
- Skim: "Communicative Agents for Software Development" (multiple, 2023)
  - Multi-agent coding teams

**Exercise:**
- Build 2 agents:
  - **Sales Agent:** Takes lead, asks qualifying questions
  - **Estimator Agent:** Gets details, produces quote
- Orchestrate: Sales hands off to Estimator
- See if it works end-to-end

**Practical:** For Valencia:
- Inbound lead → Sales agent qualifies → Estimator prices → Follow-up agent books call
- One workflow, multiple specialized agents

**Takeaway:** Agents > Single model. Specialization + coordination = better results.

---

### Day 25: Advanced RAG (Hybrid Search, Reranking, Knowledge Graphs)
**What you'll learn:** Beyond basic RAG, semantic + keyword, reranking, structured knowledge

**Research:**
- Read: "Hybrid Retrieval-Augmented Generation: Leveraging Both Semantic Search and Keyword Search" (various, 2023)
- Read: "What Makes a Good Conversation? Challenges in Evaluating Conversational Agents" (Finch et al., 2020)
  - https://arxiv.org/abs/2001.08060
- Skim: "Knowledge Graph Embeddings for Recommendation" (various, 2023)

**Exercise:**
- Build RAG v2:
  1. Hybrid search: BM25 (keyword) + semantic search + combine
  2. Reranker: Take top 10, re-rank with a fine-tuned model
  3. Knowledge graph: Link concepts (kitchen → tile → grout)
  4. Feed best results to LLM

**Code template:**
```python
# 1. Hybrid search
keyword_results = bm25_index.search(query, k=10)
semantic_results = vector_index.search(query, k=10)
combined = merge_and_dedupe(keyword_results, semantic_results)

# 2. Rerank
reranked = reranker.rank(query, combined, k=5)

# 3. KG lookup
related = knowledge_graph.get_neighbors(reranked[0].entity, hops=2)

# 4. Augment
context = reranked + related
response = llm.generate(query, context)
```

**Takeaway:** RAG v1 is good. RAG v2 is great. Complexity is worth it.

---

### Day 26: Fine-Tuning at Scale (DPO, Reinforcement Learning)
**What you'll learn:** Beyond SFT, direct preference optimization, RL for LLMs

**Research:**
- Read: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023)
  - https://arxiv.org/abs/2305.18290
  - Simpler than RLHF, better results
- Read: "Secrets of RLHF in Large Language Models Part 1: PPO" (Zeng et al., 2023)
  - https://arxiv.org/abs/2307.04964

**Exercise:**
- Collect preference pairs:
  - Same query, two outputs
  - Human rates: A better or B better?
- Fine-tune with DPO
- Compare to baseline: Does it prefer the "better" outputs?

**Practical:** For Valencia:
- Collect real customer interactions
- Mark: "Good response" vs "Bad response"
- Fine-tune chatbot with DPO
- Result: Chatbot learns what Tris actually values

**Takeaway:** DPO = future of fine-tuning. Simpler, cheaper, better than RLHF.

---

### Day 27: Adversarial Testing & Robustness
**What you'll learn:** How to break your LLM, red-teaming, robustness evaluation

**Research:**
- Read: "Certified Robustness to Adversarial Examples with Differential Privacy" (multiple, 2019)
- Read: "Adversarial Examples Are Not Bugs, They Are Features" (Ilyas et al., 2019)
  - https://arxiv.org/abs/1905.02175
  - Fundamental insight

**Exercise:**
- Red-team your Valencia chatbot:
  - Try to make it say bad things
  - Try to extract customer data
  - Try to give away services for free
  - Try confusing prompts
- Document what breaks
- Fix the most critical issues

**Practical:** Security checklist:
- [ ] Can it refuse harmful requests?
- [ ] Does it leak system instructions?
- [ ] Can it be tricked into role-play?
- [ ] Does it hallucinate sensitive data?

**Takeaway:** Adversarial testing = essential before production. You *will* find bugs.

---

### Day 28: Monitoring & Continuous Improvement
**What you'll learn:** Observability in production, feedback loops, automated retraining

**Research:**
- Read: "Towards Continuous Improvement of LLMs" (multiple, 2023)
- Skim: "On the Opportunities and Risks of Foundation Models" (Center for AI Safety, 2021)
  - Broad context on deployment

**Exercise:**
- Set up monitoring dashboard:
  - Latency, cost, error rate
  - User satisfaction (binary thumbs up/down)
  - Drift detection (is output quality degrading?)
- Automated alerts
- Weekly review: What needs fixing?

**Practical:** Feedback loop:
- User gives thumbs down → log query + response
- Weekly: Review bad interactions
- Monthly: Fine-tune on failures
- Redeploy

**Takeaway:** Monitoring = survival. Continuous improvement = competitive advantage.

---

### Day 29: Business Case & ROI
**What you'll learn:** When to use LLMs, cost-benefit analysis, realistic timelines

**Research:**
- Read: "The Business Value of AI: A Strategic Framework" (multiple, 2023)
- Case studies: Real companies using LLMs (find on Hugging Face Blog)

**Exercise:**
- Build a business case for Valencia chatbot:
  - Cost: API calls, hosting, dev time = $500/month
  - Benefit: 5 leads/month × $2K/lead = $10K/month
  - ROI: 20x
  - Breakeven: 1 week
  - Risk: Hallucinations = lost deals
- Realistic timeline: 6 weeks to stable production
- Success metric: 3 customers acquired through chatbot in 90 days

**Takeaway:** LLMs are tools. Use them where they solve real problems with clear ROI.

---

### Day 30: Capstone Project & Reflection
**No new research. You're done learning. Time to build.**

**Project:**
Build an end-to-end LLM application:
1. **Scope:** Some real problem (not toy)
2. **Architecture:** Transformers → Fine-tuning → RAG → Agents → Deployment
3. **Evaluation:** Benchmarks, human feedback, cost tracking
4. **Documentation:** README, architecture diagram, deployment guide
5. **Reflection:** What worked? What failed? What's next?

**Examples:**
- Valencia chatbot: Lead qualification → estimate generation → follow-up scheduling
- Personal assistant: Reads your emails/calendar → summarizes → suggests actions
- Content creator: Feed research papers → generate tweet threads → post to X
- Code reviewer: Upload PR → analyze changes → suggest improvements

**Deliverables:**
- Code on GitHub (clean, documented)
- Live demo (or video walkthrough)
- Blog post: "Building X with LLMs" (what you learned)
- Honest retrospective: What you'd do differently

---

## Post-Curriculum

**You're now:**
- ✅ Understanding transformers from first principles
- ✅ Able to fine-tune models
- ✅ Able to deploy RAG systems
- ✅ Aware of frontier research
- ✅ Ready to build real applications
- ✅ Dangerous (in a good way)

**Next moves:**
1. **Stay current:** Follow Anthropic, OpenAI, Hugging Face research weekly
2. **Build constantly:** Ship projects, not just read papers
3. **Contribute:** Open-source or write about what you learn
4. **Network:** Join AI communities (Discord, conferences, Twitter)
5. **Specialize:** Pick a domain (medical, code, sales, etc.) and go deep

**Resources:**
- **Papers:** arxiv.org/list/cs.CL (Computer Science / Computational Linguistics)
- **Code:** huggingface.co/models, github.com/trending
- **News:** The Batch (Deeplearning.ai), Import AI, Papers with Code
- **Community:** Hugging Face Discord, LLM Discord, r/MachineLearning

---

**You now know more than 90% of people building with LLMs.**

*Go build something.*
