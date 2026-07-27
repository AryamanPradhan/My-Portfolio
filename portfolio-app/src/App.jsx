import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import BootScreen from './components/BootScreen';

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <BrowserRouter>
      {!booted && <BootScreen onBootComplete={() => setBooted(true)} />}
      {booted && (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            {/* Old routes from the 4-page layout — projects now lives on Home. */}
            <Route path="profile" element={<Navigate to="/about" replace />} />
            <Route path="projects" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
