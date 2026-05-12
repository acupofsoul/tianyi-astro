# 天文奇观观测平台 - 技术架构文档

## 1. 项目概述

### 1.1 项目信息

- **项目名称**：Deep Space Observatory Console（深空观测站控制台）
- **项目类型**：交互式天文可视化应用
- **技术栈**：React 18 + TypeScript + Tailwind CSS
- **目标用户**：对天文学感兴趣的用户，提供沉浸式的宇宙探索体验

### 1.2 项目结构

```
src/
├── pages/
│   └── Wonders.tsx          # 主页面组件
├── styles/
│   └── industrial.css       # 工业风格样式
├── components/
│   ├── Navigation/         # 导航组件
│   ├── ControlPanel/        # 控制面板组件
│   ├── DataDisplay/         # 数据展示组件
│   └── Canvas/              # 画布容器组件
└── utils/
    ├── astronomy/           # 天文学计算工具
    └── canvas/              # Canvas 渲染工具
```

## 2. 设计系统

### 2.1 CSS 变量配置

```css
:root {
  /* 基础色 */
  --color-void: #0A0E14;
  --color-panel: #1A1F2A;
  --color-border: #2D3548;
  --color-accent: #00B4D8;
  --color-warning: #FF6B35;
  --color-success: #00F5A0;
  --color-danger: #FF3D3D;
  --color-text: #E8F1F8;
  
  /* 功能色 */
  --color-gravity: #7B68EE;    /* 黑洞 */
  --color-ion: #00CED1;        /* 彗星 */
  --color-binary: #FFD93D;     /* 双星 */
  --color-supernova: #FF8C42;  /* 超新星 */
  --color-nebula: #C77DFF;     /* 星云 */
  
  /* 字体 */
  --font-display: 'JetBrains Mono', monospace;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* 间距 */
  --space-unit: 8px;
  --space-sm: calc(var(--space-unit) * 1);
  --space-md: calc(var(--space-unit) * 2);
  --space-lg: calc(var(--space-unit) * 3);
  --space-xl: calc(var(--space-unit) * 4);
  
  /* 动画 */
  --transition-fast: 200ms ease-out;
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2.2 组件命名规范

```
工业风格组件命名：
- .obs-panel          # 观测面板容器
- .obs-header         # 头部标识区
- .obs-nav            # 侧边导航
- .obs-canvas         # 画布区域
- .obs-control        # 控制面板
- .obs-data           # 数据面板
- .obs-info           # 信息面板

状态类名：
- .is-active          # 激活状态
- .is-expanded        # 展开状态
- .is-loading         # 加载状态
- .is-disabled        # 禁用状态

修饰符：
- .--primary          # 主要样式
- .--secondary        # 次要样式
- .--ghost            # 透明背景
```

## 3. 核心组件架构

### 3.1 主容器布局

```tsx
<div className="obs-container">
  <header className="obs-header" />
  <aside className="obs-nav" />
  <main className="obs-main">
    <section className="obs-canvas-wrapper">
      <canvas className="obs-canvas" />
    </section>
    <aside className="obs-sidebar">
      <ControlPanel />
      <DataPanel />
    </aside>
  </main>
</div>
```

### 3.2 导航组件结构

```tsx
<nav className="obs-nav">
  <div className="obs-nav__list">
    {phenomena.map(item => (
      <button 
        key={item.id}
        className={`obs-nav__item ${activeId === item.id ? 'is-active' : ''}`}
        data-theme={item.theme}
      >
        <span className="obs-nav__icon">{item.icon}</span>
        <span className="obs-nav__label">{item.label}</span>
        <span className="obs-nav__indicator" />
      </button>
    ))}
  </div>
</nav>
```

### 3.3 控制面板组件

```tsx
<panel className="obs-control">
  <header className="obs-control__header">
    <span className="obs-control__icon">⚙</span>
    <h3 className="obs-control__title">参数控制</h3>
  </header>
  
  <div className="obs-control__body">
    {controls.map(ctrl => (
      <div key={ctrl.id} className="obs-slider">
        <label className="obs-slider__label">
          {ctrl.label}
          <span className="obs-slider__value">{ctrl.value}</span>
        </label>
        <input 
          type="range"
          className="obs-slider__input"
          min={ctrl.min}
          max={ctrl.max}
          value={ctrl.value}
          onChange={ctrl.onChange}
        />
        <div className="obs-slider__markers">
          {ctrl.markers.map(m => (
            <span key={m} className="obs-slider__marker">{m}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
</panel>
```

## 4. Canvas 渲染架构

### 4.1 渲染循环

```tsx
useEffect(() => {
  let animationId: number;
  let lastTime = 0;
  
  const render = (timestamp: number) => {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 更新物理模拟
    updatePhysics(deltaTime);
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    drawBackground();
    
    // 绘制天体
    drawCelestialBodies();
    
    // 绘制效果
    drawEffects();
    
    animationId = requestAnimationFrame(render);
  };
  
  animationId = requestAnimationFrame(render);
  
  return () => cancelAnimationFrame(animationId);
}, [params]);
```

### 4.2 响应式画布

```tsx
const resizeCanvas = useCallback(() => {
  const container = canvasRef.current?.parentElement;
  if (!container) return;
  
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = 500 * dpr; // 固定高度
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = '500px';
  
  ctx.scale(dpr, dpr);
}, []);
```

## 5. 状态管理

### 5.1 本地状态

```tsx
// 模拟器状态
const [activeSimulator, setActiveSimulator] = useState('blackHole');
const [isPlaying, setIsPlaying] = useState(true);

// 控制参数
const [params, setParams] = useState({
  speed: 1,
  brightness: 1,
  scale: 1,
});

// 性能指标
const [metrics, setMetrics] = useState({
  fps: 60,
  latency: 0,
});
```

### 5.2 派生状态

```tsx
const activeConfig = useMemo(() => 
  simulatorConfigs[activeSimulator], 
  [activeSimulator]
);

const formattedTime = useMemo(() => 
  new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    timeZone: 'UTC' 
  }),
  []
);
```

## 6. 性能优化

### 6.1 Canvas 优化

- 使用 `willReadFrequently: false` 优化 Canvas 上下文
- 批量绘制相同类型的元素
- 使用离屏 Canvas 预渲染静态元素
- 限制重绘区域

### 6.2 React 优化

```tsx
// 稳定回调引用
const handleParamChange = useCallback((key: string, value: number) => {
  setParams(prev => ({ ...prev, [key]: value }));
}, []);

// 稳定计算结果
const displayValue = useMemo(() => {
  return params.speed * baseMultiplier;
}, [params.speed, baseMultiplier]);
```

### 6.3 动画节流

```tsx
const throttledUpdate = useRef(
  throttle((data: any) => {
    updateVisualization(data);
  }, 16) // ~60fps
);
```

## 7. 可访问性

### 7.1 键盘导航

```tsx
<div 
  className="obs-nav__item"
  role="tab"
  tabIndex={isActive ? 0 : -1}
  aria-selected={isActive}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect();
    }
  }}
>
```

### 7.2 ARIA 标签

```tsx
<main 
  role="main"
  aria-label="天文观测控制台"
>
  <canvas 
    aria-hidden="true"
    role="img"
    aria-label="黑洞模拟器可视化"
  />
</main>
```

## 8. 主题适配

### 8.1 深色主题（默认）

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--color-void);
    --color-text: var(--color-text);
  }
}
```

### 8.2 高对比度模式

```css
@media (prefers-contrast: high) {
  :root {
    --color-border: #ffffff;
    --color-accent: #00ffff;
  }
}
```

### 8.3 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 9. 测试策略

### 9.1 单元测试

- 工具函数测试（天文学计算）
- 组件渲染测试
- 状态更新测试

### 9.2 集成测试

- Canvas 渲染测试
- 用户交互流程测试
- 响应式布局测试

### 9.3 性能测试

- FPS 监控
- 内存使用监控
- 首屏加载时间测试

## 10. 部署配置

### 10.1 构建优化

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'canvas': ['canvas']
        }
      }
    }
  }
}
```

### 10.2 环境变量

```
VITE_API_BASE_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-XXXXX-X
```
