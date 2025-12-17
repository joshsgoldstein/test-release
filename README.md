# Notes - Mobile Note-Taking App

A beautiful, mobile-first note-taking application inspired by Notion and Craft. Built with vanilla JavaScript, HTML, and CSS with a focus on touch gestures and mobile usability.

![Mobile-First Design](https://img.shields.io/badge/Mobile-First-blue)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-green)

## Features

### 📱 Mobile-First Design
- Responsive layout optimized for touch screens
- Modern dark theme with smooth animations
- Touch-friendly UI elements and spacing
- Works seamlessly on desktop and mobile

### 👆 Gesture Controls
- **Swipe right from left edge** - Open sidebar menu
- **Swipe left** - Close sidebar
- **Long-press on note cards** - Open context menu with options
- **Tap** - Standard interactions (open notes, navigate, etc.)
- Haptic feedback on supported devices

### 📝 Note Management
- Create, edit, and delete notes
- Rich text editor with formatting toolbar
- Real-time auto-save (500ms debounce)
- Full-text search across all notes
- Duplicate notes with one tap
- Share notes using native share API
- Time-based timestamps (e.g., "2h ago", "5m ago")

### ✏️ Rich Text Editor
- **Bold** and *italic* formatting
- Headings, lists, and checkboxes
- Image insertion via URL
- Inline formatting toolbar
- Content-editable interface

### ✅ Task Management
- Create and manage tasks
- Toggle completion status
- Dedicated tasks view
- Visual checkbox indicators

### 💾 Data Persistence
- All data saved to browser's local storage
- Automatic save on every edit
- Data persists across sessions
- No server required

### 🎨 Beautiful UI
- Dark theme with modern color palette
- Smooth transitions and animations
- Context menus for quick actions
- Toast notifications for feedback
- Empty states with helpful messages
- Custom scrollbars

## Getting Started

### Installation

No installation required! Simply open the app in your browser:

1. Clone this repository:
   ```bash
   git clone https://github.com/joshsgoldstein/test-release.git
   cd test-release
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```
   Or simply double-click the `index.html` file.

### Usage

#### Creating Notes
1. Tap the **+** floating button (bottom-right corner)
2. Or use the sidebar menu → "New Note"
3. Start typing your note title and content
4. Notes auto-save automatically

#### Editing Notes
1. Tap any note card to open the editor
2. Use the formatting toolbar for rich text
3. Changes save automatically as you type

#### Managing Notes
1. **Long-press** on any note card
2. Choose from context menu:
   - ✏️ Edit - Open the note editor
   - 🗑️ Delete - Remove the note
   - 📋 Duplicate - Create a copy
   - ↗️ Share - Share via native API

#### Navigation
- **Swipe from left edge** - Open sidebar
- Tap "All Notes" - View all notes
- Tap "Tasks" - Manage tasks
- Use search icon to find notes

#### Tasks
1. Navigate to Tasks view from sidebar
2. Tap "Add Task" button
3. Enter task description
4. Tap checkbox to mark complete

## File Structure

```
test-release/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling and themes
├── script.js       # App logic and gesture controls
└── README.md       # This file
```

## Technical Details

### Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks or dependencies
- **LocalStorage API** - Data persistence
- **Web Share API** - Native sharing (where supported)

### Browser Support
- Modern mobile browsers (iOS Safari, Chrome, Firefox)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires LocalStorage support

### Key Features Implementation

#### Gesture Detection
```javascript
// Swipe detection using touch events
touchstart → touchmove → touchend
// Long-press detection with 500ms timer
setTimeout for context menu trigger
```

#### Auto-Save
```javascript
// Debounced save (500ms)
// Saves only after user stops typing
```

#### Responsive Grid
```css
/* Auto-adjusting grid layout */
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
```

## Customization

### Changing Theme Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #5B7FFF;      /* Main accent color */
    --secondary-color: #8B5CF6;    /* Secondary accent */
    --background: #0A0E1A;         /* Main background */
    --surface: #1A1F35;            /* Card backgrounds */
    --text-primary: #FFFFFF;       /* Primary text */
    --text-secondary: #A0AEC0;     /* Secondary text */
}
```

### Adding New Features

The app architecture is modular:
- **State Management** - `state` object in `script.js`
- **Local Storage** - `saveToStorage()` and `loadFromStorage()`
- **Rendering** - `renderNotes()` and `renderTasks()`
- **Event Handlers** - `setupEventListeners()`

## Performance

- **Zero dependencies** - Fast load times
- **Local-first** - No network requests
- **Optimized animations** - 60fps on modern devices
- **Debounced saves** - Reduces storage writes

## Privacy

- All data stored locally in browser
- No analytics or tracking
- No server communication
- No data collection

## Known Limitations

- Data stored in browser (clearing browser data removes notes)
- No cloud sync or backup
- No collaboration features
- No offline PWA support (yet)
- Share API requires HTTPS or localhost

## Future Enhancements

- [ ] Cloud sync and backup
- [ ] Export notes (PDF, Markdown)
- [ ] Calendar integration
- [ ] Tags and categories
- [ ] Note templates
- [ ] Markdown support
- [ ] PWA with offline support
- [ ] Desktop apps (Electron)
- [ ] End-to-end encryption

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is open source and available under the MIT License.

## Author

Built with ❤️ as a mobile-first note-taking solution.

---

**Tip**: For the best experience, add this app to your mobile home screen for a native app-like feel!