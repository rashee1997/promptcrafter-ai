export type SemanticChangeType = 'directive' | 'constraint' | 'variable' | 'general';

export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
  semanticType?: SemanticChangeType;
}

function detectSemanticType(text: string): SemanticChangeType {
  const lower = text.toLowerCase();
  if (
    /(?:never|do not|forbid|prohibit|must not|cannot|without|no\s+(?:todos|ellipses|placeholders|markdown|mermaids))/i.test(
      lower,
    )
  ) {
    return 'constraint';
  }
  if (
    /(?:must|require|enforce|instruct|directive|format:|step|task|always|strictly)/i.test(
      lower,
    )
  ) {
    return 'directive';
  }
  if (/(\{\{[a-z0-9_\- .]+\}\}|\[[a-z0-9_\- .]+\])/i.test(text)) {
    return 'variable';
  }
  return 'general';
}

export function computeWordDiff(oldText: string, newText: string): DiffChunk[] {
  const oldWords = oldText.match(/\S+|\s+/g) || [];
  const newWords = newText.match(/\S+|\s+/g) || [];

  const n = oldWords.length;
  const m = newWords.length;

  // Cap DP size to prevent memory lag on extremely long outputs (> 1500 tokens)
  if (n > 1500 || m > 1500) {
    return [
      { value: oldText, removed: true, semanticType: detectSemanticType(oldText) },
      { value: newText, added: true, semanticType: detectSemanticType(newText) },
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const rawChunks: DiffChunk[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      rawChunks.push({ value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawChunks.push({
        value: newWords[j - 1],
        added: true,
        semanticType: detectSemanticType(newWords[j - 1]),
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChunks.push({
        value: oldWords[i - 1],
        removed: true,
        semanticType: detectSemanticType(oldWords[i - 1]),
      });
      i--;
    }
  }

  rawChunks.reverse();

  const result: DiffChunk[] = [];
  for (const chunk of rawChunks) {
    if (result.length > 0) {
      const last = result[result.length - 1];
      if (
        last.added === chunk.added &&
        last.removed === chunk.removed &&
        last.semanticType === chunk.semanticType
      ) {
        last.value += chunk.value;
        continue;
      }
    }
    result.push({ ...chunk });
  }

  return result;
}

export interface ThreeWayDiffResult {
  chunksA: DiffChunk[]; // Base -> Version A
  chunksB: DiffChunk[]; // Version A -> Version B
  summary: {
    addedDirectives: number;
    addedConstraints: number;
    removedConstraints: number;
  };
}

export function computeThreeWayDiff(baseText: string, vAText: string, vBText: string): ThreeWayDiffResult {
  const chunksA = computeWordDiff(baseText, vAText);
  const chunksB = computeWordDiff(vAText, vBText);

  let addedDirectives = 0;
  let addedConstraints = 0;
  let removedConstraints = 0;

  for (const c of chunksB) {
    if (c.added && c.semanticType === 'directive') addedDirectives++;
    if (c.added && c.semanticType === 'constraint') addedConstraints++;
    if (c.removed && c.semanticType === 'constraint') removedConstraints++;
  }

  return {
    chunksA,
    chunksB,
    summary: { addedDirectives, addedConstraints, removedConstraints },
  };
}

