import GalaxyTypeCard from '../components/GalaxyTypeCard';
import GalaxyFormationTimeline from '../components/GalaxyFormationTimeline';
import AstronomyKnowledge from '../components/AstronomyKnowledge';

const Galaxies = () => {
  // 星系类型数据
  const galaxyTypes = [
    {
      id: '1',
      name: '旋涡星系',
      type: 'Spiral',
      description: '旋涡星系是观测到的数量最多、外形最美丽的一种星系。它的形状很像江河中的漩涡，因而得名。旋涡星系的中心有一个密集的核心，称为核球，核球外是一个薄薄的圆盘，称为星系盘。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spiral%20galaxy%20with%20beautiful%20spiral%20arms%20and%20bright%20core%20in%20deep%20space&image_size=landscape_16_9'
    },
    {
      id: '2',
      name: '椭圆星系',
      type: 'Elliptical',
      description: '椭圆星系是河外星系的一种，呈圆球型或椭球型。中心区最亮，亮度向边缘递减，对距离较近的椭圆星系，可分辨出外围的恒星成员。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elliptical%20galaxy%20with%20smooth%20rounded%20shape%20and%20bright%20center%20in%20space&image_size=landscape_16_9'
    },
    {
      id: '3',
      name: '不规则星系',
      type: 'Irregular',
      description: '不规则星系是指外形不规则，没有明显的核和旋臂，没有盘状对称结构或者看不出有旋转对称性的星系，用字母Irr表示。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=irregular%20galaxy%20with%20chaotic%20structure%20and%20bright%20star%20forming%20regions&image_size=landscape_16_9'
    },
    {
      id: '4',
      name: '透镜星系',
      type: 'Lenticular',
      description: '透镜星系是介于椭圆星系和旋涡星系之间的一种星系类型，它具有明亮的核球和盘状结构，但没有旋臂。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lenticular%20galaxy%20with%20disk%20structure%20but%20no%20spiral%20arms&image_size=landscape_16_9'
    },
    {
      id: '5',
      name: '棒旋星系',
      type: 'Barred Spiral',
      description: '棒旋星系是旋涡星系的一种亚型，其中心有一个棒状结构，旋臂从棒的两端延伸出来。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=barred%20spiral%20galaxy%20with%20central%20bar%20structure%20and%20spiral%20arms&image_size=landscape_16_9'
    },
    {
      id: '6',
      name: '矮星系',
      type: 'Dwarf',
      description: '矮星系是质量较小的星系，通常包含的恒星数量较少，亮度较低，常作为大型星系的卫星星系存在。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dwarf%20galaxy%20small%20and%20faint%20in%20deep%20space&image_size=landscape_16_9'
    }
  ];

  // 星系形成演化时间线数据
  const formationStages = [
    {
      stage: 1,
      title: '宇宙大爆炸',
      description: '大约138亿年前，宇宙从一个奇点爆发，开始了膨胀过程。在大爆炸后的几分钟内，氢和氦等轻元素形成。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=big%20bang%20cosmic%20explosion%20with%20bright%20light%20and%20energy&image_size=landscape_16_9'
    },
    {
      stage: 2,
      title: '暗物质结构形成',
      description: '在大爆炸后约1亿年，暗物质开始形成引力结构，为未来星系的形成奠定了基础。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20matter%20filaments%20and%20cosmic%20web%20structure&image_size=landscape_16_9'
    },
    {
      stage: 3,
      title: '第一代恒星形成',
      description: '在大爆炸后约2亿年，第一代恒星开始形成，这些恒星质量巨大，寿命短暂，但为宇宙提供了重元素。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=first%20generation%20stars%20forming%20in%20early%20universe&image_size=landscape_16_9'
    },
    {
      stage: 4,
      title: '原星系形成',
      description: '在大爆炸后约3亿年，气体云开始在暗物质晕中坍缩，形成原星系。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=proto%20galaxy%20formation%20with%20gas%20clouds%20and%20early%20stars&image_size=landscape_16_9'
    },
    {
      stage: 5,
      title: '星系合并与演化',
      description: '在大爆炸后数十亿年，星系通过合并和相互作用逐渐演化，形成了我们今天看到的各种星系类型。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=galaxy%20merger%20and%20interaction%20in%20deep%20space&image_size=landscape_16_9'
    }
  ];

  // 天文知识数据
  const astronomyKnowledge = [
    {
      id: '1',
      title: '星系的大小',
      content: '星系的大小差异很大，从直径只有几千光年的矮星系到直径超过100万光年的巨大椭圆星系都有。我们的银河系直径约为10万光年。',
      icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20icon%20of%20galaxy%20size%20comparison&image_size=square'
    },
    {
      id: '2',
      title: '星系的分布',
      content: '星系在宇宙中并不是均匀分布的，它们往往形成星系团和超星系团，这些结构之间存在巨大的空洞。',
      icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20icon%20of%20galaxy%20distribution%20in%20cosmic%20web&image_size=square'
    },
    {
      id: '3',
      title: '暗物质与星系',
      content: '星系的大部分质量由暗物质组成，暗物质提供了引力，使星系能够保持稳定的结构，防止恒星因旋转而飞离。',
      icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20icon%20of%20dark%20matter%20around%20galaxy&image_size=square'
    },
    {
      id: '4',
      title: '星系的演化',
      content: '星系的演化是一个持续的过程，通过合并、气体吸积和恒星形成，星系会不断改变其形态和性质。',
      icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20icon%20of%20galaxy%20evolution%20stages&image_size=square'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white">
      {/* 英雄区域 */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20space%20galaxy%20background%20with%20stars%20and%20nebulae&image_size=landscape_16_9" 
            alt="星系背景" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">星系概念</h1>
          <p className="text-xl md:text-2xl text-indigo-200 mb-8">探索宇宙中各种星系的类型、形成和演化</p>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 星系类型卡片 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">星系类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galaxyTypes.map(galaxy => (
              <GalaxyTypeCard key={galaxy.id} {...galaxy} />
            ))}
          </div>
        </section>

        {/* 星系形成演化时间线 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">星系形成演化时间线</h2>
          <GalaxyFormationTimeline stages={formationStages} />
        </section>

        {/* 天文知识 */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">天文知识</h2>
          <AstronomyKnowledge knowledge={astronomyKnowledge} />
        </section>
      </div>
    </div>
  );
};

export default Galaxies