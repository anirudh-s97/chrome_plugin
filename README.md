# Webpage Summarizer Chrome Extension

A powerful Chrome extension that uses Google's Gemini 2.0 Flash AI to generate concise summaries of any webpage with a single click.

![Webpage Summarizer Screenshot](https://via.placeholder.com/640x400)

## Features

- **AI-Powered Summaries**: Leverages Google's Gemini 2.0 Flash model for high-quality content summarization
- **Customizable Summary Length**: Choose between short, medium, or long summaries based on your needs
- **Simple Interface**: Clean, intuitive UI with one-click summarization
- **Smart Content Extraction**: Intelligently identifies and extracts the main content from various webpage layouts
- **Preservation of Key Information**: Maintains important details, statistics, and technical information from the original content

## Installation

### From Source (Developer Mode)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

## Setup

### Obtain a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create an account or sign in
3. Navigate to the API keys section
4. Create a new API key for the Gemini 2.0 Flash model

### Configure the Extension
1. Click the extension icon in your Chrome toolbar
2. Click the "⚙️ Settings" link at the bottom of the popup
3. Enter your Gemini API key in the provided field
4. Select your preferred summary length
5. Click "Save Settings"

## Usage

1. Navigate to any webpage you want to summarize
2. Click the extension icon in your Chrome toolbar
3. Click the "Summarize Page" button
4. Wait a few seconds while the AI processes the content
5. Read the generated summary in the popup window

## How It Works

1. **Content Extraction**: The extension analyzes the webpage structure to identify and extract the main content, prioritizing article elements, main content sections, and paragraphs.

2. **AI Processing**: The extracted content is sent to Google's Gemini 2.0 Flash API along with carefully crafted prompts that guide the model to create informative summaries.

3. **Summary Generation**: Gemini processes the content and returns a concise summary that captures the main points and key details of the webpage.

4. **Display**: The summary is formatted and displayed in the extension popup, along with the page title and URL for reference.

## Technical Details

- Built with pure JavaScript, HTML, and CSS
- Uses Chrome Extension Manifest V3
- Implements Chrome's storage API for secure settings management
- Connects to Google's Gemini 2.0 Flash API for AI-powered summarization

## Requirements

- Google Chrome browser (version 88 or newer)
- Active internet connection
- Gemini API key

## Privacy

- Your API key is stored locally in Chrome's secure storage
- Webpage content is sent directly to Google's Gemini API and is not stored by this extension
- No user data is collected or tracked by this extension

## License

MIT License - Feel free to modify and distribute this extension according to the terms of the license.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to help improve this extension.

---

Developed with ❤️ for efficient information consumption.
