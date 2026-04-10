# HACKATHON PITCH — GenFit AI
### Hackaccino — Idea Submission (Elimination Round)

> Copy each slide section into your PPT. Each `---` separator = new slide.

---

SLIDE 1 — COVER

GenFit AI
The Autonomous Fitness Intelligence Platform

"Your body moves. Our AI watches, coaches, and evolves with you — in real time."

Team: [Your Team Name]
Track: AI / Health-Tech

---

SLIDE 2 — THE PROBLEM

The Fitness Crisis No One Talks About

73% of gym-goers exercise with incorrect form — risking joint damage, muscle tears, and chronic injury.
(Source: American Council on Exercise, 2025)

A personal trainer costs ₹2,000–₹5,000 per session. For 500M+ Indians under 30 trying to get fit, that is simply not an option.

What exists today is broken:
  - Workout apps give static PDF-style plans with zero real-time correction
  - Diet trackers require tedious manual input — 68% of users abandon them within 2 weeks
  - No platform connects planning, live coaching, nutrition, and progress tracking into one intelligent loop
  - Hindi-speaking users (600M+) are completely ignored by fitness technology

The gap: There is no affordable, AI-powered solution that can SEE your body, COACH your form, and AUTOMATE your fitness journey — all from a web browser.

---

SLIDE 3 — OUR VISION

GenFit AI — See. Coach. Automate.

We are building a full-stack web platform where artificial intelligence does not just plan your fitness — it actively watches your body, corrects your form in real time, and operates your entire fitness dashboard through natural conversation.

Three AI pillars drive every interaction:

  SEE → TensorFlow.js MoveNet runs in the browser camera, tracking 17 body keypoints at 30fps with skeleton overlay, joint-angle annotations, and biomechanical analysis. No app download. No wearable. No cost.

  COACH → Every rep is validated against sports-science benchmarks. Good form is counted. Bad form is rejected — and the AI tells you exactly what to fix, in English or Hindi, through live voice narration.

  AUTOMATE → An agentic AI chatbot (FitBot) does not just answer questions — it executes actions on your dashboard. Say "log that I ate 2 parathas" or "create a 4-week plan" and it is done. Voice, text, or photo — in Hindi or English.

The result: a closed-loop system where your BMI feeds into workout plans, plans link to live AI coaching, coaching logs to calorie tracker, tracker informs personalized diet, and diet adjusts to your evolving body. Every feature talks to every other feature.

---

SLIDE 4 — KEY FEATURES

What We Are Building

AI Virtual Training Assistant
  - Browser-native pose detection (TensorFlow.js MoveNet Thunder) — zero server cost
  - 60+ exercises across 7 body groups with skeleton overlay, keypoint dots, and joint-angle display
  - Automatic rep counting using angle-based state machines — no manual tapping
  - Per-rep posture validation: only correct-form reps are counted
  - Live bilingual voice narration (English + Hindi)
  - Directly linked to active workout plans — click "Train" on any exercise

Agentic AI Chatbot (FitBot)
  - Groq LLM with 6 tool-calling capabilities (log food, log workout, create plans, update BMI, create diet chart, update profile)
  - Multimodal input: text, voice (Whisper transcription), and image (Groq Vision for food recognition)
  - Context-aware: reads your BMI, active plan, and today's calorie log before responding
  - All actions are executed server-side — not just suggested, actually performed

Personalized AI Planning
  - Gemini 2.0 Flash generates multi-week workout plans based on BMI, goals, equipment, intensity
  - AI-generated diet charts linked to active workout plan and BMI profile
  - Automatic weekly plan regeneration based on completion progress

Smart Calorie Tracking
  - Manual logging, AI image-based food recognition, or natural language via FitBot
  - Macro-nutrient insights, water intake tracking, daily visual progress

Gamification, Community, and Monetization
  - Points system, global leaderboard, rank badges, weekly admin-set challenges
  - Community messaging hub for progress sharing
  - Free and Pro tiers with Razorpay payment gateway integration

Admin Management Suite
  - Dashboard analytics, user management, audit trail, feedback and support tickets, income stats, weekly challenges

Google OAuth 2.0 Authentication, editable profiles (medical conditions, allergies), BMI history, smart analytics dashboard

---

SLIDE 5 — USER JOURNEY FLOWCHART

How a User Flows Through GenFit AI

(Design this as a visual flowchart in your PPT with arrows connecting each box)

    [User visits GenFit AI]
            │
            ▼
    [Google OAuth Sign-in]
            │
            ▼
    [BMI Calculator] ──→ Weight, Height, Age, Goals captured
            │
            ▼
    [AI Generates Workout Plan] ──→ Gemini 2.0 Flash creates personalized multi-week plan
            │
            ▼
    [My Plans Dashboard] ──→ View active plan, track weekly progress
            │
        ┌───┴───┐
        ▼       ▼
  [Click "Train"]   [AI Generates Diet Chart]
        │              │
        ▼              ▼
  [Virtual Training    [Personalized meal plan
   Assistant loads]     linked to workout + BMI]
        │
        ▼
  [TensorFlow.js MoveNet] ──→ Camera opens, skeleton overlay drawn
        │
        ▼
  [AI counts reps, validates form] ──→ Voice narration: "Rep 5. Good form." / "Fix: Keep back straight"
        │
        ▼
  [Session logged] ──→ Reps, calories, duration saved
        │
        ▼
  [Calorie Tracker] ──→ Log food manually, via photo, or via FitBot voice
        │
        ▼
  [Smart Analytics Dashboard] ──→ Progress trends, streaks, AI insights
        │
        ▼
  [Leaderboard + Community] ──→ Earn points, compete, share progress
        │
        ▼
  [Pro Upgrade via Razorpay] ──→ Unlock unlimited VTA sessions

---

SLIDE 6 — TECH STACK

Technology Choices and Why

Frontend: React.js — Component-based SPA for fast, interactive UI
Pose Detection: TensorFlow.js (MoveNet Thunder by Google) — Runs 100% client-side, zero server latency
AI/LLM: Groq (Llama 3.3 70B + Whisper + Vision) — Fastest inference for real-time agentic chat
Plan Generation: Google Gemini 2.0 Flash — Structured JSON output for workout and diet plans
Backend: Node.js + Express.js — Lightweight, scalable REST API
Database: MongoDB Atlas — Flexible schema for diverse fitness data models
Auth: Google OAuth 2.0 — Secure, passwordless authentication
Payments: Razorpay — Industry-standard Indian payment gateway
Voice: Web Speech API — Native browser TTS for bilingual narration
Deployment: Vercel — Serverless deployment for both frontend and backend

Why this stack matters: The entire pose detection pipeline runs in the user's browser. There is zero server round-trip for form analysis, meaning the coaching response is instantaneous — something cloud-based pose detection APIs simply cannot achieve.

---

SLIDE 7 — COMPETITIVE ANALYSIS

How GenFit AI Compares to Existing Solutions

(Format as a comparison table in your PPT)

Feature                  │ GenFit AI        │ Cult.fit        │ Nike Training   │ JEFIT           │ MyFitnessPal
─────────────────────────┼──────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────
Real-time Pose Detection │ Yes (browser)    │ No              │ No              │ No              │ No
Live Form Correction     │ Yes (per-rep)    │ No              │ No              │ No              │ No
Voice Narration          │ English + Hindi  │ English only    │ No              │ No              │ No
Agentic AI Chatbot       │ Yes (6 tools)    │ No              │ No              │ No              │ No
AI Food Image Logging    │ Yes (Groq Vision)│ No              │ No              │ No              │ Premium only
AI Workout Generation    │ Yes (Gemini)     │ Pre-made only   │ Pre-made only   │ templates       │ No
Diet + Workout Linked    │ Yes (auto)       │ Separate apps   │ No              │ No              │ No
Gamification             │ Yes (full)       │ Challenges only │ Badges          │ Basic           │ No
Community Messaging      │ Yes              │ No              │ No              │ Forum           │ Forum
Admin Suite              │ Full (7 modules) │ Internal only   │ No              │ No              │ No
Free Tier                │ Full featured    │ Limited trial   │ Limited         │ Ads + limits    │ Ads + limits
Client-side AI (no cost) │ Yes              │ No              │ No              │ No              │ No
Runs in Browser          │ Yes              │ No (app only)   │ No (app only)   │ No (app only)   │ Web + App
Price                    │ Free / ₹99 Pro   │ ₹599-999/month  │ Free/Limited    │ ₹449/month      │ ₹649/month

GenFit AI is the only platform that combines real-time computer vision, agentic AI, personalized planning, and nutrition tracking in a single free web-based experience. Every competitor either lacks AI coaching entirely or locks features behind expensive subscriptions.

---

SLIDE 8 — COST ANALYSIS

Operational Cost Per User — Built for Scale

GenFit AI is architected for near-zero marginal cost. The most compute-intensive feature — pose detection — runs entirely on the user's device, not our servers.

Total operational cost: approximately ₹25–₹40 per user per month ($0.30–$0.50)

Breakdown:

  AI Inference (pay-per-use, zero cost when idle):
    - Groq (Llama 3.3 70B): ~$0.09/user/month for ~150 chat interactions (~600K tokens)
    - Gemini 2.0 Flash: ~$0.03/user/month for ~400 plan generation requests
    - If a user is inactive, AI cost is exactly $0.00

  Pose Detection (TensorFlow.js MoveNet):
    - Runs 100% client-side in the browser
    - Zero backend cost, zero API calls, zero server GPU required
    - This is our single biggest cost advantage over any competitor

  Database (MongoDB Atlas):
    - Free tier: $0 (supports initial user base)
    - At 1,000 users: ~$0.06/user/month
    - Scales linearly with predictable cost

  Hosting (Vercel):
    - Hobby tier: $0 (sufficient for launch)
    - Pro tier at scale: ~$0.02/user/month

  Payment Processing:
    - Razorpay: 2% per transaction (standard, no fixed cost)

Why this matters: Most AI fitness platforms spend $2–$5 per user on cloud GPU for pose detection. Our client-side architecture eliminates this entirely, making GenFit AI 10x cheaper to operate at scale.

---

SLIDE 9 — IMPACT AND INNOVATION

What Makes This Approach Different

Browser-Native Computer Vision
  No app install. No wearable. No hardware cost. TensorFlow.js runs entirely in the browser for zero-latency, zero-cost pose detection. Any device with a camera and Chrome becomes a personal trainer. This alone eliminates the largest cost center in AI fitness — server-side GPU inference.

Agentic AI — Beyond Chatbots
  Most fitness apps offer FAQ-style chatbots. FitBot is fundamentally different. It has 6 real tool-calling functions that directly modify database records — logging food, creating workout plans, updating BMI. It is an autonomous agent that operates your dashboard, not a text generation wrapper.

Closed-Loop Intelligence
  Every feature feeds into every other feature. BMI drives plan generation. Plans link to live VTA training. Training sessions log calories. Calorie data informs diet charts. Diet charts adjust to BMI changes. This is not a collection of independent features — it is a single intelligent system with continuous feedback loops.

Bilingual Accessibility at Scale
  600M+ Hindi speakers have been ignored by fitness technology. GenFit AI narrates live coaching, accepts voice commands, and responds to chat in both English and Hindi, making AI personal training accessible to Bharat — not just metro India.

Democratized Personal Training
  What costs ₹3,000–₹5,000 per session with a human trainer, GenFit AI delivers for free through a browser tab. The biomechanical validation is not cosmetic — every single rep is analyzed against joint-angle thresholds derived from sports-science literature, and bad-form reps are rejected with spoken correction.

Market Opportunity: India's fitness market is projected to reach $30B by 2028 (IMARC Group). GenFit AI targets the 500M+ digitally connected Indians under 30 who want to get fit but cannot afford personal training.

---

SLIDE 10 — FUTURE ROADMAP

Where GenFit AI Goes Next

Phase 1 — Foundation (Current)
  - Full-stack web platform with all core features live
  - 60+ exercises with real-time pose detection
  - Agentic chatbot with 6 tools
  - Free and Pro tiers with Razorpay

Phase 2 — Expansion (3–6 Months)
  - React Native mobile app with on-device pose detection
  - Wearable integration (Google Fit, Apple Health) for heart rate and step sync
  - Regional language support beyond Hindi (Tamil, Telugu, Bengali, Marathi)
  - AI-generated video demonstrations for each exercise

Phase 3 — Intelligence (6–12 Months)
  - Injury risk prediction using historical form-score trends
  - Adaptive plan difficulty — AI automatically adjusts intensity based on performance data
  - Social challenges — users compete in real-time rep battles with live pose detection
  - Partnership API for gyms and corporate wellness programs

Phase 4 — Scale (12–18 Months)
  - B2B offering for corporate employee wellness programs
  - Physiotherapy and rehabilitation mode with medical professional oversight
  - Multi-person pose detection for group fitness classes
  - Marketplace for certified trainers to create and sell custom plans

Vision: GenFit AI evolves from a fitness platform into an autonomous health intelligence engine that understands, adapts to, and improves the physical wellbeing of every user — one rep at a time.

---

SLIDE 11 — CONCLUSION

GenFit AI — See. Coach. Automate.

The problem is real: millions work out with wrong form, eat without tracking, and quit within 30 days because affordable, intelligent coaching does not exist.

Our solution is real: a browser-based platform where TensorFlow.js watches your body, validates every rep, narrates corrections in your language, and an agentic AI runs your entire fitness journey through natural conversation.

Our cost model is real: client-side pose detection means zero GPU server cost. Total per-user cost under ₹40/month. We are 10x cheaper to operate than any AI fitness competitor.

Our market is real: 500M+ digitally connected Indians under 30. A $30B fitness market by 2028. And not a single product that combines real-time AI coaching, agentic automation, and personalized planning in one free web experience.

GenFit AI is not another fitness app. It is the AI personal trainer that 1.4 billion Indians deserve — and it runs in a browser tab.

Ready to demo.

Team: [Your Team Name]
Contact: [Your Email]
Live: [Your Deployment URL]

---
