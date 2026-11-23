export default function Sidebar({ currentPage, setCurrentPage }) {
  const links = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'repository', label: '📁 Repositories' },
    { id: 'reports', label: '📝 Test Reports' },
  ];

  return (
    <div className="w-64 bg-dark-panel border-r border-dark-border flex flex-col shrink-0">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-xl font-bold text-blue-500 m-0 tracking-tight">TestPilot AI</h2>
      </div>
      <nav className="p-4 flex flex-col gap-2">
        {links.map(link => {
          const isActive = currentPage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentPage(link.id)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/15 text-blue-400' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}