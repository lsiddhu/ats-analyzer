const stopWords = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "is",
  "are",
  "be",
  "as",
  "at",
  "by",
  "from",
  "this",
  "that",
  "will",
  "your",
  "you",
  "we",
  "our",
  "have",
  "has",
  "using",
  "use",
]);

// Common short tech/role acronyms worth keeping even though they're ≤2 chars.
// Extend this list as you notice relevant terms getting filtered out.
const shortAcronyms = new Set([
  "ai",
  "ml",
  "ux",
  "ui",
  "qa",
  "js",
  "pm",
  "os",
  "it",
  "c#",
  "hr",
  "bi",
]);

// Very light suffix-stripping so tense/plural variants match
// (e.g. "managed" / "managing" / "manages" -> "manag").
// Not a real Porter stemmer — just enough to catch common cases
// without pulling in a dependency.
const stem = (word) => {
  if (word.length <= 4) return word; // don't over-stem short words
  return word
    .replace(/(ing|ies|ied)$/, "")
    .replace(/(es|ed|s)$/, "");
};

const extractKeywords = (text) => {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.]/g, " ")
        .split(/\s+/)
        .map((word) => word.replace(/\.+$/, "")) // strip trailing "." from e.g. "python."
        .filter((word) => word.length > 0 && !stopWords.has(word))
        .filter((word) => word.length > 2 || shortAcronyms.has(word))
        .map(stem)
    ),
  ];
};

export const calculateATSScore = (resumeText, jobDescription) => {
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jobKeywords = extractKeywords(jobDescription);

  const matchingKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.has(keyword)
  );

  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.has(keyword)
  );

  const score =
    jobKeywords.length === 0
      ? 0
      : Math.round((matchingKeywords.length / jobKeywords.length) * 100);

  return {
    score,
    matchingKeywords,
    missingKeywords,
    totalJobKeywords: jobKeywords.length,
  };
};