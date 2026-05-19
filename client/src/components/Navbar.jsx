import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { auth, db } from "../firebase/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore"
import { FaFire, FaHome, FaSignInAlt, FaUserPlus } from "react-icons/fa"

function Navbar() {
  const [user, setUser] = useState(null)
  const [streak, setStreak] = useState(0)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

  const updateUserStreak = async (currentUser) => {
    if (!currentUser) return;
    const metricsRef = doc(db, "userMetrics", currentUser.uid);
    try {
      const docSnap = await getDoc(metricsRef);
      const today = new Date().toISOString().split('T')[0];
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastLoginDate = data.lastLoginDate;
        let currentStreak = data.streak !== undefined ? data.streak : 0;
        
        if (lastLoginDate !== today) {
          if (lastLoginDate) {
            const lastDate = new Date(lastLoginDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              currentStreak += 1;
            } else if (diffDays > 1) {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          await setDoc(metricsRef, { lastLoginDate: today, streak: currentStreak }, { merge: true });
        }
      } else {
        await setDoc(metricsRef, { streak: 1, lastLoginDate: today }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthLoading(false)
      if (currentUser) {
        updateUserStreak(currentUser);
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const metricsRef = doc(db, "userMetrics", user.uid)
    const unsubscribe = onSnapshot(metricsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().streak !== undefined) {
        setStreak(docSnap.data().streak)
      } else {
        setStreak(0)
      }
    })
    return () => unsubscribe()
  }, [user])
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-black text-white shadow-md sticky top-0 z-50 border-b border-gray-800">

      <Link to="/" className="text-3xl font-bold text-purple-500 hover:text-purple-400 transition">
        CareerForge AI
      </Link>

      <div className="hidden md:flex gap-8 text-lg font-medium text-gray-300 items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 hover:text-purple-400 transition-all shadow-sm backdrop-blur-sm"
        >
          <FaHome className="text-xl mb-0.5" />
          <span className="font-semibold">Home</span>
        </Link>

        {user && location.pathname !== "/" && (
          <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm border border-orange-500/20">
            <FaFire className="text-lg animate-pulse" />
            <span>{streak} Day Streak</span>
          </div>
        )}

        {!isAuthLoading && !user && (
          <>
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 hover:text-purple-400 transition-all shadow-sm backdrop-blur-sm"
            >
              <FaSignInAlt className="text-xl mb-0.5" />
              <span className="font-semibold">Login</span>
            </Link>

            <Link 
              to="/signup" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 hover:text-purple-400 transition-all shadow-sm backdrop-blur-sm"
            >
              <FaUserPlus className="text-xl mb-0.5" />
              <span className="font-semibold">Signup</span>
            </Link>
          </>
        )}

      </div>

      {!isAuthLoading ? (
        !user ? (
          <Link
            to="/signup"
            className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        ) : location.pathname === "/" ? (
          <Link
            to="/dashboard"
            className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Go to Dashboard
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition"
          >
            Logout
          </button>
        )
      ) : (
        <div className="w-24"></div>
      )}

    </nav>
  )
}

export default Navbar