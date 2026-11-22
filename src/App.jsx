import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import IntroLanding from './components/IntroLanding';
import AlphabetGrid from './components/AlphabetGrid';
import DigitsView from './components/DigitsView';
import LinguisticGuidesView from './components/LinguisticGuidesView';
import DetailedLetterModal from './components/DetailedLetterModal';
import ThemeModal from './components/ThemeModal';
import { LEARNING_ENTRIES } from './data/alphabetData';

const InteractiveWhiteboard = lazy(() => import('./components/InteractiveWhiteboard'));
const ScriptQuiz = lazy(() => import('./components/ScriptQuiz'));
const WordBridgeSandbox = lazy(() => import('./components/WordBridgeSandbox'));

export default function App() {
  // Theme state: Default strictly to 'dark' with #157F1A green primary!
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hindustani_theme') || 'dark';
  });

  // Theme selection modal state
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Learning path state ('hindi-to-urdu' | 'urdu-to-hindi')
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem('hindustani_path') || 'hindi-to-urdu';
  });

  // Sidebar expanded / minimized state
  // On desktop: true = expanded (w-72), false = mini-dock (w-20)
  // On mobile (<1024px): true = open drawer, false = closed off-canvas
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });

  // Modal state for detailed letter inspection
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Sync theme to HTML document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hindustani_theme', theme);
  }, [theme]);

  // Sync learning path
  useEffect(() => {
    localStorage.setItem('hindustani_path', currentPath);
  }, [currentPath]);

  const navigate = useNavigate();
  const location = useLocation();

  const routeToView = {
    '/': 'intro',
    '/learn': 'learn',
    '/digits': 'digits',
    '/guides': 'guides',
    '/whiteboard': 'whiteboard',
    '/quiz': 'quiz',
    '/sandbox': 'sandbox',
  };
  const activeView = routeToView[location.pathname] || 'intro';

  const handleOpenWhiteboardForItem = (item) => {
    navigate('/whiteboard', { state: { initialLetter: item } });
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white transition-colors duration-200 flex">
      
      {/* Collapsible / Closable Sidebar with Mini-Dock Mode */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
        currentPath={currentPath}
        onPathChange={setCurrentPath}
        currentTheme={theme}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        activeView={activeView}
      />

      {/* Main Content Viewport: Adjust padding for desktop expanded (lg:pl-72 sm:lg:pl-80) vs mini-dock (lg:pl-20) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out pl-0 ${
          sidebarOpen ? 'lg:pl-[19rem] sm:lg:pl-[21rem]' : 'lg:pl-20'
        }`}
      >
        
        {/* Top Header Bar with Menu toggle and Quick Controls */}
        <HeaderBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          activeView={activeView}
          currentPath={currentPath}
          onPathChange={setCurrentPath}
          currentTheme={theme}
          onOpenThemeModal={() => setThemeModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className={`flex-1 ${activeView === 'quiz' ? 'pb-2 flex flex-col justify-center' : 'pb-16'}`}>
          <Suspense fallback={<div className="flex min-h-64 items-center justify-center text-sm text-base-content/60" role="status">Loading page...</div>}>
            <Routes>
              <Route
                path="/"
                element={
                  <IntroLanding
                    currentPath={currentPath}
                    onPathSelect={setCurrentPath}
                    onStartLearning={() => navigate('/learn')}
                    onOpenDigits={() => navigate('/digits')}
                  />
                }
              />
              <Route
                path="/learn"
                element={
                  <AlphabetGrid
                    currentPath={currentPath}
                    onSelectLetter={setSelectedLetter}
                    onOpenWhiteboard={handleOpenWhiteboardForItem}
                    onOpenGuides={() => navigate('/guides')}
                  />
                }
              />
              <Route
                path="/digits"
                element={
                  <DigitsView
                    currentPath={currentPath}
                    onOpenWhiteboard={handleOpenWhiteboardForItem}
                  />
                }
              />
              <Route
                path="/guides"
                element={
                  <LinguisticGuidesView
                    currentPath={currentPath}
                    onOpenWhiteboard={handleOpenWhiteboardForItem}
                  />
                }
              />
              <Route
                path="/whiteboard"
                element={
                  <InteractiveWhiteboard
                    currentPath={currentPath}
                    initialLetter={location.state?.initialLetter || null}
                    onBackToGrid={() => navigate('/learn')}
                  />
                }
              />
              <Route
                path="/quiz"
                element={
                  <ScriptQuiz
                    currentPath={currentPath}
                    onOpenWhiteboard={handleOpenWhiteboardForItem}
                  />
                }
              />
              <Route
                path="/sandbox"
                element={<WordBridgeSandbox currentPath={currentPath} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Detailed Letter Inspection Modal */}
        {selectedLetter && (
          <DetailedLetterModal
            letter={selectedLetter}
            allLetters={LEARNING_ENTRIES}
            currentPath={currentPath}
            onClose={() => setSelectedLetter(null)}
            onSelectLetter={setSelectedLetter}
            onOpenWhiteboard={() => {
              const toOpen = selectedLetter;
              setSelectedLetter(null);
              handleOpenWhiteboardForItem(toOpen);
            }}
          />
        )}

        {/* Interactive Theme Selection Popup Modal */}
        <ThemeModal
          isOpen={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
          currentTheme={theme}
          onSelectTheme={(newTheme) => {
            setTheme(newTheme);
          }}
        />

      </div>

    </div>
  );
}
