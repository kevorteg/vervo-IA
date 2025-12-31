import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

// Map of common book names to IDs (simplified)
const BOOK_MAP: Record<string, string> = {
  'génesis': 'GEN', 'exodo': 'EXO', 'éxodo': 'EXO', 'levítico': 'LEV', 'numeros': 'NUM', 'números': 'NUM', 'deuteronomio': 'DEU',
  'mateo': 'MAT', 'marcos': 'MRK', 'lucas': 'LUK', 'juan': 'JHN',
  'hechos': 'ACT', 'romanos': 'ROM', 'apocalipsis': 'REV',
  // Add more as needed
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.isUser;

  // Function to parse content and replace verse references with links
  const renderContent = (content: string) => {
    // Regex for "Name Chapter:Verse" (e.g., Juan 3:16, Génesis 1:1)
    const verseRegex = /\b([0-9]?[A-Za-zÁ-Úá-úñÑ]+)\s(\d+):(\d+)(?:-(\d+))?\b/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = verseRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const fullMatch = match[0];
      const bookName = match[1].toLowerCase();
      const chapter = match[2];

      const bookId = BOOK_MAP[bookName];

      if (bookId) {
        parts.push(
          <Link
            key={match.index}
            to={`/biblia?book=${bookId}&chapter=${chapter}`}
            className="inline-flex items-center space-x-1 text-aurora-secundario hover:underline font-medium bg-aurora-secundario/10 px-1 rounded"
          >
            <span>{fullMatch}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        );
      } else {
        parts.push(fullMatch); // Return text if book not found in map
      }

      lastIndex = verseRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom-2`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${isUser
            ? 'bg-aurora-primario text-white rounded-br-none'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
          }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans ${isUser ? 'font-medium' : ''}`}>
            {isUser ? message.content : renderContent(message.content)}
          </p>
        </div>
        <div
          className={`text-[10px] mt-2 flex items-center gap-1 opacity-70 ${isUser ? 'text-purple-100' : 'text-gray-400'
            }`}
        >
          <span>{new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(message.timestamp)}</span>
          {isUser && <span>• Enviado</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
