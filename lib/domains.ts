import { DomainPreset, FrameworkType, PromptInput, ToneType } from '@/types';

/** Default cap (in characters) applied to the engineered prompt when the user keeps the default value. */
export const DEFAULT_OUTPUT_CHAR_LIMIT = 4000;

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    id: 'software-coding',
    name: 'Software & Technology',
    iconName: 'Code2',
    description: 'Planning systems, writing technical specs, troubleshooting, and quality checks for software projects.',
    systemPromptFragment: 'You are an expert Principal Software Engineer and System Architect specializing in writing production-grade code, clean architecture, design patterns, security, and testability.',
    placeholders: {
      topic: 'e.g., Design a customer sign-in and account system for a web app',
      audience: 'e.g., Engineering team',
      additionalNotes: 'e.g., Include security, error handling, and performance considerations.',
    },
    exampleTopics: [
      'Plan a fast, reliable data layer for a busy web application',
      'Break one large software screen into smaller, reusable parts',
      'Write automated quality checks for a new feature',
      'Document the API for a customer sign-in service',
    ],
  },
  {
    id: 'product-management',
    name: 'Product Management',
    iconName: 'LayoutGrid',
    description: 'Feature plans, user stories, roadmaps, and success metrics.',
    systemPromptFragment: 'You are a Chief Product Officer (CPO) and Product Strategist experienced in crafting clear PRDs, user stories with acceptance criteria, KPI tracking, and competitive analysis.',
    placeholders: {
      topic: 'e.g., Feature plan for automatic video transcript summaries',
      audience: 'e.g., Product, design, and engineering team',
      additionalNotes: 'e.g., Include success metrics and rollout phases.',
    },
    exampleTopics: [
      'Write a feature plan for real-time document collaboration',
      'Write user stories with acceptance criteria for a checkout flow',
      'Plan onboarding analytics to improve 30-day retention',
      'Prioritize Q3 roadmap items by impact and effort',
    ],
  },
  {
    id: 'marketing-growth',
    name: 'Marketing & Growth',
    iconName: 'TrendingUp',
    description: 'Ad copy, email campaigns, landing pages, and brand messaging.',
    systemPromptFragment: 'You are a Growth Marketing Director and Lead Copywriter master of high-conversion messaging, persuasive copywriting, SEO structure, brand tone, and audience engagement.',
    placeholders: {
      topic: 'e.g., Email sequence to win back lapsed customers',
      audience: 'e.g., Decision-makers at mid-size companies',
      additionalNotes: 'e.g., Emphasize time savings and return on investment.',
    },
    exampleTopics: [
      'Write a five-email welcome campaign for a free trial',
      'Write Google Ads and LinkedIn copy for a product launch',
      'Create an SEO outline for a guide to web security best practices',
      'Define brand positioning and key messages for a B2B product',
    ],
  },
  {
    id: 'blog-writer',
    name: 'Blog & Content',
    iconName: 'PenLine',
    description: 'Search-friendly articles from a title or rough idea, written in a natural, human voice.',
    systemPromptFragment: 'You are an award-winning SEO Content Strategist and Blog Editor who writes people-first, E-E-A-T-aligned articles that rank in Google and get cited by AI search engines — pairing keyword-driven structure with a natural, human voice that avoids every detectable AI writing pattern.',
    placeholders: {
      topic: 'e.g., Topic or working title of the article',
      audience: 'e.g., Who is reading this and what they want to learn',
      additionalNotes: 'e.g., Keywords, sources to cite, target length, brand voice, or a draft',
    },
    exampleTopics: [
      'Write a complete 1,800-word guide: "How to Choose a Project Management Tool for Remote Teams" — target keyword: best project management software for remote teams',
      'Turn a rough draft into a complete, search-optimized article with an FAQ section',
      'Write a comparison article on SaaS pricing models using my stats',
      'Expand an outline into a complete article that answers the question quickly',
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
    name: 'Creative Writing',
    iconName: 'Sparkles',
    description: 'Stories, characters, dialogue, and world-building.',
    systemPromptFragment: 'You are an award-winning Creative Director and Author specializing in rich character development, engaging narratives, immersive dialogue, worldbuilding, and sensory detail.',
    placeholders: {
      topic: 'e.g., Opening scene for a mystery novel set in a futuristic city',
      audience: 'e.g., Sci-Fi novel readers',
      additionalNotes: 'e.g., Use vivid detail, strong pacing, and realistic dialogue.',
    },
    exampleTopics: [
      'Outline a three-act story about an AI officer lost in deep space',
      'Develop detailed character profiles and internal conflicts for a fantasy saga',
      'Build the world and history of a post-apocalyptic underwater colony',
      'Write dialogue between two rivals competing for a big patent',
    ],
  },
  {
    id: 'academic-research',
    name: 'Research & Academia',
    iconName: 'GraduationCap',
    description: 'Literature reviews, research proposals, abstracts, and thesis preparation.',
    systemPromptFragment: 'You are a Senior Academic Researcher and Peer Reviewer skilled in rigorous scientific methodologies, literature synthesis, citation standards, formal writing, and objective analysis.',
    placeholders: {
      topic: 'e.g., Literature review on AI in medical imaging',
      audience: 'e.g., Academic reviewers',
      additionalNotes: 'e.g., Emphasize evidence, limitations, and research method.',
    },
    exampleTopics: [
      'Draft a research proposal on climate data modeling',
      'Summarize key findings from recent research papers',
      'Draft a formal abstract and introduction for a journal manuscript',
      'Prepare likely questions and answers for a thesis defense',
    ],
  },
  {
    id: 'technical-doc-hse',
    name: 'Operations & Compliance',
    iconName: 'FileText',
    description: 'Process documents, safety procedures, operational guides, and audit checklists.',
    systemPromptFragment: 'You are a Principal Compliance & Documentation Engineer specializing in precise Standard Operating Procedures (SOPs), safety protocols, technical manuals, and audit readiness.',
    placeholders: {
      topic: 'e.g., Step-by-step process for responding to a data breach',
      audience: 'e.g., IT and compliance teams',
      additionalNotes: 'e.g., Include clear steps, severity levels, and who to contact.',
    },
    exampleTopics: [
      'Write a recovery plan for keeping systems running during an outage',
      'Write a health and safety compliance checklist for a lab',
      'Create a decision log for moving to a new database',
      'Write a security review process for outside software tools',
    ],
  },
  {
    id: 'legal-business',
    name: 'Legal & Business',
    iconName: 'ShieldCheck',
    description: 'Contract outlines, policy summaries, risk reviews, and executive memos.',
    systemPromptFragment: 'You are a Corporate Legal Counsel and Strategic Advisor expert in contractual logic, risk mitigation, compliance frameworks, precise language, and executive decision briefs.',
    placeholders: {
      topic: 'e.g., Data protection agreement with a vendor',
      audience: 'e.g., Executives and legal team',
      additionalNotes: 'e.g., Cover liability limits, data rules, and exit terms.',
    },
    exampleTopics: [
      'Outline a non-disclosure agreement for a business deal',
      'Summarize the compliance risks of using AI in healthcare',
      'Write an executive memo on expanding into larger markets',
      'Draft a service level agreement for a SaaS product',
    ],
  },
  {
    id: 'custom-domain',
    name: 'Custom',
    iconName: 'Sliders',
    description: 'Describe your own use case, role, and rules from scratch.',
    systemPromptFragment: 'You are a specialized AI assistant tailored precisely to the domain specifications provided by the user.',
    placeholders: {
      topic: 'e.g., What should the prompt help you do?',
      audience: 'e.g., Who will use this?',
      additionalNotes: 'e.g., Any rules, background, or requirements to include.',
    },
    exampleTopics: [
      'Create a prompt for generating interactive language learning exercises',
      'Create a prompt for an assistant that reviews code changes',
      'Craft a prompt for a virtual financial advisor summarizing quarterly reports',
    ],
  },
];

export const TONE_OPTIONS: { value: ToneType; label: string; description: string; category: string }[] = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear, professional, and trustworthy.',
    category: 'Professional',
  },
  {
    value: 'concise',
    label: 'Concise',
    description: 'Short, direct, and to the point.',
    category: 'Analytical',
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Expressive, imaginative, and engaging.',
    category: 'Creative',
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Complete and thorough, with step-by-step detail.',
    category: 'Supportive',
  },
  {
    value: 'analytical',
    label: 'Step-by-Step',
    description: 'Breaks problems into logical, step-by-step analysis.',
    category: 'Analytical',
  },
  {
    value: 'academic',
    label: 'Academic',
    description: 'Formal, evidence-based, and precise.',
    category: 'Supportive',
  },
  {
    value: 'executive',
    label: 'Executive',
    description: 'High-level summary with key takeaways and recommendations.',
    category: 'Professional',
  },
  {
    value: 'socratic',
    label: 'Questioning',
    description: 'Asks questions to test assumptions before concluding.',
    category: 'Analytical',
  },
  {
    value: 'persuasive',
    label: 'Persuasive',
    description: 'Builds strong, convincing arguments.',
    category: 'Professional',
  },
  {
    value: 'empathic',
    label: 'Empathetic',
    description: 'Warm, patient, and understanding.',
    category: 'Supportive',
  },
  {
    value: 'adversarial',
    label: 'Challenge',
    description: 'Challenges ideas to find weaknesses and sharpen them.',
    category: 'Analytical',
  },
  {
    value: 'pedagogical',
    label: 'Instructional',
    description: 'Explains concepts clearly with examples and step-by-step guidance.',
    category: 'Supportive',
  },
  {
    value: 'diplomatic',
    label: 'Diplomatic',
    description: 'Clear but tactful, even on difficult topics.',
    category: 'Professional',
  },
  {
    value: 'narrative',
    label: 'Narrative',
    description: 'Tells a story with vivid detail to engage the reader.',
    category: 'Creative',
  },
];

export const FRAMEWORK_OPTIONS: { value: FrameworkType; label: string; tag: string; bestFor: string; description: string; category: string }[] = [
  {
    value: 'rtf',
    label: 'Role, Task & Format',
    tag: 'Best for everyday use',
    bestFor: 'Quick, one-shot prompts where you need a clear role, a specific task, and a defined output shape — the default for most use cases.',
    description: 'Sets the role of the AI, the task, and the exact format of the result.',
    category: 'Essentials',
  },
  {
    value: 'car',
    label: 'Context, Action & Result',
    tag: 'Best for problem solving',
    bestFor: 'When the problem needs background context spelled out before the AI acts — ideal for troubleshooting, process design, and cause-and-effect analysis.',
    description: 'Sets the background, the steps to take, and the expected result.',
    category: 'Essentials',
  },
  {
    value: 'cot',
    label: 'Step-by-Step',
    tag: 'Best for step-by-step tasks',
    bestFor: 'Multi-step reasoning tasks like math, logic, code debugging, or any problem where showing the chain of reasoning improves accuracy.',
    description: 'Asks the AI to reason step by step before giving an answer.',
    category: 'Problem solving',
  },
  {
    value: 'few-shot',
    label: 'Worked Examples',
    tag: 'Best for consistent results',
    bestFor: 'When the output must match a specific style, tone, or structure — the examples teach the pattern better than instructions alone.',
    description: 'Includes example input and output pairs to show the expected style.',
    category: 'Advanced',
  },
  {
    value: 'system-instruction',
    label: 'Master Instructions',
    tag: 'Best for setting overall behavior',
    bestFor: 'Building a system-level instruction set that persists across many turns — ideal for chatbots, agents, and role-playing assistants.',
    description: 'A master instruction that sets the overall behavior and rules.',
    category: 'Advanced',
  },
  {
    value: 'react',
    label: 'Plan, Act & Check',
    tag: 'Best for tasks with tools',
    bestFor: 'Tasks that require the AI to alternate between thinking and acting (e.g. searching, calling APIs, writing code) and verifying each step before moving on.',
    description: 'Uses a plan, act, and check loop to work through tasks with tools.',
    category: 'Problem solving',
  },
  {
    value: 'risen',
    label: 'Goal-Oriented Structure',
    tag: 'Best for well-defined, linear execution',
    bestFor: 'Well-defined, linear task execution where the role, steps, end goal, and constraints are all known upfront — great for SOPs and structured plans.',
    description: 'Organizes the prompt around a clear role, steps, goal, and limits.',
    category: 'Advanced',
  },
  {
    value: 'tot',
    label: 'Explore Multiple Paths',
    tag: 'Best for complex decisions',
    bestFor: 'Problems with multiple valid approaches to weigh — the model explores several candidate paths, scores feasibility, and picks the strongest one.',
    description: 'Explores several possible approaches and picks the strongest one.',
    category: 'Problem solving',
  },
  {
    value: 'self-refine',
    label: 'Draft, Review & Improve',
    tag: 'Best for high-quality first drafts',
    bestFor: 'Tasks where the model should critique its own draft against a rubric before finalizing — ideal for essays, proposals, and polished content.',
    description: 'Drafts, reviews, and improves the result before finishing.',
    category: 'Advanced',
  },
  {
    value: 'ape',
    label: 'Action, Purpose & Result',
    tag: 'Best for clear outcomes',
    bestFor: 'When the desired outcome is crystal-clear but the best approach is not — frames the task as action + purpose + expected result.',
    description: 'Structures the task around the action, its purpose, and the expected result.',
    category: 'Advanced',
  },
  {
    value: 'coast',
    label: 'Context, Objective & Actions',
    tag: 'Best for detailed planning',
    bestFor: 'Complex plans that need full context, a defined objective, specific actions, and scenario details — nothing left to guesswork.',
    description: 'Adds full context, the objective, actions, and scenario so nothing is left to guesswork.',
    category: 'Problem solving',
  },
  {
    value: 'socratic-architecture',
    label: 'Question-First Approach',
    tag: 'Best for careful reasoning',
    bestFor: 'When accuracy matters more than speed — the model questions its own assumptions, identifies edge cases, and verifies logic before concluding.',
    description: 'Questions assumptions and verifies the reasoning before concluding.',
    category: 'Advanced',
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
1. OUTPUT ONLY THE ENGINEERED PROMPT: Return ONLY the single, complete, production-ready prompt itself. Do NOT include conversational intros (e.g., "Here is your prompt:"), extra meta-explanations, section wrappers (like "## Master System Prompt" or "## Architecture"), or Mermaid diagrams.
2. NO MERMAID DIAGRAMS: Do NOT output Mermaid charts. Never include Mermaid in the output. Keep the output 100% clean and copy-paste ready.
3. ILLUSTRATIVE EXAMPLE: ${input.includeExamples ? 'Include ONE short, concrete input/output example block that shows the expected behavior. Place it after the core instructions. Keep it brief (under 150 words) and clearly labeled.' : 'Do NOT include example blocks.'}
4. ADHERE TO USER-SELECTED OUTPUT FORMAT:
   ${formatGuide}
5. DYNAMIC BRACKETED PLACEHOLDERS: Whenever specific variables (like tech stack, API key, domain database, product name) are contextually variable, use bracketed uppercase placeholders (e.g., [INSERT_TECH_STACK_HERE], [INSERT_PRODUCT_NAME_HERE], [INSERT_TARGET_METRIC]).
6. HIGH-SIGNAL INSTRUCTIONS: Ensure the prompt contains an expert persona, explicit goal, step-by-step logic, edge-case handling, and strict negative constraints ("What NOT to do").
${input.outputCharLimit ? `7. OUTPUT LENGTH CONSTRAINT: The complete engineered prompt you return MUST NOT exceed ${input.outputCharLimit} characters total (count every character, including headers and formatting). If a draft is longer than the limit, tighten wording and cut redundancy until it fits while preserving every required section and directive.` : ''}

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

  if (input.outputCharLimit) {
    message += `Output Character Limit: the engineered prompt must not exceed ${input.outputCharLimit} characters.\n`;
  }

  message += `\nPlease engineer a top-tier, production-ready ${input.framework.toUpperCase()} prompt based on this goal.`;

  return message;
}
