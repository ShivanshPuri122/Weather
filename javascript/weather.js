const apiKey = "0db0805951f7bfd52ecc6ae3c3088d12";

// Elements
const cityNameEl = document.getElementById("cityName");
const currentDiv = document.getElementById("currentWeather");
const hourlyDiv = document.getElementById("hourlyWeather");
const weeklyDiv = document.getElementById("weeklyWeather");

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
let city = urlParams.get("location") || null;
let lat = urlParams.get("lat") || null;
let lon = urlParams.get("lon") || null;

// ---------------- Recent Locations ----------------
function addRecentLocation(location) {
    let saved = JSON.parse(localStorage.getItem("recentLocations")) || [];
    // Case-insensitive check
    const exists = saved.some(loc => loc.toLowerCase() === location.toLowerCase());
    if (!exists) {
        saved.unshift(location);
        if (saved.length > 6) saved = saved.slice(0, 6);
        localStorage.setItem("recentLocations", JSON.stringify(saved));
    }
}

// ---------------- Fetch Weather ----------------
async function fetchWeather() {
    try {
        let currentData, coord;

        // Use lat/lon first
        if (lat && lon) {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            currentData = await res.json();
            coord = { lat, lon };
            city = currentData.name;
            cityNameEl.textContent = `Weather Report for ${city}`;
            addRecentLocation(city);
        } 
        else if (city) {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            currentData = await res.json();
            if (currentData.cod !== 200) {
                cityNameEl.textContent = "City not found.";
                return;
            }
            coord = currentData.coord;
            city = currentData.name;
            cityNameEl.textContent = `Weather Report for ${city}`;
            addRecentLocation(city);
        } 
        else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    fetchWeather();
                },
                (err) => {
                    console.log("Geolocation error:", err.message);
                    cityNameEl.textContent = "Unable to detect location. Please search manually.";
                }
            );
            return;
        } 
        else {
            cityNameEl.textContent = "No location selected.";
            return;
        }

        //UV & AQI 
        const uvData = await (await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)).json();
        const aqiData = await (await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)).json();
        const aqiValue = aqiData.list[0].main.aqi;

        //Current Weather
        currentDiv.innerHTML = "";
        const features = [
            { label: "Temperature", value: currentData.main.temp + "°C", icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png` },
            { label: "Feels Like", value: currentData.main.feels_like + "°C", icon: "🌡️" },
            { label: "Humidity", value: currentData.main.humidity + "%", icon: "💧" },
            { label: "Wind", value: currentData.wind.speed + " m/s", icon: "🌬️" },
            { label: "Weather", value: currentData.weather[0].description, icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png` },
            { label: "UV Index", value: uvData.value, icon: "☀️" },
            { label: "Air Quality", value: `${aqiValue} / 5`, icon: "🌫️" }
        ];

        features.forEach(f => {
            const box = document.createElement("div");
            box.className = "weather-info-box";
            box.innerHTML = `
                <h5>${f.icon.startsWith("http") ? `<img src="${f.icon}" style="width:40px;height:40px;">` : f.icon} ${f.label}</h5>
                <p>${f.value}</p>
            `;
            currentDiv.appendChild(box);
        });

        // Forecasts
        const query = lat && lon ? `lat=${coord.lat}&lon=${coord.lon}` : `q=${city}`;
        const forecastData = await (await fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${apiKey}&units=metric`)).json();

        // Hourly
        hourlyDiv.innerHTML = "";
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

        // Weekly
        weeklyDiv.innerHTML = "";
        const dailyMap = {};
        forecastData.list.forEach(entry => {
            const date = new Date(entry.dt * 1000).toDateString();
            if (!dailyMap[date]) dailyMap[date] = [];
            dailyMap[date].push(entry);
        });

        Object.keys(dailyMap).slice(0, 7).forEach(day => {
            const entries = dailyMap[day];
            const avgTemp = (entries.reduce((sum, e) => sum + e.main.temp, 0) / entries.length).toFixed(1);
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

    } catch (error) {
        currentDiv.innerHTML = "⚠️ Error loading weather data.";
        console.error(error);
    }
}

// Run
fetchWeather();
