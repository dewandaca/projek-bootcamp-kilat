import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/recipe.svg";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signInWithGoogle, signOut, user } = useAuth();
  console.log("User status:", user);

  useEffect(() => {
    console.log("User status changed:", user);
  }, [user]);

  return (
    <nav className="fixed top-0 w-full py-2 z-40 bg-[#6D4C41] backdrop-blur-lg border-b border-white/10 shadow-lg px-4">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="inline-flex items-center space-x-3 font-mono text-2xl font-bold text-white">
            <img src={logo} alt="Recipe Logo" className="w-8 h-8 object-contain" />
            RecipeGroup8
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white text-xl font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-[#6D4C41] hover:bg-amber-50"
            >
              Home
            </Link>
            {!!user && (
              <Link
                to="/create"
                className="text-white text-xl font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-[#6D4C41] hover:bg-amber-50"
              >
                Tambah Resep
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="user profile" className="w-8 h-8 rounded-full object-cover" />
                )}
                <button
                  onClick={signOut}
                  className="bg-[#AB886D] text-xl px-3 py-1 rounded cursor-pointer font-semibold text-white transition-all duration-300 hover:bg-[#8F6A50] hover:ring-[#AB886D] hover:ring-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-white text-xl px-3 py-1 rounded cursor-pointer font-semibold bg-[#AB886D] transition-all duration-300 hover:bg-[#8F6A50] hover:ring-[#AB886D] hover:ring-2"
              >
                Login with Google
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen((prev) => !prev)} className="text-white focus:outline-none cursor-pointer" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};