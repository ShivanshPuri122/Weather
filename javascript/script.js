const input = document.getElementById("locationInput");
const suggestions = document.getElementById("suggestions");
const recentContainer = document.getElementById("recentContainer");
const recentCards = document.getElementById("recentCards");

const API_KEY = "0db0805951f7bfd52ecc6ae3c3088d12";

// Handle city search submission
function searchLocation(event) {
  event.preventDefault();
  const location = input.value.trim();
  if (!location) return false;

  addRecentLocation(location);

  // Redirect to weather page with city name
  window.location.href = `weather.html?location=${encodeURIComponent(location)}`;

  return false;
}

// Debounce function to avoid too many API calls
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Fetch city suggestions from OpenWeather Geocoding API
async function fetchSuggestions(query) {
  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  try {
    let res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );
    let data = await res.json();

    suggestions.innerHTML = "";
    if (data.length === 0) {
      let item = document.createElement("div");
      item.className = "list-group-item text-muted";
      item.textContent = "No results found";
      suggestions.appendChild(item);
      return;
    }

    data.forEach(city => {
      let item = document.createElement("a");
      item.className = "list-group-item list-group-item-action";
      item.textContent = `${city.name}, ${city.state ? city.state + ", " : ""}${city.country}`;
      item.href = "#";
      item.onclick = (e) => {
        e.preventDefault();
        input.value = `${city.name}, ${city.country}`;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(item);
    });
  } catch (err) {
    console.error("Error fetching city suggestions:", err);
  }
}

// Attach debounced input listener
input.addEventListener("input", debounce(() => {
  let query = input.value.trim();
  fetchSuggestions(query);
}, 500)); // 500ms delay

// Store and show recent locations as cards
function addRecentLocation(location) {
  recentContainer.classList.remove("d-none");

  let col = document.createElement("div");
  col.className = "col-md-4";
  col.innerHTML = `
    <div class="card shadow-sm">
      <img src="https://source.unsplash.com/400x200/?${encodeURIComponent(location)}" 
           class="card-img-top" alt="${location}">
      <div class="card-body">
        <h6 class="card-title">${location}</h6>
      </div>
    </div>
  `;
  recentCards.prepend(col);

  // Limit to 6 recent cards
  if (recentCards.children.length > 6) {
    recentCards.removeChild(recentCards.lastChild);
  }
}
