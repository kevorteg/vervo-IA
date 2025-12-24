import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BibleService } from '@/services/BibleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Book, ChevronRight, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile'; // Asumiendo que existe o usar window width
import { Toaster } from "@/components/ui/sonner";

export default function BibleReader() {
    const navigate = useNavigate();
    const [books, setBooks] = useState<any[]>([]);
    const [currentBook, setCurrentBook] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [currentChapter, setCurrentChapter] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Para navegación móvil de libros

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await BibleService.getBooks();
            setBooks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectBook = async (book: any) => {
        setCurrentBook(book);
        setCurrentChapter(null);
        setContent('');
        setLoading(true);
        try {
            const ch = await BibleService.getChapters(book.id);
            setChapters(ch);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSidebarOpen(false); // Cerrar menú en móvil
        }
    };

    const selectChapter = async (chapterId: string) => {
        setCurrentChapter(chapterId);
        setLoading(true);
        try {
            const html = await BibleService.getChapterContent(chapterId);
            setContent(html);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-[#111215] min-h-screen text-white font-sans">
            <div className="hidden md:flex flex-col w-16 border-r border-[#2d2f39] bg-[#16181d] items-center py-4 gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="Volver al Chat" className="hover:bg-purple-900/20 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="w-8 h-[1px] bg-[#2d2f39]" />
                <Book className="w-6 h-6 text-purple-500" />
            </div>
            <main className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden relative">

                {/* Mobile Header / Navigation */}
                <div className="md:hidden p-4 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Book className="w-5 h-5 text-purple-400" />
                        Biblia
                    </h1>
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">Libros</Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-[#1a1c23] border-gray-800 text-white w-[300px]">
                            <div className="h-full overflow-y-auto py-4">
                                <h2 className="text-lg font-bold mb-4 px-2">Libros</h2>
                                {books.map(book => (
                                    <Button
                                        key={book.id}
                                        variant="ghost"
                                        className={`w-full justify-start mb-1 ${currentBook?.id === book.id ? 'bg-purple-900/40 text-purple-300' : 'text-gray-400'}`}
                                        onClick={() => selectBook(book)}
                                    >
                                        {book.name}
                                    </Button>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar: Books */}
                <div className="hidden md:flex flex-col w-64 border-r border-[#2d2f39] bg-[#16181d]">
                    <div className="p-4 border-b border-[#2d2f39]">
                        <h2 className="font-bold flex items-center gap-2 text-purple-400">
                            <Book className="w-5 h-5" /> Libros
                        </h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {books.map(book => (
                                <Button
                                    key={book.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-sm ${currentBook?.id === book.id ? 'bg-purple-900/40 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => selectBook(book)}
                                >
                                    {book.name}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chapters & Content Area */}
                <div className="flex-1 flex flex-col h-full">
                    {currentBook ? (
                        <>
                            {/* Chapter Selection Bar */}
                            <div className="p-4 border-b border-[#2d2f39] bg-[#1a1c23] flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <span className="font-semibold px-2">{currentBook.name}</span>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                {chapters.map(ch => (
                                    <Button
                                        key={ch.id}
                                        size="sm"
                                        variant={currentChapter === ch.id ? "default" : "secondary"}
                                        onClick={() => selectChapter(ch.id)}
                                        className={`rounded-full w-8 h-8 p-0 ${currentChapter === ch.id ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#2d2f39] text-gray-300 hover:bg-[#3d4150]'}`}
                                    >
                                        {ch.number}
                                    </Button>
                                ))}
                            </div>

                            {/* Content Reader */}
                            <ScrollArea className="flex-1 bg-[#111215] p-6 md:p-12">
                                {loading && (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    </div>
                                )}

                                {!loading && content && (
                                    <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
                                        <style>{`
                                    .v { color: #a8a29e; font-size: 0.75em; vertical-align: super; margin-right: 4px; user-select: none; }
                                    .p { margin-bottom: 1em; line-height: 1.8; }
                                    .q { margin-left: 20px; font-style: italic; color: #d1d5db; }
                                    .wj { color: #ef4444; } /* Palabras de Jesús en rojo si la API lo soporta */
                                    h1, h2, h3 { color: #e9d5ff; font-family: sans-serif; }
                                `}</style>
                                        <div dangerouslySetInnerHTML={{ __html: content }} />
                                    </div>
                                )}

                                {!loading && !content && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <p>Selecciona un capítulo para comenzar a leer.</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                            <Book className="w-16 h-16 opacity-20" />
                            <p className="text-lg">Selecciona un libro del menú para leer la Biblia</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
