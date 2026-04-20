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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="flex justify-center items-center h-64">加载中...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wonders" element={<Wonders />} />
            <Route path="/galaxies" element={<Galaxies />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default App