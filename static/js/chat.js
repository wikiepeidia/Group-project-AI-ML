document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Chat Script v4.0 (Stop Generation) Loaded");
    
    // DOM Elements
    const elements = {
        input: document.getElementById('ai-chat-input'),
        sendBtn: document.getElementById('ai-chat-send'),
        messagesContainer: document.getElementById('ai-chat-messages'),
        toggleBtn: document.getElementById('ai-chat-toggle'),
        chatWindow: document.getElementById('ai-chat-window'),
        closeBtn: document.getElementById('ai-chat-minimize'),
        fileInput: document.getElementById('ai-chat-file-input'),
        attachBtn: document.getElementById('ai-chat-attach-btn'),
        filePreview: document.getElementById('ai-chat-file-preview'),
        fileNameDisplay: document.getElementById('ai-chat-file-name'),
        clearFileBtn: document.getElementById('ai-chat-clear-file')
    };

    // State
    let isProcessing = false;
    let currentFile = null;
    let pollInterval = null;
    let abortController = null; // Used to cancel requests
    let activeUiId = null;

    // --- TOGGLE CHAT ---
    function toggleChat() {
        if(!elements.chatWindow) return;
        const isHidden = elements.chatWindow.hasAttribute('hidden');
        if (isHidden) {
            elements.chatWindow.removeAttribute('hidden');
            setTimeout(() => { if(elements.input) elements.input.focus(); }, 100);
        } else {
            elements.chatWindow.setAttribute('hidden', '');
        }
    }
    if(elements.toggleBtn) elements.toggleBtn.addEventListener('click', toggleChat);
    if(elements.closeBtn) elements.closeBtn.addEventListener('click', toggleChat);

    // --- FILE UPLOAD ---
    if (elements.attachBtn && elements.fileInput) {
        elements.attachBtn.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            elements.filePreview.style.display = 'flex';
            elements.fileNameDisplay.innerHTML = '⏳ Uploading...';
            
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const res = await fetch('/api/ai/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok) {
                    currentFile = data.filename;
                    elements.fileNameDisplay.innerHTML = '✅ ' + file.name;
                } else {
                    elements.fileNameDisplay.innerHTML = '❌ Failed';
                }
            } catch (e) {
                elements.fileNameDisplay.innerHTML = '❌ Error';
            }
        });
        if (elements.clearFileBtn) elements.clearFileBtn.addEventListener('click', () => {
            elements.fileInput.value = '';
            elements.filePreview.style.display = 'none';
            currentFile = null;
        });
    }

    // --- UI HELPERS ---
    function scrollToBottom() {
        if(elements.messagesContainer) elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }

    function addMessage(text, role) {
        const div = document.createElement('div');
        div.className = `ai-message ai-message-${role}`;
        div.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
        elements.messagesContainer.appendChild(div);
        scrollToBottom();
    }

    // --- STOP LOGIC ---
    function setProcessingState(processing) {
        isProcessing = processing;
        if (processing) {
            // Change Send Button to Stop Button
            elements.sendBtn.innerHTML = '<i class="fas fa-square"></i>'; // Stop Icon
            elements.sendBtn.classList.add('stop');
            elements.sendBtn.title = "Stop Generating";
            elements.input.disabled = true;
        } else {
            // Revert to Send Button
            elements.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            elements.sendBtn.classList.remove('stop');
            elements.sendBtn.title = "Send";
            elements.input.disabled = false;
            elements.input.focus();
        }
    }

    function stopGeneration() {
        console.log("🛑 User stopped generation.");
        
        // 1. Cancel Network Request
        if (abortController) abortController.abort();
        
        // 2. Stop Polling
        if (pollInterval) clearInterval(pollInterval);
        
        // 3. Remove UI Bubble
        if (activeUiId) {
            const el = document.getElementById(activeUiId);
            if (el) {
                el.innerHTML = '<span style="color:#ef4444; font-size:12px;">⛔ Stopped by user</span>';
                setTimeout(() => el.remove(), 1000);
            }
        }

        // 4. Reset State
        setProcessingState(false);
    }

    // --- POLLING ---
    async function pollJob(jobId, uiId) {
        activeUiId = uiId;
        pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/ai/status/${jobId}`);
                const data = await res.json();

                if (data.status === 'completed') {
                    clearInterval(pollInterval);
                    document.getElementById(uiId)?.remove();
                    
                    if (data.action && data.action.action === 'workflow_created') {
                        // Render Success Card
                        const div = document.createElement('div');
                        div.className = 'ai-message ai-message-bot';
                        div.innerHTML = `
                            <div class="workflow-card">
                                <div class="wf-title">✅ Automation Created</div>
                                <div class="wf-desc">${data.response}</div>
                                <a href="/workspace/builder?load=${data.action.id}" class="wf-btn">Open Builder</a>
                            </div>`;
                        elements.messagesContainer.appendChild(div);
                        scrollToBottom();
                    } else {
                        addMessage(data.response, 'bot');
                    }
                    setProcessingState(false);
                } 
                else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    document.getElementById(uiId)?.remove();
                    addMessage(`❌ AI Error: ${data.error}`, 'bot');
                    setProcessingState(false);
                }
            } catch (e) {
                console.error("Polling Error:", e);
            }
        }, 1000);
    }

    // --- SEND MESSAGE ---
    async function sendMessage() {
        // If already processing, clicking the button means STOP
        if (isProcessing) {
            stopGeneration();
            return;
        }

        const text = elements.input.value.trim();
        if (!text && !currentFile) return;

        addMessage(text || (currentFile ? '[Sent File]' : ''), 'user');
        elements.input.value = '';
        
        // Clear file
        if(elements.fileInput) elements.fileInput.value = '';
        if(elements.filePreview) elements.filePreview.style.display = 'none';

        // Set State & Abort Controller
        setProcessingState(true);
        abortController = new AbortController();
        const signal = abortController.signal;

        // Show UI
        const uiId = 'thinking-' + Date.now();
        activeUiId = uiId;
        const uiDiv = document.createElement('div');
        uiDiv.id = uiId;
        uiDiv.className = 'agent-process-container';
        uiDiv.style.display = 'block';
        uiDiv.innerHTML = `
            <div class="process-header">
                <div class="spinner-ring"></div>
                <span>Analyzing Request...</span>
            </div>
            <div class="process-steps"></div>`;
        elements.messagesContainer.appendChild(uiDiv);
        scrollToBottom();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                body: JSON.stringify({ message: text }),
                signal: signal // Attach abort signal
            });
            const data = await res.json();

            if (data.status === 'completed') {
                document.getElementById(uiId)?.remove();
                addMessage(data.response, 'bot');
                setProcessingState(false);
            } else if (data.job_id) {
                pollJob(data.job_id, uiId);
            } else {
                throw new Error("Invalid Server Response");
            }

        } catch (e) {
            if (e.name === 'AbortError') {
                // Handled in stopGeneration
            } else {