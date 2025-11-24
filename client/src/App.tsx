import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/navigation";
import { SessionDialog } from "./components/session-dialog";
import Dashboard from "@/pages/dashboard";
import Sessions from "@/pages/sessions";
import Goals from "@/pages/goals";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";

function Router({ onLogSession }: { onLogSession: () => void }) {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard onLogSession={onLogSession} />} />
      <Route path="/sessions" component={() => <Sessions onLogSession={onLogSession} />} />
      <Route path="/goals" component={Goals} />
      <Route path="/insights" component={Insights} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navigation onLogSession={() => setSessionDialogOpen(true)} />
            <Router onLogSession={() => setSessionDialogOpen(true)} />
            <SessionDialog
              open={sessionDialogOpen}
              onOpenChange={setSessionDialogOpen}
            />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
