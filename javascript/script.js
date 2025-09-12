function searchLocation(event) {
  event.preventDefault();
  const input = document.getElementById("locationInput");
  const location = input.value.trim();

  if (!location) {
    alert("Please enter a location!");
    return false;
  }

  // Save to localStorage
  let locations = JSON.parse(localStorage.getItem("recentLocations")) || [];
  if (!locations.includes(location)) {
    locations.unshift(location);
    if (locations.length > 5) locations.pop(); // limit to 5
    localStorage.setItem("recentLocations", JSON.stringify(locations));
  }

  input.value = ""; // clear input
  updateRecentLocations();

  // Redirect to weather page with query
  window.location.href = `weather.html?location=${encodeURIComponent(location)}`;
  return false;
}

function updateRecentLocations() {
  const recentList = document.getElementById("recentList");
  const recentContainer = document.getElementById("recentContainer");

  let locations = JSON.parse(localStorage.getItem("recentLocations")) || [];
  recentList.innerHTML = "";

  if (locations.length === 0) {
    recentContainer.classList.add("d-none");
  } else {
    recentContainer.classList.remove("d-none");
    locations.forEach(loc => {
      let li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = loc;
      recentList.appendChild(li);
    });
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", updateRecentLocations);
