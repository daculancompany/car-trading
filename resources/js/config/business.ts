// Shop details shown on the public pages. Edit here and every page follows.
export const business = {
    name: "CDO Car Trading",
    shortName: "AUTO CDO",
    address: "Zone 1-B Colanda, Iponan, Cagayan de Oro City",
    area: "Opol, Cagayan de Oro",
    phone: "0919 911 9030",
    phoneHref: "tel:+639199119030",
    phones: ["0919 911 9030", "0926 064 1774"],
    facebookName: "AUTO CDO car trading",
    facebookUrl: "https://www.facebook.com/p/AUTO-CDO-car-trading-61552038176349/",
    // Placeholder — confirm with the owner.
    hours: "Mon–Sat, 8:00 AM – 5:00 PM",
    mapsQuery: "Colanda, Iponan, Cagayan de Oro City",
};

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapsQuery)}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}&output=embed`;
