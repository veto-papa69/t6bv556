import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Referrals from "@/pages/referrals";
import RewardServices from "@/pages/reward-services";
import ServicesDiscount from "@/pages/services-discount";
import Wallet from "@/pages/wallet";
import AddFunds from "@/pages/add-funds";
import Orders from "@/pages/orders";
import Dashboard from "@/pages/dashboard";
import FAQ from "@/pages/faq";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import { Suspense } from "react";

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)', color: 'var(--gold)' }}><div className="text-xl animate-pulse">Loading...</div></div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services-discount" component={ServicesDiscount} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/add-funds" component={AddFunds} />
        <Route path="/orders" component={Orders} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/reward-services" component={RewardServices} />
        <Route path="/faq" component={FAQ} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
