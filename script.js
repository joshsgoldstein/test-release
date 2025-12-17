// State Management
const state = {
    notes: [],
    tasks: [],
    currentNote: null,
    currentView: 'all-notes',
    searchQuery: '',
    currentBlockMenu: null
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
const blockMenu = document.getElementById('blockMenu');
const contextMenu = document.getElementById('contextMenu');
const toast = document.getElementById('toast');
const navItems = document.querySelectorAll('.nav-item');
const appTitle = document.querySelector('.app-title');
const tasksList = document.getElementById('tasksList');
const addTaskBtn = document.getElementById('addTaskBtn');

let blockIdCounter = 0;

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
            blocks: [
                { id: 1, type: 'text', content: 'This is your first note. Tap the + button on the left to add different types of content blocks.' },
                { id: 2, type: 'heading2', content: 'Block-Based Editor' },
                { id: 3, type: 'text', content: 'Just like Notion, each line is a separate block. Tap + to insert:' },
                { id: 4, type: 'list', content: 'Text paragraphs' },
                { id: 5, type: 'list', content: 'Headings (H1, H2, H3)' },
                { id: 6, type: 'list', content: 'To-do lists' },
                { id: 7, type: 'list', content: 'Tables' },
                { id: 8, type: 'list', content: 'Quotes and dividers' },
                { id: 9, type: 'heading2', content: 'Gestures' },
                { id: 10, type: 'text', content: 'Swipe from the left to open the menu. Long-press any note card for quick actions.' }
            ],
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

    // Block menu options
    document.querySelectorAll('.block-option').forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            insertBlock(type, state.currentBlockMenu);
            hideBlockMenu();
        });
    });

    // Close block menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!blockMenu.contains(e.target) && !e.target.closest('.block-handle')) {
            hideBlockMenu();
        }
    });

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.add('hidden');
        }
    });

    // Close sidebar when clicking on main content
    mainContent.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !e.target.closest('.menu-btn')) {
            toggleSidebar();
        }
    });

    // Tasks
    addTaskBtn.addEventListener('click', createNewTask);
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
        blocks: [
            { id: Date.now(), type: 'text', content: '' }
        ],
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

    renderBlocks();

    notesView.classList.add('hidden');
    editorView.classList.remove('hidden');
    editorView.classList.add('slide-in');
}

function closeEditor() {
    // Remove empty notes
    if (!state.currentNote.title && (!state.currentNote.blocks || state.currentNote.blocks.every(b => !b.content))) {
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
            blocks: note.blocks.map(b => ({ ...b, id: Date.now() + Math.random() })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        state.notes.unshift(duplicate);
        saveToStorage();
        renderNotes();
        showToast('Note duplicated');
    }
}

// Block System
function renderBlocks() {
    if (!state.currentNote || !state.currentNote.blocks) {
        state.currentNote.blocks = [{ id: Date.now(), type: 'text', content: '' }];
    }

    editorContent.innerHTML = '';

    state.currentNote.blocks.forEach((block, index) => {
        const blockEl = createBlockElement(block, index);
        editorContent.appendChild(blockEl);
    });

    // Focus first block if new note
    if (state.currentNote.blocks.length === 1 && !state.currentNote.blocks[0].content) {
        const firstInput = editorContent.querySelector('.block-input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function createBlockElement(block, index) {
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.dataset.type = block.type;
    blockEl.dataset.blockId = block.id;

    // Add handle (+ button)
    const handle = document.createElement('button');
    handle.className = 'block-handle';
    handle.innerHTML = '+';
    handle.addEventListener('click', (e) => {
        e.stopPropagation();
        showBlockMenu(block.id);
    });
    blockEl.appendChild(handle);

    // Add content based on type
    const content = document.createElement('div');
    content.className = 'block-content';

    switch(block.type) {
        case 'text':
        case 'heading1':
        case 'heading2':
        case 'heading3':
        case 'quote':
        case 'list':
        case 'numbered':
            content.appendChild(createTextInput(block, index));
            break;
        case 'checklist':
            content.appendChild(createChecklistBlock(block));
            break;
        case 'divider':
            const divider = document.createElement('div');
            divider.className = 'block-divider';
            content.appendChild(divider);
            break;
        case 'table':
            content.appendChild(createTableBlock(block));
            break;
    }

    if (block.type === 'numbered') {
        content.dataset.number = index + 1;
    }

    blockEl.appendChild(content);

    return blockEl;
}

function createTextInput(block, index) {
    const textarea = document.createElement('textarea');
    textarea.className = 'block-input';
    textarea.value = block.content || '';
    textarea.placeholder = getPlaceholder(block.type);
    textarea.rows = 1;

    // Auto-resize
    textarea.addEventListener('input', (e) => {
        autoResize(textarea);
        updateBlockContent(block.id, textarea.value);
    });

    // Handle Enter key
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const blockIndex = state.currentNote.blocks.findIndex(b => b.id === block.id);
            insertBlockAfter(blockIndex, 'text');
        } else if (e.key === 'Backspace' && textarea.value === '' && state.currentNote.blocks.length > 1) {
            e.preventDefault();
            deleteBlock(block.id);
        }
    });

    // Set initial height
    setTimeout(() => autoResize(textarea), 0);

    return textarea;
}

function createChecklistBlock(block) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'flex-start';
    container.style.gap = '12px';
    container.style.width = '100%';

    const checkbox = document.createElement('div');
    checkbox.className = 'block-checkbox';
    if (block.checked) {
        checkbox.classList.add('checked');
    }

    checkbox.addEventListener('click', () => {
        block.checked = !block.checked;
        checkbox.classList.toggle('checked');
        textarea.classList.toggle('completed', block.checked);
        saveToStorage();
    });

    const textarea = document.createElement('textarea');
    textarea.className = 'block-input';
    if (block.checked) {
        textarea.classList.add('completed');
    }
    textarea.value = block.content || '';
    textarea.placeholder = 'To-do';
    textarea.rows = 1;

    textarea.addEventListener('input', (e) => {
        autoResize(textarea);
        updateBlockContent(block.id, textarea.value);
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const blockIndex = state.currentNote.blocks.findIndex(b => b.id === block.id);
            insertBlockAfter(blockIndex, 'checklist');
        } else if (e.key === 'Backspace' && textarea.value === '' && state.currentNote.blocks.length > 1) {
            e.preventDefault();
            deleteBlock(block.id);
        }
    });

    setTimeout(() => autoResize(textarea), 0);

    container.appendChild(checkbox);
    container.appendChild(textarea);

    return container;
}

function createTableBlock(block) {
    if (!block.tableData) {
        block.tableData = {
            rows: 3,
            cols: 3,
            cells: Array(3).fill().map(() => Array(3).fill(''))
        };
    }

    const container = document.createElement('div');

    const table = document.createElement('table');
    table.className = 'block-table';

    for (let i = 0; i < block.tableData.rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < block.tableData.cols; j++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'block-table-cell';
            input.value = block.tableData.cells[i]?.[j] || '';
            input.placeholder = `Cell ${i + 1},${j + 1}`;

            input.addEventListener('input', (e) => {
                if (!block.tableData.cells[i]) {
                    block.tableData.cells[i] = [];
                }
                block.tableData.cells[i][j] = e.target.value;
                saveToStorage();
            });

            cell.appendChild(input);
        }
    }

    container.appendChild(table);

    const controls = document.createElement('div');
    controls.className = 'table-controls';

    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'table-btn';
    addRowBtn.textContent = '+ Row';
    addRowBtn.addEventListener('click', () => {
        block.tableData.rows++;
        block.tableData.cells.push(Array(block.tableData.cols).fill(''));
        renderBlocks();
    });

    const addColBtn = document.createElement('button');
    addColBtn.className = 'table-btn';
    addColBtn.textContent = '+ Column';
    addColBtn.addEventListener('click', () => {
        block.tableData.cols++;
        block.tableData.cells.forEach(row => row.push(''));
        renderBlocks();
    });

    const removeRowBtn = document.createElement('button');
    removeRowBtn.className = 'table-btn';
    removeRowBtn.textContent = '- Row';
    removeRowBtn.addEventListener('click', () => {
        if (block.tableData.rows > 1) {
            block.tableData.rows--;
            block.tableData.cells.pop();
            renderBlocks();
        }
    });

    const removeColBtn = document.createElement('button');
    removeColBtn.className = 'table-btn';
    removeColBtn.textContent = '- Column';
    removeColBtn.addEventListener('click', () => {
        if (block.tableData.cols > 1) {
            block.tableData.cols--;
            block.tableData.cells.forEach(row => row.pop());
            renderBlocks();
        }
    });

    controls.appendChild(addRowBtn);
    controls.appendChild(addColBtn);
    controls.appendChild(removeRowBtn);
    controls.appendChild(removeColBtn);

    container.appendChild(controls);

    return container;
}

function getPlaceholder(type) {
    const placeholders = {
        'text': 'Type / for blocks',
        'heading1': 'Heading 1',
        'heading2': 'Heading 2',
        'heading3': 'Heading 3',
        'quote': 'Quote',
        'list': 'List item',
        'numbered': 'Numbered item'
    };
    return placeholders[type] || 'Type something...';
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function updateBlockContent(blockId, content) {
    const block = state.currentNote.blocks.find(b => b.id === blockId);
    if (block) {
        block.content = content;
        saveCurrentNote();
    }
}

function insertBlock(type, afterBlockId) {
    const index = state.currentNote.blocks.findIndex(b => b.id === afterBlockId);
    const newBlock = {
        id: Date.now(),
        type: type,
        content: ''
    };

    if (index >= 0) {
        state.currentNote.blocks.splice(index + 1, 0, newBlock);
    } else {
        state.currentNote.blocks.push(newBlock);
    }

    renderBlocks();

    // Focus new block
    setTimeout(() => {
        const blockEl = editorContent.querySelector(`[data-block-id="${newBlock.id}"] .block-input`);
        if (blockEl) {
            blockEl.focus();
        }
    }, 50);

    saveToStorage();
}

function insertBlockAfter(index, type) {
    const newBlock = {
        id: Date.now(),
        type: type,
        content: ''
    };

    state.currentNote.blocks.splice(index + 1, 0, newBlock);
    renderBlocks();

    setTimeout(() => {
        const blockEl = editorContent.querySelector(`[data-block-id="${newBlock.id}"] .block-input`);
        if (blockEl) {
            blockEl.focus();
        }
    }, 50);

    saveToStorage();
}

function deleteBlock(blockId) {
    const index = state.currentNote.blocks.findIndex(b => b.id === blockId);

    if (state.currentNote.blocks.length > 1) {
        state.currentNote.blocks = state.currentNote.blocks.filter(b => b.id !== blockId);
        renderBlocks();

        // Focus previous block
        if (index > 0) {
            setTimeout(() => {
                const prevBlock = state.currentNote.blocks[index - 1];
                const prevInput = editorContent.querySelector(`[data-block-id="${prevBlock.id}"] .block-input`);
                if (prevInput) {
                    prevInput.focus();
                    prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                }
            }, 50);
        }

        saveToStorage();
    }
}

function showBlockMenu(blockId) {
    state.currentBlockMenu = blockId;
    blockMenu.classList.remove('hidden');
}

function hideBlockMenu() {
    blockMenu.classList.add('hidden');
    state.currentBlockMenu = null;
}

// Render Notes
function renderNotes() {
    let filteredNotes = state.notes;

    // Apply search filter
    if (state.searchQuery) {
        filteredNotes = state.notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(state.searchQuery);
            const contentMatch = note.blocks?.some(b =>
                b.content?.toLowerCase().includes(state.searchQuery)
            );
            return titleMatch || contentMatch;
        });
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
        const preview = note.blocks?.map(b => b.content).filter(c => c).join(' ').substring(0, 100) || '';

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
                const text = noteToShare.blocks?.map(b => b.content).filter(c => c).join('\n') || '';
                navigator.share({
                    title: noteToShare.title,
                    text: text
                }).catch(() => showToast('Share cancelled'));
            } else {
                showToast('Sharing not supported');
            }
            break;
    }
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
