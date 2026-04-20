import { useState } from 'react';

interface LearningCard {
  id: string;
  title: string;
  category: 'solar' | 'wonder' | 'galaxy';
  emoji: string;
  color: string;
  summary: string;
  details: string;
  additionalInfo?: string;
}

const Learning = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // 学习卡片数据
  const learningCards: LearningCard[] = [
    // 太阳系相关卡片
    {
      id: 'solar-1',
      title: '太阳系的形成',
      category: 'solar',
      emoji: '🌟',
      color: 'from-yellow-400 to-orange-500',
      summary: '太阳系形成于约46亿年前，源于一个旋转的气体和尘埃云。',
      details: '太阳系的形成始于一个巨大的分子云的引力坍缩。当云团的密度足够高时，引力开始主导，导致云团中心形成原恒星（太阳的前身）。周围的物质形成了一个原行星盘，盘中的物质逐渐聚集形成行星。这一过程被称为星云假说，最早由18世纪的科学家提出，现在已被广泛接受。',
      additionalInfo: '太阳系的年龄约为46亿年，与地球的年龄相近。'
    },
    {
      id: 'solar-2',
      title: '八大行星',
      category: 'solar',
      emoji: '🪐',
      color: 'from-cyan-400 to-blue-500',
      summary: '太阳系有八大行星，从内到外分别是水星、金星、地球、火星、木星、土星、天王星和海王星。',
      details: '八大行星分为两类：类地行星（水星、金星、地球、火星）和类木行星（木星、土星、天王星、海王星）。类地行星体积小、密度大，主要由岩石和金属组成；类木行星体积大、密度小，主要由氢和氦组成。',
      additionalInfo: '木星是太阳系中最大的行星，质量是其他所有行星总和的2.5倍。'
    },
    {
      id: 'solar-3',
      title: '太阳的结构',
      category: 'solar',
      emoji: '☀️',
      color: 'from-orange-400 to-red-500',
      summary: '太阳由核心、辐射区、对流区、光球层、色球层和日冕组成。',
      details: '太阳的核心是核聚变发生的地方，温度高达1500万摄氏度，压力巨大。核心产生的能量通过辐射区以光子的形式向外传递，然后在对流区通过对流运动传递到表面。光球层是我们看到的太阳表面，温度约为5500摄氏度。',
      additionalInfo: '太阳的能量来自氢原子核聚变形成氦的过程，每秒将约400万吨物质转化为能量。'
    },
    
    // 天文奇观相关卡片
    {
      id: 'wonder-1',
      title: '黑洞',
      category: 'wonder',
      emoji: '🌀',
      color: 'from-purple-400 to-indigo-500',
      summary: '黑洞是宇宙中引力极强的天体，连光也无法逃脱其引力范围。',
      details: '黑洞形成于大质量恒星的引力坍缩。当恒星耗尽核燃料时，其核心会在自身引力作用下坍缩，形成一个密度无限大、体积无限小的奇点。奇点周围有一个事件视界，任何进入事件视界的物质都无法逃脱。',
      additionalInfo: '超大质量黑洞存在于大多数星系的中心，包括我们的银河系。'
    },
    {
      id: 'wonder-2',
      title: '超新星爆发',
      category: 'wonder',
      emoji: '💥',
      color: 'from-red-400 to-pink-500',
      summary: '超新星爆发是大质量恒星生命结束时的剧烈爆炸，释放出巨大的能量。',
      details: '当大质量恒星耗尽核燃料时，其核心会坍缩，引发剧烈的爆炸，称为超新星爆发。超新星爆发释放的能量相当于太阳在100亿年中释放的能量总和，使其在短时间内亮度超过整个星系。',
      additionalInfo: '超新星爆发是宇宙中最明亮的事件之一。'
    },
    {
      id: 'wonder-3',
      title: '星云',
      category: 'wonder',
      emoji: '🌌',
      color: 'from-pink-400 to-purple-500',
      summary: '星云是宇宙中由气体和尘埃组成的云团，是恒星形成的地方。',
      details: '星云主要由氢和氦组成，还含有少量其他元素。根据形态和成因，星云可分为发射星云、反射星云、暗星云和行星状星云等类型。',
      additionalInfo: '猎户座大星云是离地球最近的恒星形成区域之一，距离约1300光年。'
    },
    
    // 星系概念相关卡片
    {
      id: 'galaxy-1',
      title: '星系的类型',
      category: 'galaxy',
      emoji: '🔭',
      color: 'from-teal-400 to-cyan-500',
      summary: '星系主要分为旋涡星系、椭圆星系和不规则星系三大类。',
      details: '旋涡星系具有旋臂结构，如银河系；椭圆星系呈椭球形，没有旋臂；不规则星系则没有明显的对称结构。',
      additionalInfo: '银河系是一个棒旋星系，直径约为10万光年。'
    },
    {
      id: 'galaxy-2',
      title: '星系的形成',
      category: 'galaxy',
      emoji: '⏳',
      color: 'from-green-400 to-teal-500',
      summary: '星系形成于宇宙大爆炸后，由气体云在暗物质引力作用下坍缩形成。',
      details: '星系的形成始于大爆炸后约1亿年，当时暗物质开始形成引力结构，为气体云的坍缩提供了框架。',
      additionalInfo: '宇宙中最早的星系形成于大爆炸后约3亿年。'
    },
    {
      id: 'galaxy-3',
      title: '星系团和宇宙大尺度结构',
      category: 'galaxy',
      emoji: '🕸️',
      color: 'from-indigo-400 to-purple-500',
      summary: '星系在宇宙中形成星系团、超星系团等大尺度结构。',
      details: '星系形成了星系团和超星系团等结构，这些结构之间存在巨大的空洞，形成了类似蜘蛛网的宇宙大尺度结构。',
      additionalInfo: '我们的银河系属于本星系群，本星系群又属于室女座超星系团。'
    }
  ];

  const categories = [
    { id: 'solar', name: '太阳系', emoji: '🌍' },
    { id: 'wonder', name: '天文奇观', emoji: '✨' },
    { id: 'galaxy', name: '星系概念', emoji: '🌌' }
  ];

  const [activeCategory, setActiveCategory] = useState<'solar' | 'wonder' | 'galaxy'>('solar');

  return (
    <div className="min-h-screen nebula-bg pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 英雄区域 */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            📚 交互式学习卡片
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            探索太阳系、天文奇观和星系概念的奥秘
          </p>
        </div>

        {/* 分类导航 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`group relative px-6 py-3 rounded-xl transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`font-bold ${activeCategory === category.id ? 'text-white' : 'text-gray-400'}`}>
                {category.emoji} {category.name}
              </span>
              {activeCategory === category.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningCards
            .filter(card => card.category === activeCategory)
            .map((card, index) => (
              <div 
                key={card.id}
                className={`glass-effect rounded-2xl border-gradient card-hover overflow-hidden ${
                  expandedCard === card.id ? 'lg:col-span-3' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className={`p-6 cursor-pointer ${expandedCard === card.id ? 'pb-0' : ''}`}
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                      {card.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                      <p className="text-gray-400">{card.summary}</p>
                    </div>
                    <div className="text-2xl text-cyan-400 transition-transform">
                      {expandedCard === card.id ? '↑' : '↓'}
                    </div>
                  </div>
                </div>

                {expandedCard === card.id && (
                  <div className="p-6 pt-0 fade-in">
                    <hr className="border-gray-700 my-4" />
                    <h4 className="text-lg font-bold text-cyan-400 mb-3">详细介绍</h4>
                    <p className="text-gray-300 mb-4">{card.details}</p>
                    {card.additionalInfo && (
                      <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                        <p className="text-cyan-300 text-sm">
                          💡 {card.additionalInfo}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Learning;