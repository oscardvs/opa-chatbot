import React, { useState, useEffect } from 'react';
import { fileOperations } from '../utils/fileOperations';
import { 
  File, 
  Trash2, 
  Play, 
  Plus,
  Save,
  X,
  FileText,
  Code,
  RefreshCw
} from 'lucide-react';


const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await fileOperations.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (filename) => {
    try {
      setLoading(true);
      const { content } = await fileOperations.readFile(filename);
      setSelectedFile(filename);
      setFileContent(content);
      setExecutionResult(null);
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      await fileOperations.saveFile(selectedFile, fileContent);
      await loadFiles();
      return true; // Indicate successful save
    } catch (error) {
      console.error('Error saving file:', error);
      return false; // Indicate save failure
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    const validExtensions = ['.js', '.py', '.cpp', '.txt', '.jsx', '.css', '.html'];
    const fileExtension = newFileName.substring(newFileName.lastIndexOf('.'));
    
    if (!newFileName || !validExtensions.includes(fileExtension)) {
      alert(`Filename must end with one of these extensions: ${validExtensions.join(', ')}`);
      return;
    }
    if (!newFileName) return;
    try {
      setLoading(true);
      const fileExtension = newFileName.substring(newFileName.lastIndexOf('.'));
      let defaultContent = '';
      
      // Create appropriate default content based on file type
      switch (fileExtension) {
        case '.js':
        case '.jsx':
          defaultContent = '// New JavaScript file\n\nconsole.log("Hello world!");';
          break;
        case '.py':
          defaultContent = '# New Python file\n\nprint("Hello world!")';
          break;
        case '.cpp':
          defaultContent = '#include <iostream>\n\nint main() {\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}';
          break;
        case '.html':
          defaultContent = '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>';
          break;
        case '.css':
          defaultContent = '/* New CSS file */\n\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}';
          break;
        default:
          defaultContent = '// New file';
      }
      
      await fileOperations.saveFile(newFileName, defaultContent);
      await loadFiles();
      setIsCreating(false);
      setNewFileName('');
      setSelectedFile(newFileName);
      setFileContent(defaultContent);
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      setLoading(true);
      await fileOperations.deleteFile(filename);
      if (selectedFile === filename) {
        setSelectedFile(null);
        setFileContent('');
      }
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteFile = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      const { result } = await fileOperations.executeFile(selectedFile);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Combined save and execute function to prevent race conditions
  const handleSaveAndExecute = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const saveSuccess = await handleSaveFile();
      if (saveSuccess) {
        // Small delay to ensure file is completely saved
        await new Promise(resolve => setTimeout(resolve, 100));
        await handleExecuteFile();
      }
    } catch (error) {
      console.error('Error in save and execute:', error);
      setExecutionResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-gradient-to-b from-purple-900/95 to-purple-800/95 rounded-2xl border border-purple-700/50 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-800/80 to-purple-700/80 border-b border-purple-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-100 flex items-center">
            <Code className="h-5 w-5 mr-2 text-purple-300" />
            <span>Workspace Files</span>
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreating(true)}
              className="p-2 bg-purple-800/80 text-purple-200 hover:text-purple-100 hover:bg-purple-700/80 
                       rounded-lg transition-all duration-200 border border-purple-700/50 
                       hover:shadow-purple-500/20 hover:border-purple-600/50"
              title="Create New File"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={loadFiles}
              className="p-2 bg-purple-800/80 text-purple-200 hover:text-purple-100 hover:bg-purple-700/80 
                       rounded-lg transition-all duration-200 border border-purple-700/50
                       hover:shadow-purple-500/20 hover:border-purple-600/50"
              title="Refresh Files"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list */}
        <div className="w-64 border-r border-purple-700/50 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-2">
            {isCreating && (
              <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-800/70 to-purple-700/70 
                            rounded-xl animate-fade-in-up border border-purple-600/30 shadow-md">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.js"
                  className="flex-1 bg-purple-700/70 text-purple-100 rounded-lg px-3 py-1.5 text-sm
                           border border-purple-600/30 focus:outline-none focus:ring-1 
                           focus:ring-purple-500/50 focus:border-purple-500/50"
                  autoFocus
                />
                <button
                  onClick={handleCreateFile}
                  className="text-green-400 hover:text-green-300 p-1 hover:bg-purple-700/50 rounded transition-colors"
                  title="Save File"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-red-400 hover:text-red-300 p-1 hover:bg-purple-700/50 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {files.map((file) => (
              <div
                key={file.name}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl cursor-pointer
                  ${
                    selectedFile === file.name 
                      ? 'bg-gradient-to-r from-purple-700/60 to-purple-600/60 shadow-md border border-purple-600/30' 
                      : 'hover:bg-purple-800/40 border border-transparent hover:border-purple-700/30'
                  }
                  transition-all duration-200 group
                `}
                onClick={() => handleFileSelect(file.name)}
              >
                <div className="flex items-center space-x-2">
                  {file.name.endsWith('.js') || file.name.endsWith('.jsx') ? (
                    <Code className="h-4 w-4 text-yellow-400" />
                  ) : file.name.endsWith('.py') ? (
                    <Code className="h-4 w-4 text-blue-400" />
                  ) : file.name.endsWith('.cpp') ? (
                    <Code className="h-4 w-4 text-green-400" />
                  ) : file.name.endsWith('.html') ? (
                    <Code className="h-4 w-4 text-orange-400" />
                  ) : file.name.endsWith('.css') ? (
                    <Code className="h-4 w-4 text-pink-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-purple-300" />
                  )}
                  <span className="text-sm text-purple-100 font-medium">{file.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.name);
                    }}
                    className="text-red-400 hover:text-red-300 p-1.5 hover:bg-purple-700/50 rounded-lg transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="flex-1 p-4">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full bg-purple-950/60 text-purple-100 p-5 rounded-xl 
                           border border-purple-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40
                           font-mono text-sm resize-none shadow-inner custom-scrollbar"
                  spellCheck="false"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-800/70 to-purple-700/70 border-t border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveFile}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600
                               hover:from-purple-600 hover:to-purple-500 text-purple-100 rounded-xl transition-all
                               duration-300 shadow-md hover:shadow-purple-500/20 border border-purple-600/30"
                    >
                      <Save className="h-4 w-4" />
                      <span className="font-medium">Save</span>
                    </button>
                    <button
                      onClick={handleSaveAndExecute}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-green-600
                               hover:from-green-600 hover:to-green-500 text-green-100 rounded-xl transition-all
                               duration-300 shadow-md hover:shadow-green-500/20 border border-green-600/30"
                    >
                      <Play className="h-4 w-4" />
                      <span className="font-medium">Save & Run</span>
                    </button>
                  </div>
                </div>
                {executionResult !== null && (
                  <div className="mt-4 p-4 bg-purple-950/70 rounded-xl border border-purple-700/50 shadow-inner">
                    <div className="text-xs text-purple-300 mb-2 font-medium">Output:</div>
                    <pre className="text-sm text-purple-100 font-mono whitespace-pre-wrap overflow-auto max-h-40 custom-scrollbar">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-purple-400">
              <div className="flex flex-col items-center space-y-3 animate-pulse-glow">
                <File className="h-12 w-12" />
                <p className="text-sm md:text-base">Select a file to edit or create a new one</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-2 flex items-center space-x-2 px-4 py-2 bg-purple-700/60 hover:bg-purple-600/60 
                           text-purple-200 rounded-lg transition-colors text-sm border border-purple-600/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>New File</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;