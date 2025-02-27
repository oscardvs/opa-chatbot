import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Download,
  Folders,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import OdeshaLogo from './OdeshaLogo';
import FileManager from './FileManager';  
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Gallery from './Gallery';
import IntegrationManager from './IntegrationManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const OPAChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ask user for file access
  const requestFileAccess = () => {
    if (window.confirm('Allow O.P.A to perform file operations on the server?')) {
      setHasPermission(true);
      axios.post(`${API_BASE_URL}/request-access`, { permission: true });
    }
  };

  // Clear messages and close gallery on O.P.A logo click
  const handleLogoClick = () => {
    setMessages([]);
    setShowGallery(false);
  };

  // Handle chat submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await processMessage(input);
  };

  // Process user message
  const processMessage = async (messageText, isExternal = false) => {
    if (!messageText.trim()) return;

    // Check file access permission
    if (
      !hasPermission &&
      (messageText.toLowerCase().includes('script') ||
       messageText.toLowerCase().includes('code') ||
       messageText.toLowerCase().includes('.js'))
    ) {
      alert('Please grant file access to perform this operation.');
      return;
    }

    // If message includes code-related keywords, show file manager
    if (
      !isExternal &&
      (messageText.toLowerCase().includes('script') ||
       messageText.toLowerCase().includes('code') ||
       messageText.toLowerCase().includes('.js'))
    ) {
      setShowFileManager(true);
    }

    // Add user message to chat
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      id: Date.now()
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!isExternal) setInput('');
    setIsLoading(true);

    // Send request to server
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: messageText
      });

      if (!response.data?.content) {
        throw new Error('Empty response from assistant');
      }

      // Extract text blocks from response
      const textBlocks = response.data.content.filter(
        (block) => block.type === 'text'
      );
      if (textBlocks.length > 0) {
        // Clean out any hidden tags, extra newlines
        const cleanedText = textBlocks
          .map((block) =>
            block.text
              .replace(/<thinking>.*?<\/thinking>/gs, '')
              .replace(/\n+/g, '\n')
              .trim()
          )
          .join('\n');

        // Add assistant message
        const assistantMessage = {
          text: cleanedText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          id: Date.now() + 1
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Sorry, I couldn't process your request";

      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${errorMessage}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + 1
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Download CV
  const handleCVDownload = async () => {
    try {
      const response = await fetch('/api/download-cv');
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Oscar_DevOs_CV.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  };

  // For external messages (like OdeshaLogo buttons)
  const handleExternalMessage = async (message) => {
    await processMessage(message, true);
  };

  return (
    <>
      {/* Conditionally render the Gallery modal on top */}
      {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
      
      {/* Conditionally render the Integrations modal */}
      {showIntegrations && <IntegrationManager onClose={() => setShowIntegrations(false)} />}

      {/* Main container: pinned header + pinned input, scrolled messages in between */}
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-950 to-purple-900 overflow-hidden">

        {/* HEADER (Pinned at top) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 to-purple-800/95 border-b border-purple-700/50 backdrop-blur-md shadow-lg safe-top">
          <div className="w-full px-4 py-3 md:py-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Left: Bot Icon -> handleLogoClick */}
              <button
                onClick={handleLogoClick}
                className="bg-purple-800/80 text-purple-200 border border-purple-600/70 p-2.5 rounded-xl 
                         transform hover:rotate-12 hover:bg-purple-700/80 transition-all duration-300
                         hover:shadow-purple-500/20 hover:border-purple-500/70 active:scale-95"
              >
                <Bot className="h-5 w-5 md:h-6 md:w-6 text-purple-200 animate-pulse" />
              </button>

              {/* Middle: O.P.A Title -> handleLogoClick */}
              <button
                onClick={handleLogoClick}
                className="bg-purple-800/80 text-purple-100 border border-purple-600/70 px-4 py-2 rounded-xl 
                         hover:bg-purple-700/80 transition-all duration-300 group
                         hover:shadow-purple-500/20 hover:border-purple-500/70 active:scale-95"
              >
                <h1 className="text-xl md:text-2xl font-bold tracking-wider group-hover:bg-gradient-to-r 
                             group-hover:from-purple-300 group-hover:to-purple-100 group-hover:bg-clip-text 
                             group-hover:text-transparent transition-all duration-300">O.P.A</h1>
                <p className="text-xs md:text-sm text-purple-300">Oscar Personal Assistant</p>
              </button>

              {/* Right: Integration, Gallery & FileManager Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowIntegrations(true)}
                  className="p-2.5 bg-purple-800/80 text-purple-200 border border-purple-600/70 rounded-xl 
                           hover:bg-purple-700/80 hover:text-purple-100 transition-all duration-300
                           hover:shadow-purple-500/20 hover:border-purple-500/70 active:scale-95"
                  title="Manage Integrations"
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowGallery(!showGallery)}
                  className="p-2.5 bg-purple-800/80 text-purple-200 border border-purple-600/70 rounded-xl 
                           hover:bg-purple-700/80 hover:text-purple-100 transition-all duration-300
                           hover:shadow-purple-500/20 hover:border-purple-500/70 active:scale-95"
                  title="Image Gallery"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowFileManager(!showFileManager)}
                  className="p-2.5 bg-purple-800/80 text-purple-200 border border-purple-600/70 rounded-xl 
                           hover:bg-purple-700/80 hover:text-purple-100 transition-all duration-300
                           hover:shadow-purple-500/20 hover:border-purple-500/70 active:scale-95"
                  title="File Manager"
                >
                  <Folders className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGES CONTAINER (scrollable) */}
        {/*  - pt-32 = space for pinned header
            - pb-40 = space for pinned chat input at bottom */}
        <div className="flex-1 overflow-y-auto pt-32 pb-32 px-4 md:px-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-4">
              <OdeshaLogo
                onMessageSubmit={handleExternalMessage}
                hasPermission={hasPermission}
                onRequestAccess={requestFileAccess}
              />
            </div>
          ) : (
            <div className="space-y-6 max-w-6xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`
                    flex items-start space-x-3
                    ${message.isUser ? 'justify-end' : 'justify-start'}
                    opacity-0 animate-[fade-in-up_0.4s_ease-out_forwards]
                  `}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Bot Icon if assistant message */}
                  {!message.isUser && (
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-700/60 to-purple-600/60 rounded-full p-2.5 animate-pop shadow-md">
                      <Bot className="h-5 w-5 text-purple-200" />
                    </div>
                  )}

                  {/* Message bubble + timestamp */}
                  <div
                    className={`
                      flex flex-col ${message.isUser ? 'items-end' : 'items-start'}
                      max-w-[85%] sm:max-w-[75%] md:max-w-[70%]
                    `}
                  >
                    <div
                      className={`
                        rounded-2xl px-5 py-3.5 shadow-md group relative
                        ${
                          message.isUser
                            ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-purple-100 rounded-br-none'
                            : 'bg-gradient-to-r from-purple-800/60 to-purple-700/60 text-purple-100 rounded-bl-none border border-purple-700/50'
                        }
                        hover:shadow-purple-500/20 transition-all duration-300
                      `}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        className="prose prose-invert max-w-none prose-p:my-1.5 prose-headings:my-3 
                                  prose-pre:bg-gray-800/90 prose-pre:p-4 prose-pre:rounded-xl prose-pre:shadow-inner
                                  prose-code:text-purple-200 prose-code:bg-purple-950/50 prose-code:px-1.5 prose-code:py-0.5 
                                  prose-code:rounded prose-code:before:hidden prose-code:after:hidden"
                        components={{
                          a: ({ node, ...props }) => {
                            // If link is the CV link, show a custom button
                            if (props.href === '/api/download-cv') {
                              return (
                                <button
                                  onClick={handleCVDownload}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 
                                           hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2.5 rounded-xl 
                                           transition-all duration-300 transform hover:scale-105 active:scale-95
                                           shadow-md hover:shadow-purple-500/30 font-medium"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download CV</span>
                                </button>
                              );
                            }
                            // Otherwise, normal link
                            return (
                              <a 
                                {...props} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-purple-200 underline decoration-purple-500/30
                                         hover:decoration-purple-400/70 decoration-2 underline-offset-2
                                         transition-all duration-200"
                              />
                            );
                          }
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>

                      {/* Removed hovered controls bubble */}
                    </div>

                    {/* Timestamp with improved styling */}
                    <span className="text-xs text-purple-400/80 mt-1.5 px-2 font-light">
                      {message.timestamp}
                    </span>
                  </div>

                  {/* User Icon if user message */}
                  {message.isUser && (
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-600/60 to-purple-500/60 rounded-full p-2.5 animate-pop shadow-md">
                      <User className="h-5 w-5 text-purple-200" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading dots if assistant is typing */}
              {isLoading && (
                <div className="flex items-start space-x-3 animate-fade-in">
                  <div className="flex-shrink-0 bg-gradient-to-br from-purple-700/60 to-purple-600/60 rounded-full p-2.5 shadow-md">
                    <Bot className="h-5 w-5 text-purple-200 animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-r from-purple-800/60 to-purple-700/60 rounded-2xl rounded-bl-none 
                               px-5 py-3.5 shadow-md border border-purple-700/50">
                    <div className="flex space-x-3">
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full 
                                    animate-bounce shadow-sm"></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full 
                                    animate-bounce delay-[150ms] shadow-sm"></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full 
                                    animate-bounce delay-[300ms] shadow-sm"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* FILE MANAGER (fixed near bottom) */}
        {showFileManager && (
          <div className="fixed inset-x-4 bottom-40 md:bottom-44 z-50 animate-fade-in-up">
            <FileManager />
          </div>
        )}

        {/* CHAT INPUT (Pinned at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 to-purple-800/95 border-t border-purple-700/50 backdrop-blur-md px-4 py-4 md:py-5 shadow-lg safe-bottom">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-purple-800/60 border border-purple-700/50 rounded-2xl px-5 py-3 md:py-4
                           focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-600/50
                           transition-all duration-200 text-purple-100 placeholder-purple-400
                           shadow-inner hover:bg-purple-800/70"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-700 to-purple-600 text-purple-100 rounded-2xl 
                           px-6 py-3 md:py-4
                           hover:from-purple-600 hover:to-purple-500 focus:outline-none focus:ring-2 
                           focus:ring-purple-500/70 focus:ring-offset-2 focus:ring-offset-purple-900
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-700
                           disabled:hover:to-purple-600
                           transition-all duration-300 transform hover:scale-105 active:scale-95
                           flex items-center justify-center shadow-lg hover:shadow-purple-500/30
                           md:min-w-28"
              >
                <Send className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default OPAChatbot;
