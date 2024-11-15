# Detoxify

Detoxify is a browser extension designed to give you control over your YouTube experience by hiding YouTube Shorts from your home feed, offering a distraction-free, streamlined interface. Currently compatible with Firefox and soon to be available for Chrome and other Chromium-based browsers.

![detoxify chrome](https://github.com/user-attachments/assets/10b4f4a7-e848-487b-8772-0c8bc4927c33)
![detoxify firefox](https://github.com/user-attachments/assets/d75ec890-0cae-4bbd-9752-d579c393a721)


## Features

- **Hide YouTube Shorts**: Remove YouTube Shorts from your home feed for a cleaner browsing experience.
- **Privacy-Focused**: Operates locally in your browser without collecting or transmitting any user data.
  - **Firefox**: Supported on Manifest V2.
  - **Chrome**: Will support Manifest V3 upon release.

## Installation

### Firefox

Detoxify is currently available for Firefox browsers.

[**Download Detoxify for Firefox**](https://addons.mozilla.org/en-US/firefox/addon/detoxify-youtube/)

### Chrome

Detoxify will soon be available for Chrome and other Chromium-based browsers. Stay tuned for updates.

## Usage

1. Install the Detoxify extension from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/detoxify-youtube/).
2. Navigate to YouTube in your browser.
3. You can toggle the "Hide Shorts" option in the extension.

## Screenshots

### Extension on FireFox
![Detoxify Extension for Firefox](https://github.com/user-attachments/assets/cde013b3-56ed-4b0e-b372-aebb01afb063)

### Extension on Chrome (Unreleased)
![Detoxify Extension for Chrome](https://github.com/user-attachments/assets/f4b53347-7fc0-4b1b-9350-214793f8ffb7)

### Before Using Detoxify

![YouTube Home Feed with Shorts](https://github.com/user-attachments/assets/9a0f9f58-0dea-42e6-b8ab-0e9e4ab6eae1)

### After Using Detoxify

![YouTube Home Feed without Shorts](https://github.com/user-attachments/assets/df227845-e858-4668-8433-eb5c4ef79e24)

## Known Issues

As Detoxify is in the testing phase, you may encounter some bugs:

- **Shorts May Reappear**: YouTube Shorts may reappear after being hidden.
- **Toggle Inconsistencies**: Toggling the "Hide Shorts" option may not consistently display Shorts correctly.

### Troubleshooting

- If Shorts reappear, try toggling the "Hide Shorts" option on and off several times to refresh the visibility settings.
- If the issue persists, please [open an issue](#support) to report the problem.

### Developer Note

Due to differences in extension APIs and event-handling mechanisms between Firefox and Chromium browsers, some features may require specific adjustments to ensure consistent functionality across both platforms. I am actively working on improving compatibility for a smoother experience.

## Roadmap

We are planning the following improvements:

- [ ] **Bug Fixes**: Resolve the issue preventing Shorts from reappearing correctly after toggling.
- [ ] **Extended Functionality**: Extend Shorts-hiding functionality to YouTube search results and other areas.
- [ ] **Filter Options**: Add options to filter feed videos based on selected tags.
- [ ] **UI/UX Enhancements**: Improve the user interface for a more intuitive experience.
- [ ] **Hide Playables**: Introduce an option to hide playable ads (for YouTube Premium users).

These enhancements aim to provide greater control over your YouTube experience, focusing on a customizable, ad-free, and distraction-free interface.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## License

This project is licensed under the [MIT License](LICENSE).

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/grenish/detoxify/issues) on GitHub or contact us directly at [mrcoder2033d@gmail.com](mailto:mrcoder2033d@gmail.com).
