// pages/api/airports.js
interface Airport {
    code: string;
    name: string;
}

interface FlightOfferResponse {
  meta: Meta;
  data: FlightOffer[];
  dictionaries: Dictionaries;
}

interface Meta {
  count: number;
  links: Links;
}

interface Links {
  self: string;
}

interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  isUpsellOffer: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

interface Itinerary {
  duration: string;
  segments: Segment[];
}

interface Segment {
  departure: DepartureArrival;
  arrival: DepartureArrival;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  operating: Operating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

interface DepartureArrival {
  iataCode: string;
  terminal: string;
  at: string;
}

interface Aircraft {
  code: string;
}

interface Operating {
  carrierCode: string;
}

interface Price {
  currency: string;
  total: string;
  basePrice: string;
  fees: Fee[];
  grandTotal: string;
}

interface Fee {
  amount: string;
  type: string;
}

interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags: IncludedCheckedBags;
}

interface IncludedCheckedBags {
  quantity: number | null;
  weight: number | null;
  weightUnit: string;
}

interface Dictionaries {
  locations: Record<string, Location>;
  aircraft: Record<string, string>;
  currencies: Record<string, string>;
  carriers: Record<string, string>;
}

interface Location {
  cityCode: string;
  countryCode: string;
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
  