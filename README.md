# Single-Page-App

## Overview

This is a **Single-Page Application (SPA)** designed to dynamically build a navigation menu based on the content of a specified directory. The app fetches files from either a local directory or a GitHub repository, processes them, and renders them in the browser. It also features a caching mechanism that improves performance by preventing redundant network requests during the same session.

## Features

- **Dynamic Menu Generation**: Automatically generates a navigation menu based on files in a specified directory.
- **GitHub Integration**: Supports fetching files directly from a GitHub repository using the GitHub API when hosted on GitHub Pages.
- **Cache Mechanism**: Implements a caching system to prevent repeated network requests for the same content, improving performance.
- **Markdown Parsing**: Supports the display of Markdown content by converting it into HTML using the `parseMd` function.
- **Frontmatter Extraction**: Extracts and processes YAML Frontmatter for Markdown files.
- **Responsive Updates**: Automatically updates the page content when navigation links are clicked.

## How It Works

The Single-Page-App relies on two main modes for fetching content:
1. **Local Filesystem Mode**: When the app is run locally or on a non-GitHub server, it fetches the file listing directly from a local directory.
2. **GitHub Pages Mode**: When hosted on GitHub Pages, the app uses the GitHub API to fetch files from a specific GitHub repository and directory.

### Menu Building

The navigation menu is built dynamically based on the files present in the `content/` directory or GitHub repository. File names are displayed without numeric prefixes (e.g., `01_home.md` becomes `Home`).

### Content Rendering

The app supports rendering content in various formats:
- **Markdown Files**: Markdown files are parsed and converted to HTML using the `parseMd` function.
- **Plain Text and JSON**: Plain text files and JSON files are also supported for display.

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Single-Page-App.git
   cd Single-Page-App
2. **Directory Structure**:
   Ensure that the `content/` directory (or any directory you specify) is filled with the necessary files. File names can be prefixed with numbers to define their order in the menu, but the prefixes will not appear in the menu links.

3. **Run Locally**:
   You can run the app locally by opening the `index.html` file in your browser or serving it with a simple HTTP server:
   ```bash
   npx serve
4. **Deploy on GitHub Pages**:
   - If you are hosting the app on GitHub Pages, simply push the project to a GitHub repository and enable GitHub Pages in the repository settings.
   - The app will automatically detect if it is running on GitHub Pages and will fetch files using the GitHub API.

## Configuration

The main configuration is stored in the `config` object within `app.js`. You can modify this to suit your needs.

```javascript
const config = {
    startingPageName: "home",             // The default page to load
    standardFileType: "html",             // Default file type if not specified
    directory: "content",                 // Directory containing content
    user: window.location.hostname.split(".")[0],  // GitHub username (autodetected)
    repo: window.location.pathname.split("/")[1],  // GitHub repository name (autodetected)
    isGitHubPages: window.location.hostname.endsWith("github.io")  // Detect GitHub Pages environment
};

### Customization

- **Changing the Content Directory**: You can modify the `directory` in the config object to point to a different directory for fetching content.
- **Markdown Parsing**: If you're using Markdown files, ensure that `parseMd` is correctly imported and used to process the content.
- **Adding File Types**: The app currently supports Markdown, plain text, and JSON files. You can easily extend it to support more file types by modifying the `router()` function.

## Usage Example

Once the app is up and running, it will dynamically generate the navigation menu based on the contents of the `content/` directory. Clicking on a link in the menu will load the corresponding file's content into the page without a full page reload.
