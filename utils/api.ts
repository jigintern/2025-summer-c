import type { PostSubmission, QueryParams } from '../types/postData.ts';
const BASE_URL = 'http://localhost:8000'; // For local testing. Change for production.

export const postJson = async (data: PostSubmission): Promise<Response> => {
    const endpoint = `${BASE_URL}/post-json`;
    return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const queryJson = async (params: QueryParams): Promise<PostSubmission[]> => {
    const q = Object.keys(params).map((key) => {
        return key + '=' + params[key as keyof QueryParams];
    }).join('&');
    const endpoint = `${BASE_URL}/query-json?${q}`;
    console.log(endpoint);
    const response = await fetch(endpoint, {
        method: 'GET', // Assuming backend expects POST for query
        headers: { 'Content-Type': 'application/json' },

        // body: JSON.stringify(params),
    });
    if (!response.ok) {
        throw new Error(`Server responded with an error: ${response.status}`);
    }
    return await response.json();
};