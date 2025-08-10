import { useState } from "react";
import { MagicBento } from "@/components/ui/magic-bento.jsx";
import { CosmicProgress } from "@/components/ui/cosmic-progress.jsx";
import { ClickSpark } from "@/components/ui/click-spark.jsx";
import { SplitText } from "@/components/ui/split-text.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  Target, 
  FileText,
  Download,
  TrendingUp,
  Star
} from "lucide-react";

export function AnalysisResults({ result }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 85) return { color: "rgb(34, 197, 94)", name: "green" };
    if (score >= 70) return { color: "rgb(245, 158, 11)", name: "yellow" };
    return { color: "rgb(239, 68, 68)", name: "red" };
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <AlertTriangle className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const feedbackCategories = [
    {
      key: "grammar",
      title: "Grammar & Style",
      icon: <CheckCircle className="w-4 h-4" />,
      data: result.feedback.grammar,
    },
    {
      key: "ats",
      title: "ATS Keywords",
      icon: <Target className="w-4 h-4" />,
      data: result.feedback.ats,
    },
    {
      key: "formatting",
      title: "Formatting",
      icon: <FileText className="w-4 h-4" />,
      data: result.feedback.formatting,
    },
    {
      key: "content",
      title: "Content Quality",
      icon: <Star className="w-4 h-4" />,
      data: result.feedback.content,
    },
    {
      key: "skills",
      title: "Skills Match",
      icon: <Lightbulb className="w-4 h-4" />,
      data: result.feedback.skills,
    },
    {
      key: "experience",
      title: "Experience",
      icon: <TrendingUp className="w-4 h-4" />,
      data: result.feedback.experience,
    },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple text file with analysis results
    const analysisText = `Resume Analysis Results\n\nOverall Score: ${result.overallScore}/100\n\nDetailed Feedback:\n${feedbackCategories.map(cat => 
      `\n${cat.title}: ${cat.data.score}/100\nSummary: ${cat.data.summary}\nSuggestions: ${cat.data.suggestions.join(", ")}`
    ).join("\n")}\n\nGenerated on: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([analysisText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
      {/* Overall Score Card */}
      <MagicBento className="p-8">
        <div className="text-center mb-8">
          <SplitText
            text="Resume Analysis Complete"
            className="text-3xl font-bold text-white mb-4"
            delay={50}
          />
          <div className="flex justify-center mb-6">
            <CosmicProgress
              value={result.overallScore}
              size={120}
              animated={true}
            />
          </div>
          <SplitText
            text="Your resume shows strong potential with room for strategic improvements"
            className="text-lg text-gray-300"
            delay={30}
            splitType="words"
          />
        </div>
      </MagicBento>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbackCategories.map((category, index) => {
          const scoreColor = getScoreColor(category.data.score);
          
          return (
            <ClickSpark
              key={category.key}
              sparkColor={scoreColor.color}
              sparkCount={6}
              sparkRadius={12}
              duration={500}
            >
              <MagicBento 
                className="p-6 cursor-pointer h-full"
                glowColor={scoreColor.color.replace("rgb(", "").replace(")", "")}
              >
                <div className="flex items-center mb-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: scoreColor.color }}
                  >
                    {getScoreIcon(category.data.score)}
                  </div>
                  <h3 className="font-semibold text-white">{category.title}</h3>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Score</span>
                    <span style={{ color: scoreColor.color }}>
                      {category.data.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        background: `linear-gradient(90deg, ${scoreColor.color}, ${scoreColor.color}80)`,
                        width: `${category.data.score}%` 
                      }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-300">{category.data.summary}</p>
              </MagicBento>
            </ClickSpark>
          );
        })}
      </div>

      {/* Detailed Improvements */}
      <MagicBento className="p-8">
        <SplitText
          text="AI-Generated Improvements"
          className="text-2xl font-bold text-white mb-6 flex items-center"
          delay={50}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended Changes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-stellar-cyan mb-4">Recommended Changes</h3>
            
            {result.feedback.improvements.slice(0, 5).map((improvement, index) => (
              <div key={index} className="bg-space-black/50 rounded-lg p-4 border border-cosmic-purple/20">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cosmic-purple rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white mb-1">{improvement.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{improvement.description}</p>
                    {improvement.before && improvement.after && (
                      <div className="text-xs text-gray-500">
                        <span className="line-through">{improvement.before}</span>
                        <br />
                        <span className="text-green-400">→ {improvement.after}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Trending Skills */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-galaxy-pink mb-4">Trending Skills to Add</h3>
            
            <div className="bg-space-black/50 rounded-lg p-4 border border-galaxy-pink/20">
              <h4 className="font-medium text-white mb-3">High-Demand Skills</h4>
              <div className="space-y-2">
                {result.feedback.trendingSkills
                  .filter(skill => skill.category === 'technical')
                  .slice(0, 5)
                  .map((skill, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{skill.skill}</span>
                      <Badge variant="outline" className="text-galaxy-pink border-galaxy-pink/30">
                        {skill.relevance}% match
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-space-black/50 rounded-lg p-4 border border-stellar-cyan/20">
              <h4 className="font-medium text-white mb-3">Soft Skills Enhancement</h4>
              <div className="space-y-2">
                {result.feedback.trendingSkills
                  .filter(skill => skill.category === 'soft')
                  .slice(0, 3)
                  .map((skill, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      • {skill.skill}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </MagicBento>

      {/* Download Section */}
      <div className="text-center">
        <ClickSpark
          sparkColor="#ec4899"
          sparkCount={16}
          sparkRadius={25}
          duration={800}
        >
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-8 py-4 bg-gradient-to-r from-cosmic-purple via-stellar-cyan to-galaxy-pink hover:from-cosmic-purple/80 hover:via-stellar-cyan/80 hover:to-galaxy-pink/80 text-white font-semibold rounded-xl shadow-lg hover:shadow-cosmic-purple/30 transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            {isDownloading ? "Generating..." : "Download Analysis Report"}
          </Button>
        </ClickSpark>
        <p className="text-sm text-gray-400 mt-2">
          AI-enhanced report with all improvements and suggestions
        </p>
      </div>
    </div>
  );
}