export function createDemoAnalysis(resumeText) {
  // Simulate analysis based on resume length and content
  const wordCount = resumeText.split(/\s+/).length;
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeText);
  const hasSkills = /skills?|technologies?|programming|software/i.test(resumeText);
  const hasExperience = /experience|work|job|position|company/i.test(resumeText);

  // Calculate base score
  let baseScore = 60;
  if (wordCount > 200) baseScore += 10;
  if (wordCount > 400) baseScore += 5;
  if (hasEmail) baseScore += 5;
  if (hasPhone) baseScore += 5;
  if (hasSkills) baseScore += 10;
  if (hasExperience) baseScore += 5;

  const overallScore = Math.min(92, baseScore);

  const feedback = {
    grammar: {
      score: Math.min(95, baseScore + 10),
      summary: "Good grammar and writing style with room for minor improvements",
      suggestions: [
        "Consider using more action verbs to start bullet points",
        "Ensure consistent verb tenses throughout the document"
      ]
    },
    ats: {
      score: Math.min(88, baseScore + 5),
      summary: "Resume contains relevant keywords but could be optimized further",
      missingKeywords: ["project management", "data analysis", "team leadership"],
      suggestions: [
        "Include more industry-specific keywords",
        "Add technical skills section with relevant technologies"
      ]
    },
    formatting: {
      score: Math.min(90, baseScore + 8),
      summary: "Clean and professional formatting with good structure",
      suggestions: [
        "Consider using bullet points for better readability",
        "Ensure consistent spacing and alignment"
      ]
    },
    content: {
      score: Math.min(87, baseScore + 3),
      summary: "Strong content with quantifiable achievements",
      suggestions: [
        "Add more specific metrics and numbers to achievements",
        "Include relevant projects or portfolio items"
      ]
    },
    skills: {
      score: Math.min(85, baseScore),
      summary: "Good skills representation with room for expansion",
      missingSkills: ["Cloud Computing", "Machine Learning", "Agile Methodologies"],
      suggestions: [
        "Add trending technical skills relevant to your field",
        "Include both hard and soft skills"
      ]
    },
    experience: {
      score: Math.min(89, baseScore + 7),
      summary: "Well-documented experience with clear progression",
      suggestions: [
        "Use STAR method to describe achievements",
        "Quantify impact with specific numbers and metrics"
      ]
    },
    improvements: [
      {
        title: "Quantify Achievements",
        description: "Add specific numbers and metrics to demonstrate impact",
        before: "Improved team productivity",
        after: "Improved team productivity by 25% through process optimization",
        category: "content"
      },
      {
        title: "Add Technical Skills",
        description: "Include a dedicated technical skills section",
        category: "skills"
      },
      {
        title: "Optimize Keywords",
        description: "Include more industry-specific keywords for ATS compatibility",
        category: "ats"
      },
      {
        title: "Action Verbs",
        description: "Start bullet points with strong action verbs",
        before: "Was responsible for managing projects",
        after: "Managed cross-functional projects delivering results on time",
        category: "grammar"
      },
      {
        title: "Contact Information",
        description: "Ensure all contact information is current and professional",
        category: "formatting"
      }
    ],
    trendingSkills: [
      { skill: "Cloud Computing (AWS/Azure)", relevance: 92, category: "technical" },
      { skill: "Data Analysis", relevance: 88, category: "technical" },
      { skill: "Project Management", relevance: 85, category: "soft" },
      { skill: "Machine Learning", relevance: 82, category: "technical" },
      { skill: "Agile Methodologies", relevance: 80, category: "soft" },
      { skill: "Python Programming", relevance: 78, category: "technical" },
      { skill: "Leadership", relevance: 85, category: "soft" },
      { skill: "Communication", relevance: 90, category: "soft" }
    ]
  };

  return { overallScore, feedback };
}