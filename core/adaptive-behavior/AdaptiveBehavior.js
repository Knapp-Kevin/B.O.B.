/**
 * File: G:\B.O.B\components\AdaptiveBehavior.js v0.1.0
 * Purpose: Implement adaptive behavior logic and cognitive profile framework
 * Location: Project components directory
 * 
 * Related files:
 *   - G:\B.O.B\renderer.js (imports this module)
 *   - G:\B.O.B\models\TaskManager.js (enhanced by this module)
 */

/**
 * CognitiveProfile class for storing user cognitive traits and preferences
 */
class CognitiveProfile {
    constructor(userId) {
        this.userId = userId || this.generateUserId();
        this.created = Date.now();
        this.lastUpdated = Date.now();
        this.version = "0.1.0";
        
        // Initialize trait scores with default values (0-100 scale)
        this.traits = {
            // Executive Function traits
            executiveFunction: {
                taskInitiation: 50,
                planning: 50,
                organization: 50,
                timeManagement: 50,
                metacognition: 50
            },
            
            // Attention Regulation traits
            attentionRegulation: {
                sustainedFocus: 50,
                filteringDistraction: 50,
                taskSwitching: 50,
                hyperfocus: 50,
                attentionDistribution: 50
            },
            
            // Emotional Processing traits
            emotionalProcessing: {
                emotionalReactivity: 50,
                frustrationTolerance: 50,
                rewardSensitivity: 50,
                emotionalRegulation: 50,
                motivationManagement: 50
            },
            
            // Sensory Integration traits
            sensoryIntegration: {
                visualProcessing: 50,
                auditoryProcessing: 50,
                environmentSensitivity: 50,
                preferredInputModality: 'visual', // visual, auditory, kinesthetic
                systemOverloadThreshold: 50
            },
            
            // Task Management Capabilities
            taskManagement: {
                multiTaskingCapability: 50,
                taskCompletion: 50,
                prioritization: 50,
                decisionMaking: 50,
                informationProcessing: 50
            }
        };
        
        // User preferences (explicitly set by user)
        this.preferences = {
            communicationStyle: 'neutral', // direct, detailed, neutral, supportive
            remindersIntensity: 'medium', // low, medium, high
            taskBreakdownLevel: 'auto', // minimal, moderate, detailed, auto
            timeEstimationAdjustment: 0, // percentage adjustment for time estimates
            uiDensity: 'medium' // low, medium, high
        };
        
        // Interaction history (limited in scope to preserve privacy)
        this.interactionPatterns = {
            avgResponseTime: [], // Array of response times in ms
            taskCompletionRate: [], // Array of completion status strings
            uiInteractionHeatmap: {}, // Object with UI element IDs/classes and counts
            featureUsageFrequency: {}, // Object with feature names and usage counts
            timeOfDayActivity: {} // Object with hour keys (0-23) and activity counts
        };
        
        // Context-specific adjustments
        this.contextualAdjustments = {
            timeOfDay: {}, // Adjustments for morning, afternoon, evening, night
            dayOfWeek: {}, // Adjustments for each day of the week
            workloadLevel: {}, // Adjustments based on current workload
            deadlineProximity: {} // Adjustments based on approaching deadlines
        };
    }
    
    /**
     * Generate a random user ID if none exists
     * @returns {string} Generated user ID
     */
    generateUserId() {
        return 'user_' + Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Save profile to local storage with encryption (placeholder)
     * @returns {boolean} Success status
     */
    save() {
        this.lastUpdated = Date.now();
        
        try {
            // In production, encrypt this data before storing
            const profileData = JSON.stringify(this);
            localStorage.setItem(`cognitive-profile-${this.userId}`, profileData);
            
            console.log('Cognitive profile saved:', this.userId);
            return true;
        } catch (error) {
            console.error('Error saving cognitive profile:', error);
            return false;
        }
    }
    
    /**
     * Load profile from local storage
     * @param {string} userId - User ID to load
     * @returns {CognitiveProfile} Loaded profile or new profile
     */
    static load(userId) {
        try {
            const profileData = localStorage.getItem(`cognitive-profile-${userId}`);
            
            if (!profileData) {
                // No existing profile, create new one
                console.log('Creating new cognitive profile for:', userId);
                return new CognitiveProfile(userId);
            }
            
            // In production, decrypt the data first
            const profileObj = JSON.parse(profileData);
            
            // Convert plain object back to class instance
            const profile = new CognitiveProfile(userId);
            Object.assign(profile, profileObj);
            
            console.log('Cognitive profile loaded:', userId);
            return profile;
        } catch (error) {
            console.error('Error loading cognitive profile:', error);
            return new CognitiveProfile(userId);
        }
    }
    
    /**
     * Update a specific trait based on observed behavior
     * @param {string} category - Trait category
     * @param {string} trait - Specific trait name
     * @param {number} value - New trait value
     * @param {number} confidence - Confidence level (0-1)
     * @returns {boolean} Success status
     */
    updateTrait(category, trait, value, confidence = 0.5) {
        if (!this.traits[category] || this.traits[category][trait] === undefined) {
            console.error(`Invalid trait: ${category}.${trait}`);
            return false;
        }
        
        // Ensure parameters are valid
        if (typeof value !== 'number' || value < 0 || value > 100) {
            console.error('Trait value must be a number between 0-100');
            return false;
        }
        
        if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
            console.error('Confidence must be a number between 0-1');
            return false;
        }
        
        // Calculate weighted average based on confidence
        const currentValue = this.traits[category][trait];
        const newValue = currentValue + (value - currentValue) * confidence;
        
        // Ensure value stays within 0-100 range
        this.traits[category][trait] = Math.max(0, Math.min(100, newValue));
        
        // Update lastUpdated timestamp
        this.lastUpdated = Date.now();
        
        return true;
    }
    
    /**
     * Record an interaction pattern
     * @param {string} type - Type of interaction
     * @param {*} data - Interaction data
     */
    recordInteraction(type, data) {
        switch (type) {
            case 'responseTime':
                // Record time to respond to a prompt/notification
                if (typeof data !== 'number') return;
                
                // Keep only the last 50 response times
                this.interactionPatterns.avgResponseTime.push(data);
                if (this.interactionPatterns.avgResponseTime.length > 50) {
                    this.interactionPatterns.avgResponseTime.shift();
                }
                break;
                
            case 'taskCompletion':
                // Record task completion status (completed, abandoned, etc.)
                // Keep only the last 30 task completion results
                this.interactionPatterns.taskCompletionRate.push(data);
                if (this.interactionPatterns.taskCompletionRate.length > 30) {
                    this.interactionPatterns.taskCompletionRate.shift();
                }
                break;
                
            case 'uiInteraction':
                // Record UI element interaction
                if (!data || !data.element) return;
                
                const elementKey = data.element.id || data.element.className || 'unknown';
                if (!this.interactionPatterns.uiInteractionHeatmap[elementKey]) {
                    this.interactionPatterns.uiInteractionHeatmap[elementKey] = 0;
                }
                this.interactionPatterns.uiInteractionHeatmap[elementKey]++;
                break;
                
            case 'featureUsage':
                // Record feature usage
                if (!data || !data.feature) return;
                
                const { feature, duration } = data;
                if (!this.interactionPatterns.featureUsageFrequency[feature]) {
                    this.interactionPatterns.featureUsageFrequency[feature] = {
                        count: 0,
                        totalDuration: 0
                    };
                }
                this.interactionPatterns.featureUsageFrequency[feature].count++;
                
                if (duration) {
                    this.interactionPatterns.featureUsageFrequency[feature].totalDuration += duration;
                }
                break;
                
            case 'timeOfDay':
                // Record activity time
                const hour = new Date().getHours();
                if (!this.interactionPatterns.timeOfDayActivity[hour]) {
                    this.interactionPatterns.timeOfDayActivity[hour] = 0;
                }
                this.interactionPatterns.timeOfDayActivity[hour]++;
                break;
                
            default:
                console.warn(`Unknown interaction type: ${type}`);
        }
        
        // Update lastUpdated timestamp
        this.lastUpdated = Date.now();
    }
    
    /**
     * Get the appropriate communication style based on current profile
     * @returns {string} Communication style (direct, detailed, neutral, supportive)
     */
    getCommunicationStyle() {
        // User's explicit preference takes precedence
        if (this.preferences.communicationStyle !== 'neutral') {
            return this.preferences.communicationStyle;
        }
        
        // Get average scores for relevant trait categories
        const executiveFunction = this.getAverageScore('executiveFunction');
        const emotionalProcessing = this.getAverageScore('emotionalProcessing');
        const attentionRegulation = this.getAverageScore('attentionRegulation');
        
        // Logic to determine appropriate style based on trait scores
        if (attentionRegulation < 40) {
            return 'direct'; // More direct for those with attention challenges
        } else if (emotionalProcessing < 40) {
            return 'supportive'; // More supportive for those with emotional regulation challenges
        } else if (executiveFunction < 40) {
            return 'detailed'; // More detailed for those with executive function challenges
        } else {
            return 'neutral'; // Default balanced approach
        }
    }
    
    /**
     * Get the appropriate task breakdown level
     * @returns {string} Task breakdown level (minimal, moderate, detailed)
     */
    getTaskBreakdownLevel() {
        // User's explicit preference takes precedence
        if (this.preferences.taskBreakdownLevel !== 'auto') {
            return this.preferences.taskBreakdownLevel;
        }
        
        // Get relevant trait scores
        const executiveFunction = this.getAverageScore('executiveFunction');
        const taskManagement = this.getAverageScore('taskManagement');
        
        // Combine scores with equal weighting
        const combinedScore = (executiveFunction + taskManagement) / 2;
        
        if (combinedScore < 30) {
            return 'detailed';
        } else if (combinedScore < 60) {
            return 'moderate';
        } else {
            return 'minimal';
        }
    }
    
    /**
     * Helper to get average score for a trait category
     * @param {string} category - Trait category
     * @returns {number} Average score (0-100)
     */
    getAverageScore(category) {
        if (!this.traits[category]) {
            return 50; // Default middle value
        }
        
        const traits = this.traits[category];
        const traitKeys = Object.keys(traits).filter(key => 
            typeof traits[key] === 'number');
        
        if (traitKeys.length === 0) {
            return 50;
        }
        
        const sum = traitKeys.reduce((total, key) => total + traits[key], 0);
        return sum / traitKeys.length;
    }
    
    /**
     * Analyze user behavior patterns to update cognitive profile
     * Currently uses simple heuristics, could be enhanced with ML in future
     */
    analyzeAndUpdateProfile() {
            // Check if behavioral assignments are enabled
			if (!this.settings.behavioralAssignmentsEnabled) {
				console.log('Behavioral assignments are disabled, skipping profile analysis');
				return;
			}
			
			// Check if we've reached the interaction threshold
			const interactionCount = this.getInteractionCount();
			if (interactionCount < this.settings.interactionThreshold) {
				console.log(`Not enough interactions yet (${interactionCount}/${this.settings.interactionThreshold}), skipping profile analysis`);
				return;
			}
    
	// Example: Analyze task completion patterns
        if (this.interactionPatterns.taskCompletionRate.length > 10) {
            const completionRates = this.interactionPatterns.taskCompletionRate;
            const recentCompletions = completionRates.slice(-10);
            const completedCount = recentCompletions.filter(status => 
                status === 'completed').length;
            const recentCompletionRate = completedCount / 10;
            
            if (recentCompletionRate < 0.3) {
                // Low task completion rate - adjust traits
                this.updateTrait('taskManagement', 'taskCompletion', 
                               Math.max(this.traits.taskManagement.taskCompletion - 5, 0), 0.7);
            } else if (recentCompletionRate > 0.7) {
                // High task completion rate - adjust traits
                this.updateTrait('taskManagement', 'taskCompletion', 
                               Math.min(this.traits.taskManagement.taskCompletion + 5, 100), 0.7);
            }
        }
        
        // Example: Analyze response time patterns
        if (this.interactionPatterns.avgResponseTime.length > 20) {
            const responseTimes = this.interactionPatterns.avgResponseTime;
            const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / 
                                   responseTimes.length;
            
            // Short response times might indicate impulsivity or high focus
            if (avgResponseTime < 10000) { // Less than 10 seconds
                this.updateTrait('attentionRegulation', 'sustainedFocus', 
                               this.traits.attentionRegulation.sustainedFocus + 3, 0.3);
            }
        }
        
        // Example: Analyze time of day activity
        const timeOfDayEntries = Object.entries(this.interactionPatterns.timeOfDayActivity);
        if (timeOfDayEntries.length > 0) {
            // Find peak activity hours
            const sortedHours = timeOfDayEntries.sort((a, b) => b[1] - a[1]);
            const peakHour = parseInt(sortedHours[0][0]);
            
            // Update contextual adjustments for time of day
            if (peakHour >= 22 || peakHour <= 5) {
                // Night owl - may need more support during early hours
                this.contextualAdjustments.timeOfDay.earlyMorning = 'high-support';
            } else if (peakHour >= 5 && peakHour <= 10) {
                // Early bird - may need more support in evening
                this.contextualAdjustments.timeOfDay.evening = 'high-support';
            }
        }
        
        // Save updated profile
		this.cognitiveProfile.save();
		
		// Update interaction count in settings
		this.settings.interactionCount = interactionCount;
		this.saveSettings();
	}
    
    /**
     * Generate personalized interaction strategy based on context
     * @param {Object} context - Current context information
     * @returns {Object} Interaction strategy
     */
    getInteractionStrategy(context = {}) {
        const { timeOfDay, activityType, urgency } = context;
        
        // Build the strategy based on cognitive profile and context
        const strategy = {
            communicationStyle: this.getCommunicationStyle(),
            taskBreakdownLevel: this.getTaskBreakdownLevel(),
            reminderIntensity: this.preferences.remindersIntensity,
            visualElements: this.traits.sensoryIntegration.preferredInputModality === 'visual',
            timeEstimateAdjustment: this.preferences.timeEstimationAdjustment
        };
        
        // Apply contextual adjustments
        if (timeOfDay && this.contextualAdjustments.timeOfDay[timeOfDay]) {
            if (this.contextualAdjustments.timeOfDay[timeOfDay] === 'high-support') {
                strategy.communicationStyle = 'supportive';
                strategy.taskBreakdownLevel = 'detailed';
            }
        }
        
        // Adjust for urgency
        if (urgency === 'high') {
            strategy.communicationStyle = 'direct';
            strategy.reminderIntensity = 'high';
        }
        
        return strategy;
    }
}

/**
 * AdaptiveBehaviorManager - Main class that handles adaptive behavior integration
 */
class AdaptiveBehaviorManager {
	constructor() {
		// Get or create user ID
		this.userId = localStorage.getItem('bobUserId') || this.generateUserId();
		
		// Load or create cognitive profile
		this.cognitiveProfile = CognitiveProfile.load(this.userId);
		
		// Initialize analysis interval
		this.analysisInterval = null;
		
		// Track event listeners for cleanup
		this.eventListeners = [];
		
		// Integration settings
		this.settings = {
			enabled: true,
			analysisFrequency: 30 * 60 * 1000, // 30 minutes in milliseconds
			dataCollectionEnabled: true,
			adaptiveSuggestions: true,
			// New settings
			behavioralAssignmentsEnabled: false, // Start disabled until we get to know the user
			interactionThreshold: 20, // Number of interactions before behavioral assignments begin
			enhancedVisualCues: true, // Use color coding and visual indicators
			interactionCount: 0  // Track total interactions
		};
		
		// Load settings
		this.loadSettings();
	}
    /**
	 * Load settings from localStorage
	 */
	loadSettings() {
		try {
			const savedSettings = localStorage.getItem('bobAdaptiveSettings');
			if (savedSettings) {
				const parsedSettings = JSON.parse(savedSettings);
				this.settings = { ...this.settings, ...parsedSettings };
			}
		} catch (error) {
			console.error('Error loading adaptive behavior settings:', error);
		}
	}

	/**
	 * Save settings to localStorage
	 */
	saveSettings() {
		try {
			localStorage.setItem('bobAdaptiveSettings', JSON.stringify(this.settings));
		} catch (error) {
			console.error('Error saving adaptive behavior settings:', error);
		}
	}
	
	/**
	 * Gets the total number of meaningful interactions
	 * @returns {number} Interaction count
	 */
	getInteractionCount() {
		const profile = this.cognitiveProfile;
		
		// Count UI interactions
		const uiInteractionCount = Object.values(profile.interactionPatterns.uiInteractionHeatmap)
			.reduce((sum, count) => sum + count, 0);
		
		// Count task completions
		const taskCompletionCount = profile.interactionPatterns.taskCompletionRate.length;
		
		// Count response times (chat interactions)
		const responseTimeCount = profile.interactionPatterns.avgResponseTime.length;
		
		// Count feature usages
		const featureUsageCount = Object.values(profile.interactionPatterns.featureUsageFrequency)
			.reduce((sum, data) => sum + data.count, 0);
		
		return uiInteractionCount + taskCompletionCount + responseTimeCount + featureUsageCount;
	}

	/**
	 * Record a meaningful interaction 
	 * This helps track progress toward the interaction threshold
	 * @param {string} interactionType - Type of interaction
	 */
	recordMeaningfulInteraction(interactionType) {
		// Increment interaction count
		this.settings.interactionCount = (this.settings.interactionCount || 0) + 1;
		this.saveSettings();
		
		// Check if we've just passed the threshold
		if (this.settings.interactionCount === this.settings.interactionThreshold && 
			!this.settings.behavioralAssignmentsEnabled) {
			
			// Ask user if they want to enable behavioral assignments
			if (confirm('B.O.B. has collected enough information to start adapting to your work style. Would you like to enable adaptive behavior?')) {
				this.settings.behavioralAssignmentsEnabled = true;
				this.saveSettings();
				
				// Show toast notification if available
				if (window.bobRenderer && window.bobRenderer.showToast) {
					window.bobRenderer.showToast('Adaptive behavior enabled', 'success');
				}
			}
		}
	}
	
    /**
     * Generate a random user ID if none exists
     * @returns {string} Generated user ID
     */
    generateUserId() {
        const userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('bobUserId', userId);
        return userId;
    }
    
    /**
     * Initialize the adaptive behavior system
     * @returns {boolean} Success status
     */
    initialize() {
        if (!this.settings.enabled) {
            console.log('Adaptive Behavior System is disabled in settings');
            return false;
        }
        
        // Set up event listeners for user interactions
        this.setupEventListeners();
        
        // Start periodic analysis of user patterns
        this.startPeriodicAnalysis();
        
        console.log('Adaptive Behavior System initialized');
        return true;
    }
    
    /**
     * Set up event listeners to track user behavior
     */
    setupEventListeners() {
        if (!this.settings.dataCollectionEnabled) {
            console.log('Data collection disabled, skipping event listeners');
            return;
        }
        
        // Track UI interactions
        const trackInteraction = (element) => {
            if (!element) return;
            
            const data = {
                element: element.id || element.className || 'unnamed-element',
                timestamp: Date.now()
            };
            
            this.cognitiveProfile.recordInteraction('uiInteraction', data);
        };
        
        // Add event listeners to important UI elements
        const uiElements = document.querySelectorAll('[data-track-interaction]');
        uiElements.forEach(element => {
            const listener = () => trackInteraction(element);
            element.addEventListener('click', listener);
            
            // Store listener for cleanup
            this.eventListeners.push({
                element,
                event: 'click',
                listener
            });
        });
        
        // Track time spent on each tab
        let currentTab = null;
        let tabStartTime = null;
        
        const tabSwitchListener = (event) => {
            const newTab = event.target.dataset.tab;
            
            if (currentTab && tabStartTime) {
                // Record time spent on previous tab
                const duration = Date.now() - tabStartTime;
                this.cognitiveProfile.recordInteraction('featureUsage', {
                    feature: currentTab,
                    duration
                });
            }
            
            currentTab = newTab;
            tabStartTime = Date.now();
        };
        
        // Add listeners to tab buttons
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', tabSwitchListener);
            
            // Store listener for cleanup
            this.eventListeners.push({
                element: button,
                event: 'click',
                listener: tabSwitchListener
            });
        });
        
        // Monitoring task interactions
        this.setupTaskInteractionTracking();
        
        // Record time of day activity periodically
        const timeActivityInterval = setInterval(() => {
            this.cognitiveProfile.recordInteraction('timeOfDay', {});
        }, 15 * 60 * 1000); // Every 15 minutes
        
        // Store interval for cleanup
        this.timeActivityInterval = timeActivityInterval;
    }
    
    /**
     * Set up tracking of task interactions to inform cognitive profile
     */
    setupTaskInteractionTracking() {
        // Track task completion times
        const taskCompleteButtons = document.querySelectorAll('.complete-task');
        taskCompleteButtons.forEach(button => {
            const taskCompleteListener = (e) => {
                const taskId = e.target.dataset.taskId;
                const taskElement = document.querySelector(`tr[data-task-id="${taskId}"]`);
                
                if (taskElement) {
                    // Record task completion
                    this.cognitiveProfile.recordInteraction('taskCompletion', 
                        taskElement.classList.contains('completed') ? 'completed' : 'pending');
                }
            };
            
            button.addEventListener('click', taskCompleteListener);
            
            // Store listener for cleanup
            this.eventListeners.push({
                element: button,
                event: 'click',
                listener: taskCompleteListener
            });
        });
        
        // Track task priority changes
        const prioritySelects = document.querySelectorAll('.priority-select');
        prioritySelects.forEach(select => {
            const priorityChangeListener = () => {
                // Capture task priority changing behaviors
                this.cognitiveProfile.recordInteraction('featureUsage', {
                    feature: 'priority-change'
                });
            };
            
            select.addEventListener('change', priorityChangeListener);
            
            // Store listener for cleanup
            this.eventListeners.push({
                element: select,
                event: 'change',
                listener: priorityChangeListener
            });
        });
    }
    
    /**
     * Start periodic analysis of user patterns
     */
    startPeriodicAnalysis() {
        // Clear any existing interval
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        
        // Analyze patterns on the frequency set in settings
        this.analysisInterval = setInterval(() => {
            if (this.settings.dataCollectionEnabled) {
                console.log('Running periodic cognitive profile analysis');
                this.cognitiveProfile.analyzeAndUpdateProfile();
            }
        }, this.settings.analysisFrequency);
        
        // Run initial analysis
        setTimeout(() => {
            if (this.settings.dataCollectionEnabled) {
                this.cognitiveProfile.analyzeAndUpdateProfile();
            }
        }, 60000); // Wait 1 minute after initialization
    }
    
    /**
     * Stop adaptive behavior tracking and clean up
     */
    shutdown() {
        // Remove all event listeners
        this.eventListeners.forEach(({element, event, listener}) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, listener);
            }
        });
        
        // Clear all intervals
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        
        if (this.timeActivityInterval) {
            clearInterval(this.timeActivityInterval);
            this.timeActivityInterval = null;
        }
        
        // Save current profile state
        this.cognitiveProfile.save();
        
        console.log('Adaptive Behavior System shut down');
    }
    
    /**
     * Get current interaction strategy for given context
     * @param {Object} context - Current context information
     * @returns {Object} Interaction strategy
     */
    getInteractionStrategy(context = {}) {
        // If system is disabled, return default strategy
        if (!this.settings.enabled) {
            return {
                communicationStyle: 'neutral',
                taskBreakdownLevel: 'moderate',
                reminderIntensity: 'medium',
                visualElements: true,
                timeEstimateAdjustment: 0
            };
        }
        
        return this.cognitiveProfile.getInteractionStrategy(context);
    }
    
    /**
     * Update cognitive profile with task outcome
	 * Enhanced record task outcome method that includes interaction tracking
	 * @param {string} taskId - Task ID
	 * @param {string} outcome - Task outcome (completed, abandoned)
	 * @param {Object} duration - Task duration information
	 */
	recordTaskOutcome(taskId, outcome, duration) {
		if (!this.settings.dataCollectionEnabled) return;
		
		// Record as a meaningful interaction
		this.recordMeaningfulInteraction('taskCompletion');
		
		// Record task completion
		this.cognitiveProfile.recordInteraction('taskCompletion', outcome);
		
		// Only update traits if behavioral assignments are enabled and past threshold
		if (this.settings.behavioralAssignmentsEnabled && 
			this.getInteractionCount() >= this.settings.interactionThreshold) {
			
			// Update traits based on outcome
			if (outcome === 'completed') {
				this.cognitiveProfile.updateTrait('taskManagement', 'taskCompletion', 
											  this.cognitiveProfile.traits.taskManagement.taskCompletion + 2, 0.4);
			} else if (outcome === 'abandoned') {
				this.cognitiveProfile.updateTrait('taskManagement', 'taskCompletion', 
											  this.cognitiveProfile.traits.taskManagement.taskCompletion - 2, 0.4);
			}
			
			// If task took much longer than estimated, adjust time management trait
			if (duration && duration.actual && duration.estimated) {
				const ratio = duration.actual / duration.estimated;
				
				if (ratio > 2) { // Task took more than twice as long as estimated
					this.cognitiveProfile.updateTrait('executiveFunction', 'timeManagement', 
												  this.cognitiveProfile.traits.executiveFunction.timeManagement - 3, 0.5);
				} else if (ratio < 0.8) { // Task took less time than estimated
					this.cognitiveProfile.updateTrait('executiveFunction', 'timeManagement', 
												  this.cognitiveProfile.traits.executiveFunction.timeManagement + 1, 0.3);
				}
			}
		}
		
		// Save changes
		this.cognitiveProfile.save();
	}
    
	/**
	 * Apply adaptive behavior to UI elements, respecting the behavioralAssignmentsEnabled setting
	 * @returns {Object} Applied strategy
	 */
	applyAdaptiveBehavior() {
		if (!this.settings.enabled) return null;
		
		// Determine if we should use learned behavior or manual settings
		const useLearnedBehavior = this.settings.behavioralAssignmentsEnabled && 
								 this.getInteractionCount() >= this.settings.interactionThreshold;
		
		let strategy;
		
		if (useLearnedBehavior) {
			// Use adaptive cognitive profile
			strategy = this.getInteractionStrategy({
				timeOfDay: this.getCurrentTimeOfDay(),
				urgency: this.determineCurrentUrgency()
			});
		} else {
			// Use manually configured settings instead of learned behavior
			strategy = {
				communicationStyle: this.cognitiveProfile.preferences.communicationStyle,
				taskBreakdownLevel: this.cognitiveProfile.preferences.taskBreakdownLevel,
				reminderIntensity: this.cognitiveProfile.preferences.remindersIntensity,
				visualElements: this.settings.enhancedVisualCues,
				timeEstimateAdjustment: this.cognitiveProfile.preferences.timeEstimationAdjustment
			};
		}
		
		// Apply UI density based on user preferences
		document.body.dataset.uiDensity = this.cognitiveProfile.preferences.uiDensity;
		
		// Apply communication style to response formatting
		document.body.dataset.communicationStyle = strategy.communicationStyle;
		
		// Apply task breakdown level
		document.body.dataset.taskBreakdown = strategy.taskBreakdownLevel;
		
		// Apply visual enhancement setting
		document.body.dataset.enhancedVisualCues = this.settings.enhancedVisualCues.toString();
		
		// Apply sensory preferences
		if (this.cognitiveProfile.traits.sensoryIntegration.preferredInputModality === 'visual') {
			document.body.classList.add('visual-focused');
		} else {
			document.body.classList.remove('visual-focused');
		}
		
		return strategy;
	}

    /**
     * Helper method to determine current time of day category
     * @returns {string} Time of day category
     */
    getCurrentTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return 'morning';
        } else if (hour >= 12 && hour < 17) {
            return 'afternoon';
        } else if (hour >= 17 && hour < 22) {
            return 'evening';
        } else {
            return 'night';
        }
    }
    
    /**
     * Helper method to determine current urgency level
     * @returns {string} Urgency level (low, medium, high)
     */
    determineCurrentUrgency() {
        // Check for urgent tasks due soon
        try {
            const tasksJson = localStorage.getItem('bobTasks');
            if (!tasksJson) return 'low';
            
            const tasks = JSON.parse(tasksJson);
            const now = Date.now();
            
            // Find tasks due within 24 hours
            const urgentTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate).getTime();
                return dueDate > now && dueDate - now < 24 * 60 * 60 * 1000;
            });
            
            if (urgentTasks.length > 2) {
                return 'high';
            } else if (urgentTasks.length > 0) {
                return 'medium';
            } else {
                return 'low';
            }
        } catch (error) {
            console.error('Error determining urgency:', error);
            return 'low';
        }
    }
    
    /**
     * Update user preferences
     * @param {Object} preferences - New preferences
     */
    updatePreferences(preferences) {
        Object.assign(this.cognitiveProfile.preferences, preferences);
        this.cognitiveProfile.save();
        
        // Re-apply adaptive behavior
        this.applyAdaptiveBehavior();
    }
    
    /**
     * Enable or disable the adaptive behavior system
     * @param {boolean} enabled - Whether system should be enabled
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        
        if (enabled) {
            // Re-initialize if being enabled
            this.initialize();
        } else {
            // Shut down if being disabled
            this.shutdown();
        }
        
        // Save settings
        localStorage.setItem('bobAdaptiveSettings', JSON.stringify(this.settings));
    }
    
    /**
     * Configure data collection settings
     * @param {boolean} enabled - Whether data collection is enabled
     */
    setDataCollectionEnabled(enabled) {
        this.settings.dataCollectionEnabled = enabled;
        
        if (!enabled) {
            // Remove event listeners if disabling
            this.eventListeners.forEach(({element, event, listener}) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, listener);
                }
            });
            this.eventListeners = [];
        } else if (this.settings.enabled) {
            // Add event listeners if enabling and system is on
            this.setupEventListeners();
        }
        
        // Save settings
        localStorage.setItem('bobAdaptiveSettings', JSON.stringify(this.settings));
    }
    
    /**
     * Generate adaptive task suggestions based on cognitive profile
     * @param {Array} tasks - Current task list
     * @returns {Object} Suggestions for task management
     */
    generateTaskSuggestions(tasks) {
        if (!this.settings.enabled || !this.settings.adaptiveSuggestions) {
            return null;
        }
        
        const suggestions = {
            taskOrder: [],
            timeBlocks: [],
            breakSuggestions: []
        };
        
        // Use cognitive profile to generate suggestions
        const executiveFunction = this.cognitiveProfile.getAverageScore('executiveFunction');
        const attentionRegulation = this.cognitiveProfile.getAverageScore('attentionRegulation');
        
        // Recommend task ordering based on cognitive profile
        if (executiveFunction < 40) {
            // For those with executive function challenges, suggest starting with:
            // 1. Quick wins (short, easy tasks)
            // 2. High priority tasks
            // 3. Remaining tasks
            suggestions.taskOrder = this.orderTasksForExecutiveFunctionChallenges(tasks);
        } else if (attentionRegulation < 40) {
            // For those with attention regulation challenges, suggest:
            // 1. Most engaging tasks during peak focus times
            // 2. Routine tasks during low energy periods
            suggestions.taskOrder = this.orderTasksForAttentionChallenges(tasks);
        } else {
            // Default ordering by priority and deadline
            suggestions.taskOrder = this.orderTasksDefault(tasks);
        }
        
        // Generate time block suggestions
        suggestions.timeBlocks = this.generateTimeBlocks(tasks);
        
        // Generate break suggestions
        suggestions.breakSuggestions = this.generateBreakSuggestions();
        
        return suggestions;
    }
    
    /**
     * Order tasks for people with executive function challenges
     * @param {Array} tasks - Task list
     * @returns {Array} Ordered task IDs
     */
    orderTasksForExecutiveFunctionChallenges(tasks) {
        // Quick wins first (short completion time, high reward)
        const quickWins = tasks.filter(task => 
            task.status !== 'completed' && 
            (task.estimatedTime < 15 || task.complexity < 3)
        );
        
        // High priority tasks next
        const highPriorityTasks = tasks.filter(task => 
            task.status !== 'completed' && 
            task.priority === 'high' &&
            !quickWins.includes(task)
        );
        
        // Everything else
        const remainingTasks = tasks.filter(task => 
            task.status !== 'completed' && 
            !quickWins.includes(task) && 
            !highPriorityTasks.includes(task)
        );
        
        // Combine in recommended order
        return [
            ...quickWins.map(t => t.id),
            ...highPriorityTasks.map(t => t.id),
            ...remainingTasks.map(t => t.id)
        ];
    }
    
    /**
     * Order tasks for people with attention regulation challenges
     * @param {Array} tasks - Task list
     * @returns {Array} Ordered task IDs
     */
    orderTasksForAttentionChallenges(tasks) {
        // Current time of day
        const timeOfDay = this.getCurrentTimeOfDay();
        
        // For morning, prioritize complex tasks during fresh focus
        if (timeOfDay === 'morning') {
            const complexTasks = tasks.filter(task => 
                task.status !== 'completed' && 
                (task.complexity > 3 || task.estimatedTime > 30)
            );
            
            const simpleTasks = tasks.filter(task => 
                task.status !== 'completed' && 
                !complexTasks.includes(task)
            );
            
            return [
                ...complexTasks.map(t => t.id),
                ...simpleTasks.map(t => t.id)
            ];
        }
        
        // For afternoon, mix routine and engaging tasks
        if (timeOfDay === 'afternoon') {
            // Alternate between engaging and routine
            const sortedTasks = [...tasks.filter(t => t.status !== 'completed')]
                .sort((a, b) => {
                    // Sort by priority first
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
            
            return sortedTasks.map(t => t.id);
        }
        
        // For evening, focus on lighter tasks
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
            const lightTasks = tasks.filter(task => 
                task.status !== 'completed' && 
                (task.complexity < 3 && task.estimatedTime < 30)
            );
            
            const otherTasks = tasks.filter(task => 
                task.status !== 'completed' && 
                !lightTasks.includes(task)
            );
            
            return [
                ...lightTasks.map(t => t.id),
                ...otherTasks.map(t => t.id)
            ];
        }
        
        // Default fallback
        return tasks.filter(t => t.status !== 'completed').map(t => t.id);
    }
    
    /**
     * Default task ordering algorithm
     * @param {Array} tasks - Task list
     * @returns {Array} Ordered task IDs
     */
    orderTasksDefault(tasks) {
        // Sort by priority and deadline
        const sortedTasks = [...tasks.filter(t => t.status !== 'completed')]
            .sort((a, b) => {
                // Sort by priority first
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then by due date if available
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                
                // Tasks with due dates come before those without
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                
                return 0;
            });
        
        return sortedTasks.map(t => t.id);
    }
    
    /**
     * Generate time block suggestions for task management
     * @param {Array} tasks - Task list
     * @returns {Array} Time block suggestions
     */
    generateTimeBlocks(tasks) {
        const timeBlocks = [];
        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        
        // Current time of day affects block duration
        const timeOfDay = this.getCurrentTimeOfDay();
        const attentionRegulation = this.cognitiveProfile.getAverageScore('attentionRegulation');
        
        // Determine optimal block duration
        let blockDuration = 25; // Default Pomodoro-style
        
        if (attentionRegulation < 30) {
            blockDuration = 15; // Shorter blocks for attention challenges
        } else if (attentionRegulation > 70) {
            blockDuration = 45; // Longer blocks for strong focus
        }
        
        // Adjust for time of day
        if (timeOfDay === 'morning') {
            blockDuration += 5; // Slightly longer in morning
        } else if (timeOfDay === 'afternoon') {
            // No adjustment
        } else if (timeOfDay === 'evening') {
            blockDuration -= 5; // Slightly shorter in evening
        } else if (timeOfDay === 'night') {
            blockDuration -= 10; // Much shorter at night
        }
        
        // Ensure reasonable bounds
        blockDuration = Math.max(10, Math.min(blockDuration, 60));
        
        // Generate time blocks for tasks
        let currentTime = new Date();
        
        for (const task of pendingTasks) {
            const taskDuration = task.estimatedTime || 30; // Default 30 mins
            
            // Calculate how many blocks this task needs
            const blocksNeeded = Math.ceil(taskDuration / blockDuration);
            
            for (let i = 0; i < blocksNeeded; i++) {
                const blockStart = new Date(currentTime);
                const blockEnd = new Date(currentTime.getTime() + blockDuration * 60000);
                
                timeBlocks.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    start: blockStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    end: blockEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    duration: blockDuration
                });
                
                // Add a break after each block except the last task
                if (i === blocksNeeded - 1 && task !== pendingTasks[pendingTasks.length - 1]) {
                    const breakDuration = blockDuration <= 25 ? 5 : 10;
                    
                    currentTime = new Date(blockEnd.getTime() + breakDuration * 60000);
                } else {
                    currentTime = new Date(blockEnd);
                }
            }
        }
        
        return timeBlocks;
    }
    
    /**
     * Generate break suggestions based on cognitive profile
     * @returns {Array} Break suggestions
     */
    generateBreakSuggestions() {
        const breakSuggestions = [];
        const sensoryProfile = this.cognitiveProfile.traits.sensoryIntegration;
        const emotionalProfile = this.cognitiveProfile.traits.emotionalProcessing;
        
        // Add break suggestions based on sensory profile
        if (sensoryProfile.environmentSensitivity > 60) {
            breakSuggestions.push({
                type: 'sensory',
                activity: 'Find a quiet space with minimal distractions',
                duration: 5
            });
        }
        
        if (sensoryProfile.preferredInputModality === 'visual') {
            breakSuggestions.push({
                type: 'sensory',
                activity: 'Rest your eyes by looking at distant objects or closing them briefly',
                duration: 3
            });
        }
        
        // Add break suggestions based on emotional profile
        if (emotionalProfile.emotionalRegulation < 50) {
            breakSuggestions.push({
                type: 'emotional',
                activity: 'Practice deep breathing: inhale for 4 counts, hold for 4, exhale for 6',
                duration: 2
            });
        }
        
        if (emotionalProfile.frustrationTolerance < 50) {
            breakSuggestions.push({
                type: 'emotional',
                activity: 'Perform a quick body scan meditation to release tension',
                duration: 3
            });
        }
        
        // Add general physical break suggestions
        breakSuggestions.push({
            type: 'physical',
            activity: 'Stand up and do some light stretching',
            duration: 2
        });
        
        breakSuggestions.push({
            type: 'physical',
            activity: 'Take a short walk, even if just around the room',
            duration: 5
        });
        
        // Randomize and limit suggestions
        return this.shuffleArray(breakSuggestions).slice(0, 3);
    }
    
    /**
     * Helper to shuffle an array (Fisher-Yates algorithm)
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

/**
 * Utility function to add Adaptive Behavior UI controls to settings
 * @param {HTMLElement} settingsContainer - Settings panel container
 * @param {AdaptiveBehaviorManager} adaptiveBehavior - Adaptive behavior manager
 */
function addAdaptiveBehaviorSettings(settingsContainer, adaptiveBehavior) {
    if (!settingsContainer || !adaptiveBehavior) return;
    
    // Create settings section for adaptive behavior
    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = `
        <h3>Adaptive Behavior Settings</h3>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="adaptive-behavior-toggle">Enable Adaptive Behavior</label>
                <p class="setting-description">Allow B.O.B. to adapt to your work style and preferences</p>
            </div>
            <div class="setting-control">
                <input type="checkbox" id="adaptive-behavior-toggle" 
                    ${adaptiveBehavior.settings.enabled ? 'checked' : ''}>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="data-collection-toggle">Enable Data Collection</label>
                <p class="setting-description">Collect usage data to improve adaptive features (all data is stored locally)</p>
            </div>
            <div class="setting-control">
                <input type="checkbox" id="data-collection-toggle" 
                    ${adaptiveBehavior.settings.dataCollectionEnabled ? 'checked' : ''}>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="behavioral-assignments-toggle">Enable Behavioral Assignments</label>
                <p class="setting-description">Allow system to assign behavioral traits based on usage patterns</p>
            </div>
            <div class="setting-control">
                <input type="checkbox" id="behavioral-assignments-toggle" 
                    ${adaptiveBehavior.settings.behavioralAssignmentsEnabled !== false ? 'checked' : ''}>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="interaction-threshold">Interaction Threshold</label>
                <p class="setting-description">Number of interactions before behavioral assignments begin</p>
            </div>
            <div class="setting-control">
                <input type="range" id="interaction-threshold" min="5" max="50" step="5" 
                    value="${adaptiveBehavior.settings.interactionThreshold || 20}">
                <span id="interaction-threshold-value">${adaptiveBehavior.settings.interactionThreshold || 20}</span>
            </div>
        </div>
        
        <h4>Manual Trait Configuration</h4>
        <p class="setting-description">These settings will override adaptive detection when adaptive behavior is disabled</p>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="executive-function-slider">Executive Function</label>
                <p class="setting-description">Planning, organization, and time management capabilities</p>
            </div>
            <div class="setting-control">
                <input type="range" id="executive-function-slider" min="0" max="100" step="5" 
                    value="${adaptiveBehavior.cognitiveProfile.getAverageScore('executiveFunction')}">
                <span id="executive-function-value">${adaptiveBehavior.cognitiveProfile.getAverageScore('executiveFunction')}</span>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="attention-regulation-slider">Attention Regulation</label>
                <p class="setting-description">Focus, distraction filtering, and task switching abilities</p>
            </div>
            <div class="setting-control">
                <input type="range" id="attention-regulation-slider" min="0" max="100" step="5" 
                    value="${adaptiveBehavior.cognitiveProfile.getAverageScore('attentionRegulation')}">
                <span id="attention-regulation-value">${adaptiveBehavior.cognitiveProfile.getAverageScore('attentionRegulation')}</span>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="emotional-processing-slider">Emotional Processing</label>
                <p class="setting-description">Emotional regulation, frustration tolerance, and motivation</p>
            </div>
            <div class="setting-control">
                <input type="range" id="emotional-processing-slider" min="0" max="100" step="5" 
                    value="${adaptiveBehavior.cognitiveProfile.getAverageScore('emotionalProcessing')}">
                <span id="emotional-processing-value">${adaptiveBehavior.cognitiveProfile.getAverageScore('emotionalProcessing')}</span>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="sensory-integration-slider">Sensory Integration</label>
                <p class="setting-description">Environmental sensitivity and sensory processing preferences</p>
            </div>
            <div class="setting-control">
                <input type="range" id="sensory-integration-slider" min="0" max="100" step="5" 
                    value="${adaptiveBehavior.cognitiveProfile.getAverageScore('sensoryIntegration')}">
                <span id="sensory-integration-value">${adaptiveBehavior.cognitiveProfile.getAverageScore('sensoryIntegration')}</span>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="communication-style">Communication Style</label>
                <p class="setting-description">Choose how B.O.B. communicates with you</p>
            </div>
            <div class="setting-control">
                <select id="communication-style">
                    <option value="neutral" ${adaptiveBehavior.cognitiveProfile.preferences.communicationStyle === 'neutral' ? 'selected' : ''}>Neutral</option>
                    <option value="direct" ${adaptiveBehavior.cognitiveProfile.preferences.communicationStyle === 'direct' ? 'selected' : ''}>Direct</option>
                    <option value="detailed" ${adaptiveBehavior.cognitiveProfile.preferences.communicationStyle === 'detailed' ? 'selected' : ''}>Detailed</option>
                    <option value="supportive" ${adaptiveBehavior.cognitiveProfile.preferences.communicationStyle === 'supportive' ? 'selected' : ''}>Supportive</option>
                </select>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="task-breakdown">Task Breakdown Level</label>
                <p class="setting-description">Choose how tasks are broken down</p>
            </div>
            <div class="setting-control">
                <select id="task-breakdown">
                    <option value="auto" ${adaptiveBehavior.cognitiveProfile.preferences.taskBreakdownLevel === 'auto' ? 'selected' : ''}>Automatic</option>
                    <option value="minimal" ${adaptiveBehavior.cognitiveProfile.preferences.taskBreakdownLevel === 'minimal' ? 'selected' : ''}>Minimal</option>
                    <option value="moderate" ${adaptiveBehavior.cognitiveProfile.preferences.taskBreakdownLevel === 'moderate' ? 'selected' : ''}>Moderate</option>
                    <option value="detailed" ${adaptiveBehavior.cognitiveProfile.preferences.taskBreakdownLevel === 'detailed' ? 'selected' : ''}>Detailed</option>
                </select>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="reminders-intensity">Reminder Intensity</label>
                <p class="setting-description">Choose how frequently and intensely reminders are presented</p>
            </div>
            <div class="setting-control">
                <select id="reminders-intensity">
                    <option value="low" ${adaptiveBehavior.cognitiveProfile.preferences.remindersIntensity === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${adaptiveBehavior.cognitiveProfile.preferences.remindersIntensity === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${adaptiveBehavior.cognitiveProfile.preferences.remindersIntensity === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="ui-density">UI Density</label>
                <p class="setting-description">Control the density of information in the user interface</p>
            </div>
            <div class="setting-control">
                <select id="ui-density">
                    <option value="low" ${adaptiveBehavior.cognitiveProfile.preferences.uiDensity === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${adaptiveBehavior.cognitiveProfile.preferences.uiDensity === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${adaptiveBehavior.cognitiveProfile.preferences.uiDensity === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="visual-cues-toggle">Enhanced Visual Cues</label>
                <p class="setting-description">Use color, icons, and visual indicators to improve task organization</p>
            </div>
            <div class="setting-control">
                <input type="checkbox" id="visual-cues-toggle" 
                    ${adaptiveBehavior.settings.enhancedVisualCues !== false ? 'checked' : ''}>
            </div>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <label for="time-estimation-adjustment">Time Estimation Adjustment</label>
                <p class="setting-description">Adjust time estimates based on your completion patterns (%)</p>
            </div>
            <div class="setting-control">
                <input type="range" id="time-estimation-adjustment" min="-50" max="100" step="5" 
                    value="${adaptiveBehavior.cognitiveProfile.preferences.timeEstimationAdjustment || 0}">
                <span id="time-estimation-adjustment-value">${adaptiveBehavior.cognitiveProfile.preferences.timeEstimationAdjustment || 0}%</span>
            </div>
        </div>
        
        <div class="setting-item">
            <button id="reset-cognitive-profile" class="danger-button">Reset Cognitive Profile</button>
            <p class="setting-description">Warning: This will delete all learned behavior and preferences</p>
        </div>
        
        <div class="setting-item">
            <div class="setting-label">
                <p class="setting-info">Current interaction count: 
                <span id="interaction-count">${Object.keys(adaptiveBehavior.cognitiveProfile.interactionPatterns.uiInteractionHeatmap).length + 
                    adaptiveBehavior.cognitiveProfile.interactionPatterns.avgResponseTime.length}</span></p>
                <p class="setting-info">Last profile update: 
                <span id="last-update">${new Date(adaptiveBehavior.cognitiveProfile.lastUpdated).toLocaleString()}</span></p>
            </div>
        </div>
    `;
    
    // Append section to settings container
    settingsContainer.appendChild(section);
    
    // Add event listeners
    const adaptiveToggle = document.getElementById('adaptive-behavior-toggle');
    if (adaptiveToggle) {
        adaptiveToggle.addEventListener('change', (e) => {
            adaptiveBehavior.setEnabled(e.target.checked);
            
            // Toggle manual slider visibility based on adaptive behavior status
            const manualControls = document.querySelectorAll('#executive-function-slider, #attention-regulation-slider, #emotional-processing-slider, #sensory-integration-slider');
            manualControls.forEach(control => {
                control.parentElement.parentElement.style.opacity = e.target.checked ? '0.5' : '1';
            });
        });
    }
    
    const dataCollectionToggle = document.getElementById('data-collection-toggle');
    if (dataCollectionToggle) {
        dataCollectionToggle.addEventListener('change', (e) => {
            adaptiveBehavior.setDataCollectionEnabled(e.target.checked);
        });
    }
    
    const behavioralAssignmentsToggle = document.getElementById('behavioral-assignments-toggle');
    if (behavioralAssignmentsToggle) {
        behavioralAssignmentsToggle.addEventListener('change', (e) => {
            adaptiveBehavior.settings.behavioralAssignmentsEnabled = e.target.checked;
            adaptiveBehavior.saveSettings();
        });
    }
    
    const interactionThreshold = document.getElementById('interaction-threshold');
    const interactionThresholdValue = document.getElementById('interaction-threshold-value');
    if (interactionThreshold && interactionThresholdValue) {
        interactionThreshold.addEventListener('input', (e) => {
            const value = e.target.value;
            interactionThresholdValue.textContent = value;
            adaptiveBehavior.settings.interactionThreshold = parseInt(value);
            adaptiveBehavior.saveSettings();
        });
    }
    
    // Add slider event listeners for manual trait configuration
    const traitSliders = {
        'executive-function-slider': 'executiveFunction',
        'attention-regulation-slider': 'attentionRegulation',
        'emotional-processing-slider': 'emotionalProcessing',
        'sensory-integration-slider': 'sensoryIntegration'
    };
    
    Object.entries(traitSliders).forEach(([sliderId, traitCategory]) => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(`${sliderId}-value`);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                
                // Update manual trait settings
                if (!adaptiveBehavior.settings.enabled) {
                    // When adaptive behavior is disabled, we use manual settings
                    // Set all traits in the category to this value
                    const traits = adaptiveBehavior.cognitiveProfile.traits[traitCategory];
                    Object.keys(traits).forEach(trait => {
                        if (typeof traits[trait] === 'number') {
                            traits[trait] = parseInt(value);
                        }
                    });
                    
                    // Save the profile
                    adaptiveBehavior.cognitiveProfile.save();
                }
            });
        }
    });
    
    // Enhanced visual cues toggle
    const visualCuesToggle = document.getElementById('visual-cues-toggle');
    if (visualCuesToggle) {
        visualCuesToggle.addEventListener('change', (e) => {
            adaptiveBehavior.settings.enhancedVisualCues = e.target.checked;
            adaptiveBehavior.saveSettings();
            
            // Update UI to reflect the change
            document.body.dataset.enhancedVisualCues = e.target.checked.toString();
        });
    }
    
    // Time estimation adjustment slider
    const timeEstimationSlider = document.getElementById('time-estimation-adjustment');
    const timeEstimationValue = document.getElementById('time-estimation-adjustment-value');
    if (timeEstimationSlider && timeEstimationValue) {
        timeEstimationSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            timeEstimationValue.textContent = `${value}%`;
            adaptiveBehavior.updatePreferences({
                timeEstimationAdjustment: parseInt(value)
            });
        });
    }
    
    // Other settings event listeners (from previous implementation)
    const communicationStyle = document.getElementById('communication-style');
    if (communicationStyle) {
        communicationStyle.addEventListener('change', (e) => {
            adaptiveBehavior.updatePreferences({
                communicationStyle: e.target.value
            });
        });
    }
    
    const taskBreakdown = document.getElementById('task-breakdown');
    if (taskBreakdown) {
        taskBreakdown.addEventListener('change', (e) => {
            adaptiveBehavior.updatePreferences({
                taskBreakdownLevel: e.target.value
            });
        });
    }
    
    const remindersIntensity = document.getElementById('reminders-intensity');
    if (remindersIntensity) {
        remindersIntensity.addEventListener('change', (e) => {
            adaptiveBehavior.updatePreferences({
                remindersIntensity: e.target.value
            });
        });
    }
    
    const uiDensity = document.getElementById('ui-density');
    if (uiDensity) {
        uiDensity.addEventListener('change', (e) => {
            adaptiveBehavior.updatePreferences({
                uiDensity: e.target.value
            });
        });
    }
    
    const resetButton = document.getElementById('reset-cognitive-profile');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your cognitive profile? This will delete all learned behaviors and preferences.')) {
                // Remove profile from localStorage
                localStorage.removeItem(`cognitive-profile-${adaptiveBehavior.userId}`);
                
                // Create a new profile
                adaptiveBehavior.cognitiveProfile = new CognitiveProfile(adaptiveBehavior.userId);
                adaptiveBehavior.cognitiveProfile.save();
                
                // Show confirmation
                alert('Cognitive profile has been reset.');
                
                // Reload the page to reflect changes
                window.location.reload();
            }
        });
    }
    
    // Set initial state for manual controls opacity
    const manualControls = document.querySelectorAll('#executive-function-slider, #attention-regulation-slider, #emotional-processing-slider, #sensory-integration-slider');
    manualControls.forEach(control => {
        control.parentElement.parentElement.style.opacity = adaptiveBehavior.settings.enabled ? '0.5' : '1';
    });
}

// Export the module
export { CognitiveProfile, AdaptiveBehaviorManager, addAdaptiveBehaviorSettings };