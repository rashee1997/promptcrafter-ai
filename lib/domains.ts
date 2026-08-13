import { DomainPreset, FrameworkType, PromptInput, ToneType } from '@/types';

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    id: 'software-coding',
    name: 'Software & Coding',
    iconName: 'Code2',
    description: 'Code refactoring, system architecture, API specifications, bug triaging, and unit tests.',
    systemPromptFragment: 'You are an expert Principal Software Engineer and System Architect specializing in writing production-grade code, clean architecture, design patterns, security, and testability.',
    placeholders: {
      topic: 'e.g., Build a rate-limited API gateway in Node.js with Redis cache',
      audience: 'e.g., Senior Full-Stack Engineers',
      additionalNotes: 'e.g., Include TypeScript type definitions, error handling, and performance considerations.',
    },
    exampleTopics: [
      'Design a resilient distributed caching layer for high-throughput REST APIs',
      'Refactor a monolithic React component into custom hooks and subcomponents',
      'Write a comprehensive unit test suite with Jest and Mock Service Worker',
      'Create an OpenAPI 3.0 spec for a multi-tenant SaaS authentication service',
    ],
  },
  {
    id: 'product-management',
    name: 'Product Management',
    iconName: 'LayoutGrid',
    description: 'User stories, Product Requirement Documents (PRDs), feature roadmaps, and telemetry metrics.',
    systemPromptFragment: 'You are a Chief Product Officer (CPO) and Product Strategist experienced in crafting clear PRDs, user stories with acceptance criteria, KPI tracking, and competitive analysis.',
    placeholders: {
      topic: 'e.g., PRD for AI-powered automated video transcript summarization',
      audience: 'e.g., Cross-functional squad (Designers, Engineers, QA)',
      additionalNotes: 'e.g., Emphasize success metrics, edge cases, and rollout phases.',
    },
    exampleTopics: [
      'Draft a PRD for a collaborative real-time document editing feature',
      'Create Gherkin-syntax user stories with acceptance criteria for checkout flow',
      'Design an onboarding funnel analytics framework to improve 30-day retention',
      'Build a feature prioritization matrix (RICE score) for Q3 roadmap items',
    ],
  },
  {
    id: 'marketing-growth',
    name: 'Marketing & Growth',
    iconName: 'TrendingUp',
    description: 'Ad copy, SEO content frameworks, email marketing sequences, brand positioning, and landing page copy.',
    systemPromptFragment: 'You are a Growth Marketing Director and Lead Copywriter master of high-conversion messaging, persuasive copywriting, SEO structure, brand tone, and audience engagement.',
    placeholders: {
      topic: 'e.g., High-converting cold email sequence for B2B developer tool',
      audience: 'e.g., VPs of Engineering at mid-market tech companies',
      additionalNotes: 'e.g., Highlight pain points around CI/CD bottlenecks and ROI.',
    },
    exampleTopics: [
      'Write a 5-step email nurture campaign for a developer platform free trial',
      'Draft high-converting Google Ads and LinkedIn copy for a SaaS product launch',
      'Create an SEO-optimized pillar page outline for modern web security practices',
      'Develop a brand positioning framework and value propositions for B2B AI app',
    ],
  },
  {
    id: 'blog-writer',
    name: 'Blog Writer & SEO',
    iconName: 'PenLine',
    description: 'SEO-optimized blog posts from a title or rough idea — keyword-driven structure, E-E-A-T alignment, and a human voice that avoids AI writing patterns.',
    systemPromptFragment: 'You are an award-winning SEO Content Strategist and Blog Editor who writes people-first, E-E-A-T-aligned articles that rank in Google and get cited by AI search engines — pairing keyword-driven structure with a natural, human voice that avoids every detectable AI writing pattern.',
    placeholders: {
      topic: 'e.g., Title or topic of the blog post (working title, idea, or paste an existing draft)',
      audience: 'e.g., Target readers and search intent (e.g., SMB owners researching project management tools — informational)',
      additionalNotes: 'e.g., Primary keyword, secondary keywords, competitor URLs, stats/sources to cite, target word count, internal links, brand voice, or draft content',
    },
    exampleTopics: [
      'Write a complete 1,800-word guide: "How to Choose a Project Management Tool for Remote Teams" — target keyword: best project management software for remote teams',
      'Turn my draft intro into a fully SEO-optimized pillar post on local SEO for dental clinics, with FAQ section and internal link suggestions',
      'Write a comparison post (table + FAQ schema) of SaaS pricing models, citing the stats I provide',
      'Expand this outline into a complete article that answers the query in the first two paragraphs so AI search engines cite it directly',
    ],
    domainGuidance: `Embed ALL of the following as mandatory directives inside the engineered prompt (do not summarize or drop any):

1. INPUT COLLECTION — The prompt must collect (or accept as given) before writing: primary keyword + secondary/long-tail keywords, search intent (informational / commercial / transactional), target reader and stage of funnel, target word count and format (guide, listicle, comparison, opinion), competitor URLs, sources/stats/case studies to cite, internal links with anchor text, and brand voice examples.

2. SEO DELIVERABLES — The prompt must require: a title tag (~50-60 chars, primary keyword near the front, CTR hook), a meta description (~150-160 chars with keyword and CTA), a keyword-based URL slug, a single H1 containing the primary keyword, a logical H2/H3 hierarchy that mirrors search intent and question phrasing, natural keyword placement in the first 100 words and in headings (never keyword stuffing), internal linking suggestions with descriptive anchors, 1-2 links to authoritative external sources, a FAQ section suitable for FAQPage schema, and a clear CTA.

3. E-E-A-T & HELPFUL CONTENT — The prompt must require people-first, original analysis that goes beyond obvious advice and beyond rewriting other sources; verifiable facts with no fabricated stats; first-hand experience where relevant; and where applicable an author byline, sourcing, and transparency about AI assistance. No word-count padding and no invented answers to questions that have no answer.

4. AI-PATTERN GUARDRAILS — The prompt must explicitly forbid AI tells: filler words (delve, tapestry, vibrant, landscape, realm, embark, foster, harness, unlock, navigate, seamless, robust, pivotal, game-changer, "in today's fast-paced world", "it's important to note", "in conclusion"), transition-word saturation (furthermore / moreover chains), hedged language ("arguably", "it's worth noting", "ultimately"), uniform metronomic sentence rhythm, formulaic "list of three" structures, generic hook openings, bullet-point overload, and generic examples. It must instead require varied sentence and paragraph length, contractions, first-person experience where appropriate, direct address to the reader, concrete numbers, named tools/studies, and specific examples.

5. AI-SEARCH OPTIMIZATION — The prompt must require a cite-able direct answer near the top (a definitional sentence that answers the query in one breath), question-based H2s, and tables/lists where they add clarity, so the article can be pulled into AI Overviews and cited by ChatGPT/Perplexity.

6. SELF-REVIEW PASS — Before delivering, the prompt must instruct the model to re-read the finished article and rewrite any sentence that still contains banned phrases, hedged language, or uniform rhythm, then deliver the final clean version.`,
  },
  {
    id: 'creative-writing',
    name: 'Creative & Narrative',
    iconName: 'Sparkles',
    description: 'World-building, character depth, story arcs, dialogue refinement, and immersive world crafting.',
    systemPromptFragment: 'You are an award-winning Creative Director and Author specializing in rich character development, engaging narratives, immersive dialogue, worldbuilding, and sensory detail.',
    placeholders: {
      topic: 'e.g., Cyberpunk noir story opening with a detective investigating AI memories',
      audience: 'e.g., Sci-Fi novel readers',
      additionalNotes: 'e.g., Use vivid sensory imagery, tense pacing, and realistic dialogue.',
    },
    exampleTopics: [
      'Outline a 3-act story arc featuring a rogue AI navigation officer in deep space',
      'Develop detailed character profiles and internal conflicts for a fantasy saga',
      'Craft atmospheric worldbuilding lore for a post-apocalyptic underwater colony',
      'Write dialogue between two rival engineers competing for a high-stakes patent',
    ],
  },
  {
    id: 'academic-research',
    name: 'Academic & Research',
    iconName: 'GraduationCap',
    description: 'Literature review structure, thesis defense preparation, methodology formulation, and paper abstracts.',
    systemPromptFragment: 'You are a Senior Academic Researcher and Peer Reviewer skilled in rigorous scientific methodologies, literature synthesis, citation standards, formal writing, and objective analysis.',
    placeholders: {
      topic: 'e.g., Systematic literature review on Transformer attention mechanisms in genomics',
      audience: 'e.g., Peer reviewers for Machine Learning journals',
      additionalNotes: 'e.g., Emphasize empirical evidence, limitations, and methodological rigor.',
    },
    exampleTopics: [
      'Formulate a research proposal and methodology section on climate data modeling',
      'Synthesize key findings from recent papers on multi-modal AI reasoning',
      'Draft a formal abstract and introduction for a journal manuscript',
      'Prepare viva / thesis defense questions and counter-arguments for machine learning paper',
    ],
  },
  {
    id: 'technical-doc-hse',
    name: 'Technical & Compliance',
    iconName: 'FileText',
    description: 'Standard Operating Procedures (SOPs), safety compliance, operational runbooks, and audit frameworks.',
    systemPromptFragment: 'You are a Principal Compliance & Documentation Engineer specializing in precise Standard Operating Procedures (SOPs), safety protocols, technical manuals, and audit readiness.',
    placeholders: {
      topic: 'e.g., Incident response SOP for cloud server data breach',
      audience: 'e.g., DevOps, Security Operations, and Compliance Officers',
      additionalNotes: 'e.g., Ensure step-by-step numbering, severity tiers, and escalation paths.',
    },
    exampleTopics: [
      'Draft an AWS infrastructure disaster recovery and failover playbook',
      'Write an HSE (Health, Safety & Environment) compliance checklist for hardware labs',
      'Create an Architecture Decision Record (ADR) framework for database migration',
      'Draft an internal security audit protocol for third-party API dependencies',
    ],
  },
  {
    id: 'legal-business',
    name: 'Legal & Strategy',
    iconName: 'ShieldCheck',
    description: 'Contract clause frameworks, policy summaries, risk assessment matrix, and strategic board memos.',
    systemPromptFragment: 'You are a Corporate Legal Counsel and Strategic Advisor expert in contractual logic, risk mitigation, compliance frameworks, precise language, and executive decision briefs.',
    placeholders: {
      topic: 'e.g., Vendor Data Processing Agreement (DPA) clause for GDPR compliance',
      audience: 'e.g., Executive Committee & Legal Advisors',
      additionalNotes: 'e.g., Identify liability limits, data handling rules, and termination terms.',
    },
    exampleTopics: [
      'Draft a comprehensive Non-Disclosure Agreement (NDA) outline for M&A discussions',
      'Summarize key regulatory compliance risks for deploying generative AI in healthcare',
      'Prepare an executive board memo proposing expansion into enterprise markets',
      'Create a SaaS Terms of Service SLA (Service Level Agreement) policy document',
    ],
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    iconName: 'Sliders',
    description: 'Define your own specialized domain, role, constraints, and custom operational context.',
    systemPromptFragment: 'You are a specialized AI assistant tailored precisely to the domain specifications provided by the user.',
    placeholders: {
      topic: 'e.g., Describe what you want the prompt to accomplish...',
      audience: 'e.g., Target user or AI system',
      additionalNotes: 'e.g., Custom domain rules, context, or mandatory constraints.',
    },
    exampleTopics: [
      'Create a prompt for generating interactive language learning exercises',
      'Generate a prompt for automated code review bot in GitHub PRs',
      'Craft a prompt for a virtual financial advisor summarizing quarterly reports',
    ],
  },
];

export const TONE_OPTIONS: { value: ToneType; label: string; description: string; category: string }[] = [
  {
    value: 'professional',
    label: 'Professional & Authoritative',
    description: 'Objective, clear, structured, and authoritative tone suitable for enterprise environments.',
    category: 'Executive & Professional',
  },
  {
    value: 'concise',
    label: 'Concise & Direct',
    description: 'Eliminates fluff, focuses on direct execution, bullet points, and high signal-to-noise ratio.',
    category: 'Analytical & Critical',
  },
  {
    value: 'creative',
    label: 'Creative & Engaging',
    description: 'Expressive, imaginative, rich vocabulary, and dynamic tone.',
    category: 'Creative & Narrative',
  },
  {
    value: 'detailed',
    label: 'Exhaustive & Detailed',
    description: 'Comprehensive coverage, covering edge cases, step-by-step instructions, and thorough explanations.',
    category: 'Educational & Supportive',
  },
  {
    value: 'analytical',
    label: 'Step-by-Step Analytical',
    description: 'Breaks problem down systematically with logical reasoning and structured breakdown.',
    category: 'Analytical & Critical',
  },
  {
    value: 'academic',
    label: 'Academic & Scientific',
    description: 'Formal, evidence-grounded, precise terminology, citations, and analytical rigor.',
    category: 'Educational & Supportive',
  },
  {
    value: 'executive',
    label: 'Executive Briefing',
    description: 'High-level summary, key takeaways, strategic impact, and actionable recommendations.',
    category: 'Executive & Professional',
  },
  {
    value: 'socratic',
    label: 'Socratic Inquiry',
    description: 'Questions assumptions, probes reasoning, and encourages critical reflection before concluding.',
    category: 'Analytical & Critical',
  },
  {
    value: 'persuasive',
    label: 'Persuasive & Convincing',
    description: 'Uses rhetorical structure, strong arguments, and persuasive language to influence decision-making.',
    category: 'Executive & Professional',
  },
  {
    value: 'empathic',
    label: 'Empathic & Supportive',
    description: 'Warm, patient, and understanding tone focused on empathy, clarity, and user comfort.',
    category: 'Educational & Supportive',
  },
  {
    value: 'adversarial',
    label: 'Adversarial Challenge',
    description: 'Critically tests assumptions, identifies weaknesses, and sharpens arguments through challenge.',
    category: 'Analytical & Critical',
  },
  {
    value: 'pedagogical',
    label: 'Pedagogical & Instructional',
    description: 'Teaches concepts clearly with examples, step-by-step explanation, and learner-centered guidance.',
    category: 'Educational & Supportive',
  },
  {
    value: 'diplomatic',
    label: 'Diplomatic & Tactful',
    description: 'Balances clarity with tact, preserving relationships while communicating difficult ideas.',
    category: 'Executive & Professional',
  },
  {
    value: 'narrative',
    label: 'Narrative & Storytelling',
    description: 'Uses storytelling structure, vivid imagery, and character-driven flow to engage readers.',
    category: 'Creative & Narrative',
  },
];

export const FRAMEWORK_OPTIONS: { value: FrameworkType; label: string; tag: string; description: string; category: string }[] = [
  {
    value: 'rtf',
    label: 'Role - Task - Format (RTF)',
    tag: 'Best for standard prompts',
    description: 'Establishes a persona (Role), explicit goal (Task), and exact output structure (Format).',
    category: 'Foundational',
  },
  {
    value: 'car',
    label: 'Context - Action - Result (CAR)',
    tag: 'Best for problem solving',
    description: 'Provides background situation (Context), steps to take (Action), and expected outcome (Result).',
    category: 'Foundational',
  },
  {
    value: 'cot',
    label: 'Chain-of-Thought (CoT)',
    tag: 'Best for reasoning & code',
    description: 'Instructs the AI to think step-by-step, explaining internal logic before producing final answers.',
    category: 'Reasoning & Agentic',
  },
  {
    value: 'few-shot',
    label: 'Few-Shot Exemplar',
    tag: 'Best for strict consistency',
    description: 'Includes concrete input/output examples inside the prompt to anchor the expected pattern.',
    category: 'System & Meta',
  },
  {
    value: 'system-instruction',
    label: 'System Instruction / Meta-Prompt',
    tag: 'Best for system level behavior',
    description: 'A master system prompt designed to govern AI agent behavior, guardrails, and tool usage rules.',
    category: 'System & Meta',
  },
  {
    value: 'react',
    label: 'ReAct (Reasoning + Acting)',
    tag: 'Best for tool-enabled workflows',
    description: 'Enforces a stepwise Reasoning, Acting, Observation loop to integrate actions and external tools into the prompt.',
    category: 'Reasoning & Agentic',
  },
  {
    value: 'risen',
    label: 'RISEN Structure',
    tag: 'Best for structured plans',
    description: 'Enforces Role, Instructions, Steps, End Goal, Narrowing Constraints for precise execution.',
    category: 'System & Meta',
  },
  {
    value: 'tot',
    label: 'Tree-of-Thoughts (ToT)',
    tag: 'Best for multi-branch reasoning',
    description: 'Enforces multi-branch reasoning paths, evaluation, pruning, and synthesis of the strongest solution.',
    category: 'Reasoning & Agentic',
  },
  {
    value: 'self-refine',
    label: 'Self-Refine & Critique',
    tag: 'Best for iterative improvement',
    description: 'Enforces drafting, critique against rubrics, self-correction, and a polished final output.',
    category: 'System & Meta',
  },
  {
    value: 'ape',
    label: 'APE (Action, Purpose, Expectation)',
    tag: 'Best for direct outcomes',
    description: 'Emphasizes action, underlying purpose, and expected result for clear outcomes.',
    category: 'System & Meta',
  },
  {
    value: 'coast',
    label: 'COAST (Context, Objective, Actions, Scenario, Task)',
    tag: 'Best for contextual planning',
    description: 'Organizes prompts by context, objective, actions, scenario, and task for well-scoped execution.',
    category: 'Reasoning & Agentic',
  },
  {
    value: 'socratic-architecture',
    label: 'Socratic Architecture',
    tag: 'Best for meta-cognitive logic',
    description: 'Challenges assumptions, surfaces edge cases, and verifies reasoning with Socratic questioning.',
    category: 'System & Meta',
  },
];

export function buildMetaSystemPrompt(input: PromptInput, domain: DomainPreset): string {
  const toneObj = TONE_OPTIONS.find((t) => t.value === input.tone);
  const toneDesc = toneObj?.description || input.tone;
  const frameworkObj = FRAMEWORK_OPTIONS.find((f) => f.value === input.framework);
  const frameworkDesc = frameworkObj?.description || input.framework;

  let frameworkInstructions = '';
  switch (input.framework) {
    case 'react':
      frameworkInstructions = `Enforce a strict ReAct (Reasoning + Acting) execution sequence in the prompt (Thought -> Action -> Action Input -> Observation -> Final Answer).`;
      break;
    case 'risen':
      frameworkInstructions = `Enforce the RISEN structure (Role, Instructions, Steps, End Goal, Narrowing Constraints).`;
      break;
    case 'tot':
      frameworkInstructions = `Enforce a Tree-of-Thoughts (ToT) multi-branch evaluation approach (evaluate 3 candidate branches, score feasibility, prune, and synthesize optimal path).`;
      break;
    case 'self-refine':
      frameworkInstructions = `Enforce a Self-Refine & Critique loop in the prompt (Draft -> Critique against rubrics -> Self-Correction -> Final Output).`;
      break;
    case 'ape':
      frameworkInstructions = `Enforce an APE structure (Action, Purpose, Expectation).`;
      break;
    case 'coast':
      frameworkInstructions = `Enforce a COAST structure (Context, Objective, Actions, Scenario, Task).`;
      break;
    case 'socratic-architecture':
      frameworkInstructions = `Enforce a Socratic Meta-Cognitive architecture (Question assumptions, identify edge cases, verify step-by-step logic).`;
      break;
    default:
      frameworkInstructions = `Follow the ${input.framework.toUpperCase()} framework structure emphasizing clear role definition, structured steps, and explicit guidelines.`;
      break;
  }

  const selectedFormat = input.outputFormat || 'markdown';
  let formatGuide = '';
  switch (selectedFormat) {
    case 'xml':
      formatGuide = `Structure the generated prompt entirely using clean, well-formed XML tags (e.g. <persona>, <instructions>, <execution_steps>, <guardrails>, <output_format>). Do NOT use markdown headers unless inside tag content.`;
      break;
    case 'json':
      formatGuide = `Structure the generated prompt or system instruction definition in clean JSON schema/key-value format.`;
      break;
    case 'bullet-points':
      formatGuide = `Structure the generated prompt using clear, concise bullet-pointed instructions and directives.`;
      break;
    case 'structured-text':
      formatGuide = `Structure the generated prompt using plain-text labeled sections (e.g., PERSONA:, CONTEXT:, DIRECTIVES:, GUARDRAILS:, OUTPUT REQUIREMENTS:).`;
      break;
    case 'markdown':
    default:
      formatGuide = `Structure the generated prompt using clean, well-organized Markdown headers (e.g., # Persona & Role, ## Objective, ## Step-by-Step Instructions, ## Guardrails & Negative Constraints).`;
      break;
  }

  return `You are PromptCrafter, an elite World-Class Prompt Engineer, Meta-Prompt Designer, and AI System Architect.

YOUR MISSION:
Engineer a single, production-ready, top-tier AI prompt based on the user's requirements.

STRICT GENERATION DIRECTIVES:
1. OUTPUT ONLY THE ENGINEERED PROMPT: Return ONLY the single, complete, production-ready prompt itself. Do NOT include conversational intros (e.g., "Here is your prompt:"), extra meta-explanations, section wrappers (like "## Master System Prompt" or "## Architecture"), example sections, or Mermaid diagrams.
2. NO FEW-SHOT EXAMPLES OR MERMAID DIAGRAMS: Do NOT output example conversation blocks or Mermaid charts. Keep the output 100% clean and copy-paste ready.
3. ADHERE TO USER-SELECTED OUTPUT FORMAT:
   ${formatGuide}
4. DYNAMIC BRACKETED PLACEHOLDERS: Whenever specific variables (like tech stack, API key, domain database, product name) are contextually variable, use bracketed uppercase placeholders (e.g., [INSERT_TECH_STACK_HERE], [INSERT_PRODUCT_NAME_HERE], [INSERT_TARGET_METRIC]).
5. HIGH-SIGNAL INSTRUCTIONS: Ensure the prompt contains an expert persona, explicit goal, step-by-step logic, edge-case handling, and strict negative constraints ("What NOT to do").

Target Domain Context:
- Domain Name: ${domain.name}
- Domain Expert Persona: ${domain.systemPromptFragment}
${domain.domainGuidance ? `
DOMAIN-SPECIFIC MANDATORY DIRECTIVES (embed ALL of these requirements into the engineered prompt, do not drop or soften any):
${domain.domainGuidance}
` : ''}
Prompt Architecture Configuration:
- Framework: ${input.framework.toUpperCase()} (${frameworkDesc})
  ${frameworkInstructions}
- Tone / Style Persona: ${input.tone} (${toneDesc})
- Target Audience: ${input.targetAudience || 'General Domain Expert'}
- Requested Output Format: ${selectedFormat}
${input.includeConstraints ? `- Include Explicit Negative Constraints & Guardrails: YES` : ''}

Generate the final engineered prompt now:`;
}

export function buildUserPromptMessage(input: PromptInput, domain: DomainPreset): string {
  let message = `Topic / Goal: "${input.topic}"\n\n`;

  if (input.customDomain && domain.id === 'custom-domain') {
    message += `Custom Domain Context: ${input.customDomain}\n\n`;
  }

  if (input.targetAudience) {
    message += `Target Audience: ${input.targetAudience}\n`;
  }

  if (input.outputFormat) {
    message += `Preferred Format: ${input.outputFormat}\n`;
  }

  if (input.additionalNotes) {
    message += `Additional Requirements / Context: ${input.additionalNotes}\n`;
  }

  message += `\nPlease engineer a top-tier, production-ready ${input.framework.toUpperCase()} prompt based on this goal.`;

  return message;
}
