import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BibleService } from '@/services/BibleService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Book,
    ChevronRight,
    ArrowLeft,
    Search,
    Menu,
    MessageSquare,
    ChevronDown,
    X,
    Sun,
    Type,
    Maximize2,
    Minimize2,
    Grid3X3,
    Copy,
    Bookmark,
    Home
} from 'lucide-react';
import { BibleChat } from '@/components/bible/BibleChat';
import { useToast } from '@/hooks/use-toast';

// Book Categories Configuration
const BOOK_CATEGORIES: Record<string, string[]> = {
    'Pentateuco': ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'],
    'Históricos (AT)': ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'],
    'Poéticos': ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'],
    'Profetas Mayores': ['ISA', 'JER', 'LAM', 'EZK', 'DAN'],
    'Profetas Menores': ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'],
    'Evangelios': ['MAT', 'MRK', 'LUK', 'JHN'],
    'Históricos (NT)': ['ACT'],
    'Cartas Paulinas': ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'],
    'Cartas Generales': ['HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'],
    'Profético (NT)': ['REV']
};

const getCategory = (bookId: string) => {
    for (const [category, books] of Object.entries(BOOK_CATEGORIES)) {
        if (books.includes(bookId)) return category;
    }
    return 'Otros';
};

const AVAILABLE_VERSIONS = [
    { id: '592420522e16049f-01', name: 'Reina Valera 1909', shortName: 'RVR09' },
    { id: '6b7f504f1b6050c1-01', name: 'Nueva Biblia Viva 2008', shortName: 'NBV' },
    { id: '48acedcf8595c754-01', name: 'Palabra de Dios para ti', shortName: 'PDPT' },
    { id: 'b32b9d1b64b4ef29-01', name: 'Biblia en Lenguaje Sencillo', shortName: 'BLS' },
    { id: '482ddd53705278cc-02', name: 'Versión Biblia Libre', shortName: 'VBL' }
];

export default function BibleReader() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [books, setBooks] = useState<any[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
    const [currentBook, setCurrentBook] = useState<any>(null);
    // ... rest of state

    const [chapters, setChapters] = useState<any[]>([]);
    const [currentChapter, setCurrentChapter] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Zen Mode states
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(true);
    const [isZenMode, setIsZenMode] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [fontSize, setFontSize] = useState(18);
    const [currentVersion, setCurrentVersion] = useState('592420522e16049f-01');

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await BibleService.getBooks(currentVersion);
            setBooks(data);
            setFilteredBooks(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error de conexión",
                description: "No se pudieron cargar los libros. Verifica tu conexión.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const selectBook = async (book: any) => {
        setCurrentBook(book);
        setLoading(true);
        try {
            const ch = await BibleService.getChapters(book.id, currentVersion);
            setChapters(ch);
            if (ch.length > 0) {
                await selectChapter(ch[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectChapter = async (chapterId: string) => {
        setLoading(true);
        setCurrentChapter(chapterId);
        try {
            const data = await BibleService.getChapterContent(chapterId, currentVersion);
            setContent(data);
            // Update URL
            const bookId = chapterId.split('.')[0];
            const chapterNum = chapters.find(c => c.id === chapterId)?.number || '1';
            navigate(`/biblia?book=${bookId}&chapter=${chapterNum}`, { replace: true });

            if (scrollRef.current) scrollRef.current.scrollTop = 0;
            if (window.innerWidth < 768) setSidebarOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo cargar el contenido del capítulo.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooks();
    }, [currentVersion]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = books.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredBooks(filtered);
        } else {
            setFilteredBooks(books);
        }
    }, [searchQuery, books]);

    // UI States
    const [showOT, setShowOT] = useState(true);
    const [showNT, setShowNT] = useState(true);

    // Reading Progress
    const [readingProgress, setReadingProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Bookmarks
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [showBookmarks, setShowBookmarks] = useState(true);

    // URL Params Handling
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bookParam = params.get('book');
        const chapterParam = params.get('chapter');

        if (bookParam && books.length > 0) {
            const bookToSelect = books.find(b => b.id === bookParam || b.name.toLowerCase() === bookParam.toLowerCase());
            if (bookToSelect) {
                selectBook(bookToSelect).then(() => {
                    if (chapterParam) {
                        // We need chapters loaded first, which selectBook does.
                        // But selectBook is async and sets state. 
                        // It's better to chain the chapter selection after chapters load in a separate effect or promise.
                        // For simplicity in this logic block, we might need a distinct approach.
                        // Let's rely on the fact that selectBook sets chapters. 
                        // Actually, selectBook calls API. We should probably pass chap param to selectBook or handle it there.
                        // Revised approach:
                    }
                });
            }
        }
    }, [books]); // Run when books load

    // Better param handling:
    useEffect(() => {
        const handleDeepLink = async () => {
            const params = new URLSearchParams(window.location.search);
            const bookId = params.get('book');
            const chapterNum = params.get('chapter');

            if (bookId && books.length > 0 && !currentBook) {
                const book = books.find(b => b.id === bookId);
                if (book) {
                    setCurrentBook(book);
                    setLoading(true);
                    try {
                        const ch = await BibleService.getChapters(book.id, currentVersion);
                        setChapters(ch);

                        let chapterId;
                        if (chapterNum) {
                            const foundChapter = ch.find((c: any) => c.number === chapterNum);
                            if (foundChapter) chapterId = foundChapter.id;
                        }

                        if (!chapterId && ch.length > 0) chapterId = ch[0].id;

                        if (chapterId) {
                            await selectChapter(chapterId);
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        };

        handleDeepLink();
    }, [books, currentVersion]); // Depend on books loaded

    const toggleZenMode = () => {
        if (!isZenMode) {
            setSidebarOpen(false);
            setChatOpen(false);
        } else {
            setSidebarOpen(true);
            setChatOpen(true);
        }
        setIsZenMode(!isZenMode);
    };

    const handleCopyChapter = () => {
        if (!content) return;
        // Create temp element to strip HTML
        const tmp = document.createElement("DIV");
        tmp.innerHTML = content;
        const text = tmp.textContent || tmp.innerText || "";
        const reference = `${currentBook?.name} ${chapters.find(c => c.id === currentChapter)?.number} (RVR1909)`;

        navigator.clipboard.writeText(`${text}\n\n${reference}`);
        toast({ title: "Copiado", description: "Capítulo copiado al portapapeles." });
    };

    const toggleBookmark = () => {
        if (!currentChapter || !currentBook) return;

        const exists = bookmarks.some(b => b.id === currentChapter);
        let newBookmarks;

        if (exists) {
            newBookmarks = bookmarks.filter(b => b.id !== currentChapter);
            toast({ title: "Eliminado", description: "Marcador eliminado de favoritos." });
        } else {
            const newBookmark = {
                id: currentChapter,
                bookId: currentBook.id,
                bookName: currentBook.name,
                chapterNumber: chapters.find(c => c.id === currentChapter)?.number,
                timestamp: Date.now()
            };
            newBookmarks = [newBookmark, ...bookmarks];
            toast({ title: "Guardado", description: "Capítulo guardado en favoritos." });
        }

        setBookmarks(newBookmarks);
        localStorage.setItem('bible_bookmarks', JSON.stringify(newBookmarks));
    };

    const handleSelectBookmark = async (b: any) => {
        setLoading(true);
        try {
            setCurrentBook({ id: b.bookId, name: b.bookName });
            const ch = await BibleService.getChapters(b.bookId, currentVersion);
            setChapters(ch);
            await selectChapter(b.id);
            if (window.innerWidth < 768) setSidebarOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNextChapter = () => {
        if (!currentChapter || !chapters.length) return;
        const idx = chapters.findIndex(c => c.id === currentChapter);
        if (idx !== -1 && idx < chapters.length - 1) {
            selectChapter(chapters[idx + 1].id);
        }
    };

    const handlePrevChapter = () => {
        if (!currentChapter || !chapters.length) return;
        const idx = chapters.findIndex(c => c.id === currentChapter);
        if (idx > 0) {
            selectChapter(chapters[idx - 1].id);
        }
    };

    // Scroll progress handler
    const handleScroll = (e: any) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(progress);
    };

    // State for toggling categories (all open by default)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        'Pentateuco': true,
        'Históricos (AT)': false,
        'Poéticos': false,
        'Profetas Mayores': false,
        'Profetas Menores': false,
        'Evangelios': true,
        'Históricos (NT)': false,
        'Cartas Paulinas': false,
        'Cartas Generales': false,
        'Profético (NT)': false
    });

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const handleThemeToggle = () => {
        toast({ title: "Próximamente", description: "El cambio de tema estará disponible pronto." });
    };

    // Group filtered books by category
    const getBooksByCategory = () => {
        const grouped: Record<string, any[]> = {};
        filteredBooks.forEach(book => {
            const cat = getCategory(book.id);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(book);
        });
        return grouped;
    };

    const booksByCategory = getBooksByCategory();

    return (
        <div className="flex bg-[#09090b] h-screen text-gray-100 font-sans overflow-hidden">

            {/* LEFT SIDEBAR: Navigation */}
            <div className={`
                ${sidebarOpen ? 'w-80' : 'w-0'}
                transition-all duration-300 ease-in-out border-r border-gray-800 bg-[#111215] flex flex-col relative
            `}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-xl">
                        <Book className="w-6 h-6" /> BibliaAI
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar libro..."
                            className="w-full bg-[#1c1e24] border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-2">
                    {/* Favoritos */}
                    <div className="mb-4">
                        <button
                            onClick={() => setShowBookmarks(!showBookmarks)}
                            className="flex items-center justify-between w-full p-2 text-xs font-semibold text-yellow-500 uppercase hover:text-yellow-400 group"
                        >
                            <span className="flex items-center gap-2"><Bookmark className="w-3 h-3 group-hover:fill-current" /> Favoritos ({bookmarks.length})</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showBookmarks ? '' : '-rotate-90'}`} />
                        </button>
                        {showBookmarks && (
                            <div className="space-y-0.5 ml-2 border-l border-yellow-500/20 pl-2 mb-2">
                                {bookmarks.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => handleSelectBookmark(b)}
                                        className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-gray-400 hover:bg-gray-800 hover:text-white truncate flex justify-between items-center group/item"
                                    >
                                        <span>{b.bookName} {b.chapterNumber}</span>
                                        <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100" />
                                    </button>
                                ))}
                                {bookmarks.length === 0 && <p className="text-xs text-gray-600 p-2 italic">Sin marcadores.</p>}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Categories */}
                    {Object.keys(BOOK_CATEGORIES).map(category => {
                        const categoryBooks = booksByCategory[category] || [];
                        if (categoryBooks.length === 0) return null; // Don't show empty categories

                        return (
                            <div key={category} className="mb-2">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="flex items-center justify-between w-full p-2 text-xs font-semibold text-gray-500 uppercase hover:text-gray-300 hover:bg-gray-800/50 rounded"
                                >
                                    {category}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${openCategories[category] ? '' : '-rotate-90'}`} />
                                </button>
                                {openCategories[category] && (
                                    <div className="space-y-0.5 ml-2 border-l border-gray-800 pl-2">
                                        {categoryBooks.map(book => (
                                            <button
                                                key={book.id}
                                                onClick={() => selectBook(book)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center group ${currentBook?.id === book.id ? 'bg-yellow-500/10 text-yellow-500 font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                {book.name}
                                                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${currentBook?.id === book.id ? 'opacity-100' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </ScrollArea>

                {/* Footer Nav */}
                <div className="border-t border-gray-800 p-4 space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
                        onClick={() => navigate('/')}
                    >
                        <Home className="w-4 h-4" /> Volver al Inicio
                    </Button>
                </div>
            </div>

            {/* TOGGLE BUTTON FOR MOBILE */}
            {!sidebarOpen && (
                <div className="absolute top-4 left-4 z-50">
                    <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)} className="bg-black/50 backdrop-blur">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            )}

            {/* MAIN CONTENT: Text */}
            <div className="flex-1 flex flex-col h-full bg-[#09090b] relative transition-all duration-500">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-800 w-full">
                    <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${readingProgress}%` }} />
                </div>

                {/* Toolbar */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#09090b] z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-serif text-white hidden md:block">
                            {currentBook ? currentBook.name : 'Biblia'}
                        </h2>

                        {/* Chapter Grid Selector */}
                        {currentBook && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800 flex gap-2 items-center">
                                        <Grid3X3 className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {currentChapter
                                                ? `Cap. ${chapters.find(c => c.id === currentChapter)?.number}`
                                                : 'Capítulos'}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-[#1c1e24] border-gray-700 text-white p-4">
                                    <h4 className="mb-4 font-medium text-gray-400 border-b border-gray-700 pb-2">Seleccionar Capítulo</h4>
                                    <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                                        {chapters.map(ch => (
                                            <button
                                                key={ch.id}
                                                onClick={() => selectChapter(ch.id)}
                                                className={`p-2 rounded hover:bg-yellow-500 hover:text-black text-sm transition-colors ${currentChapter === ch.id ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 text-gray-300'
                                                    }`}
                                            >
                                                {ch.number}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Font Size */}
                        <div className="flex items-center bg-[#1c1e24] rounded-lg p-1 mr-2">
                            <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="h-7 w-7 p-0 hover:bg-gray-700"><Type className="w-3 h-3" /></Button>
                            <span className="text-xs w-8 text-center text-gray-400">{fontSize}</span>
                            <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="h-7 w-7 p-0 hover:bg-gray-700"><Type className="w-4 h-4" /></Button>
                        </div>

                        {/* Version Selector */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white mr-2">
                                    <span className="mr-2 text-xs uppercase tracking-wider">
                                        {AVAILABLE_VERSIONS.find(v => v.id === currentVersion)?.shortName || 'Versión'}
                                    </span>
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 bg-[#1c1e24] border-gray-700 p-1">
                                <div className="space-y-1">
                                    {AVAILABLE_VERSIONS.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setCurrentVersion(v.id)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${currentVersion === v.id
                                                ? 'bg-yellow-500/10 text-yellow-500 font-medium'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <div className="font-medium">{v.shortName}</div>
                                            <div className="text-xs text-gray-500 truncate">{v.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Theme placeholder */}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={handleThemeToggle}>
                            <Sun className="w-5 h-5" />
                        </Button>

                        {/* Copy Button */}
                        <Button variant="ghost" size="icon" onClick={handleCopyChapter} title="Copiar Capítulo" className="hidden md:flex">
                            <Copy className="w-4 h-4 text-gray-400" />
                        </Button>

                        {/* Bookmark Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleBookmark}
                            title="Guardar en Favoritos"
                            className={bookmarks.some(b => b.id === currentChapter) ? "text-yellow-500" : "text-gray-400"}
                        >
                            <Bookmark className={`w-4 h-4 ${bookmarks.some(b => b.id === currentChapter) ? 'fill-current' : ''}`} />
                        </Button>

                        {/* Zen Mode Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleZenMode}
                            title={isZenMode ? "Salir de Zen" : "Modo Zen"}
                            className={isZenMode ? "text-yellow-500" : "text-gray-400"}
                        >
                            {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={`text-gray-400 hover:text-yellow-500 ${chatOpen && !isZenMode ? 'bg-yellow-500/10 text-yellow-500' : ''}`}
                            onClick={() => {
                                setChatOpen(!chatOpen);
                                setIsZenMode(false); // Creating chat exits Zen implicitly
                            }}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Text Area */}
                <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
                    <div className="max-w-3xl mx-auto px-8 py-12">
                        {loading && !content ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulse">
                                <Book className="w-12 h-12 mb-4 opacity-50" />
                                <p>Cargando escritura...</p>
                            </div>
                        ) : content ? (
                            <>
                                <h1 className="text-4xl font-serif text-center mb-2 text-white">{currentBook?.name}</h1>
                                <p className="text-center text-yellow-500/80 mb-12 tracking-widest text-sm uppercase">CAPITULO {chapters.find(c => c.id === currentChapter)?.number}</p>

                                <div
                                    className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed text-gray-300"
                                    style={{ fontSize: `${fontSize}px` }}
                                >
                                    <style>{`
                                        .v { color: #6b7280; font-size: 0.6em; vertical-align: super; margin-right: 0.5em; user-select: none; font-family: sans-serif; }
                                        .p { margin-bottom: 1.5em; }
                                        .q { font-style: italic; color: #9ca3af; margin-left: 1.5em; }
                                        .wj { color: #fca5a5; } /* Words of Jesus */
                                        .s { color: #fbbf24; font-size: 0.9em; font-weight: bold; margin-top: 2em; margin-bottom: 1em; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
                                    `}</style>
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                </div>

                                {/* Chapter Navigation Footer */}
                                <div className="flex justify-between mt-16 pt-8 border-t border-gray-800">
                                    <Button variant="ghost" onClick={handlePrevChapter} disabled={!chapters[0] || currentChapter === chapters[0].id}>
                                        Anterior
                                    </Button>
                                    <Button variant="ghost" onClick={handleNextChapter} disabled={!chapters[chapters.length - 1] || currentChapter === chapters[chapters.length - 1].id}>
                                        Siguiente
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
                                <Book className="w-20 h-20 mb-6 opacity-10" />
                                <h3 className="text-xl font-medium text-gray-400">Comienza tu lectura</h3>
                                <p className="text-sm mt-2">Selecciona un libro del menú para empezar.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT SIDEBAR: Chat context */}
            <div className={`
                ${chatOpen ? 'w-[400px]' : 'w-0'} 
                transition-all duration-300 ease-in-out border-l border-gray-800 bg-[#111215] flex flex-col overflow-hidden
            `}>
                <BibleChat
                    currentBookName={currentBook?.name}
                    currentChapter={chapters.find(c => c.id === currentChapter)?.number}
                    chapterContent={content} // This might be HTML, but BibleChat truncates it for context
                />
            </div>

        </div>
    );
}
