import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveNote } from '../store/notesSlice';

const NewNote = () => {
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
            
            await dispatch(saveNote({
                data: {
                    title: title.trim(),
                    content: '',
                    lines: [],
                    textElements: [],
                    stagePosition: { x: 0, y: 0 },
                    stageScale: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            })).unwrap();
            navigate('/notes');
        } catch (err) {
            console.error('Error creating note:', err);
            setError(err.response?.data?.error || 'Failed to create note');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Note Title"
                    className="text-xl font-semibold w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 text-white font-medium rounded-lg transition-colors
                        ${isLoading 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                        </span>
                    ) : 'Create Note'}
                </button>
            </div>
        </div>
    );
};

export default NewNote;
