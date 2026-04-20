import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: '🌍 首页', icon: '🌍' },
    { path: '/wonders', label: '✨ 奇观', icon: '✨' },
    { path: '/galaxies', label: '🌌 星系', icon: '🌌' },
    { path: '/learning', label: '📚 学习', icon: '📚' },
    { path: '/about', label: 'ℹ️ 关于', icon: 'ℹ️' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-700/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl shadow-lg neon-glow">
              🌌
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-['Orbitron']">
              宇宙探索
            </span>
          </Link>
          
          {/* 桌面导航链接 */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === link.path 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-glow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
                )}
              </Link>
            ))}
          </div>
          
          {/* 快速访问工具栏 */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              🔍
            </button>
            <button className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              ⭐
            </button>
          </div>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 fade-in">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-all ${
                  location.pathname === link.path 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-glow' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2 px-4 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
                🔍 搜索
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
                ⭐ 收藏
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar