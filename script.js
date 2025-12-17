// State Management
const state = {
    notes: [],
    tasks: [],
    currentNote: null,
    currentView: 'all-notes',
    searchQuery: ''
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');
const notesView = document.getElementById('notesView');
const editorView = document.getElementById('editorView');
const tasksView = document.getElementById('tasksView');
const calendarView = document.getElementById('calendarView');
const notesGrid = document.getElementById('notesGrid');
const fabBtn = document.getElementById('fabBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const backBtn = document.getElementById('backBtn');
const noteTitle = document.getElementById('noteTitle');
const editorContent = document.getElementById('editorContent');
const contextMenu = document.getElementById('contextMenu');
const toast = document.getElementById('toast');
const navItems = document.querySelectorAll('.nav-item');
const appTitle = document.querySelector('.app-title');
const tasksList = document.getElementById('tasksList');
const addTaskBtn = document.getElementById('addTaskBtn');

// Initialize App
function init() {
    loadFromStorage();
    renderNotes();
    setupEventListeners();
    setupGestureControls();
}

// Local Storage
function saveToStorage() {
    localStorage.setItem('notes', JSON.stringify(state.notes));
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

function loadFromStorage() {
    const savedNotes = localStorage.getItem('notes');
    const savedTasks = localStorage.getItem('tasks');

    if (savedNotes) {
        state.notes = JSON.parse(savedNotes);
    } else {
        // Add welcome note
        state.notes = [{
            id: Date.now(),
            title: 'Welcome to Notes! 👋',
            content: 'This is your first note. Tap to edit or long-press for more options.\n\nSwipe from the left edge to open the menu. Tap the + button to create new notes.\n\nStart capturing your thoughts!',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }];
    }

    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    }
}

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    menuBtn.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);

    // Search
    searchBtn.addEventListener('click', toggleSearch);
    searchClose.addEventListener('click', toggleSearch);
    searchInput.addEventListener('input', handleSearch);

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => handleNavigation(item.dataset.view));
    });

    // New note
    fabBtn.addEventListener('click', createNewNote);
    newNoteBtn.addEventListener('click', () => {
        toggleSidebar();
        createNewNote();
    });

    // Editor
    backBtn.addEventListener('click', closeEditor);
    noteTitle.addEventListener('input', saveCurrentNote);
    editorContent.addEventListener('input', saveCurrentNote);

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.add('hidden');
        }
    });

    // Tasks
    addTaskBtn.addEventListener('click', createNewTask);

    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => handleToolbarAction(btn.dataset.action));
    });

    // Close sidebar when clicking on main content
    mainContent.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !e.target.closest('.menu-btn')) {
            toggleSidebar();
        }
    });
}

// Gesture Controls
function setupGestureControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let longPressTimer = null;
    let longPressTarget = null;

    // Swipe to open/close sidebar
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Long press detection for note cards
        if (e.target.closest('.note-card')) {
            longPressTarget = e.target.closest('.note-card');
            longPressTimer = setTimeout(() => {
                handleLongPress(longPressTarget, e.touches[0].clientX, e.touches[0].clientY);
            }, 500);
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        // Cancel long press if moved
        if (longPressTimer) {
            const moveX = Math.abs(e.touches[0].clientX - touchStartX);
            const moveY = Math.abs(e.touches[0].clientY - touchStartY);
            if (moveX > 10 || moveY > 10) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;

        clearTimeout(longPressTimer);
        longPressTimer = null;

        handleSwipe();
    });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Horizontal swipe
        if (absDeltaX > absDeltaY && absDeltaX > 50) {
            if (deltaX > 0 && touchStartX < 50) {
                // Swipe right from left edge - open sidebar
                if (!sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            } else if (deltaX < 0 && sidebar.classList.contains('active')) {
                // Swipe left - close sidebar
                toggleSidebar();
            }
        }
    }
}

function handleLongPress(element, x, y) {
    const noteId = parseInt(element.dataset.noteId);
    showContextMenu(noteId, x, y);

    // Add visual feedback
    element.classList.add('long-press');
    setTimeout(() => element.classList.remove('long-press'), 300);

    // Vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Sidebar
function toggleSidebar() {
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('sidebar-open');
    document.body.classList.toggle('no-scroll', sidebar.classList.contains('active'));
}

// Search
function toggleSearch() {
    searchContainer.classList.toggle('hidden');
    if (!searchContainer.classList.contains('hidden')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        state.searchQuery = '';
        renderNotes();
    }
}

function handleSearch(e) {
    state.searchQuery = e.target.value.toLowerCase();
    renderNotes();
}

// Navigation
function handleNavigation(view) {
    state.currentView = view;

    // Update active nav item
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });

    // Hide all views
    notesView.classList.add('hidden');
    tasksView.classList.add('hidden');
    calendarView.classList.add('hidden');

    // Show selected view
    switch(view) {
        case 'all-notes':
            notesView.classList.remove('hidden');
            appTitle.textContent = 'All Notes';
            renderNotes();
            break;
        case 'tasks':
            tasksView.classList.remove('hidden');
            appTitle.textContent = 'Tasks';
            renderTasks();
            break;
        case 'calendar':
            calendarView.classList.remove('hidden');
            appTitle.textContent = 'Calendar';
            break;
    }

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// Notes Management
function createNewNote() {
    const note = {
        id: Date.now(),
        title: '',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    state.notes.unshift(note);
    state.currentNote = note;

    openEditor(note);
    noteTitle.focus();
}

function openEditor(note) {
    state.currentNote = note;
    noteTitle.value = note.title;
    editorContent.innerHTML = note.content.replace(/\n/g, '<br>');

    notesView.classList.add('hidden');
    editorView.classList.remove('hidden');
    editorView.classList.add('slide-in');
}

function closeEditor() {
    // Remove empty notes
    if (!state.currentNote.title && !state.currentNote.content) {
        state.notes = state.notes.filter(n => n.id !== state.currentNote.id);
    }

    editorView.classList.add('slide-out');
    setTimeout(() => {
        editorView.classList.remove('slide-in', 'slide-out');
        editorView.classList.add('hidden');
        notesView.classList.remove('hidden');
    }, 300);

    renderNotes();
    saveToStorage();
}

function saveCurrentNote() {
    if (state.currentNote) {
        state.currentNote.title = noteTitle.value;
        state.currentNote.content = editorContent.innerText;
        state.currentNote.updatedAt = new Date().toISOString();

        // Debounced save
        clearTimeout(saveCurrentNote.timer);
        saveCurrentNote.timer = setTimeout(() => {
            saveToStorage();
        }, 500);
    }
}

function deleteNote(noteId) {
    state.notes = state.notes.filter(n => n.id !== noteId);
    saveToStorage();
    renderNotes();
    showToast('Note deleted');
}

function duplicateNote(noteId) {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
        const duplicate = {
            ...note,
            id: Date.now(),
            title: note.title + ' (Copy)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        state.notes.unshift(duplicate);
        saveToStorage();
        renderNotes();
        showToast('Note duplicated');
    }
}

// Render Notes
function renderNotes() {
    let filteredNotes = state.notes;

    // Apply search filter
    if (state.searchQuery) {
        filteredNotes = state.notes.filter(note =>
            note.title.toLowerCase().includes(state.searchQuery) ||
            note.content.toLowerCase().includes(state.searchQuery)
        );
    }

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>${state.searchQuery ? 'No notes found' : 'No notes yet'}</h3>
                <p>${state.searchQuery ? 'Try a different search term' : 'Tap the + button to create your first note'}</p>
            </div>
        `;
        return;
    }

    notesGrid.innerHTML = filteredNotes.map(note => {
        const date = new Date(note.updatedAt);
        const formattedDate = formatDate(date);
        const preview = note.content.substring(0, 100);

        return `
            <div class="note-card" data-note-id="${note.id}">
                <div class="note-card-title">${note.title || 'Untitled'}</div>
                <div class="note-card-preview">${preview}</div>
                <div class="note-card-date">${formattedDate}</div>
            </div>
        `;
    }).join('');

    // Add click listeners to note cards
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!contextMenu.classList.contains('hidden')) return;

            const noteId = parseInt(card.dataset.noteId);
            const note = state.notes.find(n => n.id === noteId);
            if (note) {
                openEditor(note);
            }
        });
    });
}

// Tasks Management
function createNewTask() {
    const taskText = prompt('Enter task:');
    if (taskText && taskText.trim()) {
        const task = {
            id: Date.now(),
            text: taskText.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        state.tasks.unshift(task);
        saveToStorage();
        renderTasks();
    }
}

function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToStorage();
        renderTasks();
    }
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    renderTasks();
    showToast('Task deleted');
}

function renderTasks() {
    if (state.tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✓</div>
                <h3>No tasks yet</h3>
                <p>Tap "Add Task" to create your first task</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = state.tasks.map(task => `
        <div class="task-item" data-task-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
        </div>
    `).join('');
}

// Context Menu
function showContextMenu(noteId, x, y) {
    contextMenu.classList.remove('hidden');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;

    // Position within viewport
    const menuRect = contextMenu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
        contextMenu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
        contextMenu.style.top = `${window.innerHeight - menuRect.height - 10}px`;
    }

    // Remove old listeners
    const newContextMenu = contextMenu.cloneNode(true);
    contextMenu.parentNode.replaceChild(newContextMenu, contextMenu);
    const contextMenuEl = document.getElementById('contextMenu');

    // Add new listeners
    contextMenuEl.querySelectorAll('.context-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            handleContextAction(option.dataset.action, noteId);
            contextMenuEl.classList.add('hidden');
        });
    });
}

function handleContextAction(action, noteId) {
    switch(action) {
        case 'edit':
            const note = state.notes.find(n => n.id === noteId);
            if (note) openEditor(note);
            break;
        case 'delete':
            if (confirm('Delete this note?')) {
                deleteNote(noteId);
            }
            break;
        case 'duplicate':
            duplicateNote(noteId);
            break;
        case 'share':
            const noteToShare = state.notes.find(n => n.id === noteId);
            if (noteToShare && navigator.share) {
                navigator.share({
                    title: noteToShare.title,
                    text: noteToShare.content
                }).catch(() => showToast('Share cancelled'));
            } else {
                showToast('Sharing not supported');
            }
            break;
    }
}

// Toolbar Actions
function handleToolbarAction(action) {
    const selection = window.getSelection();

    switch(action) {
        case 'bold':
            document.execCommand('bold');
            break;
        case 'italic':
            document.execCommand('italic');
            break;
        case 'heading':
            document.execCommand('formatBlock', false, '<h1>');
            break;
        case 'list':
            document.execCommand('insertUnorderedList');
            break;
        case 'checkbox':
            const checkbox = '☐ ';
            document.execCommand('insertText', false, checkbox);
            break;
        case 'image':
            const url = prompt('Enter image URL:');
            if (url) {
                document.execCommand('insertImage', false, url);
            }
            break;
    }

    editorContent.focus();
}

// Toast Notifications
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Utilities
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

// Global functions for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Save before page unload
window.addEventListener('beforeunload', saveToStorage);
