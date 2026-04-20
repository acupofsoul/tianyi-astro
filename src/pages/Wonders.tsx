import { useState, useRef, useEffect } from 'react';

const Wonders = () => {
  const [activeTab, setActiveTab] = useState('blackHole');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b132b] to-[#1c2541]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-white mb-8 font-[Orbitron]">
          天文奇观
        </h1>
        
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveTab('blackHole')}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${activeTab === 'blackHole' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              黑洞模拟
            </button>
            <button
              onClick={() => setActiveTab('comet')}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${activeTab === 'comet' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              彗星模拟
            </button>
            <button
              onClick={() => setActiveTab('binaryStar')}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${activeTab === 'binaryStar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              双星系统模拟
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-800">
          {activeTab === 'blackHole' && <BlackHoleSimulator />}
          {activeTab === 'comet' && <CometSimulator />}
          {activeTab === 'binaryStar' && <BinaryStarSimulator />}
        </div>
      </div>
    </div>
  );
};

// 黑洞模拟器
const BlackHoleSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    
    const draw = () => {
      ctx.fillStyle = '#0b132b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制星空背景
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 绘制引力透镜效应
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * canvas.width;
        const x = Math.cos(angle) * distance + centerX;
        const y = Math.sin(angle) * distance + centerY;
        
        // 计算引力透镜效应
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const lensEffect = 100 / (dist + 1);
        
        if (dist > 50) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * (1 - dist / canvas.width)})`;
          ctx.beginPath();
          ctx.arc(x + lensEffect * (dx / dist), y + lensEffect * (dy / dist), 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // 绘制吸积盘
      const accretionDiskRadius = 100;
      for (let i = 0; i < 360; i += 5) {
        const angle = (i * Math.PI) / 180 + time * 0.02;
        const radius = accretionDiskRadius + Math.sin(i * 0.1 + time * 0.1) * 10;
        const x = Math.cos(angle) * radius + centerX;
        const y = Math.sin(angle) * radius + centerY;
        
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const intensity = 1 - distFromCenter / accretionDiskRadius;
        
        ctx.fillStyle = `hsla(45, 100%, ${50 + intensity * 50}%, ${intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 绘制黑洞
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制事件视界
      const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 50);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(30, 60, 120, 0.3)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();
      
      time += 1;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white text-center font-[Orbitron]">
        黑洞模拟
      </h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] rounded-xl"
        />
        <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <h3 className="text-white font-medium mb-2">黑洞参数</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>质量: 10倍太阳质量</p>
            <p>事件视界: 30km</p>
            <p>吸积盘温度: 1000万K</p>
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-center max-w-2xl mx-auto">
        黑洞是宇宙中最神秘的天体之一，具有极强的引力，甚至连光也无法逃脱。
        模拟展示了黑洞的吸积盘和引力透镜效应，这是黑洞周围物质被引力吸引并加速的现象。
      </p>
    </div>
  );
};

// 彗星模拟器
const CometSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    
    const draw = () => {
      ctx.fillStyle = '#0b132b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制星空背景
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 计算彗星位置（椭圆轨道）
      const a = 200; // 半长轴
      const b = 100; // 半短轴
      const angle = time * 0.01;
      const cometX = centerX + Math.cos(angle) * a;
      const cometY = centerY + Math.sin(angle) * b;
      
      // 绘制彗尾
      const tailLength = 150;
      const tailWidth = 30;
      
      // 计算彗尾方向（远离太阳）
      const dx = cometX - centerX;
      const dy = cometY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const tailDirX = dx / dist;
      const tailDirY = dy / dist;
      
      // 绘制彗尾渐变
      const tailGradient = ctx.createLinearGradient(
        cometX, cometY,
        cometX + tailDirX * tailLength,
        cometY + tailDirY * tailLength
      );
      tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      tailGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.6)');
      tailGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
      
      ctx.fillStyle = tailGradient;
      ctx.beginPath();
      ctx.moveTo(cometX, cometY);
      ctx.lineTo(
        cometX + tailDirX * tailLength - tailDirY * tailWidth,
        cometY + tailDirY * tailLength + tailDirX * tailWidth
      );
      ctx.lineTo(
        cometX + tailDirX * tailLength + tailDirY * tailWidth,
        cometY + tailDirY * tailLength - tailDirX * tailWidth
      );
      ctx.closePath();
      ctx.fill();
      
      // 绘制彗星核心
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cometX, cometY, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制彗星光晕
      const glowGradient = ctx.createRadialGradient(cometX, cometY, 0, cometX, cometY, 20);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(cometX, cometY, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制太阳
      const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      sunGradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
      sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();
      
      time += 1;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white text-center font-[Orbitron]">
        彗星模拟
      </h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] rounded-xl"
        />
        <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <h3 className="text-white font-medium mb-2">彗星参数</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>轨道周期: 76年</p>
            <p>彗尾长度: 1000万公里</p>
            <p>核心直径: 10公里</p>
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-center max-w-2xl mx-auto">
        彗星是太阳系中的小天体，由冰、尘埃和岩石组成。当彗星接近太阳时，太阳辐射使彗星表面的物质蒸发，形成明亮的彗尾。
        模拟展示了彗星在椭圆轨道上运行时的彗尾效果。
      </p>
    </div>
  );
};

// 双星系统模拟器
const BinaryStarSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    
    const draw = () => {
      ctx.fillStyle = '#0b132b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制星空背景
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 计算双星位置
      const orbitRadius = 100;
      const star1X = centerX + Math.cos(time * 0.01) * orbitRadius;
      const star1Y = centerY + Math.sin(time * 0.01) * orbitRadius;
      const star2X = centerX + Math.cos(time * 0.01 + Math.PI) * orbitRadius * 0.7;
      const star2Y = centerY + Math.sin(time * 0.01 + Math.PI) * orbitRadius * 0.7;
      
      // 绘制引力相互作用效果
      const dx = star2X - star1X;
      const dy = star2Y - star1Y;
      
      // 绘制引力场线
      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const x = star1X + dx * t;
        const y = star1Y + dy * t;
        
        const intensity = 1 - Math.abs(t - 0.5) * 2;
        ctx.strokeStyle = `rgba(100, 149, 237, ${intensity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(time * 0.02 + i) * 20 * intensity, y + Math.cos(time * 0.02 + i) * 20 * intensity);
        ctx.stroke();
      }
      
      // 绘制恒星1
      const star1Gradient = ctx.createRadialGradient(star1X, star1Y, 0, star1X, star1Y, 30);
      star1Gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      star1Gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = star1Gradient;
      ctx.beginPath();
      ctx.arc(star1X, star1Y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制恒星2
      const star2Gradient = ctx.createRadialGradient(star2X, star2Y, 0, star2X, star2Y, 20);
      star2Gradient.addColorStop(0, 'rgba(150, 200, 255, 1)');
      star2Gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
      ctx.fillStyle = star2Gradient;
      ctx.beginPath();
      ctx.arc(star2X, star2Y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制轨道
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      time += 1;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white text-center font-[Orbitron]">
        双星系统模拟
      </h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] rounded-xl"
        />
        <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <h3 className="text-white font-medium mb-2">双星系统参数</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>恒星1质量: 1.5倍太阳质量</p>
            <p>恒星2质量: 0.8倍太阳质量</p>
            <p>轨道周期: 10天</p>
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-center max-w-2xl mx-auto">
        双星系统是由两颗恒星相互围绕共同质心运行的系统。它们之间的引力相互作用会产生有趣的天体物理现象，
        如质量转移、引力透镜效应等。模拟展示了双星系统的运行和引力相互作用。
      </p>
    </div>
  );
};

export default Wonders;