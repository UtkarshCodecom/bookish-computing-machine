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
    }, [dispatch]);    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await dispatch(deleteNoteById(id)).unwrap();
            } catch (err) {
                setError('Failed to delete note: ' + (err.message || 'Unknown error'));
            }
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (noteError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {noteError}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Notes</h1>
                <div className="space-x-4">
                    <span className="text-gray-600">Welcome, {user.name}!</span>
                    <button
                        onClick={logout}
                        className="text-red-600 hover:text-red-800"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Link
                to="/new"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6"
            >
                Create New Note
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <div
                        key={note._id}
                        className="border rounded-lg overflow-hidden shadow-lg"
                    >
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Last updated: {new Date(note.updatedAt).toLocaleString()}
                            </p>
                            <div className="flex justify-end space-x-2">
                                <Link
                                    to={`/notes/${note._id}`}
                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(note._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center text-gray-600 mt-8">
                    No notes yet. Create one to get started!
                </div>
            )}
        </div>
    );
};

export default NotesList;
