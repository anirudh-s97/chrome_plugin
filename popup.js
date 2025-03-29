document.addEventListener('DOMContentLoaded', function() {
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryDiv = document.getElementById('summary');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const settingsLink = document.getElementById('settingsLink');
    
    // Open options page when settings link is clicked
    settingsLink.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
  
    // Check for API key and display appropriate message
    checkAPIKey();
    
    summarizeBtn.addEventListener('click', async () => {
      // Clear previous content
      summaryDiv.innerHTML = '';
      errorDiv.innerHTML = '';
      
      // Check for API key again
      const apiKey = await getAPIKey();
      if (!apiKey) {
        errorDiv.innerHTML = 'Please set your Gemini API Key in the settings first.';
        return;
      }
      
      // Show loading indicator
      loadingDiv.style.display = 'block';
      
      // Get the current active tab
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute content script to extract page content
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      }, async (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          errorDiv.innerHTML = 'Error extracting page content.';
          loadingDiv.style.display = 'none';
          return;
        }
        
        const pageContent = results[0].result;
        
        try {
          // Get summary length setting
          const settings = await getSummarySettings();
          
          // Generate summary using Gemini
          const summary = await generateGeminiSummary(pageContent, apiKey, settings.summaryLength);
          
          // Display summary
          summaryDiv.innerHTML = summary;
        } catch (error) {
          errorDiv.innerHTML = `Error: ${error.message}`;
        } finally {
          loadingDiv.style.display = 'none';
        }
      });
    });
  
    // Function to check API key and update UI accordingly
    async function checkAPIKey() {
      const apiKey = await getAPIKey();
      if (!apiKey) {
        summarizeBtn.disabled = true;
        errorDiv.innerHTML = 'Please set your Gemini API Key in the settings first.';
      } else {
        summarizeBtn.disabled = false;
        errorDiv.innerHTML = '';
      }
    }
    
    // Function to get API key from storage
    function getAPIKey() {
      return new Promise((resolve) => {
        chrome.storage.sync.get('apiKey', function(data) {
          resolve(data.apiKey || '');
        });
      });
    }
    
    // Function to get summary settings
    function getSummarySettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get('summaryLength', function(data) {
          resolve({
            summaryLength: data.summaryLength || 'medium'
          });
        });
      });
    }
  
    // Function to extract relevant content from the page
    function extractPageContent() {
      // Get page title
      const title = document.title;
      
      // Get main content (prioritize article elements, main content divs, etc.)
      let mainContent = '';
      
      // Try to find article content first
      const articles = document.querySelectorAll('article');
      if (articles.length > 0) {
        articles.forEach(article => {
          mainContent += article.innerText + '\n';
        });
      } else {
        // Try to find main content
        const mainElements = document.querySelectorAll('main, #content, .content, #main, .main');
        if (mainElements.length > 0) {
          mainElements.forEach(element => {
            mainContent += element.innerText + '\n';
          });
        } else {
          // As a fallback, get paragraphs
          const paragraphs = document.querySelectorAll('p');
          paragraphs.forEach(p => {
            mainContent += p.innerText + '\n';
          });
        }
      }
      
      // Limit content length to prevent API issues
      if (mainContent.length > 20000) {
        mainContent = mainContent.substring(0, 20000) + '...';
      }
      
      // Get metadata if available
      let metadata = {};
      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          metadata[name] = content;
        }
      });
      
      return {
        title: title,
        content: mainContent,
        url: window.location.href,
        metadata: metadata
      };
    }
  
    // Function to generate summary using Gemini 2.0 Flash API
    async function generateGeminiSummary(pageData, apiKey, summaryLength) {
      try {
        // Format page data for the API
        const prompt = createSummaryPrompt(pageData, summaryLength);
        
        // Call Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        
        // Extract the summary from the response
        const summaryText = data.candidates[0].content.parts[0].text;
        
        // Format the HTML for display
        return formatSummaryHTML(pageData, summaryText);
      } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary with Gemini. Check your API key and try again.');
      }
    }
    
    // Create an effective prompt for Gemini
    function createSummaryPrompt(pageData, summaryLength) {
      let lengthInstruction;
      switch (summaryLength) {
        case 'short':
          lengthInstruction = 'Provide a brief summary in 1-2 short paragraphs.';
          break;
        case 'long':
          lengthInstruction = 'Provide a comprehensive summary in 5 or more paragraphs, with detailed information and key points.';
          break;
        default: // medium
          lengthInstruction = 'Provide a balanced summary in 3-4 paragraphs covering the main points.';
      }
      
      return `Summarize the following webpage content:
      
  Title: ${pageData.title}
  URL: ${pageData.url}
  
  ${pageData.metadata.description ? `Description: ${pageData.metadata.description}` : ''}
  
  Content:
  ${pageData.content}
  
  Instructions:
  - ${lengthInstruction}
  - Extract the main ideas, key points, and important details.
  - Maintain a neutral and informative tone.
  - Format the summary with proper paragraphs.
  - If the content is technical, preserve key technical details.
  - Include important facts, figures, and statistics when present.
  - Do not add information that isn't in the original content.`;
    }
    
    // Format the summary as HTML for display
    function formatSummaryHTML(pageData, summaryText) {
      let summaryHTML = '';
      
      // Add title
      summaryHTML += `<h3>${pageData.title}</h3>`;
      
      // Add URL
      summaryHTML += `<p><small>${pageData.url}</small></p>`;
      
      // Add the summary text with paragraph formatting
      const paragraphs = summaryText.split('\n').filter(p => p.trim().length > 0);
      paragraphs.forEach(paragraph => {
        summaryHTML += `<p>${paragraph}</p>`;
      });
      
      return summaryHTML;
    }
  });