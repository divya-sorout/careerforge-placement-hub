import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"

import { auth } from "../firebase/firebase"
import { useEffect } from "react"

function Signup() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/dashboard")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage("")

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      setMessage("Account Created Successfully")
      setMessageType("success")

      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)

    } catch (error) {
      console.error(error)
      setMessageType("error")
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">

      <div className="bg-gray-900 shadow-2xl rounded-3xl p-10 w-full max-w-md border border-gray-800">

        <h1 className="text-4xl font-bold text-center text-purple-500">
          Create Account
        </h1>

        <p className="text-center text-gray-400 mt-3">
          Join CareerForge AI
        </p>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
            messageType === "success" ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}>
            {message}
          </div>
        )}

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-4 border border-gray-700 bg-gray-800 text-white rounded-xl outline-none focus:border-purple-500 placeholder-gray-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-4 border border-gray-700 bg-gray-800 text-white rounded-xl outline-none focus:border-purple-500 placeholder-gray-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-semibold transition"
          >
            Signup
          </button>

        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{" "}

          <Link
            to="/login"
            className="text-purple-500 font-semibold hover:text-purple-400 transition"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Signup