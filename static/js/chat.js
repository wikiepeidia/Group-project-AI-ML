document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const chatWidget = document.getElementById('ai-chat-widget');
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-minimize');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingIndicator = document.getElementById('ai-chat-typing');
    
    // File Upload Elements
    const fileInput = document.getElementById('ai-chat-file-input');
    const attachBtn = document.getElementById('ai-chat-attach-btn');
    const filePreview = document.getElementById('ai-chat-file-preview');
    const fileNameDisplay = document.getElementById('ai-chat-file-name');
    const clearFileBtn = document.getElementById('ai-chat-clear-file');

    // State
    let currentFile = null;

    // Toggle Chat Window
    function toggleChat() {
        const isHidden = chatWindow.hasAttribute('hidden');
        if (isHidden) {
            chatWindow.removeAttribute('hidden');
            setTimeout(() => input.focus(), 100);
        } else {
            chatWindow.setAttribute('hidden', '');
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);

    // File Upload Logic
    if (attachBtn) {
        attachBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading state
            filePreview.style.display = 'flex';
            fileNameDisplay.innerHTML = '⏳ Uploading...';
            currentFile = null; // Clear prev file until uploaded

            const formData = new FormData();
            formData.append('file', file);
            
            try {
                // Get CSRF Token
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                const response = await fetch('/api/ai/upload', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken || ''
                    },
                    body: formData
                });

                const data = await response.json();
                
                if (response.ok && (data.success || data.status === 'success' || data.filename)) {
                    currentFile = data.filename;
                    fileNameDisplay.innerHTML = '✅ ' + (file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name);
                } else {
                    fileNameDisplay.innerHTML = '❌ Upload Failed';
                    console.error('Upload error:', data);
                }
            } catch (error) {
                fileNameDisplay.innerHTML = '❌ Network Error';
                console.error('Upload error:', error);
            }
        });
    }

    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', () => {
            fileInput.value = '';
            filePreview.style.display = 'none';
            currentFile = null;
        });
    }

    // Send Message Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text && !currentFile) return;

        // Add User Message
        const tempMsg = text || (currentFile ? '[Sent File]' : '');
        addMessage(tempMsg, 'user');
        
        input.value = '';
        input.disabled = true; 
        
        // Clear file preview UI
        fileInput.value = '';
        filePreview.style.display = 'none';
        
        if (typingIndicator) typingIndicator.style.display = 'block';
        scrollToBottom();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const payload = {
                message: text
            };

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (typingIndicator) typingIndicator.style.display = 'none';

            if (response.ok) {
                const responseText = data.response || data.message || 'I received your message.';
                addMessage(responseText, 'bot');
            } else {
                addMessage('❌ Error: ' + (data.error || 'Unknown server error'), 'bot');
            }

        } catch (error) {
            if (typingIndicator) typingIndicator.style.display = 'none';
            addMessage('❌ Network error. Please try again later.', 'bot');
            console.error('Network Error:', error);
        } finally {
            input.disabled = false;
            input.focus();
            scrollToBottom();
        }
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);

    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-message ai-message-' + sender;
        
        // Use marked if available, else plain text
        let htmlContent = text;
        if (typeof marked !== 'undefined' && marked.parse) {
            try {
                htmlContent = marked.parse(text);
            } catch (e) {
                console.error('Markdown parse error:', e);
                htmlContent = text;
            }
        }

        msgDiv.innerHTML = htmlContent;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});