import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Download,
  Folders,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import OdeshaLogo from './OdeshaLogo';
import FileManager from './FileManager';  
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Gallery from './Gallery';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const OPAChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

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

      {/* Main container: pinned header + pinned input, scrolled messages in between */}
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-950 to-purple-900 overflow-hidden">

        {/* HEADER (Pinned at top) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 to-purple-800 border-b border-purple-700/50 backdrop-blur-md safe-top">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Bot Icon -> handleLogoClick */}
              <button
                onClick={handleLogoClick}
                className="bg-purple-800 text-purple-200 border border-purple-600 p-2 rounded-lg transform hover:rotate-12 hover:bg-purple-700 transition-transform duration-300"
              >
                <Bot className="h-6 w-6 text-purple-200 animate-pulse" />
              </button>

              {/* Middle: O.P.A Title -> handleLogoClick */}
              <button
                onClick={handleLogoClick}
                className="bg-purple-800 text-purple-100 border border-purple-600 px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <h1 className="text-2xl font-bold tracking-wider">O.P.A</h1>
                <p className="text-sm text-purple-300">Oscar Personal Assistant</p>
              </button>

              {/* Right: Gallery & FileManager Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowGallery(!showGallery)}
                  className="p-2 text-purple-200 hover:text-purple-100 hover:bg-purple-700/50 rounded-lg transition-colors"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowFileManager(!showFileManager)}
                  className="p-2 bg-purple-800 text-purple-200 border border-purple-600 rounded-lg hover:bg-purple-700 hover:text-purple-100 transition-colors"
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
        <div className="flex-1 overflow-y-auto pt-32 pb-40 px-4 md:px-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
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
                    opacity-0 animate-[fade-in-up_0.3s_ease-out_forwards]
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Bot Icon if assistant message */}
                  {!message.isUser && (
                    <div className="flex-shrink-0 bg-purple-700/50 rounded-full p-2 animate-pop">
                      <Bot className="h-5 w-5 text-purple-200" />
                    </div>
                  )}

                  {/* Message bubble + timestamp */}
                  <div
                    className={`
                      flex flex-col ${message.isUser ? 'items-end' : 'items-start'}
                      max-w-[80%] md:max-w-[70%]
                    `}
                  >
                    <div
                      className={`
                        rounded-2xl px-4 py-3 shadow-md group relative
                        ${
                          message.isUser
                            ? 'bg-purple-700 text-purple-100 rounded-br-none'
                            : 'bg-purple-800/50 text-purple-100 rounded-bl-none border border-purple-700/50'
                        }
                        hover:shadow-purple-500/20 transition-shadow duration-200
                      `}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        className="prose prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:p-3 prose-pre:rounded prose-code:before:hidden prose-code:after:hidden"
                        components={{
                          a: ({ node, ...props }) => {
                            // If link is the CV link, show a custom button
                            if (props.href === '/api/download-cv') {
                              return (
                                <button
                                  onClick={handleCVDownload}
                                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download CV</span>
                                </button>
                              );
                            }
                            // Otherwise, normal link
                            return <a {...props} target="_blank" rel="noopener noreferrer" />;
                          }
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>

                      {/* (Optional) hovered controls */}
                      <div
                        className={`
                          absolute ${message.isUser ? 'left-0' : 'right-0'} -top-3
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          flex items-center space-x-2 bg-purple-900/90 rounded-full shadow-md px-2 py-1
                        `}
                      >
                        {/* Additional controls could go here */}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-purple-400 mt-1 px-2">
                      {message.timestamp}
                    </span>
                  </div>

                  {/* User Icon if user message */}
                  {message.isUser && (
                    <div className="flex-shrink-0 bg-purple-700/50 rounded-full p-2 animate-pop">
                      <User className="h-5 w-5 text-purple-200" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading dots if assistant is typing */}
              {isLoading && (
                <div className="flex items-start space-x-3 animate-fade-in">
                  <div className="flex-shrink-0 bg-purple-700/50 rounded-full p-2">
                    <Bot className="h-5 w-5 text-purple-200" />
                  </div>
                  <div className="bg-purple-800/50 rounded-2xl rounded-bl-none px-4 py-3 shadow-md border border-purple-700/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
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
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-purple-800 border-t border-purple-700/50 backdrop-blur-md px-4 py-4 safe-bottom">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-purple-800/50 border border-purple-700/50 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 text-purple-100 placeholder-purple-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-purple-700 text-purple-100 rounded-xl px-6 py-2
                           hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500
                           focus:ring-offset-2 focus:ring-offset-purple-900
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 transform hover:scale-105 active:scale-95
                           flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default OPAChatbot;
