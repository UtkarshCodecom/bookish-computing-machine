import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">✨</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Note Studio
              </h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name}!</span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Your Ideas,
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Beautifully Crafted
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create stunning digital notes with our advanced drawing tools, text editing, 
              and seamless cloud synchronization. Perfect for students, professionals, and creatives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/notes"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="relative z-10">Start Creating</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/new"
                className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-2xl hover:bg-indigo-50 transition-all duration-300"
              >
                Create New Note
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to bring your ideas to life with precision and style.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🖊️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Drawing</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional drawing tools with pressure sensitivity, multiple brush types, 
                and smooth vector rendering for precise artwork.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rich Text Editing</h3>
              <p className="text-gray-600 leading-relaxed">
                Add formatted text with custom fonts, colors, highlighting, and styling options 
                to complement your drawings perfectly.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">☁️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cloud Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Your notes are automatically saved and synchronized across all your devices 
                with real-time backup and version history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Note-Taking?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
            Join thousands of users who have revolutionized their creative workflow with Note Studio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/notes"
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              View My Notes
            </Link>
            <Link
              to="/new"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300"
            >
              Create First Note
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✨</span>
              </div>
              <span className="text-xl font-bold">Note Studio</span>
            </div>
            
            <div className="text-gray-400">
              <p>&copy; 2024 Note Studio. Crafted with ❤️ for creators.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;