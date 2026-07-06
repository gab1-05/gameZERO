import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";

const Overview = lazy(() => import("@/pages/overview"));
const Optimize = lazy(() => import("@/pages/optimize"));
const GameProfiles = lazy(() => import("@/pages/profiles"));
const Processes = lazy(() => import("@/pages/processes"));
const Drivers = lazy(() => import("@/pages/drivers"));
const Display = lazy(() => import("@/pages/display"));
const SystemSpecs = lazy(() => import("@/pages/system-specs"));
const Thermals = lazy(() => import("@/pages/thermals"));
const Storage = lazy(() => import("@/pages/storage"));
const Benchmarks = lazy(() => import("@/pages/benchmarks"));
const Settings = lazy(() => import("@/pages/settings"));
const GamingMonitor = lazy(() => import("@/pages/gaming-monitor"));
const Analytics = lazy(() => import("@/pages/analytics"));

const queryClient = new QueryClient();

const isElectron =
  typeof window !== "undefined" && !!(window as any).electronAPI?.isElectron;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/optimize" component={Optimize} />
          <Route path="/profiles" component={GameProfiles} />
          <Route path="/processes" component={Processes} />
          <Route path="/drivers" component={Drivers} />
          <Route path="/display" component={Display} />
          <Route path="/system-specs" component={SystemSpecs} />
          <Route path="/thermals" component={Thermals} />
          <Route path="/storage" component={Storage} />
          <Route path="/benchmarks" component={Benchmarks} />
          <Route path="/settings" component={Settings} />
          <Route path="/gaming" component={GamingMonitor} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          hook={isElectron ? useHashLocation : undefined}
          base={isElectron ? "" : import.meta.env.BASE_URL.replace(/\/$/, "")}
        >
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
