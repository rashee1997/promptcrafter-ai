export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeWordDiff(oldText: string, newText: string): DiffChunk[] {
  const oldWords = oldText.match(/\S+|\s+/g) || [];
  const newWords = newText.match(/\S+|\s+/g) || [];

  const n = oldWords.length;
  const m = newWords.length;

  // Cap DP size to prevent memory lag on extremely long outputs (> 1500 tokens)
  if (n > 1500 || m > 1500) {
    return [
      { value: oldText, removed: true },
      { value: newText, added: true },
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
      rawChunks.push({ value: newWords[j - 1], added: true });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChunks.push({ value: oldWords[i - 1], removed: true });
      i--;
    }
  }

  rawChunks.reverse();

  const result: DiffChunk[] = [];
  for (const chunk of rawChunks) {
    if (result.length > 0) {
      const last = result[result.length - 1];
      if (last.added === chunk.added && last.removed === chunk.removed) {
        last.value += chunk.value;
        continue;
      }
    }
    result.push({ ...chunk });
  }

  return result;
}
