// knowledge-center.js

/**
 * Knowledge Center implementation for B.O.B.
 * This module handles the UI for the knowledge management tab.
 */

// Configuration
const apiUrl = 'http://localhost:3001';

// DOM elements cache
let knowledgePanel;
let fileInput;
let fileDropArea;
let categorySelect;
let descriptionInput;
let tagsInput;
let processButton;
let knowledgeList;
let testQueryInput;
let testResultsContainer;
let previewSection;
let uploadSection;
let managementSection;
let previewContent;
let qualityMeter;
let qualityScore;
let chunksContainer;
let approveButton;
let discardButton;
let editButton;

/**
 * Initialize the Knowledge Center
 */
function initializeKnowledgeCenter() {
  // Create elements if they don't exist
  createKnowledgeCenterUI();
  
  // Cache DOM elements
  cacheElements();
  
  // Attach event listeners
  attachEventListeners();
  
  // Load existing knowledge base documents
  loadKnowledgeBaseDocuments();
}

/**
 * Create Knowledge Center UI
 */
function createKnowledgeCenterUI() {
  // Get or create the knowledge panel
  knowledgePanel = document.getElementById('panel-knowledge');
  if (!knowledgePanel) {
    knowledgePanel = document.createElement('div');
    knowledgePanel.id = 'panel-knowledge';
    knowledgePanel.className = 'panel';
    knowledgePanel.style.display = 'none';
    document.getElementById('panels-container').appendChild(knowledgePanel);
  }
  
  // Create the Knowledge Center UI
  knowledgePanel.innerHTML = `
    <div class="knowledge-center">
      <h2>Knowledge Center</h2>
      <p>Manage B.O.B.'s knowledge base to improve responses on company-specific topics.</p>
      
      <div class="knowledge-container">
        <!-- Upload Section -->
        <section class="knowledge-section upload-section">
          <h3>Add to Knowledge Base</h3>
          <div class="file-upload-area" id="knowledge-file-drop">
            <i class="upload-icon">📄</i>
            <p>Drag & drop files here or</p>
            <button id="knowledge-file-select" class="file-select-button">Select File</button>
            <input type="file" id="knowledge-file-input" hidden>
          </div>
          
          <div class="knowledge-metadata">
            <div class="form-group">
              <label for="knowledge-category">Category</label>
              <select id="knowledge-category">
                <option value="procedures">Procedures</option>
                <option value="resources">Resources</option>
                <option value="tools">Tools</option>
                <option value="projects">Projects</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="knowledge-description">Description</label>
              <textarea id="knowledge-description" placeholder="Brief description of this document..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="knowledge-tags">Tags</label>
              <input type="text" id="knowledge-tags" placeholder="Enter tags separated by commas">
            </div>
            
            <button id="process-document" class="primary-button">Process Document</button>
          </div>
        </section>
        
        <!-- Preview Section (hidden initially) -->
        <section class="knowledge-section preview-section" style="display: none;">
          <h3>Document Preview</h3>
          <div class="preview-controls">
            <div class="quality-indicator">
              <span>Understanding Quality:</span>
              <div class="quality-meter">
                <div class="quality-fill" style="width: 0%"></div>
              </div>
              <span class="quality-score">0%</span>
            </div>
            <button id="edit-preview" class="secondary-button">Edit</button>
          </div>
          
          <div class="preview-content" id="preview-content"></div>
          
          <div class="chunk-visualization" id="chunk-visualization">
            <h4>Document Chunking</h4>
            <div class="chunks-container"></div>
          </div>
          
          <div class="preview-actions">
            <button id="approve-document" class="primary-button">Approve & Add to Knowledge</button>
            <button id="discard-document" class="secondary-button">Discard</button>
          </div>
        </section>
        
        <!-- Management Section -->
        <section class="knowledge-section management-section">
          <h3>Manage Knowledge Base</h3>
          <div class="knowledge-search">
            <input type="text" id="knowledge-search" placeholder="Search knowledge base...">
            <select id="filter-category">
              <option value="">All Categories</option>
              <option value="procedures">Procedures</option>
              <option value="resources">Resources</option>
              <option value="tools">Tools</option>
              <option value="projects">Projects</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="knowledge-list" id="knowledge-list">
            <!-- Knowledge items will be added here -->
            <div class="empty-state">
              <p>No documents in knowledge base yet.</p>
            </div>
          </div>
          
          <div class="test-knowledge">
            <h4>Test Knowledge Retrieval</h4>
            <div class="test-input">
              <input type="text" id="test-query" placeholder="Enter a test query...">
              <button id="run-test" class="primary-button">Test</button>
            </div>
            <div class="test-results" id="test-results"></div>
          </div>
        </section>
      </div>
    </div>
  `;
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  // Sections
  uploadSection = document.querySelector('.upload-section');
  previewSection = document.querySelector('.preview-section');
  managementSection = document.querySelector('.management-section');
  
  // File upload elements
  fileInput = document.getElementById('knowledge-file-input');
  fileDropArea = document.getElementById('knowledge-file-drop');
  categorySelect = document.getElementById('knowledge-category');
  descriptionInput = document.getElementById('knowledge-description');
  tagsInput = document.getElementById('knowledge-tags');
  processButton = document.getElementById('process-document');
  
  // Preview elements
  previewContent = document.getElementById('preview-content');
  qualityMeter = document.querySelector('.quality-fill');
  qualityScore = document.querySelector('.quality-score');
  chunksContainer = document.querySelector('.chunks-container');
  approveButton = document.getElementById('approve-document');
  discardButton = document.getElementById('discard-document');
  editButton = document.getElementById('edit-preview');
  
  // Management elements
  knowledgeList = document.getElementById('knowledge-list');
  testQueryInput = document.getElementById('test-query');
  testResultsContainer = document.getElementById('test-results');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // File selection
  document.getElementById('knowledge-file-select').addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', handleFileSelection);
  
  // Drag and drop
  fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('drag-over');
  });
  
  fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('drag-over');
  });
  
  fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelection();
    }
  });
  
  // Process document button
  processButton.addEventListener('click', processDocument);
  
  // Preview actions
  approveButton.addEventListener('click', approveDocument);
  discardButton.addEventListener('click', discardDocument);
  editButton.addEventListener('click', editPreview);
  
  // Knowledge search
  document.getElementById('knowledge-search').addEventListener('input', filterKnowledgeList);
  document.getElementById('filter-category').addEventListener('change', filterKnowledgeList);
  
  // Test knowledge
  document.getElementById('run-test').addEventListener('click', testKnowledge);
}

/**
 * Handle file selection
 */
function handleFileSelection() {
  const fileName = fileInput.files[0]?.name || 'No file selected';
  
  // Show file name in drop area
  const fileDropText = document.querySelector('#knowledge-file-drop p');
  fileDropText.textContent = fileName;
}

/**
 * Process document
 */
async function processDocument() {
  if (!fileInput.files[0]) {
    showToast('Please select a file first', 'error');
    return;
  }
  
  try {
    showLoader('Processing document...');
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('originalName', fileInput.files[0].name);
    formData.append('category', categorySelect.value);
    formData.append('description', descriptionInput.value);
    formData.append('tags', tagsInput.value);
    
    // Call API to process the document
    const response = await fetch(`${apiUrl}/api/knowledge/document`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to process document');
    }
    
    const data = await response.json();
    
    // Show preview section
    showDocumentPreview(data);
    hideLoader();
  } catch (error) {
    hideLoader();
    showToast(`Error: ${error.message}`, 'error');
  }
}

/**
 * Show document preview
 */
function showDocumentPreview(data) {
  // Show preview section and hide upload section
  uploadSection.style.display = 'none';
  previewSection.style.display = 'block';
  
  // Populate preview content
  previewContent.textContent = data.textPreview || 'No preview available';
  
  // Set quality score (for demonstration - in reality this would be calculated)
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100%
  document.querySelector('.quality-fill').style.width = `${qualityScore}%`;
  document.querySelector('.quality-score').textContent = `${qualityScore}%`;
  
  // Visualize chunks
  chunksContainer.innerHTML = '';
  
  const chunkCount = data.chunks || 5;
  for (let i = 0; i < chunkCount; i++) {
    const chunk = document.createElement('div');
    chunk.className = 'chunk';
    chunk.textContent = `Chunk ${i + 1}`;
    chunksContainer.appendChild(chunk);
  }
  
  // Store the processed data for approval
  window.currentProcessedDocument = data;
}

/**
 * Approve document and add to knowledge base
 */
async function approveDocument() {
  const data = window.currentProcessedDocument;
  
  if (!data) {
    showToast('No document to approve', 'error');
    return;
  }
  
  showToast(`Added ${data.originalName || data.fileName} to knowledge base`, 'success');
  
  // Reset the form
  resetKnowledgeForm();
  
  // Refresh the document list
  await loadKnowledgeBaseDocuments();
}

/**
 * Discard document
 */
function discardDocument() {
  // Reset the form
  resetKnowledgeForm();
  showToast('Document discarded', 'info');
}

/**
 * Edit preview text
 */
function editPreview() {
  // Make preview content editable
  previewContent.contentEditable = true;
  previewContent.focus();
  previewContent.style.border = '2px solid var(--primary-color)';
  previewContent.style.padding = '10px';
  
  // Change edit button to save button
  editButton.textContent = 'Save';
  editButton.removeEventListener('click', editPreview);
  editButton.addEventListener('click', savePreview);
}

/**
 * Save edited preview
 */
function savePreview() {
  // Make preview content non-editable
  previewContent.contentEditable = false;
  previewContent.style.border = 'none';
  previewContent.style.padding = '0';
  
  // Update the stored document
  if (window.currentProcessedDocument) {
    window.currentProcessedDocument.textPreview = previewContent.textContent;
  }
  
  // Change save button back to edit button
  editButton.textContent = 'Edit';
  editButton.removeEventListener('click', savePreview);
  editButton.addEventListener('click', editPreview);
  
  showToast('Preview updated', 'success');
}

/**
 * Reset knowledge form
 */
function resetKnowledgeForm() {
  // Hide preview section and show upload section
  uploadSection.style.display = 'block';
  previewSection.style.display = 'none';
  
  // Reset file input
  fileInput.value = '';
  document.querySelector('#knowledge-file-drop p').textContent = 'Drag & drop files here or';
  
  // Reset form fields
  descriptionInput.value = '';
  tagsInput.value = '';
  categorySelect.selectedIndex = 0;
  
  // Clear stored data
  window.currentProcessedDocument = null;
}

/**
 * Load knowledge base documents
 */
async function loadKnowledgeBaseDocuments() {
  try {
    const response = await fetch(`${apiUrl}/api/knowledge/sources`);
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to load knowledge base');
    }
    
    const data = await response.json();
    
    if (!data.sources || data.sources.length === 0) {
      knowledgeList.innerHTML = `
        <div class="empty-state">
          <p>No documents in knowledge base yet.</p>
        </div>
      `;
      return;
    }
    
    // Populate the list
    knowledgeList.innerHTML = '';
    
    data.sources.forEach(source => {
      const item = document.createElement('div');
      item.className = 'knowledge-item';
      item.dataset.source = source;
      item.innerHTML = `
        <div class="knowledge-item-details">
          <h4>${source}</h4>
          <div class="knowledge-item-meta">
            <span class="category">Category: Unknown</span>
            <span class="date">Added: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div class="knowledge-item-actions">
          <button class="icon-button view-knowledge" data-source="${source}" title="View Document">👁️</button>
          <button class="icon-button delete-knowledge" data-source="${source}" title="Delete Document">🗑️</button>
        </div>
      `;
      knowledgeList.appendChild(item);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.delete-knowledge').forEach(button => {
      button.addEventListener('click', () => deleteKnowledgeSource(button.dataset.source));
    });
    
    document.querySelectorAll('.view-knowledge').forEach(button => {
      button.addEventListener('click', () => viewKnowledgeSource(button.dataset.source));
    });
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  }
}

/**
 * Filter knowledge list
 */
function filterKnowledgeList() {
  const searchText = document.getElementById('knowledge-search').value.toLowerCase();
  const category = document.getElementById('filter-category').value;
  
  document.querySelectorAll('.knowledge-item').forEach(item => {
    const title = item.querySelector('h4').textContent.toLowerCase();
    const itemCategory = item.querySelector('.category').textContent.toLowerCase();
    
    const matchesSearch = title.includes(searchText);
    const matchesCategory = !category || itemCategory.includes(category.toLowerCase());
    
    if (matchesSearch && matchesCategory) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

/**
 * Test knowledge retrieval
 */
async function testKnowledge() {
  const query = testQueryInput.value.trim();
  
  if (!query) {
    showToast('Please enter a test query', 'error');
    return;
  }
  
  try {
    showLoader('Testing query...');
    
    const response = await fetch(`${apiUrl}/api/knowledge/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Test query failed');
    }
    
    const data = await response.json();
    
    // Display results
    if (!data.hasContext || !data.context || data.context.length === 0) {
      testResultsContainer.innerHTML = `
        <div class="no-results">
          <p>No relevant knowledge found for this query.</p>
        </div>
      `;
    } else {
      testResultsContainer.innerHTML = `
        <h5>Retrieved Knowledge:</h5>
        <ul class="result-list">
          ${data.context.map(item => `
            <li class="result-item">
              <div class="result-header">
                <span class="result-source">${item.source}</span>
                <span class="result-relevance">${Math.round(item.relevance * 100)}% match</span>
              </div>
              <div class="result-text">${item.text.substring(0, 200)}${item.text.length > 200 ? '...' : ''}</div>
            </li>
          `).join('')}
        </ul>
      `;
    }
    
    hideLoader();
  } catch (error) {
    hideLoader();
    showToast(`Error: ${error.message}`, 'error');
  }
}

/**
 * Delete knowledge source
 */
async function deleteKnowledgeSource(source) {
  if (!confirm(`Are you sure you want to delete "${source}" from the knowledge base?`)) {
    return;
  }
  
  try {
    showLoader('Deleting...');
    
    const response = await fetch(`${apiUrl}/api/knowledge/source/${encodeURIComponent(source)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to delete source');
    }
    
    await loadKnowledgeBaseDocuments();
    showToast(`Deleted ${source} from knowledge base`, 'success');
    hideLoader();
  } catch (error) {
    hideLoader();
    showToast(`Error: ${error.message}`, 'error');
  }
}

/**
 * View knowledge source
 */
function viewKnowledgeSource(source) {
  showToast(`View functionality for ${source} not implemented yet`, 'info');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Use existing toast system if available
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }
  
  // Simple fallback implementation
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Show loader
 */
function showLoader(message = 'Loading...') {
  // Use existing loader system if available
  if (window.showLoader) {
    window.showLoader(message);
    return;
  }
  
  // Simple fallback implementation
  const loader = document.createElement('div');
  loader.className = 'loader-overlay';
  loader.innerHTML = `
    <div class="loader-container">
      <div class="loader-spinner"></div>
      <div class="loader-message">${message}</div>
    </div>
  `;
  
  document.body.appendChild(loader);
}

/**
 * Hide loader
 */
function hideLoader() {
  // Use existing loader system if available
  if (window.hideLoader) {
    window.hideLoader();
    return;
  }
  
  // Simple fallback implementation
  const loader = document.querySelector('.loader-overlay');
  if (loader) {
    loader.remove();
  }
}

// Export the initialization function
window.initializeKnowledgeCenter = initializeKnowledgeCenter;