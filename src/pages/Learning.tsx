import InteractiveLearningCard from '../components/InteractiveLearningCard';

interface LearningCard {
  id: string;
  title: string;
  category: 'solar' | 'wonder' | 'galaxy';
  image: string;
  summary: string;
  details: string;
  additionalInfo?: string;
}

const Learning = () => {
  // 学习卡片数据
  const learningCards: LearningCard[] = [
    // 太阳系相关卡片
    {
      id: 'solar-1',
      title: '太阳系的形成',
      category: 'solar',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=solar%20system%20formation%20nebula%20gas%20and%20dust&image_size=landscape_16_9',
      summary: '太阳系形成于约46亿年前，源于一个旋转的气体和尘埃云。',
      details: '太阳系的形成始于一个巨大的分子云的引力坍缩。当云团的密度足够高时，引力开始主导，导致云团中心形成原恒星（太阳的前身）。周围的物质形成了一个原行星盘，盘中的物质逐渐聚集形成行星。这一过程被称为星云假说，最早由18世纪的科学家提出，现在已被广泛接受。',
      additionalInfo: '太阳系的年龄约为46亿年，与地球的年龄相近。'
    },
    {
      id: 'solar-2',
      title: '八大行星',
      category: 'solar',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=eight%20planets%20of%20solar%20system%20in%20order%20with%20sun&image_size=landscape_16_9',
      summary: '太阳系有八大行星，从内到外分别是水星、金星、地球、火星、木星、土星、天王星和海王星。',
      details: '八大行星分为两类：类地行星（水星、金星、地球、火星）和类木行星（木星、土星、天王星、海王星）。类地行星体积小、密度大，主要由岩石和金属组成；类木行星体积大、密度小，主要由氢和氦组成。冥王星曾被认为是第九大行星，但在2006年被重新分类为矮行星。',
      additionalInfo: '木星是太阳系中最大的行星，质量是其他所有行星总和的2.5倍。'
    },
    {
      id: 'solar-3',
      title: '太阳的结构',
      category: 'solar',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=solar%20structure%20core%20radiative%20zone%20convective%20zone%20photosphere&image_size=landscape_16_9',
      summary: '太阳由核心、辐射区、对流区、光球层、色球层和日冕组成。',
      details: '太阳的核心是核聚变发生的地方，温度高达1500万摄氏度，压力巨大。核心产生的能量通过辐射区以光子的形式向外传递，然后在对流区通过对流运动传递到表面。光球层是我们看到的太阳表面，温度约为5500摄氏度。色球层和日冕是太阳的外层大气，温度可以达到数百万摄氏度。',
      additionalInfo: '太阳的能量来自氢原子核聚变形成氦的过程，这一过程每秒将约400万吨物质转化为能量。'
    },
    
    // 天文奇观相关卡片
    {
      id: 'wonder-1',
      title: '黑洞',
      category: 'wonder',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20hole%20with%20accretion%20disk%20and%20gravitational%20lensing&image_size=landscape_16_9',
      summary: '黑洞是宇宙中引力极强的天体，连光也无法逃脱其引力范围。',
      details: '黑洞形成于大质量恒星的引力坍缩。当恒星耗尽核燃料时，其核心会在自身引力作用下坍缩，形成一个密度无限大、体积无限小的奇点。奇点周围有一个事件视界，任何进入事件视界的物质都无法逃脱。黑洞的存在已通过引力透镜效应、吸积盘辐射等现象得到证实。',
      additionalInfo: '超大质量黑洞存在于大多数星系的中心，包括我们的银河系。'
    },
    {
      id: 'wonder-2',
      title: '超新星爆发',
      category: 'wonder',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=supernova%20explosion%20with%20bright%20light%20and%20shock%20wave&image_size=landscape_16_9',
      summary: '超新星爆发是大质量恒星生命结束时的剧烈爆炸，释放出巨大的能量。',
      details: '当大质量恒星耗尽核燃料时，其核心会坍缩，引发剧烈的爆炸，称为超新星爆发。超新星爆发释放的能量相当于太阳在100亿年中释放的能量总和，使其在短时间内亮度超过整个星系。超新星爆发是宇宙中重元素形成的重要过程，我们身体中的许多元素都来自超新星爆发。',
      additionalInfo: '超新星爆发是宇宙中最明亮的事件之一，可以在遥远的星系中被观测到。'
    },
    {
      id: 'wonder-3',
      title: '星云',
      category: 'wonder',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20nebula%20with%20gas%20and%20dust%20in%20space&image_size=landscape_16_9',
      summary: '星云是宇宙中由气体和尘埃组成的云团，是恒星形成的地方。',
      details: '星云主要由氢和氦组成，还含有少量其他元素。根据形态和成因，星云可分为发射星云、反射星云、暗星云和行星状星云等类型。发射星云因其中的气体被附近恒星的紫外线激发而发光；反射星云则反射附近恒星的光；暗星云因吸收背景星光而呈现黑暗；行星状星云是恒星演化到晚期抛出的气体外壳。',
      additionalInfo: '猎户座大星云是离地球最近的恒星形成区域之一，距离地球约1300光年。'
    },
    
    // 星系概念相关卡片
    {
      id: 'galaxy-1',
      title: '星系的类型',
      category: 'galaxy',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=different%20types%20of%20galaxies%20spiral%20elliptical%20irregular&image_size=landscape_16_9',
      summary: '星系主要分为旋涡星系、椭圆星系和不规则星系三大类。',
      details: '旋涡星系具有旋臂结构，如银河系；椭圆星系呈椭球形，没有旋臂；不规则星系则没有明显的对称结构。此外还有透镜星系、棒旋星系等亚型。星系的类型与其形成和演化历史密切相关，椭圆星系可能是由多个星系合并形成的，而旋涡星系则保持了较为原始的结构。',
      additionalInfo: '银河系是一个棒旋星系，直径约为10万光年。'
    },
    {
      id: 'galaxy-2',
      title: '星系的形成',
      category: 'galaxy',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=galaxy%20formation%20from%20gas%20clouds%20and%20dark%20matter&image_size=landscape_16_9',
      summary: '星系形成于宇宙大爆炸后，由气体云在暗物质引力作用下坍缩形成。',
      details: '星系的形成始于大爆炸后约1亿年，当时暗物质开始形成引力结构，为气体云的坍缩提供了框架。气体云在暗物质晕中坍缩形成原星系，原星系通过合并和吸积气体逐渐成长。第一代恒星在原星系中形成，为宇宙提供了重元素。星系的形成是一个持续的过程，直到今天仍在进行。',
      additionalInfo: '宇宙中最早的星系形成于大爆炸后约3亿年。'
    },
    {
      id: 'galaxy-3',
      title: '星系团和宇宙大尺度结构',
      category: 'galaxy',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=galaxy%20clusters%20and%20cosmic%20web%20structure&image_size=landscape_16_9',
      summary: '星系在宇宙中形成星系团、超星系团等大尺度结构，构成宇宙的“骨架”。',
      details: '星系并不是均匀分布在宇宙中的，而是形成了星系团和超星系团等结构。这些结构之间存在巨大的空洞，形成了类似海绵或蜘蛛网的宇宙大尺度结构，称为宇宙网。宇宙网的形成是暗物质引力作用的结果，暗物质提供了引力骨架，普通物质则在其中形成星系。',
      additionalInfo: '我们的银河系属于本星系群，本星系群又属于室女座超星系团。'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 英雄区域 */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20space%20astronomy%20background%20with%20stars%20and%20galaxies&image_size=landscape_16_9" 
            alt="宇宙背景" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">交互式学习卡片</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">探索太阳系、天文奇观和星系概念的奥秘</p>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 太阳系卡片 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">太阳系</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningCards.filter(card => card.category === 'solar').map(card => (
              <InteractiveLearningCard key={card.id} {...card} />
            ))}
          </div>
        </section>

        {/* 天文奇观卡片 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">天文奇观</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningCards.filter(card => card.category === 'wonder').map(card => (
              <InteractiveLearningCard key={card.id} {...card} />
            ))}
          </div>
        </section>

        {/* 星系概念卡片 */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">星系概念</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningCards.filter(card => card.category === 'galaxy').map(card => (
              <InteractiveLearningCard key={card.id} {...card} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Learning;