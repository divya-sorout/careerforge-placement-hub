import { useState } from "react"
import { analyzeResumeAI } from "../services/gemini"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import { motion } from "framer-motion"

import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function ResumeAnalyzer() {

  const [resumeText, setResumeText] = useState("")

  const [analysis, setAnalysis] = useState("")

  const [loading, setLoading] = useState(false)

  // Extract Text From PDF

  const handleFileUpload = async (e) => {

    const file = e.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = async function () {

      const typedArray = new Uint8Array(this.result)

      const pdf = await pdfjsLib.getDocument(typedArray).promise

      let extractedText = ""

      for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i)

        const textContent = await page.getTextContent()

        const pageText = textContent.items
          .map(item => item.str)
          .join(" ")

        extractedText += pageText + "\n"
      }

      setResumeText(extractedText)
    }

    reader.readAsArrayBuffer(file)
  }

  // Analyze Resume

  const analyzeResume = async () => {

    if (!resumeText) {
      alert("Please upload a resume")
      return
    }

    setLoading(true)

    try {
      const feedback = await analyzeResumeAI(resumeText)
      setAnalysis(feedback)

      const scoreMatch = feedback.match(/SCORE:\s*(\d+)/i)
      let score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      const currentUser = auth.currentUser
      if (currentUser && score > 0) {
        const userMetricsRef = doc(db, "userMetrics", currentUser.uid);
        const docSnap = await getDoc(userMetricsRef);
        if (docSnap.exists()) {
          await updateDoc(userMetricsRef, {
            resumeScore: score
          });
        } else {
          await setDoc(userMetricsRef, {
            mockInterviews: 0,
            resumeScore: score
          });
        }
      }
    } catch (error) {
      alert("Error analyzing resume: " + error.message)
    }

    setLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 p-10 rounded-3xl shadow-lg text-white hover:shadow-purple-500/10 transition-all duration-300"
    >

      <h2 className="text-4xl font-bold mb-8">
        AI Resume Analyzer
      </h2>

      {/* Upload PDF */}

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="mb-6 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
      />

      {/* Extracted Resume */}

      <textarea
        rows="10"
        className="w-full border border-gray-700 bg-gray-800/50 text-gray-300 p-5 rounded-2xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
        value={resumeText}
        readOnly
      />

      <button
        onClick={analyzeResume}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:active:scale-100"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {analysis && (

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-gray-800/80 border border-gray-700/50 p-6 rounded-2xl whitespace-pre-line backdrop-blur-md"
        >

          <h3 className="text-2xl font-bold mb-4 text-white">
            Analysis Result
          </h3>

          <div className="prose prose-invert prose-purple max-w-none text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>

        </motion.div>
      )}

    </motion.div>
  )
}

export default ResumeAnalyzer