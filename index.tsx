import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// TerminalEntry interface
interface TerminalEntry {
  id: number | string; // ID can be number for boot, or string for commands/outputs
  type: 'command' | 'output' | 'boot';
  content: string; // The full content of the line to be displayed
}

// Global content definitions
const BOOT_SEQUENCE = [
  'INIT: Loading profile_data.json... [ OK ]',
  'ACCESS GRANTED: User NguyenLePhucThinh',
  '',
  'Type \'help\' for available commands.'
];

const PERSONAL_INFO_DATA = {
  name: 'NguyenLePhucThinh',
  position: 'Junior Web Developer',
  phone: '+84 123 456 789',
  email: 'nguyenlephucthinh@example.com',
  address: 'Ho Chi Minh City, Vietnam'
};

const SUMMARY_TEXT = `Junior Web Developer with a passion for creating dynamic and user-friendly web applications. Proficient in front-end technologies like Angular and skilled in back-end development with ASP.NET and SQL Server. Eager to contribute to innovative projects and continuously learn new technologies.`;

const EDUCATION_DATA = {
  degree: 'Bachelor of Science in Computer Science',
  university: 'Ho Chi Minh City University of Technology (HCMUT)',
  graduationYear: '2024'
};

const EXPERIENCE_LIST = [
  `-rw-r--r-- 1 NguyenLePhucThinh 1.0K 2024-Present ST_Connection_ERP`,
  `drwxr-xr-x 1 NguyenLePhucThinh 4.0K 2023-2024 Project_X_Frontend`
];

const ST_CONNECTION_ERP_DETAIL = `Project: ST_Connection_ERP (2024 - Present)
\nDescription: Developed and maintained modules for an ERP system.
\nResponsibilities:
- Developed and maintained modules for an ERP system using Angular for the frontend and ASP.NET Core for the backend.
- Designed and implemented RESTful APIs to facilitate communication between client and server.
- Managed database operations and optimized queries in SQL Server.
- Collaborated with cross-functional teams to define, design, and ship new features.
- Participated in code reviews and ensured adherence to coding standards and best practices.
\nTechnologies: Angular, TypeScript, HTML, CSS, ASP.NET Core, C#, SQL Server, Git`;

const PROJECT_X_FRONTEND_DETAIL = `Project: Project_X_Frontend (2023-2024)
\nDescription: Contributed to the development of a customer-facing web application.
\nResponsibilities:
- Implemented responsive UI components using React and styled-components.
- Integrated with various RESTful APIs to fetch and display data.
- Performed unit and integration testing.
\nTechnologies: React, JavaScript, HTML, CSS, RESTful APIs, Jest, Git`;

const SKILLS_DATA = {
  'Ngôn ngữ lập trình': ['JavaScript (ES6+)', 'TypeScript', 'C#', 'SQL'],
  'Framework': ['Angular', 'ASP.NET Core', 'Node.js (Express)', 'React (Basic)'],
  'Database': ['SQL Server', 'MongoDB (Basic)'],
  'Công cụ & Khác': ['Git', 'Docker (Basic)', 'RESTful APIs', 'Visual Studio Code', 'Visual Studio']
};

const PROJECTS_DATA = [
  `./Travel_Web_UI/ (A travel booking UI built with React)`,
  `./Metaversus_3D/ (A 3D metaverse landing page using Three.js)`
];

interface ContactInfo {
  type: 'phone' | 'email' | 'github' | 'facebook';
  label: string;
  value: string; // The raw value, e.g., URL or email address
  display: string; // The display text, e.g., domain or full email
  domain?: string; // For ping-like display, e.g., "github.com"
  ip?: string;    // Simulated IP address
}

const CONTACTS_DATA: ContactInfo[] = [
  { type: 'phone', label: '[Phone]', value: '+84 123 456 789', display: '+84 123 456 789' },
  { type: 'email', label: '[Email]', value: 'mailto:nguyenlephucthinh@example.com', display: 'nguyenlephucthinh@example.com', domain: 'mail.example.com', ip: '203.0.113.45' },
  { type: 'github', label: '[GitHub]', value: 'https://github.com/thinhdev', display: 'github.com/thinhdev', domain: 'github.com', ip: '192.30.255.112' },
  { type: 'facebook', label: '[Facebook]', value: 'https://facebook.com/thinh.le.dev', display: 'facebook.com/thinh.le.dev', domain: 'facebook.com', ip: '69.63.176.13' }
];

const HELP_COMMANDS = [
  `Available commands:`,
  `  <span class="command-name">help</span>                                 - Displays this help message.`,
  `  <span class="command-name">clear</span>                                - Clears the terminal screen.`,
  `  <span class="command-name">show profile</span>                       - Displays personal information.`,
  `  <span class="command-name">show profile all</span>                   - Displays all personal details, summary, experience, skills, projects, and contacts.`,
  `  <span class="command-name">show education</span>                     - Displays education details.`,
  `  <span class="command-name">show avatar</span>                        - Displays my avatar in a modal window.`,
  `  <span class="command-name">close avatar</span>                       - Closes the avatar modal window.`,
  `  <span class="command-name">cat summary.txt</span>                    - Displays career objective/summary.`,
  `  <span class="command-name">ls -l /experience</span>                    - Lists work experience projects.`,
  `  <span class="command-name">cat /experience/&lt;project_name&gt;.log</span>   - Shows detailed experience for a project.`,
  `                                         (e.g., <span class="command-name">cat /experience/st_connection_erp.log</span>)`,
  `  <span class="command-name">show skills</span>                          - Lists technical skills.`,
  `  <span class="command-name">view projects</span>                        - Displays personal projects.`,
  `  <span class="command-name">ping contacts</span>                        - Shows contact information and social links with simulated network status.`,
  `  <span class="command-name">theme &lt;name&gt;</span>                     - Switches the terminal color theme. (e.g., <span class="command-name">theme dark</span>, <span class="command-name">theme light</span>, <span class="command-name">theme matrix</span>, <span class="command-name">theme vscode-dark</span>)`
];

const PROMPT = 'root@thinh-dev:~/$ ';
const AVATAR_URL = 'https://avatars.githubusercontent.com/u/87023023?v=4'; // Your avatar URL

function TerminalApp() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [bootLineIndex, setBootLineIndex] = useState(0);
  const [bootCharIndex, setBootCharIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'matrix' | 'vscode-dark'>('dark');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0); // Points to the next available slot for new command
  const [showAvatarModal, setShowAvatarModal] = useState(false); // New state for avatar modal
  
  // States for autocomplete
  const [autocompleteMatches, setAutocompleteMatches] = useState<string[]>([]);
  const [autocompleteCurrentIndex, setAutocompleteCurrentIndex] = useState<number>(-1);


  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null); // Ref for modal close button

  // Memoized list of known commands for autocomplete
  const knownCommands = useMemo(() => {
    const commands: string[] = [];
    HELP_COMMANDS.forEach(helpLine => {
        // Regex to extract the content inside the first <span class="command-name"> tag
        const commandSpanMatch = helpLine.match(/<span class="command-name">(.*?)<\/span>/);
        if (commandSpanMatch && commandSpanMatch[1]) {
            // Decode HTML entities like &lt; and &gt;
            const commandText = commandSpanMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>');

            // Handle specific commands that are templates or have multiple fixed arguments
            if (commandText.includes('<project_name>')) {
                commands.push('cat /experience/st_connection_erp.log');
                commands.push('cat /experience/project_x_frontend.log');
            } else if (commandText.includes('<name>') && commandText.startsWith('theme')) {
                commands.push('theme dark');
                commands.push('theme light');
                commands.push('theme matrix');
                commands.push('theme vscode-dark');
            } else {
                // Add the base command, filter out any remaining templates
                commands.push(commandText);
            }
        }
    });
    // Ensure uniqueness and filter out any templates that might have slipped through
    return Array.from(new Set(commands.filter(cmd => !cmd.includes('<')))).sort();
  }, []);

  // Effect to update autocomplete matches when currentInput changes
  useEffect(() => {
    if (!currentInput) {
        setAutocompleteMatches([]);
        setAutocompleteCurrentIndex(-1);
        return;
    }
    const lowercasedInput = currentInput.toLowerCase();
    const matches = knownCommands.filter(cmd => cmd.toLowerCase().startsWith(lowercasedInput));
    setAutocompleteMatches(matches);
    setAutocompleteCurrentIndex(-1); // Reset index whenever input changes
  }, [currentInput, knownCommands]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // Focus on input when terminal is ready
  useEffect(() => {
    if (!booting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booting]);

  // Scroll to bottom on history update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Modal focus management
  useEffect(() => {
    if (showAvatarModal) {
      closeButtonRef.current?.focus(); // Focus the close button when modal opens
    } else {
      inputRef.current?.focus(); // Return focus to terminal input when modal closes
    }
  }, [showAvatarModal]);


  // Boot sequence typing effect
  useEffect(() => {
    let timeoutId: number;
    if (booting) {
      if (bootLineIndex < BOOT_SEQUENCE.length) {
        const currentBootLine = BOOT_SEQUENCE[bootLineIndex];

        timeoutId = window.setTimeout(() => {
          setHistory(prev => {
            const newHistory = [...prev];
            
            // Ensure array has enough length for bootLineIndex and fill with placeholders if needed
            while (newHistory.length <= bootLineIndex) {
              newHistory.push({ id: `boot-placeholder-${newHistory.length}`, type: 'boot', content: '' });
            }

            // Retrieve existing content if it was already a boot line being typed
            const existingContent = (newHistory[bootLineIndex] && newHistory[bootLineIndex].type === 'boot') 
                                    ? newHistory[bootLineIndex].content : '';

            let updatedContent = existingContent;
            let isLineFullyTyped = false;

            if (bootCharIndex < currentBootLine.length) {
                updatedContent = currentBootLine.substring(0, bootCharIndex + 1);
            } else {
                updatedContent = currentBootLine;
                isLineFullyTyped = true;
            }

            // Create or re-initialize the entry for the current bootLineIndex
            const currentBootEntry: TerminalEntry = {
              id: `boot-${bootLineIndex}`, // Use stable ID for boot lines
              type: 'boot',
              content: updatedContent,
            };
            newHistory[bootLineIndex] = currentBootEntry; // Place the updated entry in the array
            
            return newHistory;
          });

          if (bootCharIndex < currentBootLine.length) {
            setBootCharIndex(bootCharIndex + 1);
          } else {
            // Line fully typed, move to next line
            timeoutId = window.setTimeout(() => {
              setBootLineIndex(bootLineIndex + 1);
              setBootCharIndex(0);
            }, 500); // Pause before next line
          }
        }, 30); // Typing speed
      } else {
        setBooting(false); // Boot sequence complete
      }
    }
    return () => window.clearTimeout(timeoutId);
  }, [booting, bootLineIndex, bootCharIndex]); // Depend on bootLineIndex and bootCharIndex for re-runs


  const handleCommand = (command: string) => {
    const normalizedCommand = command.trim(); // Keep original casing for history display
    const lowercasedCommand = normalizedCommand.toLowerCase();
    const parts = lowercasedCommand.split(' ');
    const commandVerb = parts[0];
    const commandArg = parts[1]; // For 'theme' command, 'show' command or sub-commands
    let outputLines: string[] = [];

    // Reset autocomplete state after command submission
    setAutocompleteMatches([]);
    setAutocompleteCurrentIndex(-1);

    // Add command to history unless it's a 'clear' command
    if (normalizedCommand !== 'clear' && normalizedCommand !== '') {
        setCommandHistory(prev => {
            const newHistory = [...prev, normalizedCommand];
            setHistoryIndex(newHistory.length); // Reset index to the end
            return newHistory;
        });
    } else if (normalizedCommand === '') {
        // If empty command, just add the prompt and no output, then return
        setHistory(prev => [
            ...prev,
            { 
                id: Date.now(), 
                type: 'command', 
                content: `<span class="prompt-history-color">${PROMPT}</span><span class="command-text-color">${normalizedCommand}</span>` 
            },
        ]);
        setCurrentInput('');
        setHistoryIndex(commandHistory.length); // Reset index even for empty input
        return;
    }

    switch (commandVerb) {
      case 'help':
        outputLines = HELP_COMMANDS;
        break;
      case 'clear':
        setHistory([]);
        setCurrentInput('');
        setHistoryIndex(commandHistory.length); // Reset index after clear
        return; // Don't add command itself to history if clearing
      case 'show':
        if (commandArg === 'profile') {
          if (parts[2] === 'all') { // Handle 'show profile all'
            outputLines.push('', `<span class="category">--- Personal Information ---</span>`);
            outputLines.push(
              `<span class="command-name">Tên:</span> <span class="white-text">${PERSONAL_INFO_DATA.name}</span>`,
              `<span class="command-name">Vị trí:</span> <span class="white-text">${PERSONAL_INFO_DATA.position}</span>`,
              `<span class="label">Số điện thoại:</span> ${PERSONAL_INFO_DATA.phone}`,
              `<span class="label">Email:</span> ${PERSONAL_INFO_DATA.email}`,
              `<span class="label">Địa chỉ:</span> ${PERSONAL_INFO_DATA.address}`
            );
            outputLines.push(
              '',
              `<span class="category">--- Education ---</span>`,
              `<span class="label">Degree:</span> ${EDUCATION_DATA.degree}`,
              `<span class="label">University:</span> ${EDUCATION_DATA.university}`,
              `<span class="label">Graduation Year:</span> ${EDUCATION_DATA.graduationYear}`
            );
            outputLines.push(
              '',
              `<span class="category">--- Career Summary ---</span>`,
              SUMMARY_TEXT,
              '',
              `<span class="category">--- Work Experience ---</span>`,
              ...EXPERIENCE_LIST,
              '',
              `<span class="category">--- Technical Skills ---</span>`,
            );
            Object.entries(SKILLS_DATA).forEach(([category, skills]) => {
              outputLines.push(`<span class="category">${category}:</span>`);
              skills.forEach(skill => outputLines.push(`  - ${skill}`));
            });
            outputLines.push(
              '',
              `<span class="category">--- Personal Projects ---</span>`,
              ...PROJECTS_DATA,
              '',
              `<span class="category">--- Contact Information ---</span>`,
            );
            CONTACTS_DATA.forEach(contact => {
              if (contact.type === 'phone') {
                outputLines.push(`${contact.label}: ${contact.display}`);
              } else {
                const domainOutput = contact.domain ? `<span class="domain-name">${contact.domain}</span>` : '';
                const ipOutput = contact.ip ? ` (<span class="ip-address">${contact.ip}</span>)` : '';
                const pingStatus = contact.domain ? ` - PING SUCCESS (<span class="ping-time">${Math.floor(Math.random() * 5) + 1}ms</span>)` : ''; // Simulated ping time
                
                outputLines.push(`${domainOutput}${ipOutput}${pingStatus}`);
                // Ensure links are formatted correctly as <a> tags
                outputLines.push(`    <a href="${contact.value}" target="_blank" rel="noopener noreferrer">${contact.display}</a>`);
              }
            });
            outputLines.push('', '<span class="success-code">CODE 200: OK</span>');

          } else { // Handle 'show profile'
            outputLines = [
              '', // Empty line for spacing
              `<span class="command-name">Tên:</span> <span class="white-text">${PERSONAL_INFO_DATA.name}</span>`,
              `<span class="command-name">Vị trí:</span> <span class="white-text">${PERSONAL_INFO_DATA.position}</span>`,
              `<span class="label">Số điện thoại:</span> ${PERSONAL_INFO_DATA.phone}`,
              `<span class="label">Email:</span> ${PERSONAL_INFO_DATA.email}`,
              `<span class="label">Địa chỉ:</span> ${PERSONAL_INFO_DATA.address}`,
            ];
          }
        } else if (commandArg === 'education') {
          outputLines = [
            '',
            `<span class="category">--- Education ---</span>`,
            `<span class="label">Degree:</span> ${EDUCATION_DATA.degree}`,
            `<span class="label">University:</span> ${EDUCATION_DATA.university}`,
            `<span class="label">Graduation Year:</span> ${EDUCATION_DATA.graduationYear}`,
          ];
        } else if (commandArg === 'skills') {
          outputLines = ['']; // Add an empty line for spacing
          Object.entries(SKILLS_DATA).forEach(([category, skills]) => {
            outputLines.push(`<span class="category">${category}:</span>`);
            skills.forEach(skill => outputLines.push(`  - ${skill}`));
          });
        } else if (commandArg === 'avatar') {
            setShowAvatarModal(true);
            outputLines = [`Displaying avatar.`];
        } else {
            outputLines = [`<span class="command-error">Invalid 'show' argument: ${commandArg}.</span> Try 'show profile', 'show profile all', 'show education', 'show skills', or 'show avatar'.`];
        }
        break;
      case 'close': // New command for closing avatar
        if (commandArg === 'avatar') {
            setShowAvatarModal(false);
            outputLines = [`Avatar modal closed.`];
        } else {
            outputLines = [`<span class="command-error">Invalid 'close' argument: ${commandArg}.</span> Try 'close avatar'.`];
        }
        break;
      case 'cat':
        if (commandArg === 'summary.txt') {
            outputLines = [SUMMARY_TEXT];
        } else if (commandArg === '/experience/st_connection_erp.log') {
            outputLines = ST_CONNECTION_ERP_DETAIL.split('\n');
        } else if (commandArg === '/experience/project_x_frontend.log') {
            outputLines = PROJECT_X_FRONTEND_DETAIL.split('\n');
        } else {
            outputLines = [`<span class="command-error">File not found: ${commandArg}.</span>`];
        }
        break;
      case 'ls':
        if (commandArg === '-l' && parts[2] === '/experience') {
            outputLines = EXPERIENCE_LIST;
        } else {
            outputLines = [`<span class="command-error">Invalid 'ls' argument: ${commandArg}.</span> Try 'ls -l /experience'.`];
        }
        break;
      case 'view':
        if (commandArg === 'projects') {
            outputLines = [...PROJECTS_DATA, '', '<span class="success-code">CODE 200: OK</span>'];
        } else {
            outputLines = [`<span class="command-error">Invalid 'view' argument: ${commandArg}.</span> Try 'view projects'.`];
        }
        break;
      case 'ping':
        if (commandArg === 'contacts') {
            outputLines = ['']; // Add an empty line for spacing
            CONTACTS_DATA.forEach(contact => {
              if (contact.type === 'phone') {
                outputLines.push(`${contact.label}: ${contact.display}`);
              } else {
                const domainOutput = contact.domain ? `<span class="domain-name">${contact.domain}</span>` : '';
                const ipOutput = contact.ip ? ` (<span class="ip-address">${contact.ip}</span>)` : '';
                const pingStatus = contact.domain ? ` - PING SUCCESS (<span class="ping-time">${Math.floor(Math.random() * 5) + 1}ms</span>)` : ''; // Simulated ping time
                
                outputLines.push(`${domainOutput}${ipOutput}${pingStatus}`);
                // Ensure links are formatted correctly as <a> tags
                outputLines.push(`    <a href="${contact.value}" target="_blank" rel="noopener noreferrer">${contact.display}</a>`);
              }
            });
        } else {
            outputLines = [`<span class="command-error">Invalid 'ping' argument: ${commandArg}.</span> Try 'ping contacts'.`];
        }
        break;
      case 'theme':
        if (commandArg) {
          const availableThemes = ['dark', 'light', 'matrix', 'vscode-dark'];
          if (availableThemes.includes(commandArg)) {
            setCurrentTheme(commandArg as 'dark' | 'light' | 'matrix' | 'vscode-dark');
            outputLines = [`Theme set to '${commandArg}'.`];
          } else {
            outputLines = [`<span class="command-error">Error: Invalid theme '${commandArg}'.</span> Available themes: ${availableThemes.join(', ')}.`];
          }
        } else {
          outputLines = [`Usage: theme <dark|light|matrix|vscode-dark>`];
        }
        break;
      default:
        outputLines = [`<span class="command-error">Command not found: ${normalizedCommand}.</span> Type 'help' for available commands.`];
        break;
    }

    const commandEntry: TerminalEntry = {
        id: `cmd-${Date.now()}`, 
        type: 'command', 
        content: `<span class="prompt-history-color">${PROMPT}</span><span class="command-text-color">${normalizedCommand}</span>` 
    };

    const newOutputEntries: TerminalEntry[] = outputLines.map((line, index) => ({
        id: `output-${Date.now()}-${index}`, // Unique ID for each output line
        type: 'output',
        content: line, // Directly set full content
    }));

    setHistory(prev => [...prev, commandEntry, ...newOutputEntries]);
    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior
      if (autocompleteMatches.length > 0) {
        const nextIndex = (autocompleteCurrentIndex + 1) % autocompleteMatches.length;
        setAutocompleteCurrentIndex(nextIndex);
        setCurrentInput(autocompleteMatches[nextIndex]);
        // Move cursor to end of input field after state update
        if (inputRef.current) {
            // Using setTimeout to ensure the DOM has updated with the new currentInput value
            // before trying to set the selection range.
            setTimeout(() => {
                inputRef.current?.setSelectionRange(autocompleteMatches[nextIndex].length, autocompleteMatches[nextIndex].length);
            }, 0); 
        }
      }
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor from moving to start of input
      // Reset autocomplete state when navigating history
      setAutocompleteMatches([]);
      setAutocompleteCurrentIndex(-1);

      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      } else if (commandHistory.length > 0) { // If at the very first command and pressing up
        setHistoryIndex(0);
        setCurrentInput(commandHistory[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor from moving to end of input
      // Reset autocomplete state when navigating history
      setAutocompleteMatches([]);
      setAutocompleteCurrentIndex(-1);

      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      } else if (historyIndex === commandHistory.length - 1) {
        // If at the last command and pressing down again, clear input
        setHistoryIndex(commandHistory.length);
        setCurrentInput('');
      }
    } else {
        // Any other key press, ensure autocomplete index is reset
        setAutocompleteCurrentIndex(-1);
    }
  };

  return (
    <div className="terminal-container" ref={terminalRef} role="log" aria-live="polite">
      <div className="terminal-content">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`terminal-line`}
          >
            <span dangerouslySetInnerHTML={{ __html: entry.content }}></span>
            {/* Show cursor for boot sequence only */}
            {booting && entry.type === 'boot' && entry.id === `boot-${bootLineIndex}` && (
              <span className="cursor"></span>
            )}
          </div>
        ))}
      </div>
      {!booting && (
        <div className="terminal-input-line">
          <span className="prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal command input"
            disabled={booting} // Only disable input during booting
          />
          <span className="cursor"></span>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div 
          className={`modal-overlay ${showAvatarModal ? 'visible' : ''}`} 
          onClick={() => setShowAvatarModal(false)} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="avatar-modal-caption"
          tabIndex={-1} // Make overlay focusable for accessibility
        >
          <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={AVATAR_URL} alt="ThinhDev Avatar" className="avatar-image" />
            <div id="avatar-modal-caption" className="modal-caption">Avatar of NguyenLePhucThinh</div>
            <button 
              ref={closeButtonRef}
              className="close-button" 
              onClick={() => setShowAvatarModal(false)} 
              aria-label="Close avatar modal"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TerminalApp />
  </React.StrictMode>
);