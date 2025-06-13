// place files you want to import through the `$lib` alias in this folder.
import stringSimilarity from "string-similarity";
import {metaphone} from "metaphone";
import removeAccents from "remove-accents";
import * as levenshtein from 'fast-levenshtein';

function normalizeText(text: string): string {
    let normalized = removeAccents(text);
    normalized = normalized.toLowerCase();
    normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, "");
    normalized = normalized.replace(/\s+/g, " ").trim();
    return normalized;
}

class UniversalMatcher {
    private readonly similarityThreshold: number;
    private readonly typoThreshold: number;
    private readonly keyboardLayouts: Record<string, Record<string, string[]>>;

    constructor(similarityThreshold = 0.7, typoThreshold = 2) {
        this.similarityThreshold = similarityThreshold;
        this.typoThreshold = typoThreshold;
        this.keyboardLayouts = {
            'qwerty': {
                'q': ['w', 'a', 's'],
                'w': ['q', 'e', 'a', 's', 'd'],
                'e': ['w', 'r', 's', 'd', 'f'],
                'r': ['e', 't', 'd', 'f', 'g'],
                't': ['r', 'y', 'f', 'g', 'h'],
                'y': ['t', 'u', 'g', 'h', 'j'],
                'u': ['y', 'i', 'h', 'j', 'k'],
                'i': ['u', 'o', 'j', 'k', 'l'],
                'o': ['i', 'p', 'k', 'l', ';'],
                'p': ['o', '[', 'l', ';', '\''],
                'a': ['q', 'w', 's', 'z', 'x'],
                's': ['a', 'w', 'e', 'd', 'z', 'x', 'c'],
                'd': ['s', 'e', 'r', 'f', 'x', 'c', 'v'],
                'f': ['d', 'r', 't', 'g', 'c', 'v', 'b'],
                'g': ['f', 't', 'y', 'h', 'v', 'b', 'n'],
                'h': ['g', 'y', 'u', 'j', 'b', 'n', 'm'],
                'j': ['h', 'u', 'i', 'k', 'n', 'm', ','],
                'k': ['j', 'i', 'o', 'l', 'm', ',', '.'],
                'l': ['k', 'o', 'p', ';', ',', '.', '/'],
                'z': ['a', 's', 'x'],
                'x': ['z', 's', 'd', 'c'],
                'c': ['x', 'd', 'f', 'v'],
                'v': ['c', 'f', 'g', 'b'],
                'b': ['v', 'g', 'h', 'n'],
                'n': ['b', 'h', 'j', 'm'],
                'm': ['n', 'j', 'k', ',']
            },
            'russian': {
                'й': ['ц', 'ф', 'ы'], 'ц': ['й', 'у', 'ф', 'ы', 'в'], 'у': ['ц', 'к', 'ы', 'в', 'а'],
                'к': ['у', 'е', 'в', 'а', 'п'], 'е': ['к', 'н', 'а', 'п', 'р'], 'н': ['е', 'г', 'п', 'р', 'о'],
                'г': ['н', 'ш', 'р', 'о', 'л'], 'ш': ['г', 'щ', 'о', 'л', 'д'], 'щ': ['ш', 'з', 'л', 'д', 'ж'],
                'з': ['щ', 'х', 'д', 'ж', 'э'], 'х': ['з', 'ъ', 'ж', 'э'], 'ъ': ['х', 'э'],
                'ф': ['й', 'ц', 'ы', 'я', 'ч'], 'ы': ['ф', 'ц', 'у', 'в', 'я', 'ч', 'с'],
                'в': ['ы', 'у', 'к', 'а', 'ч', 'с', 'м'], 'а': ['в', 'к', 'е', 'п', 'с', 'м', 'и'],
                'п': ['а', 'е', 'н', 'р', 'м', 'и', 'т'], 'р': ['п', 'н', 'г', 'о', 'и', 'т', 'ь'],
                'о': ['р', 'г', 'ш', 'л', 'т', 'ь', 'б'], 'л': ['о', 'ш', 'щ', 'д', 'ь', 'б', 'ю'],
                'д': ['л', 'щ', 'з', 'ж', 'б', 'ю'], 'ж': ['д', 'з', 'х', 'э', 'ю'],
                'э': ['ж', 'х', 'ъ', 'ю'], 'я': ['ф', 'ы', 'ч'], 'ч': ['я', 'ы', 'в', 'с'],
                'с': ['ч', 'в', 'а', 'м'], 'м': ['с', 'а', 'п', 'и'], 'и': ['м', 'п', 'р', 'т'],
                'т': ['и', 'р', 'о', 'ь'], 'ь': ['т', 'о', 'л', 'б'], 'б': ['ь', 'л', 'д', 'ю'],
                'ю': ['б', 'д', 'ж', 'э']
            }
        };
    }

    private getPhoneticHash(text: string): string {
        return metaphone(text);
    }

    private detectLanguage(text: string): string {
        const cyrillicPattern = /^\p{Script=Cyrillic}/u;
        if (cyrillicPattern.test(text)) {
            return 'ru';
        }
        return 'en';
    }

    private CyrillicTransliteration(text: string): string {
        const translitMap1: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
            'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
            'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ы': 'y',
            'ъ': '', 'э': 'e', 'ю': 'u', 'я': 'ya',
        };
        return text.split('').map(c => translitMap1[c] || c).join('');
    }

    private isPotentialTypo(a: string, b: string): boolean {
        if (a === b) return false;

        if (Math.abs(a.length - b.length) === 1) {
            const shorter = a.length < b.length ? a : b;
            const longer = a.length < b.length ? b : a;

            for (let i = 0; i < longer.length; i++) {
                if (longer.slice(0, i) + longer.slice(i + 1) === shorter) {
                    return true;
                }
            }
        }

        const distance = levenshtein.get(a, b);

        if (distance <= this.typoThreshold) {
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    const charA = a[i];
                    const charB = b[i];
                    const lang = this.detectLanguage(charA);
                    if (lang === 'ru') {
                        if (this.keyboardLayouts['russian'][charA]?.includes(charB) ||
                            this.keyboardLayouts['russian'][charB]?.includes(charA)) {
                            return true;
                        }
                    }
                    else {
                        if (this.keyboardLayouts['qwerty'][charA]?.includes(charB) ||
                            this.keyboardLayouts['qwerty'][charB]?.includes(charA)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    public async areStringsSimilar(correct: string, answer: string): Promise<boolean> {
        const directSimilarity = stringSimilarity.compareTwoStrings(correct, answer);
        if (directSimilarity >= this.similarityThreshold) {
            return true;
        }

        const lang1 = this.detectLanguage(correct);
        const lang2 = this.detectLanguage(answer);

        if (lang1 !== lang2) {
            let translated1: string
            let translated2: string;
            if (lang1 === 'ru') {
                translated1 = this.CyrillicTransliteration(correct);
            }
            else {
                translated1 = correct;
            }
            if (lang2 === 'ru') {
                translated2 = this.CyrillicTransliteration(answer);
            }
            else {
                translated2 = answer;
            }

            const phonetic1 = this.getPhoneticHash(translated1);
            const phonetic2 = this.getPhoneticHash(translated2);

            const phoneticSimilarity = stringSimilarity.compareTwoStrings(phonetic1, phonetic2);
            if (phoneticSimilarity >= this.similarityThreshold) {
                return true;
            }
            return this.isPotentialTypo(correct, answer);
        }
        else {
            if (lang1 === 'en') {
                const phonetic1 = this.getPhoneticHash(correct);
                const phonetic2 = this.getPhoneticHash(answer);

                const phoneticSimilarity = stringSimilarity.compareTwoStrings(phonetic1, phonetic2);
                if (phoneticSimilarity >= this.similarityThreshold) {
                    return true;
                }
            }
            return this.isPotentialTypo(correct, answer);
        }
    }
}

class KeyboardLayoutMatcher {
    private readonly similarityThreshold: number;
    private readonly layoutMaps: Record<string, Record<string, string>>;

    constructor(similarityThreshold = 0.7) {
        this.similarityThreshold = similarityThreshold;

        this.layoutMaps = {
            'ru': {
                'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г',
                'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы',
                'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д',
                ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и',
                'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '/': '.', " ": " ",
            },
        };
    }

    private reverseLayoutMap(layoutMap: Record<string, string>): Record<string, string> {
        const reversed: Record<string, string> = {};
        for (const [key, value] of Object.entries(layoutMap)) {
            reversed[value] = key;
        }
        return reversed;
    }

    private generatePossibleCorrections(text: string): string[] {
        const possibilities: string[] = [text];
        for (const [_, layoutMap] of Object.entries(this.layoutMaps)) {
            const reversedMap = this.reverseLayoutMap(layoutMap);

            let convertedFromForeign = '';
            let allCharsConverted = true;

            for (const char of text.toLowerCase()) {
                if (reversedMap[char]) {
                    convertedFromForeign += reversedMap[char];
                }
                else if (char in layoutMap) {
                    convertedFromForeign += char;
                }
                else {
                    allCharsConverted = false;
                    break;
                }
            }

            if (allCharsConverted && convertedFromForeign !== text.toLowerCase()) {
                possibilities.push(convertedFromForeign);
            }

            let convertedToForeign = '';
            allCharsConverted = true;

            for (const char of text.toLowerCase()) {
                if (layoutMap[char]) {
                    convertedToForeign += layoutMap[char];
                }
                else if (Object.values(layoutMap).includes(char)) {
                    convertedToForeign += char;
                }
                else {
                    allCharsConverted = false;
                    break;
                }
            }

            if (allCharsConverted && convertedToForeign !== text.toLowerCase()) {
                possibilities.push(convertedToForeign);
            }
        }

        return possibilities;
    }

    public areStringsSimilar(correct: string, answer: string): boolean {
        if (stringSimilarity.compareTwoStrings(correct, answer) >= this.similarityThreshold) {
            return true;
        }
        const possibilities = this.generatePossibleCorrections(answer);
        const res = stringSimilarity.findBestMatch(correct, possibilities);
        return stringSimilarity.compareTwoStrings(correct, possibilities[res.bestMatchIndex]) >= this.similarityThreshold;
    }
}

class StringMatcher {
    private keyboardMatcher: KeyboardLayoutMatcher;
    private universalMatcher: UniversalMatcher;

    constructor() {
        this.keyboardMatcher = new KeyboardLayoutMatcher();
        this.universalMatcher = new UniversalMatcher();
    }

    public async areStringsSimilar(correct: string, answer: string): Promise<boolean> {
        correct = normalizeText(correct);
        answer = normalizeText(answer);

        if (correct === answer) {
            return true;
        }


        if (this.keyboardMatcher.areStringsSimilar(correct, answer)) {
            return true;
        }

        return await this.universalMatcher.areStringsSimilar(correct, answer);
    }
}

export async function checkStringSimilarity(correct: string, answer: string): Promise<boolean> {
    const matcher = new StringMatcher();
    return await matcher.areStringsSimilar(correct, answer);
}