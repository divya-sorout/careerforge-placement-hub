import { useState } from "react"
import { generateCompanyPrepAI } from "../services/gemini"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CompanyPrepHub() {

  const [company, setCompany] = useState("")
  const [prepData, setPrepData] = useState("")
  const [loading, setLoading] = useState(false)

  const generatePrepGuide = async () => {
    if (!company.trim()) {
      alert("Please enter a company name")
      return
    }

    setLoading(true)
    setPrepData("")

    try {
      const guide = await generateCompanyPrepAI(company)
      setPrepData(guide)
    } catch (error) {
      alert("Error generating prep guide: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16 bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-lg text-white">

      <h2 className="text-4xl font-bold mb-8">
        Company-wise Interview Prep Hub 🏢
      </h2>

      <p className="text-gray-400 mb-6 text-lg">
        Enter a company name to generate topic-wise interview questions and answer strategies.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="e.g., Google, Netflix, Amazon"
          className="flex-1 border border-gray-700 bg-gray-800 text-white p-5 rounded-2xl outline-none focus:border-purple-500 placeholder-gray-500 text-lg"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generatePrepGuide()}
        />

        <button
          onClick={generatePrepGuide}
          className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-2xl transition disabled:opacity-50 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Guide"}
        </button>
      </div>

      {prepData && (
        <div className="mt-8 bg-gray-800 border border-gray-700 p-8 rounded-2xl whitespace-pre-line overflow-hidden">
          <h3 className="text-2xl font-bold mb-6 text-purple-400">
            {company} Interview Preparation Guide
          </h3>
          <div className="text-lg text-gray-300 leading-relaxed space-y-4 prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-purple">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{prepData}</ReactMarkdown>
          </div>
        </div>
      )}

    </div>
  )
}

export default CompanyPrepHub
