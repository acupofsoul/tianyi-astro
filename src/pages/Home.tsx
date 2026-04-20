import SolarSystemCanvas from '../components/SolarSystemCanvas'

const Home = () => {
  return (
    <div className="w-full min-h-screen interstellar-bg relative overflow-hidden">
      {/* 顶部标题区域 */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-24 pb-8 text-center scan-line">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 interstellar-font interstellar-text-glow">
            <span className="bg-gradient-to-r from-interstellar-cyan via-interstellar-purple to-interstellar-pink bg-clip-text text-transparent">
              INTERSTELLAR
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-6 rajdhani-font text-interstellar-cyan/80">
            EXPLORATION
          </h2>
          <p className="text-interstellar-gray max-w-2xl mx-auto text-sm md:text-base rajdhani-font leading-relaxed">
            Embark on a journey through the cosmos, exploring distant galaxies, mysterious black holes, 
            and the wonders of our solar system. Experience the beauty and majesty of space in stunning detail.
          </p>
        </div>
      </div>

      {/* 太阳系画布 */}
      <div className="relative z-0 pt-48">
        <SolarSystemCanvas />
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 interstellar-glass border-t border-interstellar-cyan/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-interstellar-cyan/60 rajdhani-font">SYSTEM STATUS</p>
              <p className="text-sm text-interstellar-white">All systems operational</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-interstellar-cyan/60 rajdhani-font">STARS</p>
                <p className="text-sm font-bold text-interstellar-white">200+</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-interstellar-cyan/60 rajdhani-font">PLANETS</p>
                <p className="text-sm font-bold text-interstellar-white">8</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-interstellar-cyan/60 rajdhani-font">WONDERS</p>
                <p className="text-sm font-bold text-interstellar-white">5</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-interstellar-cyan/60 rajdhani-font">NAVIGATION</p>
              <p className="text-sm text-interstellar-white">Ready for exploration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home