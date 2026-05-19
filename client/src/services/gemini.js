import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = (modelName = "gemini-2.5-flash") => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("API Key is missing. Please add it to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

const callGeminiWithFallback = async (prompt) => {
  try {
    const model = getModel("gemini-2.5-flash");
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error.message.includes("404") || error.message.includes("not found") || error.message.includes("not supported")) {
      console.warn("Gemini 2.5 Flash failed, falling back to gemini-2.5-pro...");
      const model = getModel("gemini-2.5-pro");
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
    throw error;
  }
};

export const analyzeResumeAI = async (resumeText) => {
  try {
    const prompt = `
      You are an expert Career Coach and ATS (Applicant Tracking System) specialist.
      Analyze the following resume text and provide:
      1. A professional summary/score. Please explicitly include "SCORE: X" (where X is a number between 0 and 100) on a new line so it can be extracted programmatically.
      2. Key strengths.
      3. Critical areas for improvement.
      4. Suggestions for missing keywords or sections.
      
      Resume Text:
      ${resumeText}
      
      Format the response with professional emojis and clear headings.
    `;

    return await callGeminiWithFallback(prompt);
  } catch (error) {
    console.error("Gemini AI Error (Resume):", error);
    throw new Error(error.message || "Failed to analyze resume.");
  }
};

export const getInterviewFeedbackAI = async (question, answer) => {
  try {
    const prompt = `
      You are an expert Technical Interviewer.
      Evaluate the candidate's answer to the following interview question:
      
      Question: ${question}
      Candidate's Answer: ${answer}
      
      Provide:
      1. A score out of 10.
      2. What they did well.
      3. What they could improve.
      4. A better sample answer for this question.
      
      Format the response with professional emojis and clear headings.
    `;

    return await callGeminiWithFallback(prompt);
  } catch (error) {
    console.error("Gemini AI Error (Interview):", error);
    throw new Error(error.message || "Failed to get interview feedback.");
  }
};

export const generateInterviewQuestionAI = async (role = "Software Engineer") => {
  try {
    const prompt = `Generate a challenging and relevant interview question for a ${role} position. Only return the question text.`;
    return await callGeminiWithFallback(prompt);
  } catch (error) {
    console.error("Gemini AI Error (Question Gen):", error);
    return "Tell me about a challenging project you worked on."; // Fallback
  }
};

export const generateCompanyPrepAI = async (companyName) => {
  try {
    const prompt = `
      You are an expert Technical Interview Coach.
      Generate a comprehensive interview preparation guide for ${companyName}.
      
      Categorize the questions by topic. For example:
      - Data Structures & Algorithms
      - System Design
      - Core Fundamentals (OS, DBMS, Networks)
      - Behavioral / Leadership Principles
      
      For each topic, provide 2-3 commonly asked interview questions at ${companyName} and a brief approach or answer strategy for each.
      
      Format the response with professional emojis and clear markdown headings.
    `;
    return await callGeminiWithFallback(prompt);
  } catch (error) {
    console.error("Gemini AI Error (Company Prep Gen):", error);
    throw new Error(error.message || "Failed to generate company preparation guide.");
  }
};
