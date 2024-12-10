"use client";
import { useState } from "react";

// Define the types for the FlightOfferResponse
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
  const [formData, setFormData] = useState({
    departureDate: "",
    returnDate: "",
    originLocationCode: "",
    destinationLocationCode: "",
    adults: "",
    currencyCode: "",
  });

  const [flightOffers, setFlightOffers] = useState<FlightOfferResponse | null>(null); // State to hold the response

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateQueryKey = () => {
    return `${formData.departureDate}_${formData.returnDate}_${formData.originLocationCode}_${formData.destinationLocationCode}_${formData.adults}_${formData.currencyCode}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    // If no cached data, fetch new data
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
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Flight Offer Search</h1>
          <p className="text-gray-600 text-sm">
            Search low-cost budget airlines and flights.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-lg text-gray-500"
        >
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 text-gray-500"
              required
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 text-gray-500"
              required
            />
          </div>

          {/* Adults */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Adults</label>
            <input
              type="number"
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 text-gray-500"
              required
            />
          </div>

          {/* Departure Airport */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Departure Airport</label>
            <select
              name="originLocationCode"
              value={formData.originLocationCode}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white text-gray-500"
              required
            >
              <option value="" disabled>Select an option</option>
              <option value="JFK">JFK Airport</option>
              <option value="LAX">LAX Airport</option>
              <option value="ORD">ORD Airport</option>
            </select>
          </div>

          {/* Return Airport */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Return Airport</label>
            <select
              name="destinationLocationCode"
              value={formData.destinationLocationCode}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white text-gray-500"
              required
            >
              <option value="" disabled>Select an option</option>
              <option value="JFK">JFK Airport</option>
              <option value="LAX">LAX Airport</option>
              <option value="ORD">ORD Airport</option>
            </select>
          </div>

          {/* Currency Code */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Currency Code</label>
            <select
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white text-gray-500"
              required
            >
              <option value="" disabled>Select an option</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Display Flight Offers */}
       
        {flightOffers && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">Flight Offers</h2>
    {flightOffers.data.length === 0 ? (
      <p className="text-center text-lg text-gray-600">No flight offers available.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {flightOffers.data.map((offer, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-xl p-6 shadow-lg bg-white hover:shadow-xl transform transition duration-300 hover:scale-105"
          >
            <h3 className="text-xl font-semibold text-blue-800 mb-3">{offer.id}</h3>
            
            {/* Polazni Aerodrom (Departure Airport) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Polazni aerodrom:</p>
              <p className="text-lg text-gray-900">{offer.itineraries[0]?.segments[0]?.departure.iataCode}</p>
            </div>
            
            {/* Odredišni Aerodrom (Arrival Airport) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Odredišni aerodrom:</p>
              <p className="text-lg text-gray-900">{offer.itineraries[0]?.segments[0]?.arrival.iataCode}</p>
            </div>
            
            {/* Datum Polaska/Povratka (Departure/Return Date) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Datum polaska:</p>
              <p className="text-lg text-gray-900">{new Date(offer.itineraries[0]?.segments[0]?.departure.at).toLocaleDateString()}</p>
            </div>
            <div className="mb-3">
              <p className="font-medium text-gray-700">Datum povratka:</p>
              <p className="text-lg text-gray-900">{new Date(offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1]?.arrival.at).toLocaleDateString()}</p>
            </div>
            
            {/* Broj Presjedanja (Number of Stops) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Broj presjedanja (odlazno):</p>
              <p className="text-lg text-gray-900">{offer.itineraries[0]?.segments[0]?.numberOfStops}</p>
            </div>
            <div className="mb-3">
              <p className="font-medium text-gray-700">Broj presjedanja (povratno):</p>
              <p className="text-lg text-gray-900">{offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1]?.numberOfStops}</p>
            </div>
            
            {/* Broj Putnika (Number of Passengers) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Broj putnika:</p>
              <p className="text-lg text-gray-900">{formData.adults}</p>
            </div>
            
            {/* Valuta (Currency) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Valuta:</p>
              <p className="text-lg text-gray-900">{offer.price.currency}</p>
            </div>
            
            {/* Ukupna Cijena (Total Price) */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Ukupna cijena:</p>
              <p className="text-lg font-semibold text-green-600">
                {offer.price.currency} {offer.price.grandTotal}
              </p>
            </div>
            
            {/* Aircraft Time */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Vrijeme polaska:</p>
              <p className="text-lg text-gray-900">
                {new Date(offer.itineraries[0]?.segments[0]?.departure.at).toLocaleTimeString()}
              </p>
            </div>
            <div className="mb-3">
              <p className="font-medium text-gray-700">Vrijeme dolaska:</p>
              <p className="text-lg text-gray-900">
                {new Date(offer.itineraries[0]?.segments[0]?.arrival.at).toLocaleTimeString()}
              </p>
            </div>
            
            {/* Airline */}
            <div className="mb-3">
              <p className="font-medium text-gray-700">Zrakoplovna kompanija:</p>
              <p className="text-lg text-gray-900">
                {flightOffers.dictionaries.carriers[offer.itineraries[0]?.segments[0]?.carrierCode]}
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