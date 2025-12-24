
interface BibleBook {
    id: string;
    name: string;
    abbreviation: string;
}

interface BibleChapter {
    id: string;
    number: string;
}

interface BibleVerse {
    id: string;
    orgId: string;
    bookId: string;
    chapterId: string;
    reference: string;
    content: string; // HTML content
}

const API_KEY = 'f83eae0edabaf9130d553f5e4931cf36';
const BIBLE_ID = '592420522e16049f-01'; // Reina Valera 1909 (Public Domain)

export class BibleService {
    private static baseUrl = 'https://api.scripture.api.bible/v1';

    private static async fetchAPI(endpoint: string) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'api-key': API_KEY,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Bible API Error:', error);
            throw error;
        }
    }

    // Obtener todos los libros
    static async getBooks(): Promise<BibleBook[]> {
        const data = await this.fetchAPI(`/bibles/${BIBLE_ID}/books`);
        return data.data;
    }

    // Obtener capítulos de un libro
    static async getChapters(bookId: string): Promise<BibleChapter[]> {
        const data = await this.fetchAPI(`/bibles/${BIBLE_ID}/books/${bookId}/chapters`);
        return data.data.filter((c: any) => c.number !== 'intro'); // Filtrar introducciones
    }

    // Obtener texto de un capítulo
    static async getChapterContent(chapterId: string): Promise<string> {
        const data = await this.fetchAPI(`/bibles/${BIBLE_ID}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true`);
        return data.data.content;
    }

    // Buscar versículo específico (para RAG)
    // chapterId formato: "JHN.3"
    static async getVerse(verseId: string): Promise<string> {
        // verseId ex: JHN.3.16
        const data = await this.fetchAPI(`/bibles/${BIBLE_ID}/verses/${verseId}?content-type=text&include-verse-numbers=false`);
        return data.data.content;
    }

    // Búsqueda simple
    static async search(query: string) {
        // Normalización de nombres comunes en español
        let cleanQuery = query
            .replace(/\bSalmo\b/gi, 'Salmos')     // Salmo -> Salmos
            .replace(/\bApoc\b/gi, 'Apocalipsis') // Abreviatura común
            .replace(/\bMat\b/gi, 'Mateo');       // Abreviatura común

        const data = await this.fetchAPI(`/bibles/${BIBLE_ID}/search?query=${encodeURIComponent(cleanQuery)}`);
        return data.data;
    }
}
