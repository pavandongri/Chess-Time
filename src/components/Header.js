import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <a href="/" className="text-xl sm:text-2xl font-bold tracking-wide select-none">
          ♟️ Chess Time
        </a>
        <nav className="hidden sm:flex space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-yellow-300 transition">Home</a>
          <a href="#" className="hover:text-yellow-300 transition">Play</a>
          <a href="#" className="hover:text-yellow-300 transition">About</a>
          <a href="#" className="hover:text-yellow-300 transition">Contact</a>
        </nav>
        {/* Mobile menu icon could go here if you want */}
      </div>
    </header>
  );
};

export default Header;
