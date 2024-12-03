import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from 'lucide-react';

const SideBarItem = ({
  href, 
  label, 
  isCollapsed, 
  icon: Icon ,
}: {
  href: string;
  label: string;
  isCollapsed: boolean;
  icon: LucideIcon | React.ComponentType; 
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <li className={'group relative'}>
      <Link 
        to={href} 
        className={`
          flex items-center 
          py-2.5 px-4 
          transition-all duration-300 ease-in-out 
          group-hover:bg-[#0094ff] 
          ${isActive 
            ? "bg-[#007cff] text-[#ffffff]" 
            : "dark:text-white  hover:text-[#ffffff]"
          }
          rounded-lg 
          mx-2 my-1 
          relative 
          overflow-hidden
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        {/* Icon with dynamic sizing and color */}
        {Icon && (
          <Icon 
            className={`
              w-5 h-5 
              transition-all duration-300 
              ${isActive 
                ? "text-[#ffffff]" 
                : "dark:text-gray-400 text-gray-800 group-hover:text-[#ffffff]"
              }
            `} 
          />
        )}

        {/* Label with smooth transition */}
        <span 
          className={`
            ml-3 
            text-sm 
            font-medium 
            transition-all duration-300 
            ${isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto"}
            overflow-hidden
          `}
        >
          {label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <div 
            className="
              absolute 
              right-0 
              top-1/2 
              transform 
              -translate-y-1/2 
              w-1 
              h-2/3 
              bg-[#83e0ff] 
              rounded
            "
          />
        )}
      </Link>
    </li>
  );
};

export default SideBarItem;