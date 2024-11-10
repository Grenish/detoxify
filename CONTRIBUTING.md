# Contributing to Detoxify

Thank you for considering contributing to Detoxify! Your support helps improve this Chrome extension, making it a more effective tool for a distraction-free YouTube experience. Below are the guidelines for contributing to this project.

## Getting Started

### Prerequisites

1. **Chromium Browser**: Ensure you have a Chromium-based browser (e.g., Google Chrome, Microsoft Edge) installed for testing.
2. **Node.js and npm** (optional): For any additional tooling or package management, though not currently required.

### Setting Up the Project

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Grenish/detoxify.git
   cd detoxify
   ```

2. **Load the Extension**:
   - Open your Chromium-based browser.
   - Navigate to `chrome://extensions/`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `detoxify` directory.

3. **Explore the Codebase**:
   - The project structure includes:
     - `background.js`: Handles background scripts.
     - `content.js`: Manages content-specific scripts.
     - `manifest.json`: Defines extension settings and permissions.
     - `popup.html` and `popup.js`: Control the popup's UI and functionality.

## How to Contribute

Since this is a new repository, the issue tracker may not have any issues yet. Here are some ways you can start contributing:

1. **Identifying Bugs and Limitations**: While using Detoxify, if you encounter any bugs or limitations, please open an issue describing the problem clearly.

2. **Suggesting Features**: If you have ideas for enhancements, feel free to open an issue. Describe your suggestion in detail, and explain why it would improve the user experience.

3. **Implementing Improvements**:
   - You can start working on the planned improvements listed in the `TODO` section below or suggest your own enhancements.
   - Comment on the planned improvements you'd like to work on, if applicable, to avoid duplication.

4. **Submitting Changes**:
   - Fork the repository and create a new branch for your changes:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - Make your changes and commit them with clear messages:
     ```bash
     git commit -m "Description of changes"
     ```
   - Push your branch to your fork and create a Pull Request to the main repository:
     ```bash
     git push origin feature/your-feature-name
     ```
   - In your pull request, include a description of your changes and the motivation behind them.

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain a welcoming environment for all contributors.

## TODO List

Areas where contributions are currently needed:
- **Bug Fixes**: Address the issue of toggling Shorts visibility.
- **New Features**: Add filtering of feed videos by tags, improve UI/UX, hide playables for YouTube Premium users, and attempt to block ads on the homepage.
- **Documentation**: Enhance the documentation with more details and usage examples.

Thank you for contributing to Detoxify! Your efforts help make this extension better for everyone.