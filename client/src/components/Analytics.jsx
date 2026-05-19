import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import { topicsData as importedTopicsData } from "./DSATracker"
import { motion } from "framer-motion"

function Analytics() {

  const [progress, setProgress] = useState({})
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    const docRef = doc(db, "dsaProgress", user.uid)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data())
      }
    })
    return () => unsubscribe()
  }, [user])

  const topicData = importedTopicsData.map(topic => ({
    topic: topic.name === "Dynamic Programming" ? "DP" : topic.name,
    solved: progress[topic.name] || 0
  }))

  const totalSolved = importedTopicsData.reduce((acc, topic) => acc + (progress[topic.name] || 0), 0)
  const totalQuestions = importedTopicsData.reduce((acc, topic) => acc + topic.total, 0)

  const pieData = [
    { name: "Solved", value: totalSolved },
    { name: "Remaining", value: totalQuestions - totalSolved > 0 ? totalQuestions - totalSolved : 0 }
  ]

  const COLORS = ["#9333ea", "#374151"]

  return (
    <div className="mt-16 text-white">

      <h2 className="text-4xl font-bold mb-10">
        Analytics Dashboard
      </h2>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* Bar Chart */}

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/60 backdrop-blur-md border border-gray-800/50 p-8 rounded-3xl shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
        >

          <h3 className="text-2xl font-bold mb-6">
            Topic Progress
          </h3>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={topicData}>

              <XAxis dataKey="topic" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="solved"
                fill="#9333ea"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </motion.div>

        {/* Pie Chart */}

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-md border border-gray-800/50 p-8 rounded-3xl shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
        >

          <h3 className="text-2xl font-bold mb-6">
            Overall Progress
          </h3>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >

                {pieData.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </motion.div>

      </div>

    </div>
  )
}

export default Analytics