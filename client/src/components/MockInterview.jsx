import { useState, useRef, useEffect } from "react"
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa"

import axios from "axios"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import { motion } from "framer-motion"

function MockInterview() {

  const [question, setQuestion] = useState("")

  const [answer, setAnswer] = useState("")

  const [feedback, setFeedback] = useState("")

  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(isMuted)

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  if (recognition) {
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let currentTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      setAnswer((prev) => prev + " " + currentTranscript.trim())
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
      setIsListening(false)
    } else {
      recognition?.start()
      setIsListening(true)
    }
  }

  const speakText = (text) => {
    if (isMutedRef.current) return
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel() // Stop any current speech
      // Remove special characters and symbols (*, #, ?, ", etc.) so they aren't spoken aloud
      const cleanText = text.replace(/[^a-zA-Z0-9\s.,']/g, '')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Generate AI Interview Question

  const startInterview = async () => {

    setLoading(true)

    try {

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,

        {
          contents: [
            {
              parts: [
                {
                  text:
                    "Generate one technical or HR interview question for a software engineering student."
                }
              ]
            }
          ]
        }
      )

      const generatedQuestion =
        response.data.candidates[0].content.parts[0].text

      setQuestion(generatedQuestion)
      setAnswer("")
      setFeedback("")

      // Read the question aloud
      speakText(generatedQuestion)

    } catch (error) {

      console.log(error)

      alert("Error generating question")
    }

    setLoading(false)
  }

  // Analyze Candidate Answer

  const submitAnswer = async () => {

    if (!answer) {
      alert("Please enter your answer")
      return
    }

    setLoading(true)

    try {

      const prompt = `
      Interview Question:
      ${question}

      Candidate Answer:
      ${answer}

      Give professional interview feedback.

      Mention:
      - confidence
      - clarity
      - technical quality
      - improvements

      Keep response concise.
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

      const aiFeedback =
        response.data.candidates[0].content.parts[0].text

      setFeedback(aiFeedback)

      const currentUser = auth.currentUser
      if (currentUser) {
        const userMetricsRef = doc(db, "userMetrics", currentUser.uid);
        const docSnap = await getDoc(userMetricsRef);
        if (docSnap.exists()) {
          await updateDoc(userMetricsRef, {
            mockInterviews: (docSnap.data().mockInterviews || 0) + 1
          });
        } else {
          await setDoc(userMetricsRef, {
            mockInterviews: 1,
            resumeScore: 0
          });
        }
      }

    } catch (error) {

      console.log(error)

      alert("Error analyzing answer")
    }

    setLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 bg-gray-900/60 backdrop-blur-md p-10 rounded-3xl shadow-lg border border-gray-800/50 text-white hover:shadow-purple-500/10 transition-all duration-300"
    >

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold">
          AI Mock Interview Bot
        </h2>
        <button
          onClick={() => {
            if (!isMuted && "speechSynthesis" in window) {
              window.speechSynthesis.cancel()
            }
            setIsMuted(!isMuted)
          }}
          className="text-gray-400 hover:text-white transition text-3xl p-2 rounded-full hover:bg-gray-800"
          title={isMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      <button
        onClick={startInterview}
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-md shadow-purple-500/20"
      >
        {loading ? "Loading..." : "Start AI Interview"}
      </button>

      {question && (

        <div className="mt-8">

          <h3 className="text-2xl font-bold">
            Question:
          </h3>

          <div className="mt-3 text-xl text-gray-300 prose prose-invert prose-purple max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{question}</ReactMarkdown>
          </div>

          <textarea
            rows="7"
            placeholder="Type your answer or use the microphone..."
            className="w-full border border-gray-700 bg-gray-800/50 text-white p-5 rounded-2xl outline-none mt-6 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-500"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={submitAnswer}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-md shadow-purple-500/20"
            >
              {loading ? "Analyzing..." : "Submit Answer"}
            </button>

            {recognition && (
              <button
                onClick={toggleListening}
                className={`px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-md text-white font-semibold ${isListening ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
              >
                {isListening ? "⏹ Stop Listening" : "🎤 Voice Answer"}
              </button>
            )}
          </div>

        </div>
      )}

      {feedback && (

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-gray-800/80 p-6 rounded-2xl whitespace-pre-line border border-gray-700/50 backdrop-blur-md"
        >

          <h3 className="text-2xl font-bold mb-4 text-white">
            AI Feedback
          </h3>

          <div className="prose prose-invert prose-purple max-w-none text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
          </div>

        </motion.div>
      )}

    </motion.div>
  )
}

export default MockInterview