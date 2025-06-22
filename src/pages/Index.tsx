
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-aurora-gradient p-4 flex items-center justify-center">
      <div className="w-full h-full max-h-[95vh]">
        <ChatInterface />
      </div>
      
      {/* Decorative elements */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-aurora-violet/10 rounded-full blur-xl"></div>
      <div className="fixed top-32 right-20 w-16 h-16 bg-aurora-celestial/10 rounded-full blur-lg"></div>
      <div className="fixed bottom-20 left-32 w-12 h-12 bg-aurora-gold/10 rounded-full blur-md"></div>
      <div className="fixed bottom-40 right-10 w-24 h-24 bg-aurora-violet/5 rounded-full blur-2xl"></div>
    </div>
  );
};

export default Index;
