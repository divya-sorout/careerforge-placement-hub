import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { auth } from "../firebase/firebase"
import { onAuthStateChanged } from "firebase/auth"

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoute