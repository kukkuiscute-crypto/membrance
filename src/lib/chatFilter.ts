// ============================================================================
// MEMBRANCE chat filter
// - Softens mild swears into friendlier words (with suggestions shown to user)
// - Fully masks a message as ###### when it is too severe to soften
// - Blocks personal info: addresses, locations, phone numbers, emails, links
// - Names may only be referenced with @mentions of real, existing accounts
// ============================================================================

/** Mild words -> friendlier replacement (also used as the "better word" hint) */
const SOFTEN: Record<string, string> = {
  fuck: "frick", fucking: "fricking", fucked: "messed up", fucker: "friend",
  shit: "shoot", shitty: "rough", bullshit: "nonsense", crap: "junk", crappy: "rough",
  damn: "darn", goddamn: "goodness", hell: "heck", piss: "annoy", pissed: "annoyed",
  bloody: "very", bugger: "silly", jerk: "meanie", sucks: "is tough",
  stupid: "tricky", dumb: "tricky", idiot: "goofball", moron: "goofball",
  loser: "friend", lame: "boring", trash: "rough", garbage: "rough",
  wtf: "what", stfu: "please stop", omfg: "omg", ffs: "oh come on",
  noob: "beginner", suck: "struggle", shutup: "please pause",
};

/** Words / bases that can never be softened -> the whole message becomes ###### */
const SEVERE = [
  "nigger", "nigga", "faggot", "fag", "cunt", "retard", "retarded", "tranny",
  "rape", "rapist", "molest", "pedo", "pedophile", "porn", "pornhub", "sex",
  "sexy", "nude", "nudes", "boobs", "tits", "penis", "vagina", "dick", "cock",
  "pussy", "whore", "slut", "bitch", "bastard", "asshole", "arsehole", "ass",
  "arse", "wanker", "jerkoff", "milf", "hentai", "orgasm", "masturbate",
  "kys", "killyourself", "suicide", "selfharm", "cutyourself", "hangyourself",
  "terrorist", "bomb", "shooting", "drugs", "cocaine", "heroin", "weed",
  "bhenchod", "madarchod", "chutiya", "gandu", "randi", "lauda", "harami",
];

/** Compound bases: any token containing these is treated as severe (dumbass, jackass, dickhead...) */
const SEVERE_BASES = ["ass", "dick", "cock", "cunt", "fag", "nigg", "whore", "slut", "bitch", "rape", "porn"];

const PII_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i, reason: "email addresses" },
  { re: /(?:\+?\d[\s-]?){7,}/, reason: "phone numbers" },
  { re: /\bhttps?:\/\/\S+/i, reason: "links" },
  { re: /\b\d{1,4}\s+[A-Za-z]+\s+(street|st|road|rd|avenue|ave|lane|ln|block|sector|colony|nagar|marg)\b/i, reason: "street addresses" },
  { re: /\b(i\s*live\s*(in|at|near)|my\s*(address|house|home|school\s*is\s*at|city|town|village|pin\s*code|zip))\b/i, reason: "your location" },
  { re: /\b(meet\s*me\s*at|come\s*to\s*my\s*(house|home|place))\b/i, reason: "meetup locations" },
  { re: /\b\d{6}\b(?=\s*(pin|zip)?)/i, reason: "postal codes" },
  { re: /\b-?\d{1,3}\.\d{4,},\s*-?\d{1,3}\.\d{4,}\b/, reason: "map coordinates" },
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i" };

const normalize = (w: string) =>
  w.toLowerCase()
    .replace(/[01345789@$!]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/[^a-z]/g, "");

const matchCase = (original: string, replacement: string) => {
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] === original[0]?.toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
};

export const MASK = "######";

export interface FilterWarning {
  word: string;
  suggestion: string;
}

export interface FilterResult {
  /** Text safe to send (may be "######") */
  clean: string;
  /** Something was altered */
  changed: boolean;
  /** Whole message was masked */
  masked: boolean;
  /** Should count as a moderation warning */
  warn: boolean;
  /** Why it was masked / warned */
  reason?: string;
  /** Words that tripped the filter + gentler alternatives */
  warnings: FilterWarning[];
}

export interface FilterOptions {
  /** lowercase usernames that actually exist — @mentions outside this list are blocked */
  knownUsernames?: string[];
}

export function filterChat(text: string, opts: FilterOptions = {}): FilterResult {
  const warnings: FilterWarning[] = [];
  const known = new Set((opts.knownUsernames || []).map((u) => u.toLowerCase()));

  // 1. Personal info / locations -> full mask
  for (const p of PII_PATTERNS) {
    if (p.re.test(text)) {
      return { clean: MASK, changed: true, masked: true, warn: true, reason: `Don't share ${p.reason} in chat — that message was hidden.`, warnings: [] };
    }
  }

  // 2. @mentions must point at a real account
  const mentions = text.match(/@[A-Za-z0-9_]+/g) || [];
  for (const m of mentions) {
    const uname = m.slice(1).toLowerCase();
    if (known.size > 0 && !known.has(uname)) {
      return { clean: MASK, changed: true, masked: true, warn: true, reason: `@${m.slice(1)} isn't an existing account. Names can only be used as @mentions of real members.`, warnings: [] };
    }
  }

  // 3. Bare-name blocking: real names outside @mentions (e.g. "Rohan Sharma lives here")
  const withoutMentions = text.replace(/@[A-Za-z0-9_]+/g, " ");
  if (/\b(my name is|his name is|her name is|call me|named)\b/i.test(withoutMentions)) {
    return { clean: MASK, changed: true, masked: true, warn: true, reason: "Real names aren't allowed — use an @mention of an existing account instead.", warnings: [] };
  }

  // 4. Severe language -> full mask
  const tokens = text.match(/[\p{L}\p{N}@$!*]+/gu) || [];
  for (const t of tokens) {
    const n = normalize(t);
    if (!n) continue;
    if (SEVERE.includes(n) || SEVERE_BASES.some((b) => n.includes(b) && n.length <= 18)) {
      return { clean: MASK, changed: true, masked: true, warn: true, reason: "That word can't be softened, so the whole message was hidden.", warnings: [] };
    }
  }

  // 5. Mild language -> soften + suggest
  const clean = text.replace(/[\p{L}\p{N}@$!*]+/gu, (token) => {
    const key = normalize(token);
    const replacement = SOFTEN[key];
    if (!replacement) return token;
    warnings.push({ word: token, suggestion: replacement });
    return matchCase(token, replacement);
  });

  return {
    clean,
    changed: clean !== text,
    masked: false,
    warn: warnings.length > 0,
    reason: warnings.length ? "We swapped some rough words for kinder ones." : undefined,
    warnings,
  };
}

export const containsProfanity = (text: string) => filterChat(text).changed;

// --- Moderation policy -------------------------------------------------------
export const MAX_WARNINGS = 5;
export const BAN_MINUTES = 15;
