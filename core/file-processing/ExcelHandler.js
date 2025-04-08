/**
 * File: G:\B.O.B\utils\ExcelHandler.js v0.1.0
 * Purpose: Handle Excel file processing and integration with chat
 * Location: Project utils directory
 * 
 * Related files:
 *   - G:\B.O.B\renderer.js (imports this module)
 */

class ExcelHandler {
    constructor() {
        this.supportedFormats = ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv'];
        this.fileData = null;
        this.sheetNames = [];
        this.activeSheet = null;
        this.parsedData = null;
    }

    /**
     * Check if a file is an Excel or CSV file
     * @param {File} file - The file to check
     * @returns {boolean} - Whether the file is supported
     */
    isExcelFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return this.supportedFormats.includes(extension);
    }

    /**
     * Process an Excel file and extract basic information
     * @param {File} file - The Excel file to process
     * @returns {Promise<Object>} - Basic information about the file
     */
    async processFile(file) {
		return new Promise((resolve, reject) => {
			if (!this.isExcelFile(file)) {
				reject(new Error('Unsupported file format'));
				return;
			}

			const reader = new FileReader();
			
			reader.onload = async (e) => {
				try {
					const data = e.target.result;
					
					// Store the raw data for later use
					this.fileData = data;
					
					// Extract basic file info
					const fileInfo = {
						name: file.name,
						size: file.size,
						type: file.type || 'application/vnd.ms-excel',
						lastModified: file.lastModified,
						extension: file.name.split('.').pop().toLowerCase()
					};
					
					// If we're in the browser and XLSX is available, get sheet info
					if (typeof XLSX !== 'undefined') {
						try {
							const workbook = XLSX.read(data, {
								type: 'array',
								cellDates: true,
								cellStyles: true,
								cellNF: true,  // Added to preserve number formats
								cellDates: true  // Ensure dates are properly handled
							});
							
							this.sheetNames = workbook.SheetNames;
							this.activeSheet = this.sheetNames[0];
							
							fileInfo.sheetNames = this.sheetNames;
							fileInfo.totalSheets = this.sheetNames.length;
							
							// Get basic stats about the first sheet
							const firstSheet = workbook.Sheets[this.activeSheet];
							if (firstSheet) {
								const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1');
								fileInfo.rowCount = range.e.r - range.s.r + 1;
								fileInfo.columnCount = range.e.c - range.s.c + 1;
								
								// Get column headers
								const headers = [];
								for (let C = range.s.c; C <= range.e.c; ++C) {
									const cell = firstSheet[XLSX.utils.encode_cell({r:range.s.r, c:C})];
									headers.push(cell ? cell.v : undefined);
								}
								fileInfo.headers = headers.filter(Boolean);
							}
							
							// Parse the first sheet into an array of objects
							this.parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[this.activeSheet]);
						} catch (err) {
							console.warn('XLSX processing error:', err);
							// Continue with limited info if XLSX processing fails
						}
					}
					
					resolve(fileInfo);
				} catch (error) {
					console.error('Error processing Excel file:', error);
					reject(error);
				}
			};
			
			reader.onerror = () => {
				reject(new Error('Error reading file'));
			};
			
			// Read file as array buffer for Excel files
			reader.readAsArrayBuffer(file);
		});
	}
    
    /**
     * Format the Excel file info for display in chat
     * @param {Object} fileInfo - The file information object
     * @returns {string} - Formatted message for chat
     */
    formatFileInfoForChat(fileInfo) {
        const extension = fileInfo.extension.toUpperCase();
        const formattedSize = this.formatFileSize(fileInfo.size);
        
        let message = `📊 **Excel File Attached**: ${fileInfo.name}\n`;
        message += `📏 **Size**: ${formattedSize}\n`;
        
        if (fileInfo.sheetNames && fileInfo.sheetNames.length > 0) {
            message += `📑 **Sheets**: ${fileInfo.sheetNames.join(', ')}\n`;
            
            if (fileInfo.rowCount && fileInfo.columnCount) {
                message += `📈 **Dimensions**: ${fileInfo.rowCount} rows × ${fileInfo.columnCount} columns\n`;
            }
        }
        
        message += '\nReady to analyze this data. What would you like to know about it?';
        
        return message;
    }
    
    /**
     * Format a file size in bytes to a human-readable string
     * @param {number} bytes - The file size in bytes
     * @returns {string} - Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    /**
     * Get a preview of the Excel data
     * @param {string} sheetName - Optional sheet name, defaults to first sheet
     * @param {number} maxRows - Maximum number of rows to preview
     * @returns {Array|null} - Array of data rows or null if processing fails
     */
	getDataPreview(sheetName = null, maxRows = 10) {
		if (!this.fileData) {
			return null;
		}
		
		try {
			if (typeof XLSX === 'undefined') {
				console.error("XLSX library not available");
				// Return a special format indicating the library is missing
				return [["XLSX library not available. Add the library to enable Excel preview."]];
			}
			
			const workbook = XLSX.read(this.fileData, {
				type: 'array',
				cellDates: true
			});
			
			const sheet = sheetName || this.activeSheet || workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheet];
			
			if (!worksheet) {
				return null;
			}
			
			// Convert to JSON
			let rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
			
			// Limit to maxRows
			const preview = rawData.slice(0, maxRows);
			
			// Store full parsed data for later use
			this.parsedData = rawData;
			
			return preview;
		} catch (error) {
			console.error('Error getting Excel data preview:', error);
			if (error.message && error.message.includes('XLSX is not defined')) {
				return [["XLSX library not available. Add the library to enable Excel preview."]];
			}
			return null;
		}
	}
    
    /**
     * Format data preview as a text table for chat
     * @param {Array} data - The data preview array
     * @returns {string} - Formatted table
     */
    formatDataPreviewForChat(data) {
        if (!data || data.length === 0) {
            return 'No data available to preview.';
        }
        
        // Get header row and data rows
        const headerRow = data[0];
        const dataRows = data.slice(1);
        
        if (!headerRow || headerRow.length === 0) {
            return 'Sheet appears to be empty.';
        }
        
        // Create markdown table
        let table = '| ' + headerRow.join(' | ') + ' |\n';
        table += '| ' + headerRow.map(() => '---').join(' | ') + ' |\n';
        
        dataRows.forEach(row => {
            // Ensure row has same length as header
            const paddedRow = [...row];
            while (paddedRow.length < headerRow.length) {
                paddedRow.push('');
            }
            
            table += '| ' + paddedRow.map(cell => {
                // Format cell content
                if (cell === null || cell === undefined) return '';
                if (typeof cell === 'object' && cell instanceof Date) {
                    return cell.toLocaleDateString();
                }
                return String(cell);
            }).join(' | ') + ' |\n';
        });
        
        return table;
    }
    
    /**
     * Extract potential tasks from Excel data
     * @returns {Array} - Array of potential tasks
     */
    extractPotentialTasks() {
        if (!this.parsedData) {
            return [];
        }
        
        const tasks = [];
        
        // Look for headers that might indicate tasks
        const headerRow = this.parsedData[0];
        let taskColumnIndex = -1;
        
        const taskHeaderKeywords = ['task', 'todo', 'action', 'item', 'activity'];
        
        // Try to find task column
        headerRow.forEach((header, index) => {
            if (typeof header === 'string' && 
                taskHeaderKeywords.some(keyword => 
                    header.toLowerCase().includes(keyword))) {
                taskColumnIndex = index;
            }
        });
        
        if (taskColumnIndex !== -1) {
            // Extract from task column
            for (let i = 1; i < this.parsedData.length; i++) {
                const row = this.parsedData[i];
                if (row[taskColumnIndex] && typeof row[taskColumnIndex] === 'string') {
                    tasks.push(row[taskColumnIndex]);
                }
            }
        } else {
            // No specific task column found, try to identify task-like text in any column
            for (let i = 1; i < this.parsedData.length; i++) {
                const row = this.parsedData[i];
                
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    
                    if (typeof cell === 'string' && 
                        cell.length > 10 && 
                        cell.length < 200 &&
                        !cell.startsWith('http') &&
                        !cell.includes('@')) {
                        
                        // Check if text looks like a task
                        if (/^(to|need to|should|must|will|have to|add|create|update|review|complete)/i.test(cell)) {
                            tasks.push(cell);
                        }
                    }
                }
            }
        }
        
        // Remove duplicates and limit to 5 tasks
        return [...new Set(tasks)].slice(0, 5);
    }
}

// Export the module
export default ExcelHandler;
