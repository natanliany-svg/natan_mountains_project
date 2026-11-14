import { useEffect } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MountainsPage } from './pages/MountainsPage';
import { MountainDetailsPage } from './pages/MountainDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// (#30)
const rtlTheme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#ef6c00' },
  },
  typography: {
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
  },
});

// (#30)
export default function App() {
  useEffect(() => {
    document.dir = 'rtl';
  }, []);

  return (
    <ThemeProvider theme={rtlTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<MountainsPage />} />
          <Route path="/mountains/:id" element={<MountainDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
