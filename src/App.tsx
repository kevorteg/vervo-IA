import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SpiritualLibrary } from "./components/ai/SpiritualLibrary";
import { TrainingDataManager } from "./components/ai/TrainingDataManager";
import { PrayerJournal } from "./components/PrayerJournal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/biblioteca" element={<SpiritualLibrary />} />
          <Route
            path="/entrenamiento"
            element={
              <ProtectedRoute requireAdmin={true}>
                <TrainingDataManager />
              </ProtectedRoute>
            }
          />
          <Route path="/diario" element={<PrayerJournal />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
