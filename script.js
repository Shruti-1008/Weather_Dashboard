const cityInput = document.getElementById("cityInput");


// Search weather by city
async function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    try {

        // Find the city's coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results) {
            alert("City not found.");
            return;
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,visibility,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        updateWeather(
            location,
            weatherData
        );

    } catch (error) {

        console.error(error);

        alert("Something went wrong. Please try again.");
    }
}


// Update the dashboard
function updateWeather(location, weather) {

    const current = weather.current;

    // City
    document.getElementById("city").innerText =
        location.name;

    // Temperature
    document.getElementById("temperature").innerText =
        Math.round(current.temperature_2m) + "°";

    // Humidity
    document.getElementById("humidity").innerText =
        current.relative_humidity_2m + "%";

    // Wind
    document.getElementById("wind").innerText =
        Math.round(current.wind_speed_10m) + " km/h";

    // Visibility
    document.getElementById("visibility").innerText =
        Math.round(current.visibility / 1000) + " km";

    // Pressure
    document.getElementById("pressure").innerText =
        Math.round(current.surface_pressure) + " hPa";


    // Weather condition
    const weatherInfo =
        getWeatherInfo(current.weather_code);

    document.getElementById("condition").innerText =
        weatherInfo.text;

    document.getElementById("weatherIcon").innerText =
        weatherInfo.icon;


    // Update forecast
    updateForecast(weather.daily);
}


// Convert weather codes into readable weather
function getWeatherInfo(code) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {
        return {
            text: "Cloudy",
            icon: "☁️"
        };
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if (
        code >= 51 &&
        code <= 67
    ) {
        return {
            text: "Rainy",
            icon: "🌧️"
        };
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return {
            text: "Snowy",
            icon: "❄️"
        };
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return {
            text: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (
        code >= 95
    ) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown",
        icon: "🌤️"
    };
}


// Update 5-day forecast
function updateForecast(daily) {

    const forecastCards =
        document.querySelectorAll(".forecast-card");


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const card =
            forecastCards[i];

        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        // Day
        const day =
            new Date(
                daily.time[i]
            ).toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        card.querySelector("span").innerText =
            i === 0 ? "Today" : day;


        // Icon
        card.querySelector(".forecast-icon").innerText =
            weatherInfo.icon;


        // Temperature
        card.querySelector("strong").innerText =
            Math.round(
                daily.temperature_2m_max[i]
            ) + "°";


        // Condition
        card.querySelector("small").innerText =
            weatherInfo.text;
    }
}


// Get user's current location
function getLocation() {

    if (!navigator.geolocation) {

        alert(
            "Your browser does not support location."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                const response =
                    await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,visibility,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
                    );


                const weather =
                    await response.json();


                const locationResponse =
                    await fetch(
                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&format=json`
                    );


                const locationData =
                    await locationResponse.json();


                const location =
                    locationData.results?.[0] || {
                        name: "Your Location"
                    };


                updateWeather(
                    location,
                    weather
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to get weather."
                );
            }
        },

        function() {

            alert(
                "Location permission was denied."
            );
        }
    );
}