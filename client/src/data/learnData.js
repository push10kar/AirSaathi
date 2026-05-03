export const CATEGORIES = ['All', 'AQI Basics', 'Pollutants', 'Health Impact', 'Sources', 'Mitigation'];

export const LEARN_TOPICS = [
  {
    id: "aqi",
    category: "AQI Basics",
    title: "What is AQI?",
    icon: "info-outline",
    short: "Air Quality Index shows how polluted the air is.",
    why: "It helps you decide which outdoor activities are safe and which are not based on pollution levels.",
    takeaway: "Higher AQI = worse air. Check it daily before stepping out.",
    actions: ["check_aqi"]
  },
  {
    id: "pm25",
    category: "Pollutants",
    title: "What is PM2.5?",
    icon: "grain",
    short: "Tiny particles that can enter your lungs.",
    why: "Because they are 30x smaller than human hair, they can enter your bloodstream and cause serious heart/lung diseases.",
    takeaway: "Smaller particles = bigger danger. Wear a mask on high PM2.5 days.",
    actions: ["wear_mask", "air_purifier"]
  },
  {
    id: "pm10",
    category: "Pollutants",
    title: "What is PM10?",
    icon: "cloud",
    short: "Coarser particles like dust, pollen, and mold.",
    why: "They irritate the eyes, nose, and throat. While less dangerous than PM2.5, they still cause respiratory issues.",
    takeaway: "Dust and smoke are major sources. Avoid construction sites.",
    actions: ["wear_mask"]
  },
  {
    id: "o3",
    category: "Pollutants",
    title: "Ground-level Ozone",
    icon: "wb-sunny",
    short: "A gas formed when sunlight reacts with pollutants.",
    why: "Ozone is most dangerous on hot sunny days and can trigger asthma and reduce lung function.",
    takeaway: "Avoid intense outdoor exercise in the afternoon on hot days.",
    actions: ["stay_indoors"]
  },
  {
    id: "health_lungs",
    category: "Health Impact",
    title: "Lungs & Pollution",
    icon: "favorite-outline",
    short: "How pollution affects your breathing.",
    why: "Pollutants cause inflammation in the airways, leading to chronic bronchitis and reduced lung capacity.",
    takeaway: "Clean air is food for your lungs. Use an air purifier indoors.",
    actions: ["air_purifier", "plants"]
  },
  {
    id: "sources_traffic",
    category: "Sources",
    title: "Vehicle Emissions",
    icon: "directions-car",
    short: "The primary source of urban air pollution.",
    why: "Cars and trucks release NO2 and PM2.5 directly at ground level where we breathe.",
    takeaway: "Avoid heavy traffic zones during peak hours.",
    actions: ["public_transport", "ev_car"]
  },
  {
    id: "masks",
    category: "Mitigation",
    title: "Which Mask to Wear?",
    icon: "masks",
    short: "Not all masks protect against PM2.5.",
    why: "Simple cloth masks don't filter fine particles. N95 or N99 masks are needed for effective protection.",
    takeaway: "Use N95 masks when AQI exceeds 150.",
    actions: ["wear_mask"]
  }
];
