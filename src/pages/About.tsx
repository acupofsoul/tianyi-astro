const About = () => {
  const features = [
    { icon: '⚛️', title: 'React', desc: '使用最新的React构建用户界面' },
    { icon: '📘', title: 'TypeScript', desc: '提供完整的类型安全' },
    { icon: '🎨', title: 'Tailwind CSS', desc: '使用现代化的实用优先CSS框架' },
    { icon: '🛣️', title: 'React Router', desc: '完整的单页应用路由管理' },
    { icon: '📱', title: '响应式设计', desc: '完美适配不同屏幕尺寸' },
    { icon: '🌌', title: '宇宙主题', desc: '沉浸式的太空探索体验' }
  ];

  return (
    <div className="min-h-screen nebula-bg pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 英雄区域 */}
        <div className="text-center mb-16 fade-in">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-6xl shadow-2xl neon-glow mb-8">
            🚀
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            关于宇宙探索
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            探索宇宙奥秘的交互式学习平台
          </p>
        </div>

        {/* 介绍卡片 */}
        <div className="glass-effect rounded-2xl p-8 border-gradient mb-12 slide-in-left">
          <h2 className="text-3xl font-bold mb-4 text-glow">项目介绍</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            宇宙探索是一个使用React + TypeScript + Tailwind CSS + React Router构建的现代化项目，
            旨在为用户提供沉浸式的太空探索体验。通过精美的视觉效果和交互式模拟，
            让用户深入了解太阳系、天文奇观和星系概念。
          </p>
        </div>

        {/* 特性网格 */}
        <h2 className="text-3xl font-bold mb-8 text-center text-glow slide-in-left">技术特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-effect rounded-2xl p-6 border-gradient card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 联系卡片 */}
        <div className="glass-effect rounded-2xl p-8 border-gradient text-center slide-in-right">
          <div className="text-5xl mb-4">🌌</div>
          <h2 className="text-3xl font-bold mb-4 text-glow">探索无限可能</h2>
          <p className="text-gray-400 text-lg mb-6">
            感谢您探索我们的宇宙探索平台。宇宙的奥秘等待着您去发现！
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold transition-all hover:scale-105 btn-glow">
              ✨ 开始探索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;