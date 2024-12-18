import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideBarItem from "../ui/SidebarItem";
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowRight, 
  ArrowLeft, 
  Banknote, 
  Users, 
  DollarSign, 
  Menu,
  ChevronDown,
  LucideIcon,
  FileText,    // Invoice icon
  CheckCircle, // Confirmed/Paid icon
  XCircle,     // Cancelled icon
  FileInput,   // Draft icon
  ShoppingCart, // Purchases icon
  ShoppingBag,  // Sales icon
  Package,     // Inventory detail icons
  UserPlus,    // Add customer icon
  UserX,       // Inactive customers icon
  CreditCard,  // Vendor icon
  PackagePlus,
  Store,  // Add item icon
  LogOut,
  Sun,
  Moon,
  User
} from "lucide-react";

const SideBar = ({
  isCollapsed, 
  toggleSidebar
}: {
  isCollapsed: boolean, 
  toggleSidebar: () => void  
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});
    const [isDarkMode, setIsDarkMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Theme toggle effect
    useEffect(() => {
        // Check for saved theme preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set initial theme
        const initialTheme = savedTheme 
            ? savedTheme === 'dark' 
            : prefersDarkMode;
        
        setIsDarkMode(initialTheme);
        updateTheme(initialTheme);
    }, []);

    // Theme update function
    const updateTheme = (isDark: boolean) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        updateTheme(newTheme);
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.clear(); // Simple example
        navigate('/login');
    };

    // Check screen size and set mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobile(window.innerWidth <= 768); // Typical mobile breakpoint
        };

        // Check on initial render
        checkMobileView();

        // Add event listener to check on resize
        window.addEventListener('resize', checkMobileView);

        // Cleanup event listener
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // Toggle dropdown
    const toggleDropdown = (label: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    // Custom Dropdown Item that mimics SideBarItem's style
    const DropdownSideBarItem = ({
        label, 
        icon: Icon, 
        subItems,
        href
    }: {
        label: string, 
        icon: LucideIcon | React.ComponentType;
        subItems?: {href: string, label: string, icon?: LucideIcon | React.ComponentType}[],
        href?: string
    }) => {
        const isActive = location.pathname === href;
        const isDropdownOpen = openDropdowns[label];

        return (
            <li className={'group relative'}>
                <div 
                    onClick={() => subItems ? toggleDropdown(label) : undefined}
                    className={`
                        flex items-center 
                        py-2.5 px-4 
                        transition-all duration-300 ease-in-out 
                        group-hover:bg-blue-500 
                        ${isActive 
                            ? "bg-blue-600 text-white dark:bg-blue-700" 
                            : "text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white"
                        }
                        rounded-lg 
                        mx-2 my-1 
                        relative 
                        overflow-hidden
                        ${isCollapsed ? "justify-center" : ""}
                        ${subItems ? 'cursor-pointer' : ''}
                    `}
                >
                    {Icon && (
                        <Icon 
                            className={`
                                w-5 h-5 
                                transition-all duration-300 
                                ${isActive 
                                    ? "text-white" 
                                    : "text-gray-600 dark:text-gray-300 group-hover:text-white"
                                }
                            `} 
                        />
                    )}

                    {!isCollapsed && (
                        <div className="flex justify-between items-center w-full">
                            <span className={`
                                ml-3 
                                text-sm 
                                font-medium 
                                ${href ? '' : 'flex-grow'}
                            `}>
                                {label}
                            </span>
                            {subItems && (
                                <ChevronDown 
                                    className={`
                                        w-4 h-4 
                                        transition-transform duration-200 
                                        ${isDropdownOpen ? 'rotate-180' : ''}
                                        dark:text-gray-300
                                    `} 
                                />
                            )}
                        </div>
                    )}

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
                                bg-blue-300 
                                dark:bg-blue-500
                                rounded
                            "
                        />
                    )}
                </div>

                {!isCollapsed && subItems && isDropdownOpen && (
                    <ul className="ml-6 space-y-1 pb-2">
                        {subItems.map((item) => (
                            <li key={item.href} className="flex items-center">
                                <Link
                                    to={item.href}
                                    className={`
                                        flex items-center
                                        w-full
                                        py-1.5 px-3 
                                        text-sm 
                                        rounded 
                                        transition-colors 
                                        ${location.pathname === item.href 
                                            ? 'bg-blue-600 text-white dark:bg-blue-700' 
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                        }
                                    `}
                                >
                                    {item.icon && (
                                        <item.icon 
                                            className={`
                                                w-4 h-4 mr-2
                                                ${location.pathname === item.href 
                                                    ? 'text-white' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }
                                            `} 
                                        />
                                    )}
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    };

    const renderDesktopMobileSidebar = () => (
        <ul className='flex flex-col h-ful'>
            <div className='flex-grow'>
            <SideBarItem 
                href="/" 
                label="Dashboard" 
                isCollapsed={isCollapsed} 
                icon={LayoutDashboard} 
            />
            <DropdownSideBarItem 
                label="Inventory" 
                icon={Boxes}
                href="/inventory"
                subItems={[
                    {href: "/inventory", label: "All Items", icon: Package},
                    {href: "/inventory/add", label: "Add Item", icon: PackagePlus}
                ]}
            />
            <DropdownSideBarItem 
                label="Purchases" 
                icon={ShoppingCart}
                href="/purchases"
                subItems={[
                    {href: "/purchases", label: "All Purchases", icon: ShoppingCart},
                    {href: "/purchases/create", label: "New Purchase", icon: CreditCard},
                    {href: "/purchases/draft", label: "Draft", icon: FileInput},
                    {href: "/purchases/confirmed", label: "Confirmed", icon: CheckCircle},
                    {href: "/purchases/invoiced", label: "Invoiced", icon: FileText},
                    {href: "/purchases/paid", label: "Paid", icon: CheckCircle},
                    {href: "/purchases/cancelled", label: "Cancelled", icon: XCircle}
                ]}
            />
            <DropdownSideBarItem 
                label="Sales" 
                icon={ShoppingBag}
                href="/sales"
                subItems={[
                    {href: "/sales", label: "All Sales", icon: ShoppingBag},
                    {href: "/sales/create", label: "New Sale", icon: DollarSign},
                    {href: "/sales/draft", label: "Draft", icon: FileInput},
                    {href: "/sales/confirmed", label: "Confirmed", icon: CheckCircle},
                    {href: "/sales/invoiced", label: "Invoiced", icon: FileText},
                    {href: "/sales/paid", label: "Paid", icon: CheckCircle},
                    {href: "/sales/cancelled", label: "Cancelled", icon: XCircle}
                ]}
            />
            <DropdownSideBarItem 
                label="Customers" 
                icon={Users}
                href="/clients"
                subItems={[
                    {href: "/clients", label: "All Customers", icon: Users},
                    {href: "/clients/add", label: "Add Customer", icon: UserPlus},
                    {href: "/clients/inactive", label: "Inactive Customers", icon: UserX}
                ]}
            />
            <DropdownSideBarItem 
                label="Vendors" 
                icon={Banknote}
                href="/vendors"
                subItems={[
                    {href: "/vendors", label: "All Vendors", icon: Banknote},
                    {href: "/vendors/add", label: "Add Vendor", icon: UserPlus},
                    {href: "/vendors/inactive", label: "Inactive Vendors", icon: UserX}
                ]}
            />

            <DropdownSideBarItem 
                label="Markets" 
                icon={Store}
                href="/markets"
                subItems={[
                    {href: "/markets", label: "All Markets", icon: Store},
                    {href: "/markets/add", label: "Add Market", icon: UserPlus},
                    {href: "/markets/inactive", label: "Inactive Markets", icon: UserX}
                ]}
            />
             <DropdownSideBarItem 
                label="User Management" 
                icon={User}
                href="/markets"
                subItems={[
                    {href: "/createuser", label: "Create User", icon: UserPlus},
                    {href: "/allusers", label: "All Users", icon: UserPlus},
                    
                ]}
            />
            </div>

            {/* Bottom section with theme toggle and logout */}
            <li className={`
                group relative 
                border-t border-gray-200 
                dark:border-gray-700 
                py-2 
                ${isCollapsed ? 'px-2' : 'px-4'}
            `}>
                <div 
                    onClick={toggleTheme}
                    className={`
                        flex items-center 
                        py-2.5 px-4 
                        transition-all duration-300 ease-in-out 
                        hover:bg-gray-200 
                        dark:hover:bg-gray-700 
                        rounded-lg 
                        mx-2 my-1 
                        cursor-pointer 
                        ${isCollapsed ? "justify-center" : ""}
                    `}
                >
                    {isDarkMode ? (
                        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}

                    {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    )}
                </div>

                <div 
                    onClick={handleLogout}
                    className={`
                        flex items-center 
                        py-2.5 px-4 
                        transition-all duration-300 ease-in-out 
                        hover:bg-red-100 
                        dark:hover:bg-red-900 
                        rounded-lg 
                        mx-2 my-1 
                        cursor-pointer 
                        ${isCollapsed ? "justify-center" : ""}
                    `}
                >
                    <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />

                    {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium text-red-700 dark:text-red-300">
                            Logout
                        </span>
                    )}
                </div>
            </li>
        </ul>
    );

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // If mobile, render a different sidebar structure
    if (isMobile) {
        return (
            <>
                <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50 flex items-center p-2">
                    <button 
                        onClick={toggleMobileMenu}
                        className="p-2 focus:outline-none text-gray-700 dark:text-gray-300"
                    >
                        <Menu />
                    </button>
                </div>

                <div className={`
                    fixed top-0 left-0 w-64 h-full 
                    bg-gradient-to-r from-slate-100 to-gray-100 
                    dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900
                    transform transition-transform duration-300 ease-in-out 
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    z-50
                `}>
                    <button 
                        onClick={toggleMobileMenu}
                        className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                    >
                        <ArrowLeft />
                    </button>

                    <nav className="mt-16 py-2">
                        {renderDesktopMobileSidebar()}
                    </nav>
                </div>
            </>
        );
    }
      
    // Desktop/Tablet view
    return (
        <aside
            className={`${
              isCollapsed ? 'w-18' : 'w-64'
            } h-full    dark:bg-[#1e2024c9] transition-all duration-300 ease-in-out relative shadow-md rounded-md`}
        >
            <button
                onClick={toggleSidebar}
                className="absolute -right-2.5 top-0 w-6 h-6 flex justify-center items-center hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition cursor-pointer focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
                {isCollapsed ? <ArrowRight/> : <ArrowLeft/>}
            </button>
            <nav className="mt-4 py-2">
                {renderDesktopMobileSidebar()}
            </nav>
        </aside>
    );
}

export default SideBar;