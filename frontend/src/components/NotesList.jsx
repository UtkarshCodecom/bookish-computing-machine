import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, deleteNoteById } from '../store/notesSlice';
import { useAuth } from '../context/AuthContext';

const NotesList = () => {
    const dispatch = useDispatch();
    const { items: notes, status, error: noteError } = useSelector(state => state.notes);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();

    useEffect(() => {
        dispatch(fetchNotes());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await dispatch(deleteNoteById(id)).unwrap();
            } catch (err) {
                setError('Failed to delete note: ' + (err.message || 'Unknown error'));
            }
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
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
                            <span className="text-gray-600">Welcome, {user.name}!</span>
                            <button
                                onClick={logout}
                                className="text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Notes</h1>
                        <p className="text-gray-600">Create, edit, and organize your digital notes</p>
                    </div>
                    
                    <Link
                        to="/new"
                        className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center space-x-2">
                            <span>✨</span>
                            <span>Create New Note</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {noteError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
                        {noteError}
                    </div>
                )}

                {notes.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No notes yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Start your creative journey by creating your first note. 
                            Draw, write, and express your ideas beautifully.
                        </p>
                        <Link
                            to="/new"
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <span>✨</span>
                            <span>Create Your First Note</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {note.title}
                                        </h2>
                                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-60"></div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-2">
                                            Last updated
                                        </p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex space-x-3">
                                        <Link
                                            to={`/notes/${note._id}`}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(note._id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-0.5"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesList;