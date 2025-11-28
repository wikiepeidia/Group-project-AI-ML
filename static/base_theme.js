(function attachCsrfToken() {
    const meta = document.querySelector("meta[name='csrf-token']");
    if (!meta) {
        return;
    }

    const token = meta.getAttribute('content');
    if (!token) {
        return;
    }

    const headerName = 'X-CSRFToken';
    window.csrfToken = token;

    if (window.axios) {
        window.axios.defaults.headers.common[headerName] = token;
    }

    const originalFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;

    const hasHeader = (headers, name) => {
        const lower = name.toLowerCase();
        if (headers instanceof Headers) {
            return headers.has(name) || headers.has(lower);
        }
        if (Array.isArray(headers)) {
            return headers.some(([key]) => (key || '').toLowerCase() === lower);
        }
        return Object.keys(headers || {}).some((key) => (key || '').toLowerCase() === lower);
    };

    const setHeader = (headers, name, value) => {
        if (headers instanceof Headers) {
            if (!headers.has(name)) {
                headers.set(name, value);
            }
            return headers;
        }
        if (Array.isArray(headers)) {
            if (!hasHeader(headers, name)) {
                headers.push([name, value]);
            }
            return headers;
        }
        const next = Object.assign({}, headers);
        if (!hasHeader(next, name)) {
            next[name] = value;
        }
        return next;
    };

    if (originalFetch && !window.__csrfFetchPatched) {
        window.__csrfFetchPatched = true;
        window.fetch = function (resource, config) {
            const nextConfig = Object.assign({}, config || {});
            nextConfig.headers = setHeader(nextConfig.headers || {}, headerName, token);
            return originalFetch(resource, nextConfig);
        };
    }
})();
