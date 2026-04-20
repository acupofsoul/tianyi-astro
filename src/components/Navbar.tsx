import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: 'HOME', icon: '🌍' },
    { path: '/wonders', label: 'WONDERS', icon: '✨' },
    { path: '/galaxies', label: 'GALAXIES', icon: '🌌' },
    { path: '/learning', label: 'LEARNING', icon: '📚' },
    { path: '/about', label: 'ABOUT', icon: 'ℹ️' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'py-2' : 'py-4'} interstellar-glass border-b border-interstellar-cyan/20`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-interstellar-cyan to-interstellar-purple flex items-center justify-center text-2xl interstellar-glow transition-all duration-300 group-hover:scale-110">
              🌌
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-interstellar-cyan to-interstellar-purple bg-clip-text text-transparent interstellar-font">
                EXPLORER
              </span>
              <span className="text-xs text-interstellar-cyan/80 rajdhani-font">
                INTERSTELLAR NAVIGATION
              </span>
            </div>
          </Link>
          
          {/* 桌面导航链接 */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`relative px-5 py-3 rounded-lg transition-all duration-400 flex items-center gap-2 interstellar-font text-xs ${
                  location.pathname === link.path 
                    ? 'interstellar-btn text-interstellar-cyan interstellar-text-glow' 
                    : 'text-interstellar-gray hover:text-interstellar-white hover:bg-interstellar-deep/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-sm">{link.icon}</span>
                <span className="uppercase">{link.label}</span>
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-interstellar-cyan to-interstellar-purple rounded-full" />
                )}
              </Link>
            ))}
          </div>
          
          {/* 快速访问工具栏 */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2.5 rounded-lg interstellar-btn text-interstellar-gray hover:text-interstellar-cyan transition-all">
              🔍
            </button>
            <button className="p-2.5 rounded-lg interstellar-btn text-interstellar-gray hover:text-interstellar-cyan transition-all">
              ⭐
            </button>
          </div>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden p-3 rounded-lg interstellar-btn text-interstellar-gray hover:text-interstellar-cyan transition-all"
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
                className={`block px-5 py-3 rounded-lg transition-all ${
                  location.pathname === link.path 
                    ? 'interstellar-btn text-interstellar-cyan interstellar-text-glow' 
                    : 'text-interstellar-gray hover:bg-interstellar-deep/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{link.icon}</span>
                  <span className="interstellar-font text-sm uppercase">{link.label}</span>
                </div>
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-3 px-4 rounded-lg interstellar-btn text-interstellar-gray hover:text-interstellar-cyan transition-all">
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span className="interstellar-font text-sm">SEARCH</span>
                </div>
              </button>
              <button className="flex-1 py-3 px-4 rounded-lg interstellar-btn text-interstellar-gray hover:text-interstellar-cyan transition-all">
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span className="interstellar-font text-sm">FAVORITES</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar