import { useState } from 'react';
import './App.css'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom';
import Inventory from './Pages/Inventory.jsx';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
      />

      {/* Main Content */}
      <div
        className={`
          flex-1 min-h-screen bg-gray-100
          transition-all duration-300
          ${isOpen ? "ml-48" : "ml-0"}
        `}
      >
        <main className="p-2">
          <Routes>
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
