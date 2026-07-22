import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/lib/AuthContext';
import PageNotFound from '@/lib/PageNotFound';
import ScrollToTop from '@/components/ScrollToTop';
import ThemeProvider from '@/lib/ThemeProvider';
import Home from '@/pages/Home';
import Transactions from '@/pages/Transactions';
import People from '@/pages/People';
import Settings from '@/pages/Settings';

const tabPaths = ['/', '/transactions', '/people', '/settings'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

function AnimatedRoutes() {
  const location = useLocation();
  const [prevPath, setPrevPath] = React.useState(location.pathname);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
    const prev = tabPaths.indexOf(prevPath);
    const next = tabPaths.indexOf(location.pathname);
    if (prev !== -1 && next !== -1) {
      setDirection(next > prev ? 1 : -1);
    } else {
      setDirection(1);
    }
    setPrevPath(location.pathname);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'tween', duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'relative', willChange: 'transform' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/people" element={<People />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <div style={{ position: 'relative', minHeight: '100dvh' }}>
              <AnimatedRoutes />
            </div>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;