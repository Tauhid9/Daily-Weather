// API key for WeatherAPI.com. This key is used to authenticate requests to the API.
const apiKey = '6141dd6d84dd40ee961131826241510';

// Add an event listener to the search button that triggers when clicked.
document.getElementById('searchBtn').addEventListener('click', () => {

    const location = document.getElementById('locationInput').value;
    
    // If the input field is not empty, fetch the weather data for the entered location.
    if (location) {
        fetchWeatherData(location);
    }
});

// This function fetches weather data from WeatherAPI for the given location.
async function fetchWeatherData(location) {
    try {
        // Send a GET request to the WeatherAPI to get the current weather and 3-day forecast.
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`);
        const data = await response.json();  // Convert the response to JSON format.

        // Display the current weather data and the 3-day forecast on the page.
        displayWeatherData(data);
        displayForecastData(data.forecast.forecastday);
    } catch (error) {
        displayError(error.message); //call displayError function
    }
}

// This function updates the HTML with the current weather data.
function displayWeatherData(data) {
    const weatherData = `
        <h2>Weather in ${data.location.name}, ${data.location.country}</h2>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Condition: ${data.current.condition.text}</p>
        <img src="https:${data.current.condition.icon}" alt="Weather icon">
    `;
    
    document.getElementById('weatherData').innerHTML = weatherData;
}

// This function updates the HTML with the 3-day weather forecast data.
function displayForecastData(forecast) {
    let forecastHTML = '<h3>3-Day Forecast</h3>';
    
    forecast.forEach(day => {
        forecastHTML += `
            <div class="forecast-day">
                <p>${day.date}</p>
                <p>Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</p>
                <p>${day.day.condition.text}</p>
                <img src="https:${day.day.condition.icon}" alt="Forecast icon">
            </div>
        `;
    });
    
    document.getElementById('forecastData').innerHTML = forecastHTML;
}

// This function displays an error message if something goes wrong (e.g., invalid city name or API error).
function displayError(message) {
    const weatherDisplay = document.getElementById('weatherData');
    weatherDisplay.innerHTML = `<p class="error">${message}</p>`; 
}
