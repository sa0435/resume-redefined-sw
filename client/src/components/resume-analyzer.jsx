import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MagicBento } from "@/components/ui/magic-bento.jsx";
import { ClickSpark } from "@/components/ui/click-spark.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Upload, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast.js";
import { apiRequest } from "@/lib/queryClient.js";

export function ResumeAnalyzer({
  onAnalysisStart,
  onAnalysisComplete,
  isAnalyzing,
}) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setResumeText(data.resumeText);
      setUploadedFileName(data.fileName);
      setIsUploading(false);
      toast({
        title: "File Uploaded Successfully!",
        description: `Extracted text from ${data.fileName}. You can now analyze it.`,
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeResumeMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/analyze-resume", data);
      return await response.json();
    },
    onSuccess: (data) => {
      onAnalysisComplete(data);
      if (data.isDemo) {
        toast({
          title: "Demo Analysis Complete!",
          description: `Demo analysis shows ${data.overallScore}/100. This is a sample analysis while AI service is unavailable.`,
        });
      } else {
        toast({
          title: "Analysis Complete!",
          description: `Your resume scored ${data.overallScore}/100. Check out your personalized feedback below.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadFileMutation.mutate(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (resumeText.trim().length < 50) {
      toast({
        title: "Resume Too Short",
        description: "Please enter at least 50 characters of resume content.",
        variant: "destructive",
      });
      return;
    }

    onAnalysisStart();
    analyzeResumeMutation.mutate({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim() || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Resume Upload Card */}
      <MagicBento className="lg:col-span-2 p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-cosmic-purple to-stellar-cyan rounded-xl flex items-center justify-center mr-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-semibold text-white">Upload Resume</h3>
        </div>
        
        <div className="space-y-6">
          {/* File Upload Zone */}
          <div 
            className="border-2 border-dashed border-cosmic-purple/50 rounded-xl p-8 text-center hover:border-cosmic-purple transition-colors duration-300 cursor-pointer relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading || uploadFileMutation.isPending}
            />
            {isUploading || uploadFileMutation.isPending ? (
              <>
                <Loader2 className="w-16 h-16 text-cosmic-purple mx-auto mb-4 animate-spin" />
                <h4 className="text-xl font-semibold text-white mb-2">Processing file...</h4>
                <p className="text-gray-400">Extracting text content</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-cosmic-purple mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Drop your resume here</h4>
                <p className="text-gray-400">or click to select files</p>
                <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, DOCX, and TXT files (max 10MB)</p>
              </>
            )}
            {uploadedFileName && (
              <div className="mt-4 px-4 py-2 bg-cosmic-purple/20 rounded-lg inline-block">
                <p className="text-sm text-stellar-cyan">✓ {uploadedFileName}</p>
              </div>
            )}
          </div>
          
          <div className="text-center text-gray-400">
            <span>— or —</span>
          </div>
          
          <div>
            <Label htmlFor="resume-text" className="text-lg font-medium text-white mb-3 block">
              Paste Resume Text
            </Label>
            <Textarea
              id="resume-text"
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-48 bg-space-black/50 backdrop-blur-sm border-cosmic-purple/30 text-white placeholder-gray-400 focus:border-cosmic-purple focus:ring-cosmic-purple/20 resize-none font-mono"
            />
          </div>
        </div>
      </MagicBento>

      {/* Job Description Card */}
      <MagicBento className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-stellar-cyan to-galaxy-pink rounded-lg flex items-center justify-center mr-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-semibold text-white">Target Job</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-description" className="text-sm font-medium text-white mb-2 block">
              Job Description (Optional)
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste job description for targeted analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="h-32 bg-space-black/50 backdrop-blur-sm border-stellar-cyan/30 text-white placeholder-gray-400 focus:border-stellar-cyan focus:ring-stellar-cyan/20 resize-none text-sm font-mono"
            />
          </div>
          
          <ClickSpark
            sparkColor="#06b6d4"
            sparkCount={12}
            sparkRadius={20}
            duration={600}
          >
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || analyzeResumeMutation.isPending}
              className="w-full bg-gradient-to-r from-stellar-cyan to-galaxy-pink hover:from-stellar-cyan/80 hover:to-galaxy-pink/80 text-white font-medium shadow-lg hover:shadow-stellar-cyan/30 transition-all duration-300 transform hover:scale-105"
            >
              {isAnalyzing || analyzeResumeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </ClickSpark>
        </div>
      </MagicBento>
    </div>
  );
}