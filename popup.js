document.addEventListener('DOMContentLoaded', function () {
    const titleInput = document.getElementById('title');
    const noteInput = document.getElementById('note');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const searchInput = document.getElementById('search');
    const notesContainer = document.getElementById('notes');

    // Load notes from storage
    chrome.storage.sync.get('notes', function (data) {
        if (data.notes) {
            renderNotes(data.notes);
        }
    });

    // Save note
    saveButton.addEventListener('click', function () {
        const title = titleInput.value.trim();
        const note = noteInput.value.trim();
        if (!title) {
            alert('Please enter a title for the note.');
            return;
        }
        if (!note) {
            alert('Please enter a note.');
            return;
        }
        chrome.storage.sync.get('notes', function (data) {
            const notes = data.notes || [];
            notes.push({ title, note });
            chrome.storage.sync.set({ 'notes': notes }, function () {
                renderNotes(notes);
                titleInput.value = '';
                noteInput.value = '';
            });
        });
    });
    

    // Clear all notes
    clearButton.addEventListener('click', function () {
        chrome.storage.sync.remove('notes', function () {
            notesContainer.innerHTML = '';
        });
    });

    // Search notes
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.trim().toLowerCase();
        chrome.storage.sync.get('notes', function (data) {
            if (data.notes) {
                const filteredNotes = data.notes.filter(note => 
                    note.title.toLowerCase().includes(query) || 
                    note.note.toLowerCase().includes(query)
                );
                renderNotes(filteredNotes);
            }
        });
    });

    // Add note to DOM with delete button
    function addNoteToDOM(note, index) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note', 'alert', 'alert-secondary', 'mt-2');

        const noteHeader = document.createElement('div');
        noteHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center');

        const titleElement = document.createElement('strong');
        titleElement.textContent = note.title;
        noteHeader.appendChild(titleElement);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            deleteNoteFromStorage(index);
        });
        // Apply the custom styling
        deleteButton.setAttribute('style', '--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;');

        noteHeader.appendChild(deleteButton);

        noteElement.appendChild(noteHeader);

        const noteTextElement = document.createElement('div');
        noteTextElement.textContent = note.note;
        noteTextElement.classList.add('mt-1');
        noteElement.appendChild(noteTextElement);

        notesContainer.appendChild(noteElement);
    }

    // Delete note from storage and update DOM
    function deleteNoteFromStorage(index) {
        chrome.storage.sync.get('notes', function (data) {
            const notes = data.notes || [];
            notes.splice(index, 1);
            chrome.storage.sync.set({ 'notes': notes }, function () {
                renderNotes(notes);
            });
        });
    }

    // Render notes to DOM
    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        notes.forEach((note, index) => addNoteToDOM(note, index));
    }
});
