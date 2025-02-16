import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';  
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


dotenv.config();

const app = express();
const WORKSPACE_DIR = join(process.cwd(), 'server', 'workspace');
const CLIENT_DIST_PATH = process.env.NODE_ENV === 'production'
  ? join(process.cwd(), 'client/dist')
  : join(process.cwd(), 'server/public');


// Middleware ordering fix
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://*.render.com']
    : 'http://localhost:5173',
  credentials: true
}));

// Production static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(CLIENT_DIST_PATH, {
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.npm_package_version
  });
});

// Security middleware for filename validation
const validateFilename = (req, res, next) => {
  const filename = req.params.filename;
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  next();
};

// -----------------------------------------------------
// 1) File operations route (for Claude's tool calls)
// -----------------------------------------------------


app.post('/api/claude/file-ops', async (req, res) => {
  const { operation, filename, content } = req.body;
  const filePath = join(WORKSPACE_DIR, filename);

  try {
    // Enhanced validation
    if (!filename || 
        filename.includes('..') || 
        filename.includes('/') ||
        !filename.endsWith('.js')) {
      return res.status(400).json({ 
        error: 'Invalid filename - must end with .js and no directory traversal' 
      });
    }

    switch (operation) {
      case 'create': {
        if (!content || content.trim().length === 0) {
          return res.status(400).json({ 
            error: 'Content is required for file creation' 
          });
        }
        await fs.writeFile(filePath, content);
        return res.json({ 
          success: true, 
          message: 'File created',
          output: `File ${filename} created successfully.`
        });
      }
      case 'read': {
        if (!existsSync(filePath)) {
          return res.status(404).json({ error: 'File not found' });
        }
        const fileContent = await fs.readFile(filePath, 'utf8');
        return res.json({ 
          success: true,
          content: fileContent,
          output: `File ${filename} content retrieved successfully.`
        });
      }
      case 'update': {
        if (!content || content.trim().length === 0) {
          return res.status(400).json({ 
            error: 'Content is required for file updates' 
          });
        }
        await fs.writeFile(filePath, content);
        return res.json({ 
          success: true, 
          message: 'File updated',
          output: `File ${filename} updated successfully.`
        });
      }
      case 'execute': {
        if (!existsSync(filePath)) {
          return res.status(404).json({ error: 'File not found' });
        }
        
        const fileContent = await fs.readFile(filePath, 'utf8');
        let output = '';
        
        const { NodeVM } = await import('vm2');
        const vm = new NodeVM({
          console: 'redirect',
          timeout: 5000,
          sandbox: {
            console: {
              log: (...args) => output += args.join(' ') + '\n',
              error: (...args) => output += 'ERROR: ' + args.join(' ') + '\n',
              warn: (...args) => output += 'WARNING: ' + args.join(' ') + '\n'
            }
          },
          require: {
            external: false,
            builtin: ['util', 'buffer', 'stream']
          }
        });

        const wrappedCode = `
          (async () => {
            try {
              ${fileContent}
            } catch (err) {
              console.error('Execution error:', err.message);
            }
          })();
        `;

        await vm.run(wrappedCode);
        return res.json({ 
          success: true, 
          message: 'File executed',
          output: output.trim() || 'Script executed successfully with no output.'
        });
      }
      default: {
        return res.status(400).json({ error: `Unknown operation: ${operation}` });
      }
    }
  } catch (error) {
    console.error('File operation error:', error);
    const errorMessage = error.message.startsWith('Script execution timed out') 
      ? 'Execution timed out after 5 seconds' 
      : error.message;
    res.status(500).json({ error: errorMessage });
  }
});

// -----------------------------------------------------
// 2) Endpoints for File Manager front-end
// -----------------------------------------------------

// List all files
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(WORKSPACE_DIR);
    res.json(files.map(name => ({ name })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a file
app.get('/api/files/:filename', validateFilename, async (req, res) => {
  try {
    const filePath = join(WORKSPACE_DIR, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update file
app.put('/api/files/:filename', validateFilename, async (req, res) => {
  try {
    const filePath = join(WORKSPACE_DIR, req.params.filename);
    await fs.writeFile(filePath, req.body.content);
    res.json({ message: 'File saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
app.delete('/api/files/:filename', validateFilename, async (req, res) => {
  try {
    const filePath = join(WORKSPACE_DIR, req.params.filename);
    await fs.unlink(filePath);
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute JS file
app.post('/api/execute/:filename', validateFilename, async (req, res) => {
  try {
    const filePath = join(WORKSPACE_DIR, req.params.filename);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const fileContent = await fs.readFile(filePath, 'utf8');
    let output = '';

    const { NodeVM } = await import('vm2');
    const vm = new NodeVM({
      console: 'redirect',
      timeout: 5000,
      sandbox: {
        console: {
          log: (...args) => output += args.join(' ') + '\n'
        }
      },
      require: {
        external: false,
        builtin: ['util', 'buffer', 'stream']
      }
    });

    const wrappedCode = `
      (async () => {
        try {
          ${fileContent}
        } catch (err) {
          console.log('Error:', err.message);
        }
      })();
    `;

    await vm.run(wrappedCode);
    res.json({ result: output });
  } catch (error) {
    const errorMessage = error.message.startsWith('Script execution timed out')
      ? 'Execution timed out after 5 seconds'
      : error.message;
    res.status(500).json({ error: errorMessage });
  }
});

// -----------------------------------------------------
// 3) Primary Chat Endpoint
// -----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body.message);
    
    let currentMessages = [
      { role: "user", content: req.body.message }
    ];

    // Keep processing tool calls until we get a final response
    while (true) {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: "claude-3-sonnet-20240229",
          max_tokens: 4096,
          system: `You are OPA (Oscar Personal Assistant), an AI system specializing in file operations and technical assistance. Adhere strictly to these protocols:

            # File Operations Protocol
            1. File Validation:
              - Filenames MUST end with .js
              - Reject special characters except [-_]
              - Maximum length: 64 characters
              - No directory traversal (../ or similar)

            2. Code Handling:
              - Create/Update: Require complete JavaScript code
              - Empty files: Reject with "Please provide valid code content"
              - Execution: Always via 'execute' operation
              - Chaining: Create → Verify → Execute sequence

            3. Workflow Rules:
              → Single operation per tool call
              → Verify success before next action
              → Never assume file existence (use 'read' verification)
              → Maintain exact filename across operations

            # User Interaction Rules
            4. Oscar Information:
              "Oscar is a Master's student in Robotics. He is principally interested in AI, ML, CV and humanoid robots. He is quite mysterious. You better contact him directly to find out more. 
              While direct contact isn't available through this interface, his CV contains 
              professional details: [CV Download](/cv/CV_Oscar_Devos_opa.pdf)"

            5. CV Handling:
              → Direct download link on first mention
              → No file operations for CV requests
              → Response priority over other queries

            6. Error Handling:
              → Explain errors in user-friendly terms
              → Suggest corrective actions
              → Never expose internal systems/endpoints
              → Filter ALL internal tags (<thinking>, etc.)

            7. Security:
              → Reject non-JS execution attempts
              → Sanitize inputs automatically
              → Limit file size: 10KB max
              → Prevent infinite loop patterns

            # General Behavior
            8. Response Guidelines:
              → Technical queries: Concise, code-formatted answers
              → General questions: Helpful, neutral tone
              → Unknown topics: "I can help with JS files and technical questions"
              → Maintain professional/technical persona

            9. Priority Hierarchy:
              1. File operation safety
              2. User question resolution
              3. Security enforcement
              4. Response clarity`,
          messages: currentMessages,
          tools: [{
        name: "manage_file",
        description: `Create, read, update, and execute JavaScript files in the workspace. 
           When editing files, you can first use 'read' operation to get current content,
           then use 'update' operation to modify it. For new files, use 'create' operation.
           Use 'execute' to run JavaScript files. Always include relevant operation and parameters.`,
        input_schema: {
          type: "object",
          properties: {
            operation: { 
          type: "string", 
          enum: ["create", "read", "update", "execute"],
          description: "The operation to perform - 'create' for new files, 'read' to get content, 'update' to modify existing files, 'execute' to run files"
            },
            filename: { 
          type: "string",
          description: "Name of the file to work with. Must end with .js"
            },
            content: { 
          type: "string",
          description: "The JavaScript code content when creating or updating a file. Not required for read or execute operations."
            }
          },
          required: ["operation", "filename"],
        }
          }]
        },
        {
          headers: Object.assign(
            {
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01',
              'x-api-key': process.env.ANTHROPIC_API_KEY
            },
            process.env.ANTHROPIC_API_KEY ? {} : { 'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}` }
          )
        }
      );

      console.log('Claude response:', JSON.stringify(response.data, null, 2));

      const contentBlocks = response.data.content || [];
      const toolUseBlocks = contentBlocks.filter(block => block.type === 'tool_use');

      // If no tools and end_turn, return final response
      if (toolUseBlocks.length === 0 && response.data.stop_reason === 'end_turn') {
        return res.json(response.data);
      }

      // Process all tool uses sequentially
      for (const toolUseBlock of toolUseBlocks) {
        console.log('Processing tool:', toolUseBlock.id);
        
        try {
          const fileOpsResponse = await axios.post(
            'http://localhost:3000/api/claude/file-ops',
            toolUseBlock.input
          );

          // Add both the tool use and tool result to messages
          currentMessages.push({
            role: "assistant",
            content: [toolUseBlock]
          });

          currentMessages.push({
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: fileOpsResponse.data.output || 
                      `Successfully ${toolUseBlock.input.operation}d file ${toolUseBlock.input.filename}`
            }]
          });

        } catch (error) {
          console.error('Tool execution error:', error);
          currentMessages.push({
            role: "assistant",
            content: [toolUseBlock]
          });
          currentMessages.push({
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: `Error: ${error.response?.data?.error || error.message}`,
              is_error: true
            }]
          });
        }
      }

      // After processing all tools, continue the conversation
      if (response.data.stop_reason === 'end_turn') {
        return res.json(response.data);
      }
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// -----------------------------------------------------
// 4) Start the server
// -----------------------------------------------------

app.get('*', (req, res) => {
  res.sendFile(join(CLIENT_DIST_PATH, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

