"use client";

import dynamic from "next/dynamic";

const MapViewDynamic = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-bulong-950 flex items-center justify-center">
      <div className="text-bulong-500 text-sm animate-pulse">
        Loading globe...
      </div>
    </div>
  ),
});

export default MapViewDynamic;
