// Video Prompt Studio — Story-structure frameworks.
// Each framework defines named beats with a stated purpose and target
// position in the runtime. The AI is constrained to these beats when
// generating a treatment, giving the director a real shape to check against.

export interface StoryBeat {
  id: string;
  name: string;
  purpose: string;
  /** Where the beat falls in the runtime, as a percentage (0–100). */
  targetPercent: number;
}

export interface StructureFramework {
  id: 'save-the-cat' | 'three-act' | 'heros-journey' | 'eight-sequence';
  label: string;
  description: string;
  beats: StoryBeat[];
}

export const STRUCTURE_FRAMEWORKS: StructureFramework[] = [
  {
    id: 'save-the-cat',
    label: 'Save the Cat',
    description:
      'Blake Snyder\'s 15-beat framework distilled to the essential short-form beats. Strong for stories that need a clear emotional engine and a satisfying twist.',
    beats: [
      { id: 'opening-image', name: 'Opening Image', purpose: 'Show the protagonist\'s world before the story disrupts it — a single frame that says everything about who they are.', targetPercent: 0 },
      { id: 'theme-stated', name: 'Theme Stated', purpose: 'A line or moment that hints at the real subject of the story (not the plot, the theme).', targetPercent: 5 },
      { id: 'catalyst', name: 'Catalyst', purpose: 'The inciting incident. Something lands that can\'t be ignored — the moment the story ignites.', targetPercent: 10 },
      { id: 'debate', name: 'Debate', purpose: 'The protagonist hesitates. Should they act? The cost of inaction vs. the cost of change.', targetPercent: 15 },
      { id: 'break-into-two', name: 'Break into Two', purpose: 'The protagonist commits. They cross the threshold from their ordinary world into the story\'s journey.', targetPercent: 20 },
      { id: 'b-story', name: 'B Story', purpose: 'A secondary relationship or subplot begins — the vehicle for the theme. Often a love interest, mentor, or rival.', targetPercent: 30 },
      { id: 'fun-and-games', name: 'Fun and Games', purpose: 'The promise of the premise. This is what the audience came for — the core spectacle, conflict, or comedy.', targetPercent: 40 },
      { id: 'midpoint', name: 'Midpoint', purpose: 'A false victory or false defeat raises the stakes. The protagonist commits fully — there\'s no going back.', targetPercent: 50 },
      { id: 'bad-guys-close-in', name: 'Bad Guys Close In', purpose: 'External pressure mounts and/or internal flaws begin to unravel progress. The walls close in.', targetPercent: 60 },
      { id: 'all-is-lost', name: 'All Is Lost', purpose: 'The lowest point. Something or someone is lost. The protagonist\'s old way of being dies here.', targetPercent: 75 },
      { id: 'dark-night', name: 'Dark Night of the Soul', purpose: 'The protagonist sits with the loss. They grieve, reflect, and confront what they\'ve been avoiding.', targetPercent: 80 },
      { id: 'break-into-three', name: 'Break into Three', purpose: 'The A-story and B-story merge. The protagonist has a revelation — the theme becomes actionable.', targetPercent: 85 },
      { id: 'finale', name: 'Finale', purpose: 'The protagonist applies what they\'ve learned. They face the antagonist or central conflict armed with a new truth.', targetPercent: 92 },
      { id: 'final-image', name: 'Final Image', purpose: 'The mirror of the opening image. Show how the world has changed because the protagonist changed.', targetPercent: 100 },
    ],
  },
  {
    id: 'three-act',
    label: 'Three-Act Structure',
    description:
      'The classic setup–confrontation–resolution framework, adapted for short-form. Clean, reliable, and easy to communicate to a director.',
    beats: [
      { id: 'setup', name: 'Setup', purpose: 'Introduce the protagonist, their world, and what they want. Plant the seed of the conflict.', targetPercent: 5 },
      { id: 'inciting-incident', name: 'Inciting Incident', purpose: 'An event that disrupts the status quo and creates a clear goal or problem the protagonist must address.', targetPercent: 15 },
      { id: 'plot-turn-1', name: 'First Plot Turn', purpose: 'The protagonist commits to action. They leave the familiar behind and enter the central conflict.', targetPercent: 25 },
      { id: 'rising-action', name: 'Rising Action', purpose: 'Complications mount. Each attempt to solve the problem creates new obstacles and reveals character.', targetPercent: 40 },
      { id: 'midpoint', name: 'Midpoint', purpose: 'A major shift — the stakes are raised, a goal is achieved (or lost), and the direction of the story pivots.', targetPercent: 50 },
      { id: 'closing-of-act-2', name: 'End of Act Two', purpose: 'The protagonist faces their worst moment. Everything seems lost — the plan has failed completely.', targetPercent: 70 },
      { id: 'climax', name: 'Climax', purpose: 'The protagonist confronts the central conflict directly, using everything they\'ve learned. The decisive moment.', targetPercent: 85 },
      { id: 'resolution', name: 'Resolution', purpose: 'The aftermath. Show the new normal — how the protagonist and their world have been transformed.', targetPercent: 100 },
    ],
  },
  {
    id: 'heros-journey',
    label: 'Hero\'s Journey',
    description:
      'Campbell\'s monomyth adapted for short-form video. Works well when the story needs a sense of transformation and discovery.',
    beats: [
      { id: 'ordinary-world', name: 'Ordinary World', purpose: 'Show the protagonist in their everyday life before the adventure begins. Establish what they lack.', targetPercent: 5 },
      { id: 'call-to-adventure', name: 'Call to Adventure', purpose: 'A challenge, invitation, or threat arrives. The protagonist is asked to step beyond their comfort zone.', targetPercent: 15 },
      { id: 'refusal-of-call', name: 'Refusal of the Call', purpose: 'Hesitation or fear. The protagonist considers declining — the risk feels too great.', targetPercent: 20 },
      { id: 'crossing-threshold', name: 'Crossing the Threshold', purpose: 'The protagonist commits to the journey. They leave the known world and enter the unfamiliar.', targetPercent: 25 },
      { id: 'tests-allies-enemies', name: 'Tests, Allies, Enemies', purpose: 'The protagonist navigates the new world — facing challenges, finding allies, and discovering who opposes them.', targetPercent: 40 },
      { id: 'approach-inmost-cave', name: 'Approach to the Inmost Cave', purpose: 'The protagonist nears the central danger or deepest challenge. The stakes become personal.', targetPercent: 55 },
      { id: 'ordeal', name: 'Ordeal', purpose: 'The protagonist faces their greatest fear or enemy. A symbolic death and rebirth — everything hangs in the balance.', targetPercent: 70 },
      { id: 'reward', name: 'Reward', purpose: 'The protagonist survives the ordeal and gains something — knowledge, a tool, or a new understanding.', targetPercent: 75 },
      { id: 'road-back', name: 'The Road Back', purpose: 'The journey home begins, but the antagonist strikes back or a new complication threatens the reward.', targetPercent: 82 },
      { id: 'resurrection', name: 'Resurrection', purpose: 'A final confrontation that tests everything the protagonist has learned. They are transformed by the ordeal.', targetPercent: 90 },
      { id: 'return-with-elixir', name: 'Return with the Elixir', purpose: 'The protagonist returns, changed. They bring something of value back to their ordinary world.', targetPercent: 100 },
    ],
  },
  {
    id: 'eight-sequence',
    label: 'Eight-Sequence',
    description:
      'The industry-standard screenplay structure. Eight sequences of ~12–15 minutes each, with precise turning points. Great for pacing-conscious directors.',
    beats: [
      { id: 'seq-1-setup', name: 'Seq 1 — Setup & Status Quo', purpose: 'Establish the protagonist, world, and stakes. End with an event that disrupts the ordinary.', targetPercent: 0 },
      { id: 'seq-1-turn', name: 'Seq 1 — Turning Point 1', purpose: 'A catalyst forces the protagonist to act. The story\'s direction becomes clear.', targetPercent: 12 },
      { id: 'seq-2-new-situation', name: 'Seq 2 — New Situation', purpose: 'The protagonist reacts to the disruption. They learn the rules of their new reality.', targetPercent: 18 },
      { id: 'seq-2-turn', name: 'Seq 2 — Turning Point 2', purpose: 'The protagonist makes a proactive choice. They\'re no longer reacting — they\'re pursuing a goal.', targetPercent: 25 },
      { id: 'seq-3-pursuit', name: 'Seq 3 — Pursuit & Progress', purpose: 'The protagonist actively pursues their goal. Complications arise, but momentum builds.', targetPercent: 35 },
      { id: 'seq-3-turn', name: 'Seq 3 — Turning Point 3 (Midpoint)', purpose: 'The midpoint shifts everything — a false victory, false defeat, or irreversible revelation.', targetPercent: 50 },
      { id: 'seq-4-complications', name: 'Seq 4 — Complications & Higher Stakes', purpose: 'The antagonist pushes back. The protagonist\'s strategy fails, and the cost of failure rises.', targetPercent: 60 },
      { id: 'seq-4-turn', name: 'Seq 4 — Turning Point 4', purpose: 'The protagonist hits bottom. A major loss or betrayal forces them to question everything.', targetPercent: 70 },
      { id: 'seq-5-exile', name: 'Seq 5 — Exile & Inmost Cave', purpose: 'The protagonist retreats, regroups, and confronts their deepest fear or flaw.', targetPercent: 78 },
      { id: 'seq-5-turn', name: 'Seq 5 — Turning Point 5', purpose: 'A breakthrough. The protagonist finds new resolve or knowledge that changes their approach.', targetPercent: 83 },
      { id: 'seq-6-climax', name: 'Seq 6 — Final Push & Climax', purpose: 'The protagonist charges into the final confrontation with everything they have.', targetPercent: 90 },
      { id: 'seq-6-resolution', name: 'Seq 6 — Resolution', purpose: 'The outcome is settled. Show the new world the protagonist has created or entered.', targetPercent: 100 },
    ],
  },
];

export function getFramework(id: StructureFramework['id']): StructureFramework | undefined {
  return STRUCTURE_FRAMEWORKS.find((f) => f.id === id);
}

export function getBeatById(framework: StructureFramework, beatId: string): StoryBeat | undefined {
  return framework.beats.find((b) => b.id === beatId);
}
