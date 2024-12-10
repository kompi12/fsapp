// pages/api/airports.js
interface Airport {
    code: string;
    name: string;
}

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const allAirports: Airport[] = [];

    try {
        // Loop through each letter of the alphabet to fetch airport data
        for (const letter of alphabet) {
            const response = await fetch(`https://en.wikipedia.org/wiki/List_of_airports_by_IATA_airport_code:_${letter}&formtat=json`);
            const text: string = await response.text();
            
            // Use a regular expression to extract airport codes and names from the page
            const regex = /<a href="\/wiki\/(.*?)" title="(.*?)">/g;
            let match: RegExpExecArray | null;

            while ((match = regex.exec(text)) !== null) {
                const code: string = match[1].substring(0, 3); // Take first 3 characters as IATA code
                const name: string = match[2];
                allAirports.push({ code, name });
            }
        }

        // Return the extracted airports as a JSON response
        res.status(200).json(allAirports);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch airport data' });
    }
}
  