import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Wonders = lazy(() => import('./pages/Wonders'))
const Galaxies = lazy(() => import('./pages/Galaxies'))
const Learning = lazy(() => import('./pages/Learning'))

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense 
        fallback={
          <div className="min-h-screen nebula-bg flex justify-center items-center pt-20">
            <div className="glass-effect rounded-2xl p-8 border-gradient text-center">
              <div className="text-6xl mb-4 animate-pulse">🚀</div>
              <p className="text-xl text-gray-300">正在加载宇宙探索...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wonders" element={<Wonders />} />
          <Route path="/galaxies" element={<Galaxies />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App