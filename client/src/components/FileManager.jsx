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
    <div className="flex flex-col h-96 bg-purple-900 rounded-lg border border-purple-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-purple-800/50 border-b border-purple-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-100">Workspace Files</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreating(true)}
              className="p-2 text-purple-200 hover:text-purple-100 hover:bg-purple-700/50 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={loadFiles}
              className="p-2 text-purple-200 hover:text-purple-100 hover:bg-purple-700/50 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list */}
        <div className="w-64 border-r border-purple-700/50 overflow-y-auto">
          <div className="p-4 space-y-2">
            {isCreating && (
              <div className="flex items-center space-x-2 p-2 bg-purple-800/50 rounded-lg animate-fade-in">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.js"
                  className="flex-1 bg-purple-700/50 text-purple-100 rounded-lg px-3 py-1 text-sm"
                />
                <button
                  onClick={handleCreateFile}
                  className="text-green-400 hover:text-green-300"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {files.map((file) => (
              <div
                key={file.name}
                className={`
                  flex items-center justify-between p-2 rounded-lg cursor-pointer
                  ${selectedFile === file.name ? 'bg-purple-700/50' : 'hover:bg-purple-800/50'}
                  transition-colors group
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
                    <FileText className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="text-sm text-purple-100">{file.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.name);
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
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
                  className="w-full h-full bg-purple-950/50 text-purple-100 p-4 rounded-lg 
                           border border-purple-700/50 focus:outline-none focus:border-purple-500
                           font-mono text-sm resize-none"
                />
              </div>
              <div className="p-4 bg-purple-800/50 border-t border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveFile}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 
                               text-purple-100 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleSaveAndExecute}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-700 hover:bg-green-600 
                               text-green-100 rounded-lg transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      <span>Save & Run</span>
                    </button>
                  </div>
                </div>
                {executionResult !== null && (
                  <div className="mt-4 p-4 bg-purple-950/50 rounded-lg border border-purple-700/50">
                    <pre className="text-sm text-purple-100 font-mono whitespace-pre-wrap">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-purple-400">
              <div className="flex flex-col items-center space-y-2">
                <File className="h-12 w-12" />
                <p>Select a file to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;