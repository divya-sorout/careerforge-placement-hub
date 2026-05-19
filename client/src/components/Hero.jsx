import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

function Hero() {
  const navigate = useNavigate()

  const scrollToFeatures = () => {
    document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-gray-900 to-black text-white">

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-7xl font-extrabold leading-tight"
      >
        Crack Placements with <br />

        <span className="text-purple-500">
          CareerForge AI
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-xl text-gray-400 max-w-3xl"
      >
        AI-powered placement preparation platform featuring
        resume analysis, DSA tracking, mock interviews,
        company-wise preparation, and smart career guidance.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex gap-5"
      >

        <button 
          onClick={() => navigate('/login')} 
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition"
        >
          Get Started
        </button>

        <button 
          onClick={scrollToFeatures} 
          className="border border-gray-700 hover:border-purple-500 hover:text-purple-400 px-8 py-4 rounded-2xl text-lg font-semibold transition"
        >
          Learn More
        </button>

      </motion.div>

    </section>
  )
}

export default Hero