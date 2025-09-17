const apiKey = "0db0805951f7bfd52ecc6ae3c3088d12";

// Get city from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
let city = urlParams.get("location") || localStorage.getItem("selectedCity") || "Delhi";
localStorage.setItem("selectedCity", city);
document.getElementById("cityName").textContent = "Weather Report for " + city;

async function fetchWeather() {
    try {
        // --- Current Weather ---
        let resCurrent = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        let currentData = await resCurrent.json();
        if (currentData.cod !== 200) {
            document.getElementById("currentWeather").innerHTML = `<p class="text-danger">City not found. Please try again.</p>`;
            return;
        }

        const { coord } = currentData; // For UV & AQI
        const currentDiv = document.getElementById("currentWeather");
        currentDiv.innerHTML = "";

        // --- UV Index ---
        let resUV = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`);
        let uvData = await resUV.json();

        // --- Air Quality ---
        let resAQI = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`);
        let aqiData = await resAQI.json();
        let aqiValue = aqiData.list[0].main.aqi; // 1-5 scale

        const features = [
            { label: "Temperature", value: currentData.main.temp + "°C", icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png` },
            { label: "Feels Like", value: currentData.main.feels_like + "°C", icon: "🌡️" },
            { label: "Humidity", value: currentData.main.humidity + "%", icon: "💧" },
            { label: "Wind", value: currentData.wind.speed + " m/s", icon: "🌬️" },
            { label: "Weather", value: currentData.weather[0].description, icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png` },
            { label: "UV Index", value: uvData.value, icon: "☀️" },
            { label: "Air Quality", value: `${aqiValue} / 5`, icon: "🌫️" }
        ];

        const rowCurrent = document.createElement("div");
        rowCurrent.className = "d-flex flex-wrap justify-content-center gap-3";

        features.forEach(f => {
            const box = document.createElement("div");
            box.className = "weather-info-box"; // unified CSS
            box.innerHTML = `
                <h5>${f.icon.startsWith("http") ? `<img src="${f.icon}" style="width:40px;height:40px;">` : f.icon} ${f.label}</h5>
                <p>${f.value}</p>
            `;
            rowCurrent.appendChild(box);
        });
        currentDiv.appendChild(rowCurrent);

        // --- Hourly Forecast ---
        let resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        let forecastData = await resForecast.json();
        const hourlyDiv = document.getElementById("hourlyWeather");
        hourlyDiv.innerHTML = "";

        forecastData.list.slice(0, 8).forEach(hour => {
            const box = document.createElement("div");
            box.className = "weather-info-box"; // unified CSS
            box.innerHTML = `
                <small>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                <h6>${hour.main.temp}°C</h6>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="">
            `;
            hourlyDiv.appendChild(box);
        });

        // --- Weekly Forecast ---
        const weeklyDiv = document.getElementById("weeklyWeather");
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
            box.className = "weather-info-box"; // unified CSS
            box.innerHTML = `
                <strong>${dayName}</strong>
                <h6>${avgTemp}°C</h6>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" style="width:50px;height:50px;">
            `;
            weeklyDiv.appendChild(box);
        });

    } catch (error) {
        document.getElementById("currentWeather").textContent = "⚠️ Error loading weather data.";
        console.error(error);
    }
}

// Run
fetchWeather();
