const ADJECTIVES = ["haru", "natsu", "aki", "fuyu", "asa", "yoi", "hare", "sora"];
const NOUNS = ["ichi", "matsuri", "hiroba", "michi", "mori", "kaze", "hoshi", "machi"];

function randomToken() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${a}-${n}-${num}`;
}

// Titles are usually Japanese, so a byte-for-byte romanized slug isn't
// practical -- generate a short memorable random slug instead and let the
// organizer see/copy the resulting URL before publishing.
export function generateSlug(): string {
  return randomToken();
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9-]{3,60}$/.test(value);
}
