import fs from 'fs';

const content = fs.readFileSync('/src/translations.ts', 'utf-8');
const lines = content.split('\n');

const languages = ['en:', 'ar:', 'fr:', 'es:', 'darija:'];
let currentLang = '';
let keysByLang: Record<string, Set<string>> = {};

languages.forEach(lang => {
  keysByLang[lang] = new Set();
});

lines.forEach((line, index) => {
  const trimmed = line.trim();
  languages.forEach(lang => {
    if (trimmed.startsWith(lang)) {
      currentLang = lang;
    }
  });

  if (currentLang && trimmed.includes(':')) {
    const key = trimmed.split(':')[0].trim();
    if (keysByLang[currentLang].has(key)) {
      console.log(`Duplicate key "${key}" in ${currentLang} at line ${index + 1}`);
    }
    keysByLang[currentLang].add(key);
  }
});
