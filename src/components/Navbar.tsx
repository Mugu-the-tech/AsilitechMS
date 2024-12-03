import React, { useState,   useEffect } from "react"
import { ArrowBigDownDashIcon, User, Sun, Moon } from "lucide-react"
import { BellAlertIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

    // Effect to handle dark mode and persist preference
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
      );
    
      useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
      }, [theme]);
    
      const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
      };
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleNotificationDropdown = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

    return (
        <header className="w-full  dark:bg-[#1e2024c9] dark:text-white shadow-md p-4 sticky top-0 z-50 rounded-xl">
            <nav className="flex justify-between items-center">
                <div className="text-2xl font-bold text-[#0401ff] dark:text-blue-300">
                    AgriTech
                </div>
                
                {/* Search bar and icons */}
                <div className="flex items-center space-x-6">
                    {/* Dark Mode Toggle */}
                    <button 
                       onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme ? (
                            <Sun className="text-yellow-500" size={24} />
                        ) : (
                            <Moon className="text-[#0401ff]" size={24} />
                        )}
                    </button>

                    <input
                        type="text"
                        placeholder="Search"
                        className="hidden md:block px-3 py-1 border border-[#0094ff] rounded-md focus:outline-none focus:ring focus:border-black-300 transition-all duration-300 dark:bg-gray-800 dark:border-blue-600 dark:text-white"
                    />

                    {/* Notification icon */}
                    <div className="relative flex items-center">
                        <button
                            className="h-8 w-6 text-gray-700 dark:text-white"
                            onClick={toggleNotificationDropdown}
                        >
                            <BellAlertIcon/>
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                2
                            </span>
                        </button>

                        {/* Notification dropdown */}
                        {isNotificationDropdownOpen && (
                            <div className="absolute top-8 right-0 mt-4 z-50 w-96 bg-white dark:bg-gray-800 rounded-xl shadow flex-col justify-start items-start inline-flex">
                                {/* Notification dropdown content here */}
                            </div>
                        )}
                    </div>

                    {/* Dropdown for profile */}
                    <div className="relative">
                        <button
                            className="flex items-center space-x-2"
                            onClick={toggleDropdown}
                        >
                            <User className="dark:text-white" />
                            <span className="hidden md:block font-medium text-[#0401ff] dark:text-blue-300">
                                Ellitech
                            </span>
                            <ArrowBigDownDashIcon className="dark:text-white" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-gray-800 shadow-md rounded-md z-50">
                                <ul className="py-2">
                                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                                        Profile
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                                        Settings
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar