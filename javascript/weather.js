

const urlParams = new URLSearchParams(window.location.search);
let city = urlParams.get("location") || localStorage.getItem("selectedCity") || "Delhi";
localStorage.setItem("selectedCity", city);
document.getElementById("cityName").textContent = "Weather Report for " + city;

async function fetchWeather() {
  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:"unknown"}));
      throw new Error(err.error || "Failed to fetch weather from server");
    }
    const data = await res.json();
    const currentData = data.current;
    const forecastData = data.forecast;
    const uvData = data.uv;
    const aqiData = data.aqi;

    if (!currentData || currentData.cod !== 200) {
      document.getElementById("currentWeather").innerHTML = `<p class="text-danger">City not found. Please try again.</p>`;
      return;
    }

    // Build current info boxes (includes UV & AQI if available)
    const currentDiv = document.getElementById("currentWeather");
    currentDiv.innerHTML = "";
    const features = [
      { label: "Temperature", value: currentData.main.temp + "°C", icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png` },
      { label: "Feels Like", value: currentData.main.feels_like + "°C", icon: "🌡️" },
      { label: "Humidity", value: currentData.main.humidity + "%", icon: "💧" },
      { label: "Wind", value: currentData.wind.speed + " m/s", icon: "🌬️" },
      { label: "Weather", value: currentData.weather[0].description, icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png` }
    ];

    if (uvData && uvData.value !== undefined) features.push({ label: "UV Index", value: uvData.value, icon: "☀️" });
    if (aqiData && aqiData.list && aqiData.list[0] && aqiData.list[0].main) {
      const aqiValue = aqiData.list[0].main.aqi;
      features.push({ label: "Air Quality", value: `${aqiValue} / 5`, icon: "🌫️" });
    }

    const row = document.createElement("div");
    row.className = "d-flex flex-wrap justify-content-center gap-3";
    features.forEach(f => {
      const box = document.createElement("div");
      box.className = "weather-info-box";
      box.innerHTML = `
        <h5>${f.icon && f.icon.toString().startsWith("http") ? `<img src="${f.icon}" style="width:40px;height:40px;">` : f.icon} ${f.label}</h5>
        <p>${f.value}</p>
      `;
      row.appendChild(box);
    });
    currentDiv.appendChild(row);

    // Hourly (use forecastData.list)
    const hourlyDiv = document.getElementById("hourlyWeather");
    hourlyDiv.innerHTML = "";
    if (forecastData && forecastData.list) {
      forecastData.list.slice(0, 8).forEach(hour => {
        const box = document.createElement("div");
        box.className = "weather-info-box";
        box.innerHTML = `
          <small>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
          <h6>${hour.main.temp}°C</h6>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="">
        `;
        hourlyDiv.appendChild(box);
      });
    }

    // Weekly (aggregate forecastData.list per day)
    const weeklyDiv = document.getElementById("weeklyWeather");
    weeklyDiv.innerHTML = "";
    if (forecastData && forecastData.list) {
      const dailyMap = {};
      forecastData.list.forEach(entry => {
        const date = new Date(entry.dt * 1000).toDateString();
        if (!dailyMap[date]) dailyMap[date] = [];
        dailyMap[date].push(entry);
      });
      Object.keys(dailyMap).slice(0, 7).forEach(day => {
        const entries = dailyMap[day];
        const avgTemp = (entries.reduce((s,e) => s + e.main.temp, 0) / entries.length).toFixed(1);
        const icon = entries[Math.floor(entries.length / 2)].weather[0].icon;
        const dayName = new Date(day).toLocaleDateString("en-US", { weekday: "short" });
        const box = document.createElement("div");
        box.className = "weather-info-box";
        box.innerHTML = `
          <strong>${dayName}</strong>
          <h6>${avgTemp}°C</h6>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" style="width:50px;height:50px;">
        `;
        weeklyDiv.appendChild(box);
      });
    }

  } catch (error) {
    console.error(error);
    document.getElementById("currentWeather").textContent = "⚠️ Error loading weather data.";
  }
}

fetchWeather();
