import { useRef, useState } from 'react';

export default function RepositoryUploader({ onUpload, loading, error }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const submit = () => {
    if (file) onUpload(file);
  };

  return (
    <div className="bg-dark-panel border border-dark-border rounded-2xl p-8 text-center mb-8 shadow-lg max-w-2xl mx-auto mt-8">
      <p className="text-gray-300 font-medium mb-4">Upload a Python project as a .zip file.</p>
      
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={loading}
        className="block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-500/10 file:text-blue-400
          hover:file:bg-blue-500/20
          cursor-pointer mb-6 mx-auto max-w-md"
      />
      
      <div>
        <button 
          onClick={submit} 
          disabled={!file || loading}
          className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all
            ${!file || loading 
              ? 'bg-blue-500/50 cursor-not-allowed opacity-70' 
              : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
            }`}
        >
          {loading ? 'Analyzing…' : 'Analyze repository'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}