const About = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">关于我们</h1>
      <p className="text-gray-600 mb-4">这是一个使用React + TypeScript + Tailwind CSS + React Router构建的项目。</p>
      <p className="text-gray-600">项目特点：</p>
      <ul className="list-disc pl-6 mt-2 text-gray-600">
        <li>使用TypeScript提供类型安全</li>
        <li>使用Tailwind CSS进行样式设计</li>
        <li>使用React Router进行路由管理</li>
        <li>响应式设计，适配不同屏幕尺寸</li>
      </ul>
    </div>
  )
}

export default About