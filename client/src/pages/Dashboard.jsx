import DSATracker from "../components/DSATracker"
import ResumeAnalyzer from "../components/ResumeAnalyzer"
import MockInterview from "../components/MockInterview"
import Analytics from "../components/Analytics"
import { useNavigate } from "react-router-dom"
import RoadmapGenerator from "../components/RoadmapGenerator"
import CompanyPrepHub from "../components/CompanyPrepHub"
import AIStudyPlanner from "../components/AIStudyPlanner"
import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import { topicsData } from "../components/DSATracker"
import { motion } from "framer-motion"

function Dashboard() {

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [progress, setProgress] = useState({})
  const [metrics, setMetrics] = useState({ mockInterviews: 0, resumeScore: 0 })
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    const docRef = doc(db, "dsaProgress", user.uid)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data())
      }
    })
    
    const metricsRef = doc(db, "userMetrics", user.uid)
    const unsubscribeMetrics = onSnapshot(metricsRef, (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data())
      }
    })

    return () => {
      unsubscribe()
      unsubscribeMetrics()
    }
  }, [user])

  const totalSolved = topicsData.reduce((acc, topic) => acc + (progress[topic.name] || 0), 0)
  const totalQuestions = topicsData.reduce((acc, topic) => acc + topic.total, 0)
  const dsaProgressPercentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex">

      {/* Sidebar */}

      <div className="w-64 bg-gray-900 border-r border-gray-800 shadow-lg p-6 flex flex-col h-screen sticky top-0">

        <div className="space-y-5">

          {[
            "Dashboard",
            "Resume Analyzer",
            "Mock Interviews",
            "Company Prep Hub",
            "AI Study Planner",
            "Roadmap Generator"
          ].map((tab) => (
            <p
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-medium cursor-pointer transition ${
                activeTab === tab ? "text-purple-500 font-bold" : "text-gray-300 hover:text-purple-400"
              }`}
            >
              {tab}
            </p>
          ))}

        </div>

      </div>

      {/* Main Content */}

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-bold text-white">
          Welcome to Dashboard 🚀
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Track your placement preparation journey.
        </p>

        {/* Conditionally Render Content */}
        
        {activeTab === "Dashboard" && (
          <>
            {/* Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12"
            >

              <motion.div variants={itemVariants} className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-800/50 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white">
                  DSA Progress
                </h2>

                <p className="text-5xl font-bold text-purple-500 mt-5">
                  {dsaProgressPercentage}%
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-800/50 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white">
                  Mock Interviews
                </h2>

                <p className="text-5xl font-bold text-purple-400 mt-5">
                  {metrics.mockInterviews || 0}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-800/50 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white">
                  Resume Score
                </h2>

                <p className="text-5xl font-bold text-purple-300 mt-5">
                  {metrics.resumeScore || 0}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-800/50 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white">
                  Problems Solved
                </h2>

                <p className="text-5xl font-bold text-purple-600 mt-5">
                  {totalSolved}
                </p>
              </motion.div>

            </motion.div>
            
            <Analytics />
            <DSATracker />
          </>
        )}

        {activeTab === "Resume Analyzer" && <ResumeAnalyzer />}
        {activeTab === "Mock Interviews" && <MockInterview />}
        {activeTab === "Company Prep Hub" && <CompanyPrepHub />}
        {activeTab === "AI Study Planner" && <AIStudyPlanner />}
        {activeTab === "Roadmap Generator" && <RoadmapGenerator />}

      </div>

    </div>
  )
}

export default Dashboard