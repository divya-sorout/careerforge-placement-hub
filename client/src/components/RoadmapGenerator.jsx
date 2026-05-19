import { useState } from "react"

import axios from "axios"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function RoadmapGenerator() {

  const [role, setRole] = useState("")

  const [roadmap, setRoadmap] = useState("")

  const [loading, setLoading] = useState(false)

  const generateRoadmap = async () => {

    if (!role) {
      alert("Please enter a career role")
      return
    }

    setLoading(true)

    try {

      const prompt = `
      Generate a detailed roadmap for becoming a ${role}.

      Include:
      - skills to learn
      - technologies
      - project ideas
      - interview preparation
      - step-by-step learning path

      Keep it beginner friendly and structured.
      `

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,

        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        }
      )

      const aiRoadmap =
        response.data.candidates[0].content.parts[0].text

      setRoadmap(aiRoadmap)

    } catch (error) {

      console.log(error)

      alert("Error generating roadmap")
    }

    setLoading(false)
  }

  return (
    <div className="mt-16 bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-lg text-white">

      <h2 className="text-4xl font-bold mb-8">
        AI Career Roadmap Generator
      </h2>

      <input
        type="text"
        placeholder="Enter Role (e.g. Frontend Developer)"
        className="w-full border border-gray-700 bg-gray-800 text-white p-5 rounded-2xl outline-none focus:border-purple-500 placeholder-gray-500"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <button
        onClick={generateRoadmap}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition"
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>

      {roadmap && (

        <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-2xl whitespace-pre-line">

          <h3 className="text-2xl font-bold mb-4">
            AI Generated Roadmap
          </h3>

          <div className="prose prose-invert prose-purple max-w-none text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{roadmap}</ReactMarkdown>
          </div>

        </div>
      )}

    </div>
  )
}

export default RoadmapGenerator