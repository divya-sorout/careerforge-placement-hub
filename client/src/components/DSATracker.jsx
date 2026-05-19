import { useEffect, useState } from "react"

import {
  doc,
  onSnapshot,
  setDoc,
  getDoc
} from "firebase/firestore"

import { auth, db } from "../firebase/firebase"
import { motion } from "framer-motion"

export const topicsData = [
  { name: "Arrays", total: 100 },
  { name: "Strings", total: 80 },
  { name: "Linked List", total: 60 },
  { name: "Trees", total: 90 },
  { name: "Graphs", total: 70 },
  { name: "Dynamic Programming", total: 100 }
]

function DSATracker() {

  const [progress, setProgress] = useState({})

  const user = auth.currentUser

  // Fetch Data From Firestore

  useEffect(() => {
    if (!user) return
    const docRef = doc(db, "dsaProgress", user.uid)

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data())
      } else {
        const initialData = {
          Arrays: 0,
          Strings: 0,
          "Linked List": 0,
          Trees: 0,
          Graphs: 0,
          "Dynamic Programming": 0
        }
        setProgress(initialData)
        await setDoc(docRef, initialData)
      }
    })

    return () => unsubscribe()

  }, [user])

  // Increase Progress

  const increaseProgress = async (topic) => {

    const updatedProgress = {
      ...progress,
      [topic]: progress[topic] + 1
    }

    setProgress(updatedProgress)

    await setDoc(
      doc(db, "dsaProgress", user.uid),
      updatedProgress
    )
  }

  return (
    <div className="mt-14 text-white">

      <h2 className="text-4xl font-bold mb-10">
        DSA Progress Tracker
      </h2>

      <div className="grid md:grid-cols-2 gap-8">

        {topicsData.map((topic, index) => {

          const solved = progress[topic.name] || 0

          const percentage =
            Math.min(
              (solved / topic.total) * 100,
              100
            )

          return (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-800/50 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300"
            >

              <div className="flex justify-between items-center">

                <h3 className="text-2xl font-bold">
                  {topic.name}
                </h3>

                <span className="text-lg font-semibold text-purple-400">
                  {solved}/{topic.total}
                </span>

              </div>

              {/* Progress Bar */}

              <div className="w-full bg-gray-800 rounded-full h-4 mt-6 overflow-hidden">

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-purple-600 h-4 rounded-full"
                ></motion.div>

              </div>

              <button
                onClick={() => increaseProgress(topic.name)}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl transition-all duration-300 active:scale-95"
              >
                Mark Problem Solved
              </button>

            </motion.div>
          )
        })}

      </div>

    </div>
  )
}

export default DSATracker