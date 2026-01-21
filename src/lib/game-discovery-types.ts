import { z } from 'zod';

export const FindGamesInputSchema = z.object({
  query: z.string().describe("The user's natural language query for finding games."),
});
export type FindGamesInput = z.infer<typeof FindGamesInputSchema>;

export const FindGamesOutputSchema = z.object({
    recommendationText: z.string().describe("A friendly and helpful text that introduces the recommended games. This text MUST NOT be empty."),
    games: z.array(
        z.object({
            name: z.string().describe("The exact, full and official title of the recommended game. This is critical for searching in a database."),
            reason: z.string().describe("A short, compelling reason (1-2 sentences) why this specific game is recommended based on the user's query.")
        })
    ).describe("A list of 3 to 5 recommended games. This list can be empty if no relevant games are found.")
});
export type FindGamesOutput = z.infer<typeof FindGamesOutputSchema>;
