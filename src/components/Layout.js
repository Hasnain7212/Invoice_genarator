import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Layout({ config, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { app: { title, theme, navigation } } = config;

  const bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-gray-900';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      {/* Header */}
      <header className="fixed w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="ml-2 text-xl font-bold text-gray-900">{title}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar & Main Content */}
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:static
            inset-y-0 left-0
            transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            transition duration-200 ease-in-out
            z-30
            w-64
            bg-white
            border-r
            shadow-lg md:shadow-none
            overflow-y-auto
            ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}
          `}
        >
          <nav className="px-4 py-4">
            {navigation.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-3 mb-1
                    rounded-lg flex items-center
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto" size={16} />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}