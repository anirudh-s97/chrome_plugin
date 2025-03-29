document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const summaryLengthSelect = document.getElementById('summaryLength');
    const statusDiv = document.getElementById('status');
    
    // Load saved settings
    chrome.storage.sync.get(['apiKey', 'summaryLength'], function(items) {
      if (items.apiKey) {
        apiKeyInput.value = items.apiKey;
      }
      if (items.summaryLength) {
        summaryLengthSelect.value = items.summaryLength;
      }
    });
    
    // Save settings
    saveBtn.addEventListener('click', function() {
      const apiKey = apiKeyInput.value.trim();
      const summaryLength = summaryLengthSelect.value;
      
      if (!apiKey) {
        showStatus('Please enter a valid Gemini API Key', 'error');
        return;
      }
      
      chrome.storage.sync.set({
        apiKey: apiKey,
        summaryLength: summaryLength
      }, function() {
        showStatus('Settings saved successfully!', 'success');
      });
    });
    
    function showStatus(message, type) {
      statusDiv.textContent = message;
      statusDiv.className = 'status ' + type;
      statusDiv.style.display = 'block';
      
      setTimeout(function() {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  });