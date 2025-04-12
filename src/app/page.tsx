'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {toast} from "@/hooks/use-toast";
import {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle,
} from "@/components/ui/chart";
import * as Recharts from "recharts";
import {getSensorData} from '@/services/sensor';
import {provideGrowthRecommendations} from '@/ai/flows/provide-growth-recommendations';
import {suggestActionFromSensorData} from '@/ai/flows/suggest-action-from-sensor-data';

const chartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "var(--chart-1)",
  },
  humidity: {
    label: "Humidity (%)",
    color: "var(--chart-2)",
  },
  pH: {
    label: "pH Level",
    color: "var(--chart-3)",
  },
  waterLevel: {
    label: "Water Level (cm)",
    color: "var(--chart-4)",
  },
};

// Dummy historical data
const dummyHistoricalData = Array.from({length: 20}, (_, i) => ({
  name: `Day ${i + 1}`,
  temperature: 20 + Math.random() * 5,
  humidity: 50 + Math.random() * 30,
  pH: 5.5 + Math.random() * 2,
  waterLevel: 10 + Math.random() * 10,
}));

export default function Home() {
  const [sensorData, setSensorData] = useState({
    temperatureCelsius: 0,
    humidity: 0,
    pH: 0,
    waterLevelCm: 0,
  });
  const [actionLog, setActionLog] = useState('');
  const [growthRecommendations, setGrowthRecommendations] = useState('Loading...');

  useEffect(() => {
    async function fetchSensorData() {
      const data = await getSensorData();
      setSensorData(data);
    }

    fetchSensorData();
  }, []);

  const handleLogAction = (event: any) => {
    event.preventDefault();
    toast({
      title: "Action Logged",
      description: "Your action has been logged.",
    });
  };

  const handleGetRecommendations = async () => {
    try {
      const recommendations = await getRecommendations();
      setGrowthRecommendations(recommendations);
    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      setGrowthRecommendations(`Error: ${error.message || 'Failed to fetch recommendations'}`);
    }
  };

  async function getRecommendations() {
    const temperatureRange = {min: 18, max: 28};
    const humidityRange = {min: 40, max: 80};
    const pHRange = {min: 5.5, max: 7.5};
    const waterLevelRange = {min: 5, max: 20};

    const aiInput = {
      sensorData: {
        temperatureCelsius: sensorData.temperatureCelsius,
        humidity: sensorData.humidity,
        pH: sensorData.pH,
        waterLevelCm: sensorData.waterLevelCm,
      },
      temperatureRange: temperatureRange,
      humidityRange: humidityRange,
      pHRange: pHRange,
      waterLevelRange: waterLevelRange,
      lastLoggedActions: actionLog,
    };
    const suggestedActions = await suggestActionFromSensorData(aiInput);
    return suggestedActions!.suggestedActions;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">HydroView Dashboard</h1>
      </header>
      <main className="container mx-auto p-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Temperature</CardTitle>
              <CardDescription>Current temperature in Celsius</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.temperatureCelsius}°C</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Humidity</CardTitle>
              <CardDescription>Current humidity percentage</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.humidity}%</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>pH Level</CardTitle>
              <CardDescription>Current pH level</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.pH}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Water Level</CardTitle>
              <CardDescription>Current water level in cm</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.waterLevelCm} cm</CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Historical Data</h2>
          <Card>
            <CardContent>
              <ChartContainer id="sensor-data" config={chartConfig}>
                <Recharts.LineChart data={dummyHistoricalData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                  <Recharts.CartesianGrid strokeDasharray="3 3"/>
                  <Recharts.XAxis dataKey="name"/>
                  <Recharts.YAxis/>
                  <Recharts.Tooltip content={<ChartTooltipContent/>}/>
                  <Recharts.Legend content={<ChartLegendContent/>}/>
                  <Recharts.Line type="monotone" dataKey="temperature" stroke="var(--chart-1)"/>
                  <Recharts.Line type="monotone" dataKey="humidity" stroke="var(--chart-2)"/>
                  <Recharts.Line type="monotone" dataKey="pH" stroke="var(--chart-3)"/>
                  <Recharts.Line type="monotone" dataKey="waterLevel" stroke="var(--chart-4)"/>
                </Recharts.LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Action Log</h2>
            <Card>
              <CardContent>
                <form onSubmit={handleLogAction} className="flex flex-col gap-4">
                  <Textarea
                    placeholder="Log actions taken (e.g., nutrient adjustments, water changes)"
                    value={actionLog}
                    onChange={(e) => setActionLog(e.target.value)}
                  />
                  <Button type="submit">Log Action</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">AI Growth Recommendations</h2>
            <Card>
              <CardContent>
                <p>{growthRecommendations}</p>
                <Button onClick={handleGetRecommendations} className="mt-4">
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="px-6 py-4 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HydroView. All rights reserved.</p>
      </footer>
    </div>
  );
}
