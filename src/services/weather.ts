
/**
 * @fileOverview A service to simulate fetching weather data.
 */

/**
 * A list of possible weather conditions.
 */
const weatherConditions = [
    'Sunny',
    'Partly Cloudy',
    'Cloudy',
    'Rainy',
    'Windy',
    'Stormy',
];

/**
 * Simulates fetching the current weather for a given location.
 * In a real application, this would call an external weather API.
 * @param location - The location to get the weather for (currently unused).
 * @returns A random weather condition as a string.
 */
export async function getCurrentWeather(location: string): Promise<string> {
    console.log(`Fetching weather for ${location}...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const randomIndex = Math.floor(Math.random() * weatherConditions.length);
    const condition = weatherConditions[randomIndex];
    
    console.log(`Simulated weather for ${location}: ${condition}`);
    return condition;
}
