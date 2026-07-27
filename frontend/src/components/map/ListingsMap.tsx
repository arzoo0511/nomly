"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapPopupCard from "@/components/map/MapPopupCard";
import type { ListingCard } from "@/types";

function createPriceIcon(price: number): L.DivIcon {
  const label = price >= 1000 ? `$${Math.round(price / 1000)}k` : `$${Math.round(price)}`;
  return L.divIcon({
    html: `<div class="nomly-map-pin">${label}</div>`,
    className: "nomly-map-pin-wrapper",
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function hasValidCoordinates(listing: ListingCard): boolean {
  return (
    Number.isFinite(listing.latitude) &&
    Number.isFinite(listing.longitude) &&
    Math.abs(listing.latitude) <= 90 &&
    Math.abs(listing.longitude) <= 180
  );
}

function FitBoundsToListings({ listings }: { listings: ListingCard[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;
    if (listings.length === 1) {
      map.setView([listings[0].latitude, listings[0].longitude], 11);
      return;
    }
    const bounds = L.latLngBounds(listings.map((l) => [l.latitude, l.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [listings, map]);

  return null;
}

export default function ListingsMap({ listings: allListings }: { listings: ListingCard[] }) {
  // Defensive: a single bad/missing coordinate would otherwise throw "Invalid
  // LatLng object" and take down the whole map (Leaflet doesn't degrade
  // gracefully per-marker), so filter before anything reaches Leaflet.
  const listings = useMemo(() => allListings.filter(hasValidCoordinates), [allListings]);

  const initialCenter = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [20, 0];
    return [listings[0].latitude, listings[0].longitude];
  }, [listings]);

  return (
    <div className="h-[65vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border-subtle">
      <MapContainer center={initialCenter} zoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsToListings listings={listings} />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createPriceIcon(listing.price_per_night)}
          >
            <Popup minWidth={220} maxWidth={220} closeButton={false}>
              <MapPopupCard listing={listing} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
