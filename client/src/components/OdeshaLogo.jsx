import React from 'react';
import { Download } from 'lucide-react';

const OdeshaLogo = ({ onMessageSubmit, hasPermission, onRequestAccess }) => {
  const handleCVClick = () => {
    onMessageSubmit("Provide me with Oscar's CV");
  };

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

  return (
    <div className="flex flex-col items-center justify-center py-12 select-none">
      {/* Logo Container with Glow Effect */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 transform hover:scale-110 transition-all duration-500">
        <div className="absolute inset-0 bg-purple-500/30 rounded-xl blur-xl animate-pulse"></div>
        <div className="relative w-full h-full animate-float">
          <img 
            src="/images/odesha.gif" 
            alt="Odesha Logo"
            className="w-full h-full object-contain rounded-xl transition-all duration-300 hover:brightness-110"
          />
        </div>
      </div>
      
      <h1 className="mt-8 text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 
                     bg-clip-text text-transparent animate-fade-in-up">
        O.P.A
      </h1>
      <div 
        className="mt-4 flex flex-col items-center space-y-2 animate-fade-in-up" 
        style={{ animationDelay: '0.2s' }}
      >
        <p className="text-purple-200 text-base md:text-lg">
          Oscar Personal Assistant
        </p>
        <div className="flex space-x-2">
          <a
            href="https://x.com/oskrt_dvs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-xs md:text-sm 
                    hover:bg-purple-800/50 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Follow
          </a>
          
          <a
            href="mailto:osrdevos@gmail.com?subject=Contact%20from%20OPA%20User"
            className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-xs md:text-sm 
                    hover:bg-purple-800/50 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Oscar
          </a>
        </div>
      </div>
      
      <div 
        className="mt-8 grid grid-cols-2 gap-4 animate-fade-in-up" 
        style={{ animationDelay: '0.4s' }}
      >
        <button 
          onClick={handleCVClick}
          className="px-6 py-3 bg-purple-900/50 backdrop-blur-sm rounded-xl shadow-md 
                    hover:shadow-purple-500/20 hover:bg-purple-800/50 transition-all duration-300 group"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-sm font-semibold">Hire me</span>
            <span className="text-purple-400 text-xs flex items-center justify-center gap-1">
              <Download className="h-3 w-3" />
              Download CV
            </span>
          </div>
        </button>
        <button 
          onClick={handleCodeRequest}
          className="px-6 py-3 bg-purple-900/50 backdrop-blur-sm rounded-xl shadow-md 
                    hover:shadow-purple-500/20 hover:bg-purple-800/50 transition-all duration-300 group"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-sm font-semibold">Ask to Code</span>
            <span className="text-purple-400 text-xs">Write, Save, Run, Delete</span>
          </div>
        </button>
        {/* New "Grant File Access" Button */}
        <button
          onClick={onRequestAccess}
          className="col-span-2 px-6 py-3 bg-purple-900/50 backdrop-blur-sm rounded-xl shadow-md 
                    hover:shadow-purple-500/20 hover:bg-purple-800/50 transition-all duration-300 group"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-sm font-semibold">Grant File Access</span>
            <span className="text-purple-400 text-xs">Allow O.P.A to perform file operations</span>
          </div>
        </button>
        <button
          onClick={handleManualClick}
          className="col-span-2 px-6 py-3 bg-purple-900/50 backdrop-blur-sm rounded-xl shadow-md 
                    hover:shadow-purple-500/20 hover:bg-purple-800/50 transition-all duration-300 group"
        >
          <div className="text-purple-200 group-hover:scale-105 transform transition-transform">
            <span className="block text-sm font-semibold">
              Manual: Click here to discover what O.P.A can do and is used for
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default OdeshaLogo;