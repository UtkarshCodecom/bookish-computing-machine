import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveNote } from '../store/notesSlice';
import { useAuth } from '../context/AuthContext';

const NewNote = () => {
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const status = useSelector(state => state.notes.status);
    const isLoading = status === 'loading';

    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const result = await dispatch(saveNote({
                data: {
                    title: title.trim(),
                    content: {
                        lines: [],
                        textElements: [],
                        stageState: { position: { x: 0, y: 0 }, scale: 1 },
                        backgroundImage: null
                    }
                }
            })).unwrap();
            
            navigate(`/notes/${result._id}`);
        } catch (err) {
            console.error('Error creating note:', err);
            setError(err.message || 'Failed to create note');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">✨</span>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Note Studio
                                </h1>
                            </Link>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Link 
                                to="/notes"
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                ← Back to Notes
                            </Link>
                            {user && (
                                <span className="text-gray-600">Welcome, {user.name}!</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">✨</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Note</h1>
                    <p className="text-xl text-gray-600">
                        Start your creative journey with a new digital note
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                                Note Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title for your note..."
                                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleCreate}
                                disabled={isLoading || !title.trim()}
                                className={`flex-1 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                    isLoading || !title.trim()
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Note...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>🚀</span>
                                        <span>Create & Start Editing</span>
                                    </span>
                                )}
                            </button>
                            
                            <Link
                                to="/notes"
                                className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        Pro Tips
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <span>Use descriptive titles to easily find your notes later</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <span>Your notes are automatically saved as you work</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <span>Try different drawing tools and text formatting options</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NewNote;