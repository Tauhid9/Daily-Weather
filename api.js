// API Key and Base URL for fetching weather data
const apiKey = '6141dd6d84dd40ee961131826241510'; // Your API key from WeatherAPI
const baseUrl = 'https://api.weatherapi.com/v1'; // Base URL for API requests

// DOM Elements: Get references to the HTML elements used in the script
const locationInput = document.getElementById('locationInput'); // Input field for location
const searchBtn = document.getElementById('searchBtn'); // Button to trigger the search
const weatherData = document.getElementById('weatherData'); // Div to display current weather
const forecastData = document.getElementById('forecastData'); // Div to display weather forecast
const sortOptions = document.getElementById('sortOptions'); // Dropdown for sorting options
const filterOptions = document.getElementById('filterOptions'); // Dropdown for filter options

// Event listener for the search button
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim(); // Get value from input and trim whitespace
    if (location) {
        getWeatherData(location); // Call function to get weather data if location is provided
    } else {
        alert('Please enter a city name'); // Alert user if no location is entered
    }
});

// Async function to fetch weather data based on the location provided
async function getWeatherData(location) {
    try {
        // Fetch current weather data from API
        const weatherResponse = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}`);
        // Fetch 4-day forecast data from API
        const forecastResponse = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=4`);

        // Check if both responses are OK; if not, throw an error
        if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('City not found');

        // Parse JSON responses
        const weatherDataJson = await weatherResponse.json();
        const forecastDataJson = await forecastResponse.json();

        // Display current weather and forecast data
        displayWeather(weatherDataJson);
        displayForecast(forecastDataJson.forecast.forecastday);
        
        // Add event listeners for sorting and filtering after data is fetched
        sortOptions.addEventListener('change', () => sortForecast(forecastDataJson.forecast.forecastday));
        filterOptions.addEventListener('change', () => filterForecast(forecastDataJson.forecast.forecastday));
        
    } catch (error) {
        // Display error message if any error occurs
        weatherData.innerHTML = `<p style="color: red;">${error.message}</p>`;
        forecastData.innerHTML = ''; // Clear forecast data if there's an error
    }
}

// Function to display current weather data
function displayWeather(data) {
    const { location, current } = data; // Destructure the location and current weather data
    weatherData.innerHTML = `
        <h2>Weather in ${location.name}, ${location.country}</h2>
        <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
        <p><strong>Condition:</strong> ${current.condition.text}</p>
        <p><strong>Humidity:</strong> ${current.humidity}% | <strong>Wind:</strong> ${current.wind_kph} km/h</p>
        <img src="https:${data.current.condition.icon}" alt="Weather icon"> <!-- Display weather icon -->
    `;
}

// Function to display the 4-day weather forecast
function displayForecast(forecast) {
    let forecastHtml = `<h2>4-Day Forecast</h2>`; // Initialize forecast HTML

    forecast.forEach(day => { // Iterate over each forecast day
        forecastHtml += `
            <div class="forecast-day" data-condition="${day.day.condition.text.toLowerCase()}"> <!-- Add data attribute for filtering -->
                <p>${day.date}</p>
                <p>Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</p>
                <p>Condition: ${day.day.condition.text}</p>
                <img src="https:${day.day.condition.icon}" alt="Forecast icon"> <!-- Display forecast icon -->
            </div>
        `;
    });

    forecastData.innerHTML = forecastHtml; // Insert forecast HTML into the DOM
}

// Function to sort the forecast data
function sortForecast(forecast) {
    const sortOption = sortOptions.value; // Get the selected sort option

    // Sort forecast based on the selected option
    if (sortOption === 'lowToHigh') {
        forecast.sort((a, b) => a.day.maxtemp_c - b.day.maxtemp_c); // Sort from low to high max temperature
    } else if (sortOption === 'highToLow') {
        forecast.sort((a, b) => b.day.maxtemp_c - a.day.maxtemp_c); // Sort from high to low max temperature
    }
    
    displayForecast(forecast); // Re-display the sorted forecast
}

// Function to filter the forecast data
function filterForecast(forecast) {
    const filterOption = filterOptions.value; // Get the selected filter option

    // Filter forecast based on the selected condition
    const filteredForecast = forecast.filter(day => {
        const condition = day.day.condition.text.toLowerCase(); // Get condition in lowercase

        // Return true for 'all' or if condition matches the selected option
        if (filterOption === 'all') return true;
        return condition.includes(filterOption); // Check if condition includes the selected filter
    });

    displayForecast(filteredForecast); // Re-display the filtered forecast
}
