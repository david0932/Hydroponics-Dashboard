/**
 * Represents sensor data for a hydroponic system.
 */
export interface SensorData {
  /**
   * The temperature reading from the sensor (in Celsius).
   */
  temperatureCelsius: number;
  /**
   * The humidity reading from the sensor (percentage).
   */
  humidity: number;
  /**
   * The pH level reading from the sensor.
   */
  pH: number;
  /**
   * The water level reading from the sensor (in cm).
   */
  waterLevelCm: number;
}

/**
 * Asynchronously retrieves the latest sensor data.
 *
 * @returns A promise that resolves to a SensorData object.
 */
export async function getSensorData(): Promise<SensorData> {
  // TODO: Implement this by calling an API.
  return {
    temperatureCelsius: 25.5,
    humidity: 60.2,
    pH: 6.5,
    waterLevelCm: 15.0,
  };
}
