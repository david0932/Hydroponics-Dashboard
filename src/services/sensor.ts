/**
 * Represents sensor data for a hydroponic system.
 */
export interface SensorData {
  /**
   * The temperature reading from the sensor (in Celsius).
   */
  temperatureCelsius: number;
  /**
   * The water temperature reading from the sensor (in Celsius).
   */
  waterTemperatureCelsius: number;
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
   /**
   * The EC reading from the sensor.
   */
  ec: number;
  /**
   * The dissolved oxygen reading from the sensor (in ppm).
   */
  dissolvedOxygen: number;
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
    waterTemperatureCelsius: 22.3,
    humidity: 60.2,
    pH: 6.5,
    waterLevelCm: 15.0,
    ec: 1.2,
    dissolvedOxygen: 7.5,
  };
}

