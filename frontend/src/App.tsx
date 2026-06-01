import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import { CommitScreen } from "./pages/Commit";
import { GalleryScreen } from "./pages/Gallery";
import { HistoryScreen } from "./pages/History";
import { ProgressScreen } from "./pages/Progress";
import { ReviewScreen } from "./pages/Review";
import { SettingsScreen } from "./pages/Settings";
import { SetupScreen } from "./pages/Setup";
import { AppStateProvider, useAppState } from "./store/AppState";
import { AppThemeProvider } from "./theme/ThemeContext";

function Router() {
  const { view } = useAppState();
  switch (view) {
    case "setup":
      return <SetupScreen />;
    case "progress":
      return <ProgressScreen />;
    case "review":
      return <ReviewScreen />;
    case "commit":
      return <CommitScreen />;
    case "gallery":
      return <GalleryScreen />;
    case "history":
      return <HistoryScreen />;
    case "settings":
      return <SettingsScreen />;
  }
}

export function App() {
  return (
    <AppThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          <AppShell>
            <Router />
          </AppShell>
        </AppStateProvider>
      </ToastProvider>
    </AppThemeProvider>
  );
}
