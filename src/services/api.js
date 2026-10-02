// ............................................................................
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LEGACY_PARTICIPANT_TOKEN_KEY = 'participant_token';

let refreshPromise = null;
const REFRESH_EXCLUDED_ENDPOINTS = ['/auth/login', '/auth/refresh'];

// ..............................
export const getAccessToken = () => {
    return sessionStorage.getItem(LEGACY_PARTICIPANT_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
};

// ..............................
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

// ..............................
export const setAuthTokens = ({ access_token, refresh_token }) => {
    if (access_token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    }
    if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    }
};

// ..............................
export const clearAuthTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_PARTICIPANT_TOKEN_KEY);
    window.dispatchEvent(new Event('auth:logout'));
};

// ..............................
const authHeader = () => {
    const token = getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ..............................
// Manejo de errores
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const detail = Array.isArray(error.detail)
            ? error.detail.map(e => `${e.loc?.slice(1).join('.')}: ${e.msg}`).join('; ')
            : error.detail;
        const apiError = new Error(error.error || error.message || detail || `Error ${response.status}: ${response.statusText}`);
        apiError.status = response.status;
        apiError.detail = detail;
        throw apiError;
    }
    return response.json();
};

// ..............................
const refreshAccessToken = async () => {
    if (!refreshPromise) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            clearAuthTokens();
            throw new Error('No hay refresh token');
        }

        refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })
            .then(handleResponse)
            .then((data) => {
                setAuthTokens({ access_token: data.access_token });
                return data.access_token;
            })
            .catch((error) => {
                clearAuthTokens();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

// ..............................
const request = async (endpoint, options = {}, retry = true) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers ?? {}),
            ...authHeader(),
        },
    });

    if (
        response.status === 401
        && retry
        && getRefreshToken()
        && !REFRESH_EXCLUDED_ENDPOINTS.includes(endpoint)
    ) {
        await refreshAccessToken();
        return request(endpoint, options, false);
    }

    return handleResponse(response);
};


// ..............................
// Manejo de errores de red
const handleError = (error) => {
    console.error('API Error:', error);
    throw error;
};


// ..............................
// Peticiones GET
export const get = async (endpoint) => {
    try {
        return await request(endpoint);
    } catch (error) {
        return handleError(error);
    }
};


// ..............................
// Peticiones POST
export const post = async (endpoint, data) => {
    try {
        return await request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        return handleError(error);
    }
};


// ..............................
// Peticiones PUT
export const put = async (endpoint, data) => {
    try {
        return await request(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        return handleError(error);
    }
};

// ..............................
// Peticiones PATCH
export const patch = async (endpoint, data) => {
    try {
        return await request(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        return handleError(error);
    }
};


// ..............................
// Peticiones DELETE
export const del = async (endpoint) => {
    try {
        return await request(endpoint, {
            method: 'DELETE',
        });
    } catch (error) {
        return handleError(error);
    }
};

// ..............................
// Peticiones multipart/form-data
export const upload = async (endpoint, formData) => {
    try {
        return await request(endpoint, {
            method: 'POST',
            body: formData,
        });
    } catch (error) {
        return handleError(error);
    }
};

// ..............................
export default { get, post, put, patch, del, upload };
