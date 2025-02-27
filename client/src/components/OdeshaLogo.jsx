import React from 'react';
import { Download } from 'lucide-react';

const OdeshaLogo = ({ onMessageSubmit, hasPermission, onRequestAccess }) => {
  const handleCVClick = () => {
    onMessageSubmit("Provide me with Oscar's CV");
  };

  // New code request handler
  const handleCodeRequest = () => {
    if (!hasPermission) {
      alert('Please grant file access to perform this operation.');
      return;
    }
    onMessageSubmit(
      "Create a JavaScript file called graph_search.js that demonstrates a basic Graph Search Algorithm. " +
      "Include code comments explaining the core principles. Save the file and execute it to show sample output."
    );
  };

  const handleManualClick = () => {
    onMessageSubmit(
      "Please show me the user manual for O.P.A and explain all of its functionalities."
    );
  };

  const handleRandomPicture = () => {
    onMessageSubmit("Show me a random picture of Oscar");
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 select-none relative z-10 max-w-xl mx-auto">
      {/* Logo Container with Enhanced Glow Effect */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 transform hover:scale-110 transition-all duration-500">
        <div className="absolute inset-0 bg-purple-500/40 rounded-2xl blur-xl animate-pulse"></div>
        <div className="relative w-full h-full animate-float">
          <img 
            src="/images/odesha.gif" 
            alt="Odesha Logo"
            className="w-full h-full object-contain rounded-2xl transition-all duration-300 hover:brightness-110 shadow-lg"
          />
        </div>
      </div>
      
      <h1 className="mt-6 text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 
                     bg-clip-text text-transparent animate-fade-in-up tracking-wide">
        O.P.A
      </h1>
      <div 
        className="mt-3 flex flex-col items-center space-y-3 animate-fade-in-up" 
        style={{ animationDelay: '0.2s' }}
      >
        <p className="text-purple-200 text-sm md:text-base font-medium">
          Oscar Personal Assistant
        </p>
        <div className="flex space-x-3">
          <a
            href="https://x.com/oskrt_dvs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-purple-900/60 text-purple-200 rounded-full text-xs
                    hover:bg-purple-800/70 transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 
                    shadow-md hover:shadow-purple-500/20 hover:translate-y-[-1px]"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Follow
          </a>
          
          <a
            href="mailto:osrdevos@gmail.com?subject=Contact%20from%20OPA%20User"
            className="px-3 py-1.5 bg-purple-900/60 text-purple-200 rounded-full text-xs
                    hover:bg-purple-800/70 transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5
                    shadow-md hover:shadow-purple-500/20 hover:translate-y-[-1px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Oscar
          </a>
        </div>
      </div>
      
      {/* Responsive button grid with improved layout */}
      <div 
        className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up" 
        style={{ animationDelay: '0.4s' }}
      >
        {/* Top row - two equal buttons */}
        <div className="sm:col-span-1">
          <button 
            onClick={handleCVClick}
            className="w-full h-full px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl shadow-lg
                     hover:shadow-purple-500/30 hover:bg-purple-800/70 transition-all duration-300 group
                     border border-purple-700/30"
          >
            <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
              <span className="block text-xs md:text-sm font-semibold">Hire me</span>
              <span className="text-purple-300 text-xs flex items-center justify-center gap-1.5 mt-1">
                <Download className="h-3 w-3" />
                Download CV
              </span>
            </div>
          </button>
        </div>
        
        <div className="sm:col-span-1">
          <button 
            onClick={handleCodeRequest}
            className="w-full h-full px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl shadow-lg
                     hover:shadow-purple-500/30 hover:bg-purple-800/70 transition-all duration-300 group
                     border border-purple-700/30"
          >
            <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
              <span className="block text-xs md:text-sm font-semibold">Ask to Code</span>
              <span className="text-purple-300 text-xs mt-1">Write, Save, Run, Delete</span>
            </div>
          </button>
        </div>
        
        {/* Middle row - full width button */}
        <button
          onClick={onRequestAccess}
          className="col-span-1 sm:col-span-2 px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl shadow-lg 
                  hover:shadow-purple-500/30 hover:bg-purple-800/70 transition-all duration-300 group
                  border border-purple-700/30"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-xs md:text-sm font-semibold">Grant File Access</span>
            <span className="text-purple-300 text-xs mt-1">Allow O.P.A to perform file operations</span>
          </div>
        </button>
        
        {/* Bottom rows - full width buttons */}
        <button
          onClick={handleManualClick}
          className="col-span-1 sm:col-span-2 px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl shadow-lg
                  hover:shadow-purple-500/30 hover:bg-purple-800/70 transition-all duration-300 group
                  border border-purple-700/30"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-xs md:text-sm font-semibold">
              Manual: Click here to discover what O.P.A can do
            </span>
          </div>
        </button>

        <button 
          onClick={handleRandomPicture}
          className="col-span-1 sm:col-span-2 px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl shadow-lg
                   hover:shadow-purple-500/30 hover:bg-purple-800/70 transition-all duration-300 group
                   border border-purple-700/30"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-xs md:text-sm font-semibold">Show me a picture of Oscar</span>
            <span className="text-purple-300 text-xs mt-1">Displays a random image</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default OdeshaLogo;