document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("locationInput");
  const suggestions = document.getElementById("suggestions");
  const recentContainer = document.getElementById("recentContainer");
  const recentCards = document.getElementById("recentCards");
  const API_KEY = "0db0805951f7bfd52ecc6ae3c3088d12";

  // ---------------- Load recent locations ----------------
  let savedLocations = JSON.parse(localStorage.getItem("recentLocations")) || [];
  if (savedLocations.length > 0) renderRecentCards(savedLocations);

  // ---------------- Handle city search ----------------
  window.searchLocation = function (event) {
    event.preventDefault();
    const location = input.value.trim();
    if (!location) return false;

    addRecentLocation(location);

    // Redirect to weather page
    window.location.href = `weather.html?location=${encodeURIComponent(location)}`;
    return false;
  };

  // ---------------- Debounce ----------------
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // ---------------- Fetch city suggestions ----------------
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
        const item = document.createElement("div");
        item.className = "list-group-item text-muted";
        item.textContent = "No results found";
        suggestions.appendChild(item);
        return;
      }

      data.forEach(city => {
        const item = document.createElement("a");
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

  input.addEventListener("input", debounce(() => fetchSuggestions(input.value.trim()), 500));

  // ---------------- Recent Locations ----------------
  function addRecentLocation(location) {
    let saved = JSON.parse(localStorage.getItem("recentLocations")) || [];

    // Case-insensitive check for duplicates
    const exists = saved.some(loc => loc.toLowerCase() === location.toLowerCase());
    if (!exists) {
      saved.unshift(location);
      if (saved.length > 6) saved = saved.slice(0, 6);
      localStorage.setItem("recentLocations", JSON.stringify(saved));
    }

    renderRecentCards(saved);
  }

  function renderRecentCards(locations) {
    recentCards.innerHTML = "";
    if (locations.length === 0) {
      recentContainer.classList.add("d-none");
      return;
    }

    recentContainer.classList.remove("d-none");
    recentCards.className = "d-flex justify-content-center flex-wrap gap-3";

    locations.forEach(loc => {
      const card = document.createElement("div");
      card.className = "card shadow-sm recent-card text-center p-3";
      card.style.cursor = "pointer";
      card.style.width = "140px";
      card.innerHTML = `<h6 class="mb-0">${loc}</h6>`;
      card.onclick = () => {
        window.location.href = `weather.html?location=${encodeURIComponent(loc)}`;
      };
      recentCards.appendChild(card);
    });
  }

  // ---------------- Auto-detect geolocation ----------------
  if (navigator.geolocation && !localStorage.getItem("geoUsed")) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        localStorage.setItem("geoUsed", "true");
        // Redirect to weather.html with lat/lon
        window.location.href = `weather.html?lat=${lat}&lon=${lon}`;
      },
      (error) => {
        console.log("Geolocation error:", error.message);
      }
    );
  }
});
