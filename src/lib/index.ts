// place files you want to import through the `$lib` alias in this folder.
import stringSimilarity from "string-similarity";
import {metaphone} from "metaphone";
import removeAccents from "remove-accents";

class UniversalMatcher {
    private readonly similarityThreshold: number;

    constructor(similarityThreshold = 0.7) {
        this.similarityThreshold = similarityThreshold;
    }

    private async normalizeText(text: string): Promise<string> {
        let normalized = removeAccents(text);
        normalized = normalized.toLowerCase();
        normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, "");
        normalized = normalized.replace(/\s+/g, " ").trim();
        return normalized;
    }

    private getPhoneticHash(text: string): string {
        return metaphone(text);
    }

    private async detectLanguage(text: string): Promise<string> {
        const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
        if (cyrillicPattern.test(text)) {
            return 'ru';
        }
        return 'en';
    }

    private CyrillicTransliteration(text: string): string[] {
        const translitMap1: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
            'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
            'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ы': 'y',
            'ъ': '', 'э': 'e', 'ю': 'u', 'я': 'ya',
        };
        let res =[] as string[];
        res.push(text.split('').map(c => translitMap1[c] || c).join(''))
        const translitMap2: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'к': 'c', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
            'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
            'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ы': 'y',
            'ъ': '', 'э': 'e', 'ю': 'u', 'я': 'ya',
        };
        res.push(text.split('').map(c => translitMap2[c] || c).join(''))
        return res;
    }

    public async areTitlesSimilar(title1: string, title2: string): Promise<boolean> {
        const normalized1 = await this.normalizeText(title1);
        const normalized2 = await this.normalizeText(title2);

        const directSimilarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
        if (directSimilarity >= this.similarityThreshold) {
            return true;
        }

        const phonetic1 = this.getPhoneticHash(normalized1);
        const phonetic2 = this.getPhoneticHash(normalized2);

        const phoneticSimilarity = stringSimilarity.compareTwoStrings(phonetic1, phonetic2);
        if (phoneticSimilarity >= this.similarityThreshold) {
            return true;
        }

        const lang1 = await this.detectLanguage(normalized1);
        const lang2 = await this.detectLanguage(normalized2);

        let translated1 = [normalized1];
        let translated2 = [normalized2];
        if (lang1 === 'ru') {
            translated1 = this.CyrillicTransliteration(normalized1);
            console.log(lang1, translated1);
        }
        if (lang2 === 'ru') {
            translated2 = this.CyrillicTransliteration(normalized2);
        }
        console.log(translated1, translated2);
        for (const t1 of translated1) {
            for (const t2 of translated2) {
                if (stringSimilarity.compareTwoStrings(t1, t2) >= this.similarityThreshold) {
                    return true;
                }
            }
        }
        return false;
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
        for (const [layoutName, layoutMap] of Object.entries(this.layoutMaps)) {
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
            console.log(convertedFromForeign);

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

    public areTitlesSimilar(title1: string, title2: string): boolean {
        const normalized1 = title1.toLowerCase().trim();
        const normalized2 = title2.toLowerCase().trim();

        if (stringSimilarity.compareTwoStrings(normalized1, normalized2) >= this.similarityThreshold) {
            return true;
        }

        const possibilities1 = this.generatePossibleCorrections(normalized1);
        const possibilities2 = this.generatePossibleCorrections(normalized2);
        console.log(possibilities1, possibilities2, 1722727727227);
        for (const p1 of possibilities1) {
            for (const p2 of possibilities2) {

                if (stringSimilarity.compareTwoStrings(p1, p2) >= this.similarityThreshold) {
                    return true;
                }
            }
        }

        return false;
    }
}

class StringMatcher {
    private keyboardMatcher: KeyboardLayoutMatcher;
    private universalMatcher: UniversalMatcher;

    constructor() {
        this.keyboardMatcher = new KeyboardLayoutMatcher();
        this.universalMatcher = new UniversalMatcher();
    }

    public async areTitlesSimilar(title1: string, title2: string): Promise<boolean> {
        if (title1 == title2) {
            return true;
        }
        if (this.keyboardMatcher.areTitlesSimilar(title1, title2)) {
            return true;
        }

        return await this.universalMatcher.areTitlesSimilar(title1, title2);
    }
}

export async function checkStringSimilarity(title1: string, title2: string): Promise<boolean> {
    const matcher = new StringMatcher();
    return await matcher.areTitlesSimilar(title1, title2);
}