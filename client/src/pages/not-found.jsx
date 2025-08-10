export default function NotFound() {
  return (
    <div className="min-h-screen bg-space-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cosmic-purple to-stellar-cyan bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cosmic-purple to-stellar-cyan text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}