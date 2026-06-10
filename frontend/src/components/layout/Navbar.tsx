import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

// function Toggle({ user }: { user: { name: string } | null }) {
//     const navigate = useNavigate()
//     const location = useLocation()

//     const options = user
//         ? [
//             { label: 'Dashboard', path: '/dashboard' },
//             { label: 'Feed', path: '/' },
//         ]
//         : [
//             { label: 'Login', path: '/login' },
//             { label: 'Feed', path: '/' },
//         ]

//     const activeIndex = options.findIndex(option => option.path === location.pathname);
//     const currentIndex = activeIndex === -1 ? 0 : activeIndex;

//     return (
//         <div
//             className="relative flex cursor-pointer select-none rounded-full p-1 flex-shrink-0"
//             style={{ background: 'var(--bk-toggle-bg)', width: `${options.length * 100}px` }}
//         >
//             <div
//                 className="absolute top-1 left-1 rounded-full transition-transform duration-[250ms]"
//                 style={{
//                     width: `calc(${100 / options.length}% - 4px)`,
//                     height: 'calc(100% - 8px)',
//                     background: '#577146',
//                     transform: `translateX(${currentIndex * 100}%)`,
//                     boxShadow: '0 1px 6px rgba(87,113,70,0.4)'
//                 }}
//             />
//             {options.map((option, index) => (
//                 <span
//                     key={option.path}
//                     onClick={() => navigate(option.path)}
//                     className="flex-1 text-center text-sm font-semibold relative z-10 py-2 transition-colors duration-[250ms]"
//                     style={{ color: currentIndex === index ? '#fff' : 'var(--bk-toggle-inactive)' }}
//                 >
//                     {option.label}
//                 </span>
//             ))}
//         </div>
//     )
// }

function Avatar({ name, avatar, onLogout }: { name: string; avatar: string | null; onLogout: () => void }) {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer overflow-hidden"
                style={{ background: '#577146', color: 'var(--bk-bg)' }}
            >
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    name.charAt(0).toUpperCase()
                )}
            </div>

            {open && (
                <div
                    className="absolute right-0 top-[38px] rounded-xl py-1 min-w-[140px] z-50"
                    style={{ background: 'var(--bk-bg-card)', border: '0.5px solid var(--bk-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                >
                    <button
                        onClick={() => { navigate('/profile'); setOpen(false) }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#D8D0BC] transition-colors"
                        style={{ color: '#2A2A2A' }}
                    >
                        Profile
                    </button>
                    <div style={{ height: '0.5px', background: 'var(--bk-border)', margin: '2px 0' }} />
                    <button
                        onClick={() => { onLogout(); setOpen(false) }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#D8D0BC] transition-colors"
                        style={{ color: '#7A6A58' }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}

function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }
    const isActive = (path: string) => location.pathname === path

    return (
        <nav
            className="flex items-center justify-between px-6 h-[64px] sticky top-0 z-50"
            style={{ background: 'var(--bk-bg)', borderBottom: '0.5px solid var(--bk-border)' }}
        >
            <span
                onClick={() => navigate('/')}
                className="text-2xl font-bold cursor-pointer"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
            >
                Book<span style={{ color: 'var(--bk-accent)' }}>Up</span>
            </span>

            <div className="flex items-center gap-4">
                <Link
                    to="/"
                    className="text-base font-medium transition-colors"
                    style={{ color: isActive('/') ? 'var(--bk-accent)' : 'var(--bk-text-secondary)' }}
                >
                    Feed
                </Link>
                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            className="text-text-base font-medium transition-colors"
                            style={{ color: isActive('/dashboard') ? 'var(--bk-accent)' : 'var(--bk-text-secondary)' }}
                        >
                            Dashboard
                        </Link>
                        <Avatar name={user.name} avatar={user.avatar} onLogout={handleLogout} />
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar