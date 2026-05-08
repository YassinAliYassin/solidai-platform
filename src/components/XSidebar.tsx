import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, faMagnifyingGlass, faBriefcase, faCube, 
  faRobot, faNewspaper, faUsers, faRocket,
  faBell, faEnvelope, faEllipsis, faGlobeAfrica,
  faArrowTrendUp, faPlay, faComment, faBook,
  faChartBar, faLanguage, faShieldHalved, faBolt,
  faChartLine, faLock, faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

interface XSidebarProps {
  isDark?: boolean;
  currentPage?: 'home' | 'solidllm' | 'solidai';
}

export default function XSidebar({ isDark = false, currentPage = 'home' }: XSidebarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const bgClass = isDark ? 'bg-black border-[#2f3336]' : 'bg-white border-[#eff3f4]';
  const hoverBg = isDark ? 'hover:bg-[#16181c]' : 'hover:bg-[#f7f9f9]';
  const activeColor = 'text-[#1D9BF0]';
  const textClass = isDark ? 'text-white' : 'text-[#0f1419]';

  const navItems = [
    { id: 'home', icon: faHouse, label: 'Home', href: '/', active: currentPage === 'home' },
    { id: 'explore', icon: faMagnifyingGlass, label: 'Explore', href: '#' },
    { id: 'solutions', icon: faBriefcase, label: 'Solutions', href: '#' },
    { id: 'products', icon: faCube, label: 'Products', href: '#' },
    { id: 'solidllm', icon: faRobot, label: 'SolidLLM', href: '/solid-llm/', active: currentPage === 'solidllm' },
    { id: 'solidai', icon: faBolt, label: 'SolidAI', href: '/solidai', active: currentPage === 'solidai' },
    { id: 'blog', icon: faNewspaper, label: 'Blog', href: '#' },
    { id: 'about', icon: faUsers, label: 'About Africa', href: '#' },
  ];

  return (
    <nav className={`w-72 border-r flex flex-col h-screen fixed ${bgClass}`}>
      {/* Logo */}
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1D9BF0] text-white rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0">
          𝕊
        </div>
        <span className={`text-3xl font-black tracking-tighter ${textClass}`}>
          Solid
        </span>
        <span className="text-3xl font-black tracking-tighter text-[#1D9BF0]">
          {currentPage === 'solidllm' ? 'LLM' : 'Solutions'}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center gap-5 px-6 py-4 text-xl font-medium rounded-3xl transition-all duration-200 ${
              item.active ? `font-bold ${activeColor}` : ''
            } ${hoverBg}`}
            onMouseEnter={() => setIsHovered(item.id)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <FontAwesomeIcon icon={item.icon} className="w-8" />
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <div className="px-4 pb-6">
        <button
          onClick={() => {
            if (currentPage === 'solidllm') window.location.href = '/solid-llm/';
            else if (currentPage === 'solidai') window.location.href = '/solidai';
            else window.location.href = '/solid-llm/';
          }}
          className="w-full bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-bold text-xl py-4 rounded-3xl flex items-center justify-center gap-3 shadow-lg transition-all duration-200"
        >
          <FontAwesomeIcon icon={currentPage === 'solidllm' ? faComment : currentPage === 'solidai' ? faBolt : faRocket} />
          <span>
            {currentPage === 'solidllm' ? 'Start chatting now' : currentPage === 'solidai' ? 'Launch SolidAI' : 'Launch SolidLLM'}
          </span>
        </button>
      </div>

      {/* Bottom Profile */}
      <div className={`mt-auto border-t p-4 flex items-center gap-3 cursor-pointer transition-colors ${isDark ? 'border-[#2f3336] hover:bg-[#16181c]' : 'border-[#eff3f4] hover:bg-[#f7f9f9]'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-[#1D9BF0] to-white rounded-2xl flex items-center justify-center text-black text-xl font-bold">
          YA
        </div>
        <div className="flex-1">
          <div className={`font-bold ${textClass}`}>Yassin Ali</div>
          <div className={isDark ? 'text-[#71767b] text-sm' : 'text-[#536471] text-sm'}>
            @realyassinali • Harare, ZW
          </div>
        </div>
        <FontAwesomeIcon icon={faEllipsis} className={`text-2xl ${isDark ? 'text-white' : 'text-[#0f1419]'}`} />
      </div>
    </nav>
  );
}
