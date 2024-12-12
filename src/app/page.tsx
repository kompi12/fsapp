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
  data: { id: string; details: string }[]; // Assuming each offer has an `id`
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
          {airport.name} {airport.iata_code}
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
          {airport.name} {airport.iata_code}
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
            <h2 className="text-xl font-semibold">Flight Offers</h2>
            {flightOffers.data.length > 0 ? (
              <ul className="space-y-4">
                {flightOffers.data.map((offer) => (
                  <li
                    key={offer.id} // Unique key for each flight offer
                    className="p-4 border border-gray-300 rounded-md"
                  >
                    <div>
                      <p>{offer.details}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No flight offers found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
