import { useState } from "react"
import { Link } from "react-router"
import { useAuth } from "../context/AuthContext"

export const Navbar = () => {
    const[menuOpen, setMenuOpen] = useState(false)
    const{signInWithGoogle,signOut,user}=useAuth()

    return (
    <nav className="fixed top-0 w-full z-40 bg-[#6D4C41] backdrop-blur-lg border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                <Link to="/" className="font-mono text-xl font-bold text-white">
                ResepGroup8
                </Link>   
                
                {/* Dekstop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" 
                    className="text-white hover:text-[#D7CCC8] transition-colors"
                    > Home 
                    </Link>
                    <Link to="/create"  
                    className="text-white hover:text-[#D7CCC8] transition-colors"> 
                    Tambah Resep 
                    </Link>

                </div>


            {/* Dekstop Auth */}
            <div className="hidden md:flex items-center">
                {user?(
                    <div className="flex items-center space-x-4">
                        {user.user_metadata.avatar_url && (
                            <img src={user.user_metadata.avatar_url} 
                            alt="user profile"
                            className="w-8 h-8 rounded-full object-cover"/>
                        )}
                        <button onClick={signOut}
                         className="bg-[#FF5252] px-3 py-1 rounded">SignOut</button>
                    </div>
                ):(
                    <button onClick={signInWithGoogle}
                    className="bg-blue-400 px-3 py-1 rounded"
                    >Login with Google</button>
                )}
            </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    {" "}
                    <button onClick={() => setMenuOpen((prev)=>!prev)}
                        className="text-white focus:outline-none"
                        aria-label="Toggle menu"
                    >
                    <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    {menuOpen ? (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                    </svg>
                    </button>
                </div>
            </div> 
        </div>



            {/* Mobile Menu */}
            {menuOpen &&(
            <div className="md:hidden bg-[#6D4C41]">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <Link to="/"
                    onClick={()=>setMenuOpen(false)}
                    className="block px-3 py2 rounded-md text-base font-medium text-white hover:text-[#6D4C41] hover:bg-amber-50">
                        Home 
                    </Link>
                    <Link to="/create"
                    onClick={()=>setMenuOpen(false)}
                    className="block px-3 py2 rounded-md text-base font-medium text-white hover:text-[#6D4C41] hover:bg-amber-50">
                        Tambah Resep 
                    </Link>
        
                    <Link to="" onClick={()=>setMenuOpen(false)}>
                        <div className="mt-5 justify-center items-center ml-2">
                            {user?(
                            <div className="flex items-center space-x-4">
                            {user.user_metadata.avatar_url && (
                                <img src={user.user_metadata.avatar_url} 
                                alt="user profile"
                                className="w-8 h-8 rounded-full object-cover"/>
                            )}
                            <button onClick={signOut}
                            className="bg-[#FF5252] px-3 py-1 rounded">SignOut</button>
                        </div>
                    ):(
                        <button onClick={signInWithGoogle}
                        className="bg-blue-400 px-3 py-1 rounded"
                        >Login with Google</button>
                    )}
                </div>
                    </Link>
                </div>
            </div>)}
    </nav>)
}