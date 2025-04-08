/**
 * File: G:\B.O.B\renderer.js v0.0007-5
 * Purpose: Main application renderer with fixed tab functionality
 * Location: Project root directory
 * 
 * Related files:
 *   - G:\B.O.B\index.html (imports this script)
 *   - G:\B.O.B\models\TaskManager.js (used by this class)
 *   - G:\B.O.B\theme.js (handles theming)
 */

// Import our TaskManager from models directory
import TaskManager from './models/TaskManager.js';

class BOBRenderer {
    constructor() {
        // Initialize task manager
        this.taskManager = new TaskManager();
        
        // Initialize UI event listeners
        this.initializeEventListeners();
        
        // Render initial task list
        this.renderTaskList();
        
        // Initialize tab navigation with proper hiding/showing
        this.initializeTabs();
        
        // Set up accessibility features
        this.initializeAccessibility();
    }

    initializeTabs() {
        console.log('Initializing tabs');
        
        // First, hide all tab content except the first one
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach((content, index) => {
            if (index !== 0) {
                content.style.display = 'none';
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
        
        // Restore active tab from localStorage if available
        const savedTab = localStorage.getItem('bob-active-tab');
        if (savedTab && document.getElementById(savedTab)) {
            this.activateTab(savedTab);
        }
    }

    activateTab(tabId) {
        console.log('Activating tab:', tabId);
        
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
            
            // Save active tab to localStorage
            localStorage.setItem('bob-active-tab', tabId);
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

        // AI Task Suggestion
        const aiSuggestButton = document.getElementById('aiSuggest');
        if (aiSuggestButton) {
            aiSuggestButton.addEventListener('click', () => this.suggestTasks());
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

        // Settings Panel Events
        this.initializeSettingsEvents();

        // Priority and Status Change Handlers
        this.setupTaskListeners();
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
    }
    
    initializeAccessibility() {
        // Add keyboard navigation for tab selection
        document.addEventListener('keydown', (e) => {
            // Alt + 1-4 for tab navigation
            if (e.altKey) {
                const tabIndex = parseInt(e.key);
                if (tabIndex >= 1 && tabIndex <= 4) {
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
            
            // Show success toast
            this.showToast('Task added successfully!', 'success');
        }
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message to chat display
            this.addChatMessage('user', message);
            chatInput.value = ''; // Clear input
            chatInput.style.height = 'auto'; // Reset height
            
            // Show "thinking" indicator
            this.addChatMessage('system', 'Processing...', true);
            
            // Simulate AI response after a delay
            setTimeout(() => {
                // Remove thinking indicator
                const thinkingMsg = document.querySelector('.thinking-message');
                if (thinkingMsg) {
                    thinkingMsg.remove();
                }
                
                // Add AI response
                this.addChatMessage('assistant', 'This is a placeholder response. Chat functionality is not yet fully implemented.');
            }, 1500);
        }
    }
    
    addChatMessage(sender, text, isThinking = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}-message`;
        if (isThinking) {
            messageEl.className += ' thinking-message';
        }
        
        messageEl.innerHTML = `
            <div class="message-sender">${sender === 'user' ? 'You' : sender === 'assistant' ? 'B.O.B.' : ''}</div>
            <div class="message-text">${text}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    suggestTasks() {
        // Show loading state
        const aiSuggestButton = document.getElementById('aiSuggest');
        if (aiSuggestButton) {
            const originalText = aiSuggestButton.textContent;
            aiSuggestButton.textContent = 'Thinking...';
            aiSuggestButton.disabled = true;
            
            // Simulate AI processing with a timeout
            setTimeout(() => {
                const suggestedTasks = this.taskManager.suggestTasks('current work context');
                this.renderTaskList();
                
                // Reset button state
                aiSuggestButton.textContent = originalText;
                aiSuggestButton.disabled = false;
                
                // Show success toast with count
                this.showToast(`${suggestedTasks.length} tasks suggested by AI`, 'success');
            }, 1500);
        }
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
            
            row.innerHTML = `
                <td>${task.title}</td>
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
                <h3>Productivity Insights</h3>
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
        
        // Add to document
        document.body.appendChild(toast);
        
        // Automatically remove after 3 seconds
        setTimeout(() => {
            toast.remove();
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

// Initialize the renderer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing BOBRenderer');
    window.bobRenderer = new BOBRenderer();
});