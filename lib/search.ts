import { z } from "zod";

import { searchRateLimit } from './rate-limit';

const searchResultSchema = z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string(),
});

type SearchResult = z.infer<typeof searchResultSchema>;

export async function searchWeb(query: string): Promise<SearchResult[]> {

    if (!(await searchRateLimit.canMakeRequest())) {
        console.warn('Search rate limit exceeded');
        return [];
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
        console.error('Missing search API credentials');
        return [];
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
                query
            )}&num=5`  // Limit to 5 results
        );

        if (!response.ok) {
            throw new Error(`Search API error: ${response.statusText}`);
        }

        const data = await response.json();

        const results: SearchResult[] = data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        })) || [];

        return results;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}