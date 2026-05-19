import { useState } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

function AIStudyPlanner() {
  const [goal, setGoal] = useState("")
  const [timeline, setTimeline] = useState("1 month")
  const [plan, setPlan] = useState("")
  const [loading, setLoading] = useState(false)

  const generatePlan = async () => {
    if (!goal) {
      alert("Please enter your study goal.")
      return
    }

    setLoading(true)
    setPlan("")

    try {
      const prompt = `
      Create a comprehensive study plan for the following goal: "${goal}" over a period of "${timeline}".
      
      You MUST structure your response with these exact sections using markdown:
      
      ## 📝 Daily Plan
      (Provide a breakdown of what a typical day should look like, including time blocks and specific activities)

      ## 🗺️ Weekly Roadmap
      (Provide a week-by-week progression of topics and milestones to achieve)

      ## 🔄 Revision Schedule
      (Provide a strategy for reviewing and retaining information, including spaced repetition or weekend reviews)
      
      Make it highly actionable and specific to the goal.
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

      const generatedPlan = response.data.candidates[0].content.parts[0].text
      setPlan(generatedPlan)
    } catch (error) {
      console.error(error)
      alert("Error generating study plan")
    }

    setLoading(false)
  }

  return (
    <div className="mt-16 bg-gray-900 p-10 rounded-3xl shadow-lg border border-gray-800 text-white">
      <h2 className="text-4xl font-bold mb-8">AI Study Planner</h2>
      <p className="text-gray-400 mb-8 text-lg">
        Generate a personalized Daily Plan, Weekly Roadmap, and Revision Schedule.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <input
          type="text"
          placeholder="What do you want to learn? (e.g., React Native, System Design)"
          className="flex-1 border border-gray-700 bg-gray-800 text-white p-4 rounded-2xl outline-none focus:border-purple-500 placeholder-gray-500"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <select
          className="border border-gray-700 bg-gray-800 text-white p-4 rounded-2xl outline-none focus:border-purple-500"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
        >
          <option value="1 week">1 Week</option>
          <option value="1 month">1 Month</option>
          <option value="3 months">3 Months</option>
          <option value="6 months">6 Months</option>
        </select>
        <button
          onClick={generatePlan}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      {plan && (
        <div className="mt-10 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-inner">
          <div className="prose prose-invert prose-purple max-w-none text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIStudyPlanner
