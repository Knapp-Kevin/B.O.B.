/**
 * File: G:\B.O.B\renderer.js v0.0008-0
 * Purpose: Main application renderer with enhanced chat interface and animations
 * Location: Project root directory
 * 
 * Related files:
 *   - G:\B.O.B\index.html (imports this script)
 *   - G:\B.O.B\models\TaskManager.js (used by this class)
 *   - G:\B.O.B\theme.js (handles theming)
 */

// Import our TaskManager from models directory
import TaskManager from './models/TaskManager.js';
// Import Excel Handler
import ExcelHandler from './utils/ExcelHandler.js';
// Import Adaptive Behavior system
import { AdaptiveBehaviorManager, addAdaptiveBehaviorSettings } from './components/AdaptiveBehavior.js';

class BOBRenderer {
    constructor() {
        // Initialize task manager
        this.taskManager = new TaskManager();
        
        // Initialize our chat and idea storage
        this.chatMessages = [];
        this.ideas = [];
        this.fileAttachments = {
            chat: [],
            ideas: [],
            tasks: []
        };
        
		// Initialize Excel handler for file processing
		this.excelHandler = new ExcelHandler();
		
		// Initialize Adaptive Behavior system
		this.adaptiveBehavior = new AdaptiveBehaviorManager();
		this.adaptiveBehavior.initialize();
    
        // Initialize UI event listeners
        this.initializeEventListeners();
        
        // Render initial task list
        this.renderTaskList();
        
        // Initialize tab navigation with proper hiding/showing
        this.initializeTabs();
        
        // Set up accessibility features
        this.initializeAccessibility();
        
        // Initialize Knowledge Center toggle
        this.initializeKnowledgeCenterToggle();
        
	    // Add adaptive behavior settings to settings panel
		this.initializeAdaptiveSettings();
		
		// Apply adaptive behavior to UI
		this.adaptiveBehavior.applyAdaptiveBehavior();
			
        // Render productivity insights
        this.updateProductivityInsights();
        
        // Load chat history from current session
        this.loadChatHistory();
        
        // Set up clear on exit
        this.clearChatHistoryOnExit();
    }

    initializeTabs() {
		console.log('Initializing tabs');
		
		// Always activate the Chat tab first
		this.activateTab('chat');
		
		// Remove or comment out the following block
		// Restore active tab from localStorage if available
		// const savedTab = localStorage.getItem('bob-active-tab');
		// if (savedTab && document.getElementById(savedTab)) {
		//     this.activateTab(savedTab);
		// }
		
		// Hide all tab content except the active one
		const tabContents = document.querySelectorAll('.tab-content');
		const activeTabContent = document.querySelector('.tab-content.active');
		
		tabContents.forEach(content => {
			if (content !== activeTabContent) {
				content.style.display = 'none';
			} else {
				content.style.display = 'block';
			}
		});
		
		// Add click event listeners to tab links
		const tabLinks = document.querySelectorAll('.tab-link');
		tabLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const tabId = link.dataset.tab;
				this.activateTab(tabId);
			});
		});

		// New: Add initial greeting method
		this.initializeGreeting();
	}

	/**
	 * Activates a specific tab and applies adaptive behavior
	 * @param {string} tabId - ID of the tab to activate
	 */
	activateTab(tabId) {
		console.log('Activating tab:', tabId);
		
		// Apply adaptive behavior if available
		if (this.adaptiveBehavior && this.adaptiveBehavior.settings.enabled) {
			this.adaptiveBehavior.applyAdaptiveBehavior();
		}
		
		// Hide all tab contents
		document.querySelectorAll('.tab-content').forEach(tab => {
			tab.style.display = 'none';
			tab.classList.remove('active');
		});
		
		// Remove active class from all tab links
		document.querySelectorAll('.tab-link').forEach(link => {
			link.classList.remove('active');
		});
		
		// Show selected tab content and add active class
		const activeTab = document.getElementById(tabId);
		if (activeTab) {
			activeTab.style.display = 'block';
			activeTab.classList.add('active');
			
			// Add active class to the corresponding tab link
			const activeLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
			if (activeLink) {
				activeLink.classList.add('active');
			}
			
			// Initialize Knowledge Center when its tab is activated
			if (tabId === 'knowledge' && window.initializeKnowledgeCenter) {
				window.initializeKnowledgeCenter();
			}
			
			// Save active tab to localStorage
			localStorage.setItem('bob-active-tab', tabId);
		}
	}

	// Add these new methods to the class
	initializeGreeting() {
		const currentDate = new Date();
		const hour = currentDate.getHours();
		const userName = 'Kevin'; // This could be dynamically set later

		// Determine greeting based on time of day
		let timeGreeting = '';
		if (hour >= 5 && hour < 12) {
			timeGreeting = 'Good Morning';
		} else if (hour >= 12 && hour < 17) {
			timeGreeting = 'Good Afternoon';
		} else if (hour >= 17 && hour < 22) {
			timeGreeting = 'Good Evening';
		} else {
			timeGreeting = 'Good Night';
		}

		// Holiday check
		const holiday = this.checkForHoliday(currentDate);

		// Construct message
		let message = `${timeGreeting}, ${userName}!`;
		
		// Add holiday greeting if applicable
		if (holiday) {
			message += ` Happy ${holiday}!`;
		}

		// Late night encouragement
		if (hour >= 23 || hour < 5) {
			message += " It's getting late. Consider winding down to support your circadian rhythm and manage cortisol levels.";
		}

		// Send initial greeting
		this.addChatMessage('assistant', message);
	}

	checkForHoliday(inputDate) {
		// Ensure we have a valid Date object
		let date;
		try {
			// If inputDate is undefined or null, use current date
			if (inputDate == null) {
				date = new Date();
			} 
			// If it's already a Date object, use it directly
			else if (inputDate instanceof Date) {
				date = inputDate;
			} 
			// Try to create a Date object from the input
			else {
				date = new Date(inputDate);
			}

			// Validate the date
			if (isNaN(date.getTime())) {
				console.warn('Invalid date provided');
				return null;
			}

			const year = date.getFullYear();
			const month = date.getMonth();
			const day = date.getDate();

			const holidays = {
				// Fixed Date Holidays
				"New Year's Day": (m, d) => m === 0 && d === 1,
				"Independence Day": (m, d) => m === 6 && d === 4,
				"Veterans Day": (m, d) => m === 10 && d === 11,
				"Christmas Day": (m, d) => m === 11 && d === 25,

				// Holidays with specific day/week rules
				"Martin Luther King Jr. Day": this.isNthMondayInMonth(year, 0, 3), // 3rd Monday in January
				"Presidents' Day": this.isNthMondayInMonth(year, 1, 3), // 3rd Monday in February
				"Memorial Day": this.isLastMondayInMonth(year, 4), // Last Monday in May
				"Labor Day": this.isNthMondayInMonth(year, 8, 1), // 1st Monday in September
				"Columbus Day": this.isNthMondayInMonth(year, 9, 2), // 2nd Monday in October
				"Thanksgiving Day": this.isNthThursdayInMonth(year, 10, 4), // 4th Thursday in November
			};

			for (const [holiday, checkFunc] of Object.entries(holidays)) {
				if (checkFunc(month, day)) {
					return holiday;
				}
			}

			return null;
		} catch (error) {
			console.error('Error in checkForHoliday:', error);
			return null;
		}
	}

	// Helper method to check for nth Monday in a month
	isNthMondayInMonth(year, month, n) {
		return (date) => {
			const firstDay = new Date(year, month, 1);
			const dayOfWeek = firstDay.getDay();
			let firstMonday = 1 + ((7 - dayOfWeek) % 7);
			let targetMonday = firstMonday + (7 * (n - 1));
			
			return date.getMonth() === month && 
				   date.getDate() === targetMonday;
		};
	}

	// Helper method to find the last Monday in a month
	isLastMondayInMonth(year, month) {
		return (date) => {
			const lastDay = new Date(year, month + 1, 0);
			const dayOfWeek = lastDay.getDay();
			const lastMonday = lastDay.getDate() - ((dayOfWeek + 6) % 7);
			
			return date.getMonth() === month && 
				   date.getDate() === lastMonday;
		};
	}

	// Helper method to check for nth Thursday in a month
	isNthThursdayInMonth(year, month, n) {
		return (date) => {
			const firstDay = new Date(year, month, 1);
			const dayOfWeek = firstDay.getDay();
			let firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
			let targetThursday = firstThursday + (7 * (n - 1));
			
			return date.getMonth() === month && 
				   date.getDate() === targetThursday;
		};
	}

	/**
	 * Initialize adaptive behavior settings in the settings panel
	 */
	initializeAdaptiveSettings() {
		// Find settings container
		const settingsContainer = document.getElementById('settings');
		if (settingsContainer && this.adaptiveBehavior) {
			// Add adaptive behavior settings to the settings panel
			if (typeof addAdaptiveBehaviorSettings === 'function') {
				addAdaptiveBehaviorSettings(settingsContainer, this.adaptiveBehavior);
			}
		}
	}

    initializeEventListeners() {
        // Task Addition
        const addTaskButton = document.getElementById('addTask');
        const newTaskInput = document.getElementById('newTask');
        
        if (addTaskButton && newTaskInput) {
            addTaskButton.addEventListener('click', () => this.addTask());
            newTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        // Suggest Tasks from Chat
        const suggestTasksFromChatButton = document.getElementById('suggestTasksFromChat');
        if (suggestTasksFromChatButton) {
            suggestTasksFromChatButton.addEventListener('click', () => this.suggestTasksFromChat());
        }

        // Chat functionality
        const sendChatButton = document.getElementById('sendChat');
        const chatInput = document.getElementById('chatInput');
        if (sendChatButton && chatInput) {
            sendChatButton.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                // Send message on Enter without Shift key
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent new line
                    this.sendChatMessage();
                }
                // Allow new line with Shift+Enter
            });
            
            // Auto resize textarea as user types
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto'; // Reset height
                chatInput.style.height = (chatInput.scrollHeight) + 'px';
            });
        }
        
        // Chat file upload
        const chatFileUpload = document.getElementById('chatFileUpload');
        if (chatFileUpload) {
            chatFileUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'chat'));
        }
        
        // Idea Board functionality
        const addIdeaButton = document.getElementById('addIdea');
        const ideaInput = document.getElementById('ideaInput');
        const ideaTagsInput = document.getElementById('ideaTags');
        
        if (addIdeaButton && ideaInput) {
            addIdeaButton.addEventListener('click', () => this.addIdea());
            ideaInput.addEventListener('keypress', (e) => {
                // Add idea on Ctrl+Enter
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.addIdea();
                }
            });
            
            // Auto resize textarea as user types
            ideaInput.addEventListener('input', () => {
                ideaInput.style.height = 'auto'; // Reset height
                ideaInput.style.height = (ideaInput.scrollHeight) + 'px';
            });
        }
        
        // Idea file upload
        const ideaFileUpload = document.getElementById('ideaFileUpload');
        if (ideaFileUpload) {
            ideaFileUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'ideas'));
        }
        
        // Task file upload
        const taskFileUpload = document.getElementById('taskFileUpload');
        if (taskFileUpload) {
            taskFileUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'tasks'));
        }
        
        // Suggest Tasks from Ideas
        const suggestTasksFromIdeasButton = document.getElementById('suggestTasksFromIdeas');
        if (suggestTasksFromIdeasButton) {
            suggestTasksFromIdeasButton.addEventListener('click', () => this.suggestTasksFromIdeas());
        }

        // Settings Panel Events
        this.initializeSettingsEvents();

        // Priority and Status Change Handlers
        this.setupTaskListeners();
    }
    
	async handleFileUpload(event, fileType) {
		const file = event.target.files[0];
		if (!file) return;
		
		try {
			// Store basic file info 
			const fileInfo = {
				name: file.name,
				type: file.type,
				size: file.size,
				lastModified: file.lastModified,
				date: new Date()
			};
			
			// Special handling for Excel files in chat
			if (fileType === 'chat' && this.excelHandler.isExcelFile(file)) {
				try {
					// Process Excel file
					const excelInfo = await this.excelHandler.processFile(file);
					
					// Add Excel-specific info
					fileInfo.excel = excelInfo;
					
					// Add to attachments
					this.fileAttachments[fileType].push(fileInfo);
					
					// Show success toast
					this.showToast(`Excel file "${file.name}" attached`, 'success');
					
					// Format Excel info for chat
					const formattedMessage = this.excelHandler.formatFileInfoForChat(excelInfo);
					
					// Add message to chat
					this.addChatMessage('system', formattedMessage);
					
					// Try to get data preview
					try {
						const dataPreview = this.excelHandler.getDataPreview();
						if (dataPreview && dataPreview.length > 0) {
							const firstItem = dataPreview[0];
							if (Array.isArray(firstItem) && firstItem[0] && 
								firstItem[0].includes("XLSX library not available")) {
								// If XLSX library is missing, show a different message
								this.addChatMessage('system', 
									"Note: Excel file content can't be previewed because the XLSX library isn't loaded. " +
									"You can still refer to the file in your questions.");
							} else {
								// Format the preview as markdown table
								const previewTable = this.excelHandler.formatDataPreviewForChat(dataPreview);
								
								// Add preview to chat
								this.addChatMessage('system', `**Data Preview**:\n${previewTable}`);
							}
						}
					} catch (previewError) {
						console.warn('Error creating data preview:', previewError);
						this.addChatMessage('system', 
							"Excel preview isn't available, but you can still ask questions about the file.");
					}
				} catch (error) {
					console.error('Error processing Excel file:', error);
					this.showToast(`Error processing Excel file: ${error.message}`, 'error');
					
					// Still add basic file info
					this.fileAttachments[fileType].push(fileInfo);
				}
			} else {
				// Standard file handling for non-Excel files or non-chat attachments
				this.fileAttachments[fileType].push(fileInfo);
				
				// Show success toast
				this.showToast(`File "${file.name}" attached`, 'success');
			}
			
			// Update UI to show the attached file
			const fileListElement = document.getElementById(`${fileType}FileList`);
			if (fileListElement) {
				this.renderFileList(fileType, fileListElement);
			} else {
				// If no dedicated file list element, just show the toast
				console.log(`File attached to ${fileType}: ${file.name}`);
			}
			
			// Set flag for future reference
			this.hasProcessedFiles = true;
			
			// Clear the file input for future uploads
			event.target.value = '';
		} catch (error) {
			console.error('Error handling file upload:', error);
			this.showToast(`Error attaching file: ${error.message}`, 'error');
			event.target.value = '';
		}
	}

    renderFileList(fileType, listElement) {
        const files = this.fileAttachments[fileType];
        if (!files || files.length === 0) {
            listElement.innerHTML = '<p>No files attached</p>';
            return;
        }
        
        listElement.innerHTML = '';
        files.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            
            const fileDate = new Date(file.date);
            const formattedDate = fileDate.toLocaleDateString();
            
            fileElement.innerHTML = `
                <div class="file-icon">📄</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-info">${this.formatFileSize(file.size)} - ${formattedDate}</div>
                </div>
                <button class="file-remove" data-type="${fileType}" data-index="${index}">✕</button>
            `;
            
            listElement.appendChild(fileElement);
        });
        
        // Add click listeners to remove buttons
        listElement.querySelectorAll('.file-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                this.removeFile(type, index);
            });
        });
    }
    
    removeFile(fileType, index) {
        const files = this.fileAttachments[fileType];
        if (files && index >= 0 && index < files.length) {
            const removedFile = files.splice(index, 1)[0];
            
            // Update UI
            const fileListElement = document.getElementById(`${fileType}FileList`);
            if (fileListElement) {
                this.renderFileList(fileType, fileListElement);
            }
            
            // Show toast
            this.showToast(`File "${removedFile.name}" removed`, 'info');
        }
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    initializeSettingsEvents() {
        // Initialize theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Make sure theme toggle works from the renderer as well
            themeToggle.addEventListener('change', (e) => {
                // Update the body class for theme
                const isDarkTheme = e.target.checked;
                if (isDarkTheme) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
                
                // Show toast notification
                this.showToast(`Theme: ${isDarkTheme ? 'Dark' : 'Light'}`, 'info');
                
                // Also update the theme label text
                const themeLabel = document.querySelector('label[for="themeToggle"]');
                if (themeLabel) {
                    themeLabel.textContent = `Theme: ${isDarkTheme ? 'Dark' : 'Light'}`;
                }
            });
        }
        
        // Initialize reduced motion detection
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.addEventListener('change', (e) => {
                const isReducedMotion = e.target.checked;
                document.documentElement.setAttribute('data-reduce-motion', isReducedMotion.toString());
                
                // Show toast notification
                this.showToast(`Animations ${isReducedMotion ? 'disabled' : 'enabled'}`, 'info');
            });
        }
        
        // Add an event listener for contrast setting
        const contrastSelect = document.getElementById('contrastSelect');
        if (contrastSelect) {
            contrastSelect.addEventListener('change', (e) => {
                const contrastValue = e.target.value;
                document.documentElement.setAttribute('data-contrast', contrastValue);
                
                // Show toast notification
                this.showToast(`Contrast: ${contrastValue.charAt(0).toUpperCase() + contrastValue.slice(1)}`, 'info');
            });
        }
        
        // Add an event listener for color blindness mode
        const colorBlindSelect = document.getElementById('colorBlindSelect');
        if (colorBlindSelect) {
            colorBlindSelect.addEventListener('change', (e) => {
                const colorBlindMode = e.target.value;
                if (colorBlindMode === 'none') {
                    document.documentElement.removeAttribute('data-color-blind');
                } else {
                    document.documentElement.setAttribute('data-color-blind', colorBlindMode);
                }
                
                // Show toast notification
                const modeName = colorBlindMode === 'none' ? 'None' : 
                    colorBlindMode.charAt(0).toUpperCase() + colorBlindMode.slice(1);
                this.showToast(`Color Blind Mode: ${modeName}`, 'info');
            });
        }
        
        // Initialize Knowledge Center toggle
        const knowledgeCenterToggle = document.getElementById('enable-knowledge-center');
        if (knowledgeCenterToggle) {
            knowledgeCenterToggle.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                localStorage.setItem('enableKnowledgeCenter', isEnabled);
                this.toggleKnowledgeCenterTab(isEnabled);
                
                // Show toast notification
                this.showToast(`Knowledge Center ${isEnabled ? 'enabled' : 'disabled'}`, 'info');
            });
        }
    }
    
    initializeKnowledgeCenterToggle() {
        // Check if Knowledge Center toggle exists
        const knowledgeCenterToggle = document.getElementById('enable-knowledge-center');
        
        if (knowledgeCenterToggle) {
            // Set initial state based on localStorage
            const isEnabled = localStorage.getItem('enableKnowledgeCenter') === 'true';
            knowledgeCenterToggle.checked = isEnabled;
            
            // Initialize tab visibility
            this.toggleKnowledgeCenterTab(isEnabled);
        }
    }
    
    toggleKnowledgeCenterTab(isEnabled) {
        // Find the tab container
        const tabContainer = document.querySelector('.tab-navigation ul');
        let knowledgeTab = document.querySelector('.tab-link[data-tab="knowledge"]');
        
        if (isEnabled && !knowledgeTab) {
            // Create and append Knowledge tab as the last tab
            const tabItem = document.createElement('li');
            tabItem.innerHTML = `<a href="#" class="tab-link" data-tab="knowledge">Knowledge Center</a>`;
            tabContainer.appendChild(tabItem);
            
            // Get the newly created tab link
            knowledgeTab = tabItem.querySelector('.tab-link');
            
            // Add event listener
            knowledgeTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateTab('knowledge');
            });
            
            // Initialize Knowledge tab content if it's already active
            const activeTab = localStorage.getItem('bob-active-tab');
            if (activeTab === 'knowledge') {
                this.activateTab('knowledge');
            }
        } else if (!isEnabled && knowledgeTab) {
            // Remove the Knowledge tab
            const tabItem = knowledgeTab.parentNode;
            tabItem.remove();
            
            // If Knowledge tab was active, switch to another tab
            const activeTab = localStorage.getItem('bob-active-tab');
            if (activeTab === 'knowledge') {
                // Default to chat tab
                this.activateTab('chat');
            }
        }
    }
    
    initializeAccessibility() {
        // Add keyboard navigation for tab selection
        document.addEventListener('keydown', (e) => {
            // Alt + 1-5 for tab navigation
            if (e.altKey) {
                const tabIndex = parseInt(e.key);
                if (tabIndex >= 1 && tabIndex <= 5) {
                    const tabLinks = document.querySelectorAll('.tab-link');
                    if (tabLinks[tabIndex - 1]) {
                        e.preventDefault();
                        const tabId = tabLinks[tabIndex - 1].dataset.tab;
                        this.activateTab(tabId);
                    }
                }
            }
        });
        
        // Ensure all interactive elements have appropriate ARIA roles
        this.enhanceAccessibility();
    }
    
    enhanceAccessibility() {
        // Add appropriate ARIA attributes to tabs
        const tabs = document.querySelectorAll('.tab-content');
        const tabLinks = document.querySelectorAll('.tab-link');
        
        tabs.forEach((tab, index) => {
            const id = tab.id;
            const tabLink = tabLinks[index];
            
            tab.setAttribute('role', 'tabpanel');
            tab.setAttribute('aria-labelledby', `tab-${id}`);
            
            tabLink.setAttribute('role', 'tab');
            tabLink.setAttribute('id', `tab-${id}`);
            tabLink.setAttribute('aria-controls', id);
            tabLink.setAttribute('aria-selected', tabLink.classList.contains('active').toString());
        });
    }
    
    // Task management methods
    addTask() {
        const newTaskInput = document.getElementById('newTask');
        const taskTitle = newTaskInput.value.trim();
        
        if (taskTitle) {
            const task = this.taskManager.createTask(taskTitle, {
                priority: this.getPriorityFromUI(),
                estimatedTime: this.getEstimatedTimeFromUI()
            });
            
            this.renderTaskList();
            newTaskInput.value = ''; // Clear input
            
            // Update insights
            this.updateProductivityInsights();
            
            // Show success toast
            this.showToast('Task added successfully!', 'success');
        }
    }
    
    // Chat methods with enhanced functionality
	sendChatMessage() {
		const chatInput = document.getElementById('chatInput');
		const message = chatInput.value.trim();
		
		if (message) {
			// Add user message to chat display
			this.addChatMessage('user', message);
			
			// Store the message for AI analysis later
			this.chatMessages.push({
				role: 'user',
				content: message,
				timestamp: new Date()
			});
			
			// Save chat history for the current session
			this.saveChatHistory();
			
			chatInput.value = ''; // Clear input
			chatInput.style.height = 'auto'; // Reset height
			
			// Record interaction for adaptive behavior
			if (this.adaptiveBehavior) {
				this.adaptiveBehavior.cognitiveProfile.recordInteraction('featureUsage', {
					feature: 'chat',
					duration: 0
				});
			}
			
			// Improved typing indicator with animation
			const typingMessage = document.createElement('div');
			typingMessage.className = 'chat-message assistant-message thinking-message';
			typingMessage.innerHTML = `
				<div class="message-header">
					<div class="message-sender">B.O.B.</div>
					<div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
				</div>
				<div class="message-text">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			`;
			
			const chatMessages = document.getElementById('chatMessages');
			chatMessages.appendChild(typingMessage);
			chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
			
			// Get adaptive strategy to inform AI response
			const adaptiveStrategy = this.adaptiveBehavior ? 
				this.adaptiveBehavior.getInteractionStrategy() : null;
			
			// Connect to AI server with adaptive context
			this.requestAIResponse(message, typingMessage, adaptiveStrategy);
		}
	}
    
	requestAIResponse(message, typingIndicator, adaptiveStrategy = null) {
		// Get file attachments for chat
		const fileAttachments = this.fileAttachments.chat || [];
		
		// Create request body with adaptive context and file information
		const requestBody = {
			text: message,
			userData: {
				energyLevel: 7,
				preferredWorkingHours: "9am-5pm"
			},
			adaptiveContext: adaptiveStrategy,
			// Include basic file information
			files: fileAttachments.map(file => ({
				name: file.name,
				type: file.type,
				size: file.size,
				isExcel: file.excel ? true : false,
				// Include basic Excel info if available
				excelInfo: file.excel ? {
					sheetNames: file.excel.sheetNames,
					rowCount: file.excel.rowCount,
					columnCount: file.excel.columnCount,
					headers: file.excel.headers
				} : null
			})),
			hasAttachedFiles: fileAttachments.length > 0
		};
		
		console.log('Sending request to AI server:', {
			message: message,
			hasFiles: fileAttachments.length > 0,
			fileCount: fileAttachments.length
		});
		
		// Try to connect to AI server
		fetch('http://localhost:3001/api/ai/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('AI server not available');
			}
			return response.json();
		})
		.then(data => {
			// Remove typing indicator
			if (typingIndicator) {
				typingIndicator.remove();
			}
			
			// Add AI response from server
			this.addChatMessage('assistant', data.response);
			
			// Store the AI response
			this.chatMessages.push({
				role: 'assistant',
				content: data.response,
				timestamp: new Date()
			});
			
			// Save chat history
			this.saveChatHistory();
		})
		.catch(error => {
			console.error('Error connecting to AI server:', error);
			
			// Remove typing indicator
			if (typingIndicator) {
				typingIndicator.remove();
			}
			
			// Use adaptive communication style for offline response if available
			let response = 'The AI server appears to be offline. Please start the AI server to enable full chat functionality.';
			
			if (adaptiveStrategy && adaptiveStrategy.communicationStyle === 'supportive') {
				response = 'I notice the AI server isn\'t responding right now. Would you like help starting the server so we can continue our conversation?';
			} else if (adaptiveStrategy && adaptiveStrategy.communicationStyle === 'direct') {
				response = 'AI server offline. Start the server to continue.';
			} else if (adaptiveStrategy && adaptiveStrategy.communicationStyle === 'detailed') {
				response = 'The AI server connection failed. Please check that the server is running at http://localhost:3001 and restart it if necessary. Once the server is active, your messages will be processed normally.';
			}
			
			// Add placeholder response
			this.addChatMessage('assistant', response);
			
			// Store the placeholder response
			this.chatMessages.push({
				role: 'assistant',
				content: response,
				timestamp: new Date()
			});
			
			// Save chat history
			this.saveChatHistory();
		});
	}
    
    // Enhanced chat message display with timestamps
    addChatMessage(sender, text, isThinking = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}-message`;
        if (isThinking) {
            messageEl.className += ' thinking-message';
        }
        
        // Format timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-header">
                <div class="message-sender">${sender === 'user' ? 'You' : sender === 'assistant' ? 'B.O.B.' : 'System'}</div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-text">${text}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }
    
    // Save chat history to session storage
    saveChatHistory() {
        // Save to sessionStorage (only persists for current session)
        try {
            sessionStorage.setItem('bob-chat-history', JSON.stringify(this.chatMessages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    // Load chat history from session storage
    loadChatHistory() {
        try {
            const savedHistory = sessionStorage.getItem('bob-chat-history');
            if (savedHistory) {
                this.chatMessages = JSON.parse(savedHistory);
                
                // Render saved messages to chat interface
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    chatMessages.innerHTML = ''; // Clear existing messages
                    
                    this.chatMessages.forEach(msg => {
                        this.addChatMessage(msg.role, msg.content);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    // Clear chat history when application is closed
    clearChatHistoryOnExit() {
        // When the window is about to unload (close/refresh), clear chat history
        window.addEventListener('beforeunload', () => {
            sessionStorage.removeItem('bob-chat-history');
        });
    }
    
	/**
	 * Generate adaptive task suggestions based on cognitive profile
	 * @returns {Array} Task suggestion strings
	 */
	getAdaptiveTaskSuggestions() {
		if (!this.adaptiveBehavior || !this.adaptiveBehavior.settings.enabled || 
			!this.adaptiveBehavior.settings.adaptiveSuggestions) {
			// Fall back to standard suggestion logic if adaptive behavior is disabled
			return this.analyzeChatForTasks();
		}
		
		// Get task suggestions from adaptive behavior system
		const adaptiveSuggestions = this.adaptiveBehavior.generateTaskSuggestions(this.taskManager.tasks);
		
		if (!adaptiveSuggestions || !adaptiveSuggestions.taskOrder || adaptiveSuggestions.taskOrder.length === 0) {
			// Fall back to standard suggestions if adaptive system doesn't produce any
			return this.analyzeChatForTasks();
		}
		
		// Get break suggestions
		const breakSuggestions = adaptiveSuggestions.breakSuggestions || [];
		
		// Add break-related tasks if appropriate
		if (breakSuggestions.length > 0) {
			// Add a "take a break" task - randomly select one of the break activities
			const randomBreak = breakSuggestions[Math.floor(Math.random() * breakSuggestions.length)];
			return [
				`Schedule focus time for ${adaptiveSuggestions.timeBlocks[0]?.taskTitle || 'high priority task'}`,
				`Take a short break: ${randomBreak.activity} (${randomBreak.duration} mins)`,
				`Review progress on current priorities`
			];
		}
		
		// Otherwise, return standard task suggestions
		return this.analyzeChatForTasks();
	}

// Then modify your suggestTasksFromChat method to use the new method:
suggestTasksFromChat() {
    // Show loading state
    const suggestTasksButton = document.getElementById('suggestTasksFromChat');
    if (!suggestTasksButton) return;
    
    const originalText = suggestTasksButton.textContent;
    suggestTasksButton.textContent = 'Analyzing...';
    suggestTasksButton.disabled = true;
    
    // Try to connect to AI server
    fetch('http://localhost:3001/api/ai/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: "Generate tasks based on our conversation",
            userData: {},
            metadata: { taskType: "PRIORITIZATION" }
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('AI server not available');
        }
        return response.json();
    })
    .then(data => {
        // Parse tasks from AI response
        const suggestedTasks = this.parseTasksFromAIResponse(data.response);
        
        // Add tasks to task manager
        suggestedTasks.forEach(taskTitle => {
            this.taskManager.createTask(taskTitle, {
                priority: 'medium',
                source: 'chat'
            });
        });
        
        // Render the task list with new tasks
        this.renderTaskList();
        
        // Reset button state
        suggestTasksButton.textContent = originalText;
        suggestTasksButton.disabled = false;
        
        // Show success toast with count
        this.showToast(`${suggestedTasks.length} tasks suggested from chat`, 'success');
        
        // Switch to the Tasks tab to show the new tasks
        this.activateTab('todo');
    })
    .catch(error => {
        console.error('Error suggesting tasks:', error);
        
        // Fallback to adaptive task suggestions when offline
        setTimeout(() => {
            // Use adaptive task suggestions instead of the hardcoded ones
            const suggestedTasks = this.getAdaptiveTaskSuggestions();
            
            // Add tasks to task manager
            suggestedTasks.forEach(taskTitle => {
                this.taskManager.createTask(taskTitle, {
                    priority: 'medium',
                    source: 'chat'
                });
            });
            
            // Rest of the method...
        }, 2000);
    });
}
    
    parseTasksFromAIResponse(response) {
        // Simple parsing of tasks from AI response
        // This can be improved with more sophisticated parsing
        const lines = response.split('\n');
        const tasks = [];
        
        for (const line of lines) {
            // Look for lines that start with common task indicators
            const trimmed = line.trim();
            if (trimmed.startsWith('- ') || 
                trimmed.startsWith('• ') || 
                /^\d+\./.test(trimmed)) {
                
                // Remove the indicator and add to tasks
                let task = trimmed.replace(/^[-•\d.]+\s*/, '');
                if (task) tasks.push(task);
            }
        }
        
        // If no tasks found using bullet points, try to extract sentences
        if (tasks.length === 0) {
            const sentences = response.split(/[.!?]+/);
            for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed.length > 10 && trimmed.length < 100) {
                    tasks.push(trimmed);
                }
            }
        }
        
        // Limit to 5 tasks
        return tasks.slice(0, 5);
    }
    
    analyzeChatForTasks() {
        // This is a fallback method when AI server is not available
        // For now, we'll simulate with some sample tasks
        return [
            'Research project management tools mentioned in chat',
            'Follow up on meeting scheduling discussed in conversation',
            'Create presentation outline based on chat ideas'
        ];
    }
    
    // Idea Board methods
    addIdea() {
        const ideaInput = document.getElementById('ideaInput');
        const ideaTagsInput = document.getElementById('ideaTags');
        
        const content = ideaInput.value.trim();
        const tagsText = ideaTagsInput ? ideaTagsInput.value.trim() : '';
        
        if (content) {
            // Create tags array from comma-separated input
            const tags = tagsText.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
                .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
            
            // Create a new idea object
            const idea = {
                id: Date.now().toString(),
                content,
                tags,
                date: new Date(),
                status: 'active'
            };
            
            // Add to ideas collection
            this.ideas.push(idea);
            
            // Save ideas to local storage
            this.saveIdeas();
            
            // Render the idea in the UI
            this.renderIdea(idea);
            
            // Clear inputs
            ideaInput.value = '';
            if (ideaTagsInput) ideaTagsInput.value = '';
            ideaInput.style.height = 'auto'; // Reset height
            
            // Show success toast
            this.showToast('Idea added successfully!', 'success');
        }
    }
    
    renderIdea(idea) {
        const ideaEntries = document.getElementById('ideaEntries');
        if (!ideaEntries) return;
        
        const ideaEl = document.createElement('div');
        ideaEl.className = 'idea-entry';
        ideaEl.dataset.ideaId = idea.id;
        
        const date = new Date(idea.date);
        const formattedDate = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const tagsHtml = idea.tags && idea.tags.length 
            ? idea.tags.join(' ') 
            : '';
        
        ideaEl.innerHTML = `
            <div class="idea-header">
                <span class="idea-date">${formattedDate}</span>
                <span class="idea-tags">${tagsHtml}</span>
            </div>
            <div class="idea-content">
                <p>${idea.content}</p>
            </div>
        `;
        
        // Insert at the top of the list
        ideaEntries.insertBefore(ideaEl, ideaEntries.firstChild);
    }
    
    saveIdeas() {
        try {
            localStorage.setItem('bob-ideas', JSON.stringify(this.ideas));
        } catch (error) {
            console.error('Error saving ideas:', error);
        }
    }
    
    loadIdeas() {
        try {
            const savedIdeas = localStorage.getItem('bob-ideas');
            if (savedIdeas) {
                this.ideas = JSON.parse(savedIdeas);
                
                // Render all ideas
                const ideaEntries = document.getElementById('ideaEntries');
                if (ideaEntries) {
                    ideaEntries.innerHTML = ''; // Clear existing ideas
                    this.ideas.forEach(idea => this.renderIdea(idea));
                }
            }
        } catch (error) {
            console.error('Error loading ideas:', error);
        }
    }
    
    suggestTasksFromIdeas() {
        // Show loading state
        const suggestTasksButton = document.getElementById('suggestTasksFromIdeas');
        if (!suggestTasksButton) return;
        
        const originalText = suggestTasksButton.textContent;
        suggestTasksButton.textContent = 'Analyzing...';
        suggestTasksButton.disabled = true;
        
        // Collect all idea content for analysis
        const ideaContent = this.ideas.map(idea => idea.content).join('\n\n');
        
        // Try to connect to AI server
        fetch('http://localhost:3001/api/ai/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: `Generate tasks based on these ideas:\n${ideaContent}`,
                userData: {},
                metadata: { taskType: "PRIORITIZATION" }
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('AI server not available');
            }
            return response.json();
        })
        .then(data => {
            // Parse tasks from AI response
            const suggestedTasks = this.parseTasksFromAIResponse(data.response);
            
            // Add tasks to task manager
            suggestedTasks.forEach(taskTitle => {
                this.taskManager.createTask(taskTitle, {
                    priority: 'medium',
                    source: 'ideas'
                });
            });
            
            // Render the task list with new tasks
            this.renderTaskList();
            
            // Reset button state
            suggestTasksButton.textContent = originalText;
            suggestTasksButton.disabled = false;
            
            // Show success toast with count
            this.showToast(`${suggestedTasks.length} tasks suggested from ideas`, 'success');
            
            // Switch to the Tasks tab to show the new tasks
            this.activateTab('todo');
        })
        .catch(error => {
            console.error('Error suggesting tasks from ideas:', error);
            
            // Fallback to simulated tasks
            setTimeout(() => {
                // Generate default suggested tasks
                const suggestedTasks = this.analyzeIdeasForTasks();
                
                // Add tasks to task manager
                suggestedTasks.forEach(taskTitle => {
                    this.taskManager.createTask(taskTitle, {
                        priority: 'medium',
                        source: 'ideas'
                    });
                });
                
                // Render the task list with new tasks
                this.renderTaskList();
                
                // Reset button state
                suggestTasksButton.textContent = originalText;
                suggestTasksButton.disabled = false;
                
                // Show success toast with count
                this.showToast(`${suggestedTasks.length} tasks suggested from ideas`, 'success');
                
                // Switch to the Tasks tab to show the new tasks
                this.activateTab('todo');
            }, 2000);
        });
    }
    
    analyzeIdeasForTasks() {
        // This is a fallback method when AI server is not available
        // For now, we'll simulate with some sample tasks
        return [
            'Research productivity methods from idea board',
            'Outline project proposal based on brainstorming ideas',
            'Create schedule for implementing new concept'
        ];
    }

    renderTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        taskList.innerHTML = ''; // Clear existing tasks

        const prioritizedTasks = this.taskManager.prioritizeTasks();

        prioritizedTasks.forEach(task => {
            const row = document.createElement('tr');
            row.setAttribute('data-task-id', task.id);
            
            // Set appropriate ARIA attributes
            row.setAttribute('role', 'row');
            
            // Add priority class for visual indication
            row.classList.add(`priority-${task.priority}`);
            
            // Add completed class if task is completed
            if (task.status === 'completed') {
                row.classList.add('completed');
            }
            
            // Add source badge if task was AI-suggested
            const sourceBadge = task.source ? 
                `<span class="task-source ${task.source}">${task.source}</span>` : '';
            
            row.innerHTML = `
                <td>${task.title} ${sourceBadge}</td>
                <td>
                    <select class="priority-select focus-visible" data-task-id="${task.id}" aria-label="Task priority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </td>
                <td>${task.estimatedTime || 'Not Set'} mins</td>
                <td>
                    <button class="complete-task focus-visible" data-task-id="${task.id}" aria-label="Complete task">
                        ${task.status === 'completed' ? 'Completed' : 'Complete'}
                    </button>
                    <button class="delete-task focus-visible" data-task-id="${task.id}" aria-label="Delete task">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });

        this.setupTaskListeners();
        this.updateProductivityInsights();
    }

    setupTaskListeners() {
        // Priority Change
        document.querySelectorAll('.priority-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const taskId = e.target.dataset.taskId;
                const newPriority = e.target.value;
                
                // Find the task in our manager
                const task = this.taskManager.tasks.find(t => t.id === taskId);
                if (task) {
                    task.priority = newPriority;
                    this.taskManager.saveTasks();
                    
                    // Update the row's priority class
                    const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
                    if (row) {
                        // Remove all priority classes
                        row.classList.remove('priority-low', 'priority-medium', 'priority-high');
                        // Add the new priority class
                        row.classList.add(`priority-${newPriority}`);
                        
                        // Maintain completed class if needed
                        if (task.status === 'completed') {
                            row.classList.add('completed');
                        }
                    }
                    
                    // Update insights
                    this.updateProductivityInsights();
                    
                    // Show toast notification
                    this.showToast('Task priority updated', 'info');
                }
            });
        });

        // Complete Task
		document.querySelectorAll('.complete-task').forEach(button => {
			button.addEventListener('click', (e) => {
				const taskId = e.target.dataset.taskId;
				const task = this.taskManager.tasks.find(t => t.id === taskId);
				
				if (task) {
					// Toggle completion status
					const newStatus = task.status === 'completed' ? 'pending' : 'completed';
					this.taskManager.updateTaskStatus(taskId, newStatus);
					
					// Update button text
					e.target.textContent = newStatus === 'completed' ? 'Completed' : 'Complete';
					
					// Update row styling
					const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
					if (row) {
						if (newStatus === 'completed') {
							row.classList.add('completed');
						} else {
							row.classList.remove('completed');
						}
					}
					
					// Update task list and insights
					this.updateProductivityInsights();
					
					// Show confirmation toast
					const message = newStatus === 'completed' ? 'Task marked as complete!' : 'Task reopened';
					this.showToast(message, 'success');
					
					// Store the start time if we're marking as completed
					if (newStatus === 'completed' && !task.completedTime) {
						task.completedTime = Date.now();
					}
					
					// Calculate duration if possible
					let duration = null;
					if (task.createdTime && task.completedTime) {
						duration = {
							estimated: task.estimatedTime ? task.estimatedTime * 60 * 1000 : null, // Convert minutes to ms
							actual: task.completedTime - task.createdTime
						};
					}
					
					// Record in adaptive behavior system
					if (this.adaptiveBehavior) {
						this.adaptiveBehavior.recordTaskOutcome(
							taskId, 
							newStatus, 
							duration
						);
					}
				}
			});
		});

        // Delete Task
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                
                // Ask for confirmation before deleting
                if (confirm('Are you sure you want to delete this task?')) {
                    this.taskManager.tasks = this.taskManager.tasks.filter(task => task.id !== taskId);
                    this.taskManager.saveTasks();
                    this.renderTaskList();
                    
                    // Update insights
                    this.updateProductivityInsights();
                    
                    // Show toast notification
                    this.showToast('Task deleted', 'warning');
                }
            });
        });
    }

    updateProductivityInsights() {
        const insights = this.taskManager.getProductivityInsights();
        const insightsElement = document.getElementById('productivityInsights');
        
        if (insightsElement) {
            insightsElement.innerHTML = `
                <h3>Task Overview</h3>
                <div class="flex gap-4 flex-wrap">
                    <div>
                        <p>Total Tasks: <strong>${insights.totalTasks}</strong></p>
                        <p>Completed: <strong>${insights.completedTasks}</strong></p>
                        <p>Pending: <strong>${insights.pendingTasks}</strong></p>
                    </div>
                    <div>
                        <p>Completion Rate: <strong>${insights.completionRate.toFixed(2)}%</strong></p>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: ${insights.completionRate}%"></div>
                        </div>
                    </div>
                </div>
                
                <h3 class="mt-4">Task Distribution</h3>
                <div class="flex gap-4 flex-wrap">
                    <div>
                        <p>High Priority: <strong>${insights.highPriorityTasks}</strong></p>
                        <p>Medium Priority: <strong>${insights.mediumPriorityTasks}</strong></p>
                        <p>Low Priority: <strong>${insights.lowPriorityTasks}</strong></p>
                    </div>
                </div>
            `;
            
            // Simulate rendering charts if in insights tab
            if (document.getElementById('completionChart')) {
                this.renderFakeChart('completionChart', 'Completion Rate Over Time');
            }
            
            if (document.getElementById('priorityChart')) {
                this.renderFakeChart('priorityChart', 'Task Priority Distribution');
            }
        }
    }
    
    renderFakeChart(elementId, title) {
        // This would be replaced with actual chart rendering
        const chartElement = document.getElementById(elementId);
        if (chartElement) {
            chartElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <p style="margin-bottom: 10px;">${title}</p>
                    <div style="color: var(--text-tertiary);">[Chart visualization would appear here]</div>
                </div>
            `;
        }
    }
    
    showToast(message, type = 'info') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
		// Explicitly set styles
        toast.style.color = 'var(--text-primary)';
        toast.style.backgroundColor = 'var(--bg-secondary)';
		
        // Add to document
        document.body.appendChild(toast);
		
		// Logging for debugging
        console.log('Toast created:', {
            message,
            type,
            textColor: window.getComputedStyle(toast).color,
            backgroundColor: window.getComputedStyle(toast).backgroundColor
        });
    
        
        // Automatically remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    getPriorityFromUI() {
        // For now, use medium as default
        // Later we could add a priority selector in the UI
        return 'medium';
    }

    getEstimatedTimeFromUI() {
        // For now, return null as default
        // Later we could add time estimation in the UI
        return null;
    }
}

class CognitiveProfile {
    constructor() {
        this.p = {
            e: 0.65,  // Encoded executive function
            a: 0.55,  // Encoded attention profile
            v: {
                ti: 0.4,  // Task initiation
                wm: 0.7,  // Working memory
                er: 0.6   // Emotional regulation
            }
        };
    }

    // Method to subtly adapt interaction
    adaptInteraction(context) {
        // Implement subtle adaptation based on profile
        const adaptationStrategies = {
            taskBreakdown: this.p.e > 0.5 ? 'detailed' : 'flexible',
            communicationStyle: this.p.v.er < 0.4 ? 'direct' : 'empathetic'
        };

        return adaptationStrategies;
    }
}

// Initialize the renderer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing BOBRenderer');
    window.bobRenderer = new BOBRenderer();
    
    // Load ideas after renderer is initialized
    window.bobRenderer.loadIdeas();
});
