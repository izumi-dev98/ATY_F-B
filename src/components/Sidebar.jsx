import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`
        fixed top-1 z-50 p-1 bg-white rounded-md shadow
        transition-all duration-300
        ${isOpen ? "left-52" : "left-4"}
    `}
            >
                <FontAwesomeIcon
                    icon={isOpen ? faXmark : faBars}
                    size="sm"
                />
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 h-screen w-50 bg-white text-black
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex items-center gap-3 py-2 px-6 border-b border-gray-300">
                    <span className="font-bold text-end text-sm">ATY F&B</span>
                </div>

                <nav className="p-4 space-y-3 font-serif">
                    <NavLink to="/" className="block hover:text-blue-400 border px-4 py-1 rounded-sm">
                        Dashboard
                    </NavLink>
                    <NavLink to="/payments" className="block hover:text-blue-400 border px-4 py-1 rounded-sm">
                        Payments
                    </NavLink>
                    <NavLink to="/history" className="block hover:text-blue-400 border px-4 py-1 rounded-sm">
                        History
                    </NavLink>
                    <NavLink to="/menu" className="block hover:text-blue-400 border px-4 py-1 rounded-sm">
                        Menu
                    </NavLink>
                    <NavLink to="/inventory" className="block hover:text-blue-400 border px-4 py-1 rounded-sm">
                        Inventory
                    </NavLink>

                    <button className="absolute bottom-10 left-4 right-4 hover:text-red-400 border px-4 py-1 rounded-sm">
                        Log Out
                    </button>
                </nav>
            </aside>
        </>
    );
}
