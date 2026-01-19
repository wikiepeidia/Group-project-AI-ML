document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Chat System v3.0 (File-Based) Loaded");
    
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const messagesContainer = document.getElementById('ai-chat-messages');
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-minimize');

    let isProcessing = false;

    // Toggle
    function toggleChat() {
        if(!chatWindow) return;
        chatWindow.hasAttribute('hidden') ? chatWindow.removeAttribute('hidden') : chatWindow.setAttribute('hidden', '');
    }
    if(toggleBtn) toggleBtn.addEventListener('click', toggleChat);
    if(closeBtn) closeBtn.addEventListener('click', toggleChat);

    // Helper: Scroll
    function scrollToBottom() {
        if(messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Helper: Add Message
    function addMessage(text, role) {
        const div = document.createElement('div');
        div.className = `ai-message ai-message-${role}`;
        div.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    // Polling
    async function pollJob(jobId, uiId) {
        console.log(`⏳ [Polling] Starting for Job ${jobId}...`);
        
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/ai/status/${jobId}`);
                const data = await res.json();
                console.log(`🔄 [Polling] Status:`, data.status);

                if (data.status === 'completed') {
                    clearInterval(pollInterval);
                    document.getElementById(uiId)?.remove();
                    isProcessing = false;
                    
                    console.log("✅ [Polling] Success!", data);
                    if (data.action && data.action.action === 'workflow_created') {
                        addMessage(`✅ **Workflow Created!**\n[Open Builder](/workspace/builder?load=${data.action.id})`, 'bot');
                    } else {
                        addMessage(data.response, 'bot');
                    }
                    input.disabled = false;
                    input.focus();
                } 
                else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    document.getElementById(uiId)?.remove();
                    isProcessing = false;
                    input.disabled = false;
                    addMessage(`❌ Error: ${data.error}`, 'bot');
                }
            } catch (e) {
                console.error("Polling Network Error:", e);
            }
        }, 1000);
    }

    // Send
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        if (isProcessing) return;

        addMessage(text, 'user');
        input.value = '';
        input.disabled = true;
        isProcessing = true;

        // Show UI
        const uiId = 'thinking-' + Date.now();
        const uiDiv = document.createElement('div');
        uiDiv.id = uiId;
        uiDiv.className = 'agent-process-container';
        uiDiv.style.display = 'block';
        uiDiv.innerHTML = `<div class="process-header"><div class="spinner-ring"></div><span>Project A is working...</span></div>`;
        messagesContainer.appendChild(uiDiv);
        scrollToBottom();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            console.log("📤 Sending Request...");
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            console.log("📥 Initial Response:", data);

            if (data.status === 'completed') {
                document.getElementById(uiId)?.remove();
                addMessage(data.response, 'bot');
                isProcessing = false;
                input.disabled = false;
            } else if (data.job_id) {
                pollJob(data.job_id, uiId);
            } else {
                throw new Error("Invalid Server Response");
            }

        } catch (e) {
            document.getElementById(uiId)?.remove();
            isProcessing = false;
            input.disabled = false;
            addMessage(`❌ Error: ${e.message}`, 'bot');
        }
    }

    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    if(input) input.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
});