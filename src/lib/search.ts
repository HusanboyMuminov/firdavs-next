import { categories, dishes, type Dish } from "@/data/menu";

/**
 * Menu search across Uzbek, Korean, Russian and English.
 *
 * - Case-, accent- and apostrophe-insensitive (oʻ = o' = o).
 * - Cyrillic is transliterated, so "плов", "plov" and "palov" meet, and
 *   NFKD splits Hangul into jamo, so a half-typed syllable ("프") still
 *   matches "플롭".
 * - Every word of the query must match a dish (prefixes count, so incomplete
 *   words work); small typos are forgiven ("shaslik", "lagmn", "plof").
 * - Names rank above aliases, categories, ingredients and descriptions.
 */

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "",
  э: "e", ю: "yu", я: "ya",
  // Uzbek Cyrillic
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC[ch] ?? ch)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/['ʻʼ‘’`´]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

type Field = "name" | "keyword" | "category" | "ingredient" | "description";

const WEIGHT: Record<Field, number> = { name: 10, keyword: 8, category: 4, ingredient: 3, description: 2 };
/** Shortest query word that may match this field (1-letter words only hit names). */
const MIN_LENGTH: Record<Field, number> = { name: 1, keyword: 1, category: 2, ingredient: 2, description: 3 };
/** Shortest query word that may match this field with a typo. */
const FUZZY_LENGTH: Record<Field, number> = { name: 4, keyword: 4, category: 4, ingredient: 4, description: 5 };

type Posting = { dish: number; field: Field };

/** word → where it occurs. Built once, on the first search. */
let vocabulary: Map<string, Posting[]> | null = null;

function getVocabulary(): Map<string, Posting[]> {
  if (vocabulary) return vocabulary;
  const words = new Map<string, Posting[]>();
  const add = (dish: number, field: Field, text: string) => {
    for (const word of new Set(normalize(text).split(" "))) {
      if (!word || (field === "description" && word.length < 3)) continue;
      const postings = words.get(word);
      if (!postings) words.set(word, [{ dish, field }]);
      else if (!postings.some((p) => p.dish === dish && p.field === field)) postings.push({ dish, field });
    }
  };
  const categoryText = new Map(categories.map((c) => [c.id, Object.values(c.label).join(" ")]));
  dishes.forEach((dish, i) => {
    add(i, "name", Object.values(dish.name).join(" "));
    add(i, "keyword", (dish.keywords ?? []).join(" "));
    add(i, "category", categoryText.get(dish.category) ?? "");
    add(i, "ingredient", Object.values(dish.ingredients).join(" "));
    add(i, "description", Object.values(dish.description).join(" "));
  });
  vocabulary = words;
  return words;
}

const HANGUL = /[ᄀ-ᇿ㄰-㆏]/;

function maxEdits(term: string): number {
  if (HANGUL.test(term) || /\d/.test(term)) return 0; // jamo typos are too ambiguous
  if (term.length >= 7) return 2;
  if (term.length >= 4) return 1;
  return 0;
}

/**
 * Smallest edit distance (with transpositions) between `term` and any prefix
 * of `word`, or `max + 1` when it exceeds `max`.
 */
function prefixDistance(term: string, word: string, max: number): number {
  const m = term.length;
  const n = Math.min(word.length, m + max);
  if (n < m - max) return max + 1;
  let before = new Array<number>(n + 1).fill(0);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let cur = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = term[i - 1] === word[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && term[i - 1] === word[j - 2] && term[i - 2] === word[j - 1]) {
        d = Math.min(d, before[j - 2] + 1);
      }
      cur[j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return max + 1;
    [before, prev, cur] = [prev, cur, before];
  }
  let best = max + 1;
  for (let j = Math.max(0, m - max); j <= n; j++) best = Math.min(best, prev[j]);
  return best;
}

export function searchDishes(query: string): Dish[] {
  const terms = [...new Set(normalize(query).split(" ").filter(Boolean))];
  if (terms.length === 0) return [];
  const words = getVocabulary();
  const total = new Float64Array(dishes.length);
  const alive = new Uint8Array(dishes.length).fill(1);

  for (const term of terms) {
    const best = new Float64Array(dishes.length); // best match of this word, per dish
    let matched = false;

    // As typed: word prefixes everywhere; inside words for names and aliases.
    for (const [word, postings] of words) {
      const prefix = word.startsWith(term);
      if (!prefix && !(term.length >= 3 && word.includes(term))) continue;
      for (const { dish, field } of postings) {
        if (!alive[dish] || term.length < MIN_LENGTH[field]) continue;
        const quality = prefix ? 1 : field === "name" || field === "keyword" ? 0.7 : 0;
        if (WEIGHT[field] * quality > best[dish]) {
          best[dish] = WEIGHT[field] * quality;
          matched = true;
        }
      }
    }

    // Typo tolerance, only when the word matches nothing as typed
    // (so "dolma" finds dolma, not every word one letter away).
    const edits = maxEdits(term);
    if (!matched && edits > 0) {
      for (const [word, postings] of words) {
        let distance = -1; // computed once per word, when needed
        for (const { dish, field } of postings) {
          if (!alive[dish] || term.length < FUZZY_LENGTH[field]) continue;
          if (distance < 0) distance = prefixDistance(term, word, edits);
          if (distance > edits) break;
          const score = WEIGHT[field] * (0.6 - 0.15 * (distance - 1));
          if (score > best[dish]) best[dish] = score;
        }
      }
    }
    for (let i = 0; i < dishes.length; i++) {
      if (best[i] === 0) alive[i] = 0; // every query word must match
      else total[i] += best[i];
    }
  }

  const results: { dish: Dish; score: number }[] = [];
  dishes.forEach((dish, i) => {
    if (alive[i]) results.push({ dish, score: total[i] });
  });
  // Array.prototype.sort is stable: ties keep menu order.
  return results.sort((a, b) => b.score - a.score).map((r) => r.dish);
}
