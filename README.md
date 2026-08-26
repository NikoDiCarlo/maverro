# MAVERRO

**High-speed, voice-first AI research for public markets.**

Maverro is an AI research copilot designed for hedge fund analysts, public-markets investors, quantitative researchers, and the engineers supporting them.

It combines a frontier OpenAI model with live web research, direct SEC EDGAR retrieval, PDF analysis, voice transcription, and institutional-grade Python/C++ generation inside a minimal research interface.

Maverro is intentionally optimized around one idea:

> **Reduce the time between a research question and a useful, source-grounded answer.**

---

## What Maverro Does

Maverro acts like a fast research analyst and quantitative copilot sitting beside the user.

It can:

- Research current financial markets using the live web
- Identify and explain important market drivers
- Retrieve company filings directly from SEC EDGAR
- Analyze 10-Qs, 10-Ks, and 8-Ks
- Read and analyze uploaded PDFs
- Separate document facts from model interpretation
- Generate complete quantitative Python
- Generate modern C++ for performance-sensitive research
- Reason through backtests, execution assumptions, and data leakage
- Accept natural voice input through live transcription
- Maintain conversational context during the current session
- Surface primary sources so research can be independently verified

Maverro is not designed as a general-purpose chatbot.

Its scope is deliberately centered on:

**Markets → Research → Quantitative Code**

---

# Core Workflow

```text
Question
   ↓
Voice or text input
   ↓
GPT-5.6 Sol
   ↓
Web / SEC / PDF / conversation context
   ↓
Financial reasoning
   ↓
Streaming answer + evidence
```

The model performs the reasoning.

Maverro provides the research environment around it.

---

# Three Research Modes

## MARKETS

**Understand what is happening.**

Designed for questions involving:

- Current market moves
- Equity-index behavior
- Rates
- Commodities
- Earnings reactions
- Sector moves
- Macro catalysts
- Cross-asset relationships
- Market narratives
- Event-driven analysis

Example:

> What actually drove the market today, and what should an equity analyst care about going into tomorrow?

Maverro can search current sources, distinguish evidence from narrative, and explain the transmission mechanism behind a market move.

---

## RESEARCH

**Investigate the evidence.**

Designed for:

- SEC filings
- Company research
- Earnings analysis
- PDF analysis
- Primary-source investigation
- Thesis development
- Risk-factor changes
- Capital allocation
- Guidance
- Demand indicators
- Margin analysis

Maverro can retrieve SEC filings directly from EDGAR and use the filing itself as primary-source context.

Uploaded PDFs can also be analyzed directly.

Rather than only summarizing a document, Maverro is instructed to distinguish:

**Document fact**

from:

**Model interpretation**

This is particularly useful when a filing contains conflicting evidence.

---

## CODE

**Turn the idea into quantitative research.**

Designed for:

- Python
- C++20
- Backtesting
- Financial data processing
- Signal construction
- Portfolio logic
- Quantitative research architecture
- Statistical analysis
- Research tooling

Maverro is instructed to explicitly consider:

- Look-ahead bias
- Data leakage
- Survivorship bias
- Execution timing
- Transaction costs
- Position sizing
- Incomplete data
- Research assumptions

Long code responses are allowed to run to the model/API's practical output limit rather than being artificially truncated.

---

# Voice-First Research

Maverro supports live voice transcription.

The interaction is intentionally:

```text
Speak
  ↓
Live transcription
  ↓
Editable text
  ↓
Send
  ↓
Research
```

Voice is primarily an **input mechanism**, not a voice-assistant personality.

This is deliberate.

Financial research is easier to review visually because analysts need to inspect:

- Numbers
- Tables
- Sources
- Filing language
- Assumptions
- Code
- Calculations

The result is a workflow where a user can ask a complicated research question naturally and then inspect the answer on screen.

---

# Intelligence Layer

Maverro's primary model is:

**OpenAI GPT-5.6 Sol**

OpenAI describes GPT-5.6 Sol as its frontier model for complex professional work and recommends it for complex reasoning and coding.

Maverro currently uses **low reasoning effort** to prioritize latency.

That decision is intentional.

Maverro is designed around:

> **Frontier intelligence at research speed.**

For workloads where maximum deliberation matters more than latency, the underlying model supports substantially higher reasoning levels.

---

# GPT-5.6 Sol Capability

Selected published GPT-5.6 Sol benchmark results:

| Evaluation | Published Result |
|---|---:|
| GPQA Diamond | **94.6%** |
| FrontierMath Tier 1–3 v2 | **89.0%** |
| FrontierMath Tier 4 v2 | **83.0%** |
| Artificial Analysis Coding Agent Index v1.1 | **80** |
| DeepSWE v1.1 | **72.7%** |
| Terminal-Bench 2.1 | **88.8%** |
| SWE-Bench Pro | **64.6%** |
| BrowseComp | **90.4%** |
| Big Finance Bench | **53%** |
| Agents' Last Exam | **52.7%** |
| GDPval-AA v2 | **1,747.8 Elo** |

### Model capacity

| Specification | GPT-5.6 Sol |
|---|---:|
| Context window | **1,050,000 tokens** |
| Maximum output | **128,000 tokens** |
| Reasoning levels | none → max |
| Image input | Supported |
| Streaming | Supported |
| Function calling | Supported |
| Web search | Supported |

These figures describe the underlying GPT-5.6 Sol model.

They should not be interpreted as a claim that every Maverro response achieves the exact same accuracy as a benchmark evaluation. Benchmark configurations may use different reasoning settings than Maverro's latency-focused configuration.

---

# Why Source Grounding Matters

A frontier model is powerful, but Maverro does **not** assume that model intelligence makes every answer automatically correct.

For financial research, Maverro attempts to ground important claims in evidence.

Depending on the question, that evidence can come from:

```text
Live web sources
SEC EDGAR
Uploaded PDFs
Existing conversation context
```

The goal is:

> **Model intelligence for interpretation.  
> Primary evidence for verification.**

For example, if an analyst asks about a company's latest 10-Q, Maverro can retrieve the actual SEC document rather than relying only on model memory.

If the user uploads an investor presentation, Maverro can analyze the document directly.

If the question concerns today's market, Maverro can search current sources.

This makes the resulting research auditable by the person using it.

---

# SEC EDGAR Integration

Maverro contains a dedicated SEC retrieval layer.

For SEC-related requests it can:

1. Resolve the requested company
2. Resolve its ticker and CIK
3. Identify the requested filing type
4. Retrieve recent filing metadata from SEC submissions
5. Fetch the filing directly from EDGAR
6. Extract relevant filing text
7. Inject primary-source context into the model
8. Surface the original SEC filing as a source

Supported primary filing workflows include:

- 10-Q
- 10-K
- 8-K

Company resolution prioritizes:

```text
Company name
    ↓
Explicit $TICKER
    ↓
Ordinary ticker
```

This avoids ambiguous SEC-form tokens being mistaken for company tickers.

---

# PDF Research

Maverro accepts PDF uploads and can reason directly over the uploaded document.

A typical workflow might be:

```text
Upload investor presentation
        ↓
Extract important evidence
        ↓
Separate facts from interpretation
        ↓
Identify positive / negative signals
        ↓
Explain the central analytical tension
        ↓
Recommend what to monitor next
```

This allows Maverro to function as a fast document-review layer for:

- Investor presentations
- Earnings material
- Research documents
- Company reports
- Financial PDFs

Uploaded documents are temporary and are not used as persistent Maverro memory.

---

# Quantitative Research

Maverro's Code mode is intended for serious financial and quantitative work rather than generic code completion.

Example research request:

> Build a complete research-quality Python backtest for a cross-sectional post-earnings mean-reversion strategy. Enter at the next trading day's open, hold for three sessions, include transaction costs, and explicitly prevent look-ahead bias.

Maverro can reason about the architecture first and then generate the implementation.

The underlying GPT-5.6 Sol model has strong published coding performance, including:

- **80** — Artificial Analysis Coding Agent Index
- **88.8%** — Terminal-Bench 2.1
- **72.7%** — DeepSWE v1.1
- **64.6%** — SWE-Bench Pro

Generated quantitative code should still be reviewed and tested before being used for real capital.

Maverro is a research copilot, not an autonomous trading system.

---

# V1 Validation

Maverro V1 was manually tested end-to-end before being considered complete.

| Capability | Result |
|---|---|
| Core financial reasoning | ✅ Pass |
| Conversational context | ✅ Pass |
| Live web research | ✅ Pass |
| Current-source citations | ✅ Pass |
| SEC EDGAR retrieval | ✅ Pass |
| Company / ticker resolution | ✅ Pass |
| PDF upload | ✅ Pass |
| PDF analysis | ✅ Pass |
| Fact vs. interpretation separation | ✅ Pass |
| Python generation | ✅ Pass |
| C++ generation | ✅ Pass |
| Long-form code completion | ✅ Pass |
| Voice transcription | ✅ Pass |
| Voice → research workflow | ✅ Pass |
| Financial-domain restriction | ✅ Pass |
| Stop generation | ✅ Pass |

Testing included deliberately difficult cases rather than only happy-path prompts.

Examples included:

- Current U.S. market research requiring live sources
- Direct Salesforce 10-Q retrieval from SEC EDGAR
- A synthetic investor PDF containing intentionally conflicting financial signals
- Long quantitative Python generation
- Modern C++ generation
- Multi-turn quantitative reasoning
- Live microphone transcription
- Out-of-domain prompts
- Interrupted generations

---

# Example SEC Test

Maverro was asked:

> Pull Salesforce's latest 10-Q directly from SEC EDGAR. Tell me the filing date, reporting period, accession number, and the five most important things an equity analyst should notice. Use the SEC filing as the primary source.

Maverro correctly resolved:

```text
Company: Salesforce, Inc.
Ticker: CRM
CIK: 1108524
Form: 10-Q
Filing date: May 28, 2026
Accession: 0001108524-26-000127
```

It then analyzed the filing and surfaced the SEC document itself as the primary source.

---

# Example PDF Test

A fictional enterprise-software investor update was created specifically to test whether Maverro could recognize conflicting evidence.

The document contained:

```text
Strong:
Revenue
Margins
Free cash flow
AI revenue growth

Weakening:
cRPO
Net revenue retention
Expansion bookings
Contract duration
Large-enterprise growth
```

Maverro correctly identified the central tension:

> **Strong current profitability and cash generation alongside materially weaker forward demand indicators.**

It separately labeled document facts and its own interpretation and identified the most important metrics to monitor in the following quarter.

---

# Speed

Speed is a product requirement, not an accidental characteristic.

Maverro deliberately uses:

- GPT-5.6 Sol
- Low reasoning effort
- OpenAI fast service tier
- Streaming responses
- Bounded tool use
- Concurrent research where appropriate
- Lightweight session-only state
- No database round trips
- No vector database
- No autonomous multi-agent hierarchy

The architecture is intentionally smaller than many AI research systems.

The hypothesis behind Maverro is that an experienced analyst often benefits more from:

> **A very strong model + excellent tools + low latency**

than from an unnecessarily complicated agent architecture.

---

# Architecture

```text
┌───────────────────────────┐
│        Browser UI         │
│   Next.js / React / TS    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│      Maverro Backend      │
│   Vercel / Next.js API    │
└──────┬────────┬───────────┘
       │        │
       │        └──────────────► SEC EDGAR
       │
       ▼
┌───────────────────────────┐
│      OpenAI Responses     │
│       GPT-5.6 Sol         │
│      + Web Search         │
└───────────────────────────┘

Voice:
Browser microphone
       ↓
OpenAI Realtime transcription
       ↓
Editable composer
```

---

# Technology

### Frontend

- TypeScript
- React
- Next.js
- Custom CSS

### AI

- OpenAI Responses API
- GPT-5.6 Sol
- GPT-5.6 Terra fallback
- OpenAI Web Search
- OpenAI Realtime transcription

### Research

- SEC EDGAR
- Direct filing retrieval
- PDF input

### Infrastructure

- GitHub
- Vercel
- Serverless API routes
- Environment-variable secret management

---

# Repository Structure

```text
maverro/
├── app/
│   ├── api/
│   │   ├── ask/
│   │   │   └── route.ts
│   │   ├── realtime-token/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── rate-limit.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Design Philosophy

Maverro intentionally avoids the visual language of consumer investing applications.

The interface is designed to feel:

- Minimal
- Fast
- Technical
- Quiet
- Institutional
- Information-dense without being cluttered

There are no portfolios, watchlists, social feeds, gamification systems, or trading buttons.

The user arrives with a question.

Maverro helps answer it.

---

# What Maverro Is Not

Maverro is not:

- A brokerage
- An autonomous trading system
- A portfolio-management system
- A Bloomberg Terminal replacement
- A FactSet replacement
- A persistent research database
- A general-purpose consumer chatbot
- A guarantee that generated research or code is correct

It is a specialized AI research interface.

---

# Reliability

Maverro is designed to make strong research **easier to verify**, not to remove the need for verification.

The system combines:

```text
Frontier reasoning
+
Primary-source retrieval
+
Current web research
+
Visible citations
+
Analyst review
```

Model-generated conclusions can still be wrong.

Generated code can still contain implementation or modeling errors.

Sources can contain incorrect information.

SEC filings and uploaded documents remain the authoritative source for claims attributed to those documents.

Nothing produced by Maverro should be interpreted as investment advice or as authorization to deploy capital without independent review.

---

# Privacy and State

Maverro V1 is intentionally stateless.

There is:

- No user database
- No persistent chat history
- No account system
- No long-term Maverro memory

Conversation context exists only for the active research session.

OpenAI requests are configured with storage disabled where applicable.

---

# Security

Maverro keeps permanent API credentials server-side.

The browser never receives the permanent OpenAI API key.

Voice uses short-lived Realtime credentials generated by Maverro's backend.

Other safeguards include:

- Same-origin request validation
- Input limits
- PDF size limits
- Request throttling
- Server-side environment variables
- Temporary document handling
- Security response headers

The V1 rate limiter is intentionally lightweight and should be treated as best-effort in a distributed serverless environment.

---

# Environment

Required server-side configuration:

```bash
OPENAI_API_KEY=
SEC_USER_AGENT=
OPENAI_MODEL=gpt-5.6-sol
OPENAI_FALLBACK_MODEL=gpt-5.6-terra
OPENAI_SERVICE_TIER=fast
```

Never commit production API credentials to the repository.

---

# Why Maverro Exists

Modern frontier models are already capable of extraordinary financial reasoning, coding, research, and document analysis.

The remaining product problem is often not:

> Can the model answer the question?

It is:

> How quickly can an analyst ask the question, provide the right evidence, inspect the result, and continue thinking?

Maverro is an experiment in optimizing that entire loop.

```text
Speak.
Research.
Verify.
Code.
Continue.
```

No dashboards required.

---

# Status

**Maverro V1: Complete**

Validated capabilities:

**Markets + Web + SEC + PDF + Python + C++ + Voice**

The V1 feature set is intentionally frozen.

Future development should prioritize measurable improvements in research quality, latency, source grounding, and analyst workflow rather than adding features for their own sake.

---

# Author

**Niko DiCarlo**

Software developer and independent builder focused on applied AI, financial research systems, and quantitative tooling.

---

© 2026 Niko DiCarlo. All rights reserved.

Maverro is an independent project and is not affiliated with, endorsed by, or sponsored by OpenAI or any investment firm mentioned in demonstrations, comparisons, or discussion.
