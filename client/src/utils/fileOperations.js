// src/utils/fileOperations.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';


export const fileOperations = {
  // List all files in workspace
  listFiles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list files: ${error}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  },

  // Read file content
  readFile: async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${filename}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to read file: ${errorData.error}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  },

  // Create or update file
  saveFile: async (filename, content) => {
    try {
      console.log('Saving file:', filename, 'Content:', content);
      const response = await fetch(`${API_BASE_URL}/files/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save file: ${error}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${filename}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete file: ${error}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Execute JavaScript file
  executeFile: async (filename) => {
    try {
      console.log('Executing file:', filename);
      const response = await fetch(`${API_BASE_URL}/execute/${filename}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute file');
      }
      const data = await response.json();
      console.log('Execution result:', data);
      return {
        success: true,
        result: data.result || 'Script executed successfully.'
      };
    } catch (error) {
      console.error('Error executing file:', error);
      throw error;
    }
  },
};