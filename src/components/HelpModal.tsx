
import { useState } from 'react';
import { HelpCircle, X, MessageSquare, Book, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const { toast } = useToast();

  const handleContactSupport = () => {
    const message = encodeURIComponent("Hola, necesito ayuda con ChatMJ");
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
    toast({
      title: "Redirigiendo a WhatsApp",
      description: "Te conectaremos con nuestro equipo de soporte.",
    });
  };

  const faqs = [
    {
      question: "¿Cómo empiezo una nueva conversación?",
      answer: "Haz clic en 'Nueva conversación' en la barra lateral izquierda o simplemente escribe tu mensaje en el área de texto."
    },
    {
      question: "¿Puedo guardar mis conversaciones?",
      answer: "Sí, todas tus conversaciones se guardan automáticamente y puedes acceder a ellas desde la barra lateral."
    },
    {
      question: "¿Es seguro usar ChatMJ?",
      answer: "Absolutamente. Todas las conversaciones están encriptadas y solo tú y los moderadores autorizados pueden acceder a ellas."
    },
    {
      question: "¿Qué tipo de preguntas puedo hacer?",
      answer: "Puedes hacer cualquier pregunta relacionada con la fe cristiana, pedir devocionales, oración, o consejos espirituales."
    },
    {
      question: "¿Cómo contacto a un líder real?",
      answer: "Usa el botón 'Contactar Líder' en la barra lateral para conectarte directamente con un líder de Misión Juvenil por WhatsApp."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <HelpCircle className="w-5 h-5" />
            <span>Centro de Ayuda</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Enlaces rápidos */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="flex items-center space-x-2 h-auto p-4 flex-col"
            >
              <Phone className="w-6 h-6 text-aurora-primario" />
              <span className="text-sm">Contactar Soporte</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('https://misionjuvenil.org', '_blank')}
              className="flex items-center space-x-2 h-auto p-4 flex-col"
            >
              <Book className="w-6 h-6 text-aurora-primario" />
              <span className="text-sm">Recursos Bíblicos</span>
            </Button>
          </div>

          {/* Preguntas Frecuentes */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Preguntas Frecuentes</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consejos de uso */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Consejos para usar ChatMJ</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Sé específico en tus preguntas para obtener mejores respuestas</li>
                <li>• Usa las acciones rápidas para temas comunes como oración o devocionales</li>
                <li>• Puedes escribir en modo conversación natural</li>
                <li>• Si necesitas ayuda urgente, contacta directamente a un líder</li>
                <li>• Todas tus conversaciones se guardan automáticamente</li>
              </ul>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Información de Contacto</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contacto@misionjuvenil.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-8900</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: +1 (234) 567-8900</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              className="bg-aurora-primario hover:bg-orange-600 text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
