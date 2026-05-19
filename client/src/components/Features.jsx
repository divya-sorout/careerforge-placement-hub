import {
  FaRobot,
  FaCode,
  FaFileAlt,
  FaChartLine
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"

function Features() {
  const navigate = useNavigate()
  const features = [
    {
      icon: <FaRobot size={40} />,
      title: "AI Mock Interviews",
      desc: "Practice HR & technical interviews with AI."
    },

    {
      icon: <FaCode size={40} />,
      title: "DSA Tracker",
      desc: "Track coding progress company-wise."
    },

    {
      icon: <FaFileAlt size={40} />,
      title: "Resume Analyzer",
      desc: "Improve ATS score using AI suggestions."
    },

    {
      icon: <FaChartLine size={40} />,
      title: "Progress Dashboard",
      desc: "Visualize preparation and performance."
    }
  ]

  return (
    <section id="features-section" className="py-24 px-8 bg-black text-white">

      <h2 className="text-5xl font-bold text-center mb-16">
        Features
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

        {features.map((feature, index) => (
          <div
            key={index}
            onClick={() => navigate('/login')}
            className="p-8 rounded-3xl bg-gray-900 border border-gray-800 shadow-lg hover:shadow-purple-900/50 transition cursor-pointer"
          >

            <div className="text-purple-500 mb-5">
              {feature.icon}
            </div>

            <h3 className="text-2xl font-bold mb-3">
              {feature.title}
            </h3>

            <p className="text-gray-400">
              {feature.desc}
            </p>

          </div>
        ))}

      </div>

    </section>
  )
}

export default Features