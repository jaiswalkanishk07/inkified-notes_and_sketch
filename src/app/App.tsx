import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { AppShell } from './AppShell';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  );
}
