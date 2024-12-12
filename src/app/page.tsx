/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; 
import { useState, useEffect } from "react";

// Interfaces for type safety
interface FormData {
  departureDate: string;
  returnDate: string;
  originLocationCode: string;
  destinationLocationCode: string;
  adults: string;
  currencyCode: string;
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


export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    departureDate: "",
    returnDate: "",
    originLocationCode: "",
    destinationLocationCode: "",
    adults: "",
    currencyCode: "",
  });

  const [flightOffers, setFlightOffers] = useState<FlightOfferResponse | null>(null);
  
  // Use state to manage airports data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [airports, setAirports] = useState<any[]>([]);
  const [, setLoadingAirports] = useState<boolean>(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch airports data on component mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoadingAirports(true);
        const response = await fetch(
          "https://api.aviationstack.com/v1/airports?access_key=8cba6e76b827d4dc9b3df5ebf769111c&limit=7000"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch airport data");
        }

        const data = await response.json();
        setAirports(data.data);

      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  const generateQueryKey = () => {
    return `${formData.departureDate}_${formData.returnDate}_${formData.originLocationCode}_${formData.destinationLocationCode}_${formData.adults}_${formData.currencyCode}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFlightOffers(null); // Clear the previous results

    // Validation
    if (formData.originLocationCode === formData.destinationLocationCode) {
      alert("Departure and Return Airport cannot be the same");
      return;
    }
    if (new Date(formData.returnDate) < new Date(formData.departureDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    const queryKey = generateQueryKey();

    // Check if we already have the results in localStorage
    const cachedData = localStorage.getItem(queryKey);
    if (cachedData) {
      console.log("Loaded from localStorage");
      setFlightOffers(JSON.parse(cachedData)); // Set the state from cached data
      return;
    }

    try {
      const response = await fetch("http://localhost:5133", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Fetched from API:", result);

      // Store the result in localStorage
      localStorage.setItem(queryKey, JSON.stringify(result));

      // Set the fetched data in the state
      setFlightOffers(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-100">
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl rounded-xl max-w-5xl mx-auto text-gray-500 animate-fadeIn">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Flight Search</h1>
        </header>
      
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="departureDate"
                className="block text-sm font-medium text-gray-700"
              >
                Departure Date
              </label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="returnDate"
                className="block text-sm font-medium text-gray-700"
              >
                Return Date
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="originLocationCode"
                className="block text-sm font-medium text-gray-700"
              >
                Origin (IATA Code)
              </label>
              <select
                id="originLocationCode"
                name="originLocationCode"
                value={formData.originLocationCode}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
               <option value="">Select Airport</option>
      {airports.map((airport: any) => (
        <option key={airport.id} value={airport.iata_code}>
          {airport.airport_name} -{airport.country_name}- {airport.iata_code}
          </option>
      ))}
    
              </select>
            </div>

            <div>
              <label
                htmlFor="destinationLocationCode"
                className="block text-sm font-medium text-gray-700"
              >
                Destination (IATA Code)
              </label>
              <select
                id="destinationLocationCode"
                name="destinationLocationCode"
                value={formData.destinationLocationCode}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
               <option value="">Select Airport</option>
      {airports.map((airport: any) => (
        <option key={airport.id} value={airport.iata_code}>
          {airport.airport_name} -{airport.country_name}- {airport.iata_code}
          </option>
      ))}
    </select>
              
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="adults"
                className="block text-sm font-medium text-gray-700"
              >
                Adults
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="currencyCode"
                className="block text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <select
                id="currencyCode"
                name="currencyCode"
                value={formData.currencyCode}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value=""></option>

                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
            >
              Search Flights
            </button>
          </div>
        </form>

        {flightOffers && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Ponude letova
            </h2>
            {flightOffers.data.length === 0 ? (
              <p className="text-center text-lg text-gray-600">
                Nema letova za te datume.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {flightOffers.data.map((offer, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-6 shadow-lg bg-white hover:shadow-xl transform transition duration-300 hover:scale-105"
                  >
                    <h3 className="text-xl font-semibold text-blue-800 mb-3">
                      {offer.id}
                    </h3>

                    {/* Polazni Aerodrom (Departure Airport) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Polazni aerodrom:
                      </p>
                      <p className="text-lg text-gray-900">
                        {offer.itineraries[0]?.segments[0]?.departure.iataCode}
                      </p>
                    </div>

                    {/* Odredišni Aerodrom (Arrival Airport) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Odredišni aerodrom:
                      </p>
                      <p className="text-lg text-gray-900">
                        {offer.itineraries[0]?.segments[1]?.arrival.iataCode}
                      </p>
                    </div>

                    {/* Datum Polaska/Povratka (Departure/Return Date) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Datum polaska:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[0]?.segments[0]?.departure.at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Datum povratka:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[1]?.segments[
                            offer.itineraries[1].segments.length - 1
                          ]?.arrival.at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Broj Presjedanja (Number of Stops) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Broj presjedanja (odlazno):
                      </p>
                      <p className="text-lg text-gray-900">
                        {offer.itineraries[0]?.segments?.length - 1}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Broj presjedanja (povratno):
                      </p>
                      <p className="text-lg text-gray-900">
                        {offer.itineraries[1]?.segments?.length - 1}
                      </p>
                    </div>

                    {/* Broj Putnika (Number of Passengers) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">Broj putnika:</p>
                      <p className="text-lg text-gray-900">{formData.adults}</p>
                    </div>

                    {/* Valuta (Currency) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">Valuta:</p>
                      <p className="text-lg text-gray-900">
                        {offer.price.currency}
                      </p>
                    </div>

                    {/* Ukupna Cijena (Total Price) */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Ukupna cijena:
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {offer.price.currency} {offer.price.grandTotal}
                      </p>
                    </div>

                    {/* Aircraft Time */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Vrijeme polaska:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[0]?.segments[0]?.departure.at
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Vrijeme dolaska:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[0]?.segments[0]?.arrival.at
                        ).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Aircraft Time  Return*/}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Vrijeme polaska povratka:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[1]?.segments[0]?.departure.at
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Vrijeme dolaska povratka:
                      </p>
                      <p className="text-lg text-gray-900">
                        {new Date(
                          offer.itineraries[1]?.segments[0]?.arrival.at
                        ).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Airline */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-700">
                        Zrakoplovna kompanija:
                      </p>
                      <p className="text-lg text-gray-900">
                        {
                          flightOffers.dictionaries.carriers[
                            offer.itineraries[0]?.segments[0]?.carrierCode
                          ]
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
               
          </div>
        )}
      </div>
    </div>

  );
}

