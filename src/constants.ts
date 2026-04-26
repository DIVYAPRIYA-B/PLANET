/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLANETS = [
  {
    id: "sun",
    name: "Sun",
    pos: 0,
    dist: "0 km",
    temp: "5,500°C",
    mass: "1.989 × 10³⁰ kg",
    period: "N/A",
    composition: "Hydrogen, Helium",
    desc: "The star at the center of our solar system.",
    fact: "Over one million Earths could fit inside the Sun.",
    color: "from-yellow-400 to-orange-600 border-yellow-500",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "mercury",
    name: "Mercury",
    pos: 1,
    dist: "57.9M km",
    temp: "167°C",
    mass: "3.285 × 10²³ kg",
    period: "88 Days",
    composition: "Iron, Silicate",
    desc: "Smallest planet.",
    fact: "A day on Mercury is longer than its year.",
    color: "from-gray-400 to-gray-600 border-gray-500",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "venus",
    name: "Venus",
    pos: 2,
    dist: "108.2M km",
    temp: "464°C",
    mass: "4.867 × 10²⁴ kg",
    period: "225 Days",
    composition: "Silicate, Iron",
    desc: "Hottest planet.",
    fact: "Venus rotates in the opposite direction to most planets.",
    color: "from-orange-200 to-yellow-600 border-yellow-700",
    image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "earth",
    name: "Earth",
    pos: 3,
    dist: "149.6M km",
    temp: "15°C",
    mass: "5.972 × 10²⁴ kg",
    period: "365 Days",
    composition: "Silicate, Ice, Iron",
    desc: "Home planet.",
    fact: "Earth is the only planet with liquid water on surface.",
    color: "from-blue-400 to-green-600 border-blue-500",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bac4?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "mars",
    name: "Mars",
    pos: 4,
    dist: "227.9M km",
    temp: "-65°C",
    mass: "6.39 × 10²³ kg",
    period: "1.88 Years",
    composition: "Iron Oxide, Silicate",
    desc: "The Red Planet.",
    fact: "Mars has the largest dust storms in the solar system.",
    color: "from-red-400 to-orange-800 border-red-600",
    image: "https://images.unsplash.com/photo-1614735276707-f2ef0ee2c76d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    pos: 5,
    dist: "778.6M km",
    temp: "-110°C",
    mass: "1.898 × 10²⁷ kg",
    period: "11.86 Years",
    composition: "Hydrogen, Helium",
    desc: "Largest planet.",
    fact: "Jupiter has 95 moons.",
    color: "from-orange-300 to-red-900 border-orange-800",
    image: "https://images.unsplash.com/photo-1630910560335-968272200010?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "saturn",
    name: "Saturn",
    pos: 6,
    dist: "1.4B km",
    temp: "-140°C",
    mass: "5.683 × 10²⁶ kg",
    period: "29.45 Years",
    composition: "Hydrogen, Helium",
    desc: "The ringed jewel.",
    fact: "Saturn's rings are made of chunks of ice and rock.",
    color: "from-yellow-100 to-orange-400 border-yellow-300",
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "uranus",
    name: "Uranus",
    pos: 7,
    dist: "2.8B km",
    temp: "-195°C",
    mass: "8.681 × 10²⁵ kg",
    period: "84 Years",
    composition: "Water, Methane, Ammonia",
    desc: "Ice giant.",
    fact: "Uranus is the coldest planet in the solar system.",
    color: "from-blue-200 to-cyan-500 border-blue-300",
    image: "https://images.unsplash.com/photo-1639843605652-332929e96191?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "neptune",
    name: "Neptune",
    pos: 8,
    dist: "4.5B km",
    temp: "-201°C",
    mass: "1.024 × 10²⁶ kg",
    period: "164.8 Years",
    composition: "Hydrogen, Helium, Methane",
    desc: "Windiest planet.",
    fact: "Neptune's winds can reach 2,100 km/h.",
    color: "from-blue-600 to-indigo-900 border-blue-800",
    image: "https://images.unsplash.com/photo-1630834375635-430fd8b98f24?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "pluto",
    name: "Pluto",
    pos: 9,
    dist: "5.9B km",
    temp: "-225°C",
    mass: "1.309 × 10²² kg",
    period: "248 Years",
    composition: "Ice, Rock",
    desc: "Dwarf planet.",
    fact: "Pluto has five known moons.",
    color: "from-gray-300 to-gray-500 border-gray-400",
    image: "https://images.unsplash.com/photo-1614314107768-6018063bc965?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "moon",
    name: "Moon",
    pos: 10,
    dist: "384,400 km",
    temp: "-173°C to 127°C",
    mass: "7.347 × 10²² kg",
    period: "27.3 Days",
    composition: "Basalt, Anorthosite",
    desc: "Earth's natural satellite.",
    fact: "The Moon is drifting away from Earth at 3.8cm per year.",
    color: "from-gray-200 to-gray-400 border-gray-300",
    image: "https://images.unsplash.com/photo-1532667449560-72a95c8d381b?auto=format&fit=crop&q=80&w=800"
  }
];

export const SPACE_MUSIC_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"; 
export const LAUNCH_SFX_URL = "https://www.soundjay.com/transportation/sounds/rocket-launcher-1.mp3";
export const ENGINE_HUM_URL = "https://www.soundjay.com/transportation/sounds/jet-engine-take-off-1.mp3";
export const GALAXY_IMAGE = "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&q=80&w=1920";
