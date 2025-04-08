function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
    }

    // Create a new task with advanced attributes
    createTask(title, options = {}) {
        const task = {
            id: generateUUID(),
            title,
            description: options.description || '',
            priority: options.priority || 'medium',
            status: 'pending',
            estimatedTime: options.estimatedTime || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: options.tags || [],
            complexity: this.calculateComplexity(title, options.description),
            dependencies: options.dependencies || []
        };

        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    // Calculate task complexity based on title and description
    calculateComplexity(title, description = '') {
        const wordCount = (text) => text.trim().split(/\s+/).length;
        const complexityScore = wordCount(title) + wordCount(description) / 2;

        if (complexityScore < 5) return 'low';
        if (complexityScore < 10) return 'medium';
        return 'high';
    }

    // AI-powered task suggestion mechanism
    suggestTasks(context) {
        // Placeholder for AI-driven task generation
        // Would integrate with local AI model to generate contextual tasks
        const aiSuggestedTasks = [
            {
                title: 'Review project milestones',
                priority: 'high',
                estimatedTime: 45
            },
            {
                title: 'Prepare meeting summary',
                priority: 'medium',
                estimatedTime: 30
            }
        ];

        return aiSuggestedTasks.map(task => this.createTask(task.title, task));
    }

    // Prioritize tasks based on multiple factors
    prioritizeTasks() {
        return this.tasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const complexityOrder = { high: 3, medium: 2, low: 1 };

            // Multi-factor sorting
            if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }

            if (complexityOrder[b.complexity] !== complexityOrder[a.complexity]) {
                return complexityOrder[b.complexity] - complexityOrder[a.complexity];
            }

            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    // Update task status and track progress
    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date();
            this.saveTasks();
        }
    }

    // Local storage persistence
    saveTasks() {
        try {
            localStorage.setItem('bobTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    // Load tasks from local storage
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('bobTasks');
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    // Generate productivity insights
    getProductivityInsights() {
        const completedTasks = this.tasks.filter(task => task.status === 'completed');
        const pendingTasks = this.tasks.filter(task => task.status === 'pending');

        return {
            totalTasks: this.tasks.length,
            completedTasks: completedTasks.length,
            pendingTasks: pendingTasks.length,
            completionRate: (completedTasks.length / this.tasks.length) * 100 || 0,
            averageTaskComplexity: this.calculateAverageComplexity()
        };
    }

    // Calculate average task complexity
    calculateAverageComplexity() {
        const complexityMap = { low: 1, medium: 2, high: 3 };
        const totalComplexity = this.tasks.reduce((sum, task) => 
            sum + complexityMap[task.complexity], 0);
        return totalComplexity / this.tasks.length || 0;
    }
}

export default TaskManager;
