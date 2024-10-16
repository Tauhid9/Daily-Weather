// API key and base URL for the Weather API
const apiKey = '6141dd6d84dd40ee961131826241510';
const baseUrl = 'https://api.weatherapi.com/v1';

// DOM elements for user input and displaying weather data
const locationInput = document.getElementById('locationInput'); // Input field for city name
const searchBtn = document.getElementById('searchBtn'); // Search button
const weatherData = document.getElementById('weatherData'); // Element to display current weather
const forecastData = document.getElementById('forecastData'); // Element to display forecast data
const sortOptions = document.getElementById('sortOptions'); // Dropdown for sorting options
const filterOptions = document.getElementById('filterOptions'); // Dropdown for filtering options

// Variables to cache data and optimize performance
let lastLocation = ''; // Cache the last searched location
let lastWeatherData = null; // Cache the last weather data
let lastForecastData = null; // Cache the last forecast data
const cacheDuration = 60 * 1000; // 1 minute cache duration

// Event listener for the search button click
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim(); // Get user input
    if (location) {
        getWeatherData(location); // Fetch weather data if input is valid
    } else {
        alert('Please enter a city name'); // Alert if input is empty
    }
});

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeout; // Variable to hold the timeout
    return function(...args) {
        clearTimeout(timeout); // Clear the previous timeout
        // Set a new timeout to call the function after the specified delay
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Optimized function to fetch weather data
async function getWeatherData(location) {
    // Check if the location is the same as the last searched one and within cache duration
    if (location === lastLocation && lastWeatherData && Date.now() - lastWeatherData.timestamp < cacheDuration) {
        // Use cached data if within cache duration
        displayWeather(lastWeatherData.data); // Display cached weather data
        displayForecast(lastForecastData.forecast.forecastday); // Display cached forecast data
        return; // Exit the function
    }

    try {
        // Fetch current weather and forecast data from the API
        const weatherResponse = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}`);
        const forecastResponse = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=4`);

        // Check if the responses are ok
        if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('City not found');

        const weatherDataJson = await weatherResponse.json(); // Parse current weather data
        const forecastDataJson = await forecastResponse.json(); // Parse forecast data

        // Cache the data
        lastLocation = location; // Update last location
        lastWeatherData = { // Cache the current weather data with a timestamp
            timestamp: Date.now(),
            data: weatherDataJson
        };
        lastForecastData = forecastDataJson; // Cache the forecast data

        // Display the weather and forecast data
        displayWeather(weatherDataJson);
        displayForecast(forecastDataJson.forecast.forecastday);

        // Add event listeners for sorting and filtering options
        sortOptions.addEventListener('change', () => sortForecast(forecastDataJson.forecast.forecastday));
        filterOptions.addEventListener('change', () => filterForecast(forecastDataJson.forecast.forecastday));

    } catch (error) {
        // Handle errors by displaying an error message
        weatherData.innerHTML = `<p style="color: red;">${error.message}</p>`;
        forecastData.innerHTML = ''; // Clear forecast data
    }
}

// Function to display the current weather data
function displayWeather(data) {
    const { location, current } = data; // Destructure location and current data
    weatherData.innerHTML = `
        <h2>Weather in ${location.name}, ${location.country}</h2>
        <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
        <p><strong>Condition:</strong> ${current.condition.text}</p>
        <p><strong>Humidity:</strong> ${current.humidity}% | <strong>Wind:</strong> ${current.wind_kph} km/h</p>
        <img loading="lazy" src="https:${data.current.condition.icon}" alt="Weather icon"> <!-- Lazy load image -->
    `;
}

// Function to display the forecast data
function displayForecast(forecast) {
    let forecastHtml = `<h2>4-Day Forecast</h2>`; // Header for the forecast
    forecast.forEach(day => {
        forecastHtml += `
            <div class="forecast-day" data-condition="${day.day.condition.text.toLowerCase()}">
                <p>${day.date}</p>
                <p>Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</p>
                <p>Condition: ${day.day.condition.text}</p>
                <img loading="lazy" src="https:${day.day.condition.icon}" alt="Forecast icon"> <!-- Lazy load image -->
            </div>
        `;
    });
    forecastData.innerHTML = forecastHtml; // Update the forecast data element
}

// Function to sort the forecast data based on selected option
function sortForecast(forecast) {
    const sortOption = sortOptions.value; // Get the selected sort option

    // Sort forecast based on temperature
    if (sortOption === 'lowToHigh') {
        forecast.sort((a, b) => a.day.maxtemp_c - b.day.maxtemp_c); // Sort from low to high
    } else if (sortOption === 'highToLow') {
        forecast.sort((a, b) => b.day.maxtemp_c - a.day.maxtemp_c); // Sort from high to low
    }

    displayForecast(forecast); // Display the sorted forecast
}

// Function to filter the forecast data based on selected condition
function filterForecast(forecast) {
    const filterOption = filterOptions.value; // Get the selected filter option

    // Filter the forecast based on the selected condition
    const filteredForecast = forecast.filter(day => {
        const condition = day.day.condition.text.toLowerCase();
        if (filterOption === 'all') return true; // If 'all', include all days
        return condition.includes(filterOption.toLowerCase()); // Otherwise, check condition
    });

    displayForecast(filteredForecast); // Display the filtered forecast
}

// Debounced input listener for real-time search
const debouncedSearch = debounce(() => {
    const location = locationInput.value.trim(); // Get the trimmed user input
    if (location) {
        getWeatherData(location); // Fetch weather data if input is valid
    }
}, 300); // 300ms debounce time

locationInput.addEventListener('input', debouncedSearch); // Attach the debounced listener to the input field
