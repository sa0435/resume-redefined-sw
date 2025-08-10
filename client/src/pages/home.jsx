import { useState } from "react";
import { GalaxyBackground } from "@/components/ui/galaxy-background.jsx";
import { SplitText } from "@/components/ui/split-text.jsx";
import { ResumeAnalyzer } from "@/components/resume-analyzer.jsx";
import { AnalysisResults } from "@/components/analysis-results.jsx";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-space-black text-white font-mono overflow-x-hidden">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Navigation Header */}
      <header className="relative z-10 p-6 backdrop-blur-md bg-space-black/20 border-b border-cosmic-purple/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cosmic-purple to-stellar-cyan rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">R</span>
            </div>
            <SplitText
              text="Resume Refine"
              className="text-2xl font-bold bg-gradient-to-r from-cosmic-purple via-stellar-cyan to-galaxy-pink bg-clip-text text-transparent"
              delay={50}
            />
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-cosmic-purple transition-colors">Features</a>
            <a href="#" className="text-gray-300 hover:text-cosmic-purple transition-colors">Pricing</a>
            <a href="#" className="text-gray-300 hover:text-cosmic-purple transition-colors">About</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <SplitText
            text="AI-Powered Resume Analysis"
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cosmic-purple to-stellar-cyan bg-clip-text text-transparent leading-tight"
            delay={30}
          />
          <SplitText
            text="Elevate your career with cosmic intelligence. Get instant feedback, ATS optimization, and personalized improvements."
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
            delay={20}
            splitType="words"
          />
          <button className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cosmic-purple to-stellar-cyan text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cosmic-purple/30 transition-all duration-300 transform hover:scale-105">
            <span>Start Analyzing</span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ResumeAnalyzer
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
          />
          
          {analysisResult && (
            <AnalysisResults
              result={analysisResult}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-12 px-6 backdrop-blur-md bg-space-black/40 border-t border-cosmic-purple/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cosmic-purple to-stellar-cyan rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg font-bold">R</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cosmic-purple to-stellar-cyan bg-clip-text text-transparent">Resume Refine</span>
          </div>
          <p className="text-gray-400 mb-4">Powered by advanced AI to elevate your career prospects</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-cosmic-purple transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cosmic-purple transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cosmic-purple transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}