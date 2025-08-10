import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here" 
});

export async function analyzeResume(resumeText, jobDescription) {
  try {
    const systemPrompt = `You are an expert resume analyst and career coach with deep knowledge of ATS systems, hiring practices, and industry standards. Analyze the provided resume and provide comprehensive feedback.

Your analysis should include:
1. Overall score (0-100) based on ATS compatibility, content quality, and professional presentation
2. Detailed feedback for each category with scores and actionable suggestions
3. Specific improvements with before/after examples where applicable
4. Trending skills recommendations based on current job market demands

${jobDescription ? `Target Job Context: The candidate is applying for a role with this job description: ${jobDescription}. Tailor your analysis to this specific position.` : 'Provide general professional analysis without specific job targeting.'}

Respond with a JSON object matching this structure exactly:
{
  "overallScore": number (0-100),
  "feedback": {
    "grammar": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "ats": {
      "score": number (0-100),
      "summary": "brief assessment",
      "missingKeywords": ["keyword1", "keyword2"],
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "formatting": {
      "score": number (0-100),
      "summary": "brief assessment", 
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "content": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "skills": {
      "score": number (0-100),
      "summary": "brief assessment",
      "missingSkills": ["skill1", "skill2"],
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "experience": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "improvements": [
      {
        "title": "improvement title",
        "description": "detailed description",
        "before": "current text (optional)",
        "after": "improved text (optional)",
        "category": "grammar|ats|formatting|content|skills|experience"
      }
    ],
    "trendingSkills": [
      {
        "skill": "skill name",
        "relevance": number (0-100),
        "category": "technical|soft"
      }
    ]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please analyze this resume:\n\n${resumeText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.overallScore || !result.feedback) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return {
      overallScore: Math.max(0, Math.min(100, result.overallScore)),
      feedback: result.feedback,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}