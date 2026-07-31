// Chat profanity filter: masks/softens offensive language before it is sent.
const REPLACEMENTS: Record<string, string> = {
  fuck: "frick", fucking: "fricking", fucker: "friend", motherfucker: "friend",
  shit: "shoot", shitty: "rough", bullshit: "nonsense", crap: "junk",
  bitch: "buddy", bastard: "buddy", asshole: "meanie", ass: "butt",
  dick: "jerk", cock: "jerk", pussy: "wimp", slut: "person", whore: "person",
  damn: "darn", goddamn: "goodness", hell: "heck", piss: "annoy",
  cunt: "person", retard: "silly", retarded: "silly", idiot: "goofball",
  stupid: "silly", moron: "goofball", dumb: "silly", loser: "friend",
  nigga: "buddy", nigger: "buddy", fag: "buddy", faggot: "buddy",
  wtf: "what", stfu: "please stop", omfg: "omg", bloody: "very",
  kys: "take care", rape: "harm", sex: "***", porn: "***",
};

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

const normalize = (w: string) =>
  w.toLowerCase().replace(/[013457@$!]/g, (c) => LEET[c] ?? c).replace(/(.)\1{2,}/g, "$1$1").replace(/[^a-z]/g, "");

const matchCase = (original: string, replacement: string) => {
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] === original[0]?.toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
};

export interface FilterResult {
  clean: string;
  changed: boolean;
  hits: string[];
}

export function filterChat(text: string): FilterResult {
  const hits: string[] = [];
  const clean = text.replace(/[\p{L}\p{N}@$!*]+/gu, (token) => {
    const key = normalize(token);
    const replacement = REPLACEMENTS[key];
    if (!replacement) return token;
    hits.push(key);
    return matchCase(token, replacement);
  });
  return { clean, changed: clean !== text, hits };
}

export const containsProfanity = (text: string) => filterChat(text).changed;
