const Galaxies = () => {
  // 星系类型数据
  const galaxyTypes = [
    {
      id: '1',
      name: '旋涡星系',
      type: 'Spiral',
      description: '旋涡星系是观测到的数量最多、外形最美丽的一种星系。它的形状很像江河中的漩涡，因而得名。',
      emoji: '🌀',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: '2',
      name: '椭圆星系',
      type: 'Elliptical',
      description: '椭圆星系呈圆球型或椭球型。中心区最亮，亮度向边缘递减。',
      emoji: '🔴',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: '3',
      name: '不规则星系',
      type: 'Irregular',
      description: '不规则星系外形不规则，没有明显的核和旋臂，用字母Irr表示。',
      emoji: '💫',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: '4',
      name: '透镜星系',
      type: 'Lenticular',
      description: '透镜星系介于椭圆星系和旋涡星系之间，具有明亮的核球和盘状结构。',
      emoji: '🔮',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: '5',
      name: '棒旋星系',
      type: 'Barred Spiral',
      description: '棒旋星系中心有一个棒状结构，旋臂从棒的两端延伸出来。',
      emoji: '⚡',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: '6',
      name: '矮星系',
      type: 'Dwarf',
      description: '矮星系质量较小，常作为大型星系的卫星星系存在。',
      emoji: '✨',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  // 星系形成演化时间线数据
  const formationStages = [
    {
      stage: 1,
      title: '宇宙大爆炸',
      description: '大约138亿年前，宇宙从一个奇点爆发，开始了膨胀过程。',
      icon: '💥',
      color: 'from-red-400 to-orange-500'
    },
    {
      stage: 2,
      title: '暗物质结构形成',
      description: '大爆炸后约1亿年，暗物质开始形成引力结构。',
      icon: '🌑',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      stage: 3,
      title: '第一代恒星形成',
      description: '大爆炸后约2亿年，第一代恒星开始形成，质量巨大。',
      icon: '⭐',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      stage: 4,
      title: '原星系形成',
      description: '大爆炸后约3亿年，气体云开始在暗物质晕中坍缩。',
      icon: '🌌',
      color: 'from-blue-400 to-purple-500'
    },
    {
      stage: 5,
      title: '星系合并与演化',
      description: '大爆炸后数十亿年，星系通过合并和相互作用逐渐演化。',
      icon: '🔄',
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  // 天文知识数据
  const astronomyKnowledge = [
    {
      id: '1',
      title: '星系的大小',
      content: '星系的大小差异很大，从几千光年到超过100万光年。我们的银河系直径约为10万光年。',
      icon: '📏'
    },
    {
      id: '2',
      title: '星系的分布',
      content: '星系在宇宙中形成星系团和超星系团，结构之间存在巨大的空洞。',
      icon: '🌐'
    },
    {
      id: '3',
      title: '暗物质与星系',
      content: '星系的大部分质量由暗物质组成，提供了引力保持稳定结构。',
      icon: '🔮'
    },
    {
      id: '4',
      title: '星系的演化',
      content: '星系通过合并、气体吸积和恒星形成不断改变其形态和性质。',
      icon: '⏱️'
    }
  ];

  return (
    <div className="min-h-screen nebula-bg pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 英雄区域 */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌌 星系概念
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            探索宇宙中各种星系的类型、形成和演化
          </p>
        </div>

        {/* 星系类型卡片 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-glow">星系类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galaxyTypes.map((galaxy, index) => (
              <div 
                key={galaxy.id}
                className="glass-effect rounded-2xl p-6 border-gradient card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${galaxy.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                  {galaxy.emoji}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{galaxy.name}</h3>
                <p className="text-sm text-cyan-400 mb-3 font-medium">{galaxy.type}</p>
                <p className="text-gray-400">{galaxy.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 星系形成演化时间线 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-glow">星系形成演化时间线</h2>
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full hidden md:block" />
            
            <div className="space-y-8">
              {formationStages.map((stage, index) => (
                <div key={stage.stage} className="relative slide-in-left" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`flex flex-col md:flex-row items-center gap-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`w-full md:w-5/12 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                      <div className="glass-effect rounded-2xl p-6 border-gradient">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {stage.stage}. {stage.title}
                        </h3>
                        <p className="text-gray-400">{stage.description}</p>
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl z-10 shadow-lg neon-glow">
                      {stage.icon}
                    </div>
                    
                    <div className="w-full md:w-5/12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 天文知识 */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center text-glow">天文知识</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {astronomyKnowledge.map((item, index) => (
              <div 
                key={item.id}
                className="glass-effect rounded-2xl p-6 border-gradient card-hover"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Galaxies