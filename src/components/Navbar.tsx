import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">宇宙探索</div>
          
          {/* 桌面导航链接 */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">首页</Link>
            <Link to="/wonders" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">天文奇观</Link>
            <Link to="/galaxies" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">星系概念</Link>
            <Link to="/learning" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">学习卡片</Link>
            <Link to="/about" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">关于</Link>
          </div>
          
          {/* 快速访问工具栏 */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors duration-200">
              搜索
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors duration-200">
              收藏
            </button>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button className="p-2 hover:bg-blue-700 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 移动端导航菜单 */}
        <div className="md:hidden mt-4 space-y-2">
          <Link to="/" className="block hover:bg-blue-700 px-3 py-2 rounded">首页</Link>
          <Link to="/wonders" className="block hover:bg-blue-700 px-3 py-2 rounded">天文奇观</Link>
          <Link to="/galaxies" className="block hover:bg-blue-700 px-3 py-2 rounded">星系概念</Link>
          <Link to="/learning" className="block hover:bg-blue-700 px-3 py-2 rounded">学习卡片</Link>
          <Link to="/about" className="block hover:bg-blue-700 px-3 py-2 rounded">关于</Link>
          <div className="flex space-x-2 pt-2">
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm w-full">
              搜索
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm w-full">
              收藏
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar