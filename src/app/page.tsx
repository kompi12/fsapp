"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    departureDate: "",
    returnDate: "",
    originLocationCode: "",
    destinationLocationCode: "",
    adults: "",
    currencyCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData.originLocationCode);
    if(formData.originLocationCode == formData.destinationLocationCode){
     alert("Departure and Return Airport cannot be the same");;
      return;
    }
    if (new Date(formData.returnDate) < new Date(formData.departureDate)) {
      alert("End date cannot be before start date.");
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
      console.log("Response:", response);
      const result = await response.json();
      console.log(result);
  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
  }
    console.log("Form Data Submitted:", formData);
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-lg  text-gray-500"
      >
        {/* Start Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300  text-gray-500"
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
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300  text-gray-500"
            required
          />
        </div>

          {/* adults of People */}
          <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">adults of People</label>
          <input
            type="adults"
            name="adults"
            value={formData.adults}
            onChange={handleChange}
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300  text-gray-500"
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
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white  text-gray-500"
            required
          >
            <option value="" disabled>
              Select an option
            </option>
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
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white  text-gray-500"
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="JFK">JFK Airport</option>
            <option value="LAX">LAX Airport</option>
            <option value="ORD">ORD Airport</option>
          </select>
        </div>

        

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">currencyCode</label>
          <select
            name="currencyCode"
            value={formData.currencyCode}
            onChange={handleChange}
            className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 bg-white  text-gray-500"
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="USD">USD</option>
            <option value="EUR">EUR </option>
            <option value="optionC">FUR</option>
          </select>
        </div>

     
        {/* Submit Button */}
        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 "
          >
            Submit
          </button>
        </div>
      </form>
    </div> </div>
  );
}
