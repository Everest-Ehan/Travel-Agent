"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { ApiService } from "../../services/api";
import { Hotel } from "../../types/hotel";

export default function HotelDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const id = params.id as string;
        const query: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          query[key] = value;
        });
        const details = await ApiService.fetchHotelDetails(id, query);
        setHotel(details);
      } catch (err: any) {
        setError(err.message || "Failed to load hotel details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-xl">Loading hotel details...</div>;
  }
  if (error) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-red-600">{error}</div>;
  }
  if (!hotel) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Images */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-100 p-4">
            {hotel.images.slice(0, 6).map((img, idx) => (
              <img
                key={idx}
                src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_400,h_300,g_auto/f_auto/q_auto/v1/${img.public_id}`}
                alt={img.caption || hotel.name}
                className="rounded-lg object-cover w-full h-40"
              />
            ))}
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{hotel.name}</h1>
          <div className="text-lg text-gray-600 mb-4">{hotel.location}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.labels?.map((label, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                {label.text}
              </span>
            ))}
          </div>
          <div className="mb-4 text-gray-700">
            <span className="font-semibold">Description:</span> {hotel.description}
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            {hotel.hotel_class && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">{hotel.hotel_class}★</span>
            )}
            {hotel.brand_name && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold">{hotel.brand_name}</span>
            )}
            {hotel.commission_range && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">Commission: {hotel.commission_range}</span>
            )}
            {hotel.payout_speed && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">Payout: {hotel.payout_speed}</span>
            )}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Contact:</span> {hotel.contact_info?.phones?.[0]?.number || "N/A"}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Address:</span> {hotel.physical_address_1}, {hotel.physical_city}, {hotel.physical_state}, {hotel.physical_country}, {hotel.physical_postal_code}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Google Maps:</span>{" "}
            {hotel.gmaps_link ? (
              <a href={hotel.gmaps_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View on Map</a>
            ) : (
              "N/A"
            )}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Average Review Rating:</span> {hotel.average_review_rating ? hotel.average_review_rating.toFixed(1) : "N/A"} ({hotel.total_review_count || 0} reviews)
          </div>
          <div className="mb-4">
            <span className="font-semibold">Programs:</span>
            <ul className="list-disc ml-6">
              {hotel.programs?.map((prog, i) => (
                <li key={i} className="mb-1">
                  {prog.logo_url && <img src={prog.logo_url} alt={prog.name} className="inline h-6 w-auto mr-2 align-middle" />}<span className="align-middle">{prog.name}</span>
                </li>
              )) || <li>N/A</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 