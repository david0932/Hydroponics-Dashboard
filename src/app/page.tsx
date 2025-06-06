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
    label: "溫度 (°C)",
    color: "var(--chart-1)",
  },
  waterTemperature: {
    label: "水溫 (°C)",
    color: "var(--chart-2)",
  },
  humidity: {
    label: "濕度 (%)",
    color: "var(--chart-3)",
  },
  pH: {
    label: "酸鹼值",
    color: "var(--chart-4)",
  },
  waterLevel: {
    label: "水位 (cm)",
    color: "var(--chart-5)",
  },
  ec: {
    label: "電導度 (EC)",
    color: "var(--chart-1)",
  },
  dissolvedOxygen: {
    label: "溶氧量 (ppm)",
    color: "var(--chart-2)",
  }
};

// Dummy historical data
const dummyHistoricalData = Array.from({length: 20}, (_, i) => ({
  name: `Day ${i + 1}`,
  temperature: 20 + Math.random() * 5,
  waterTemperature: 18 + Math.random() * 5,
  humidity: 50 + Math.random() * 30,
  pH: 5.5 + Math.random() * 2,
  waterLevel: 10 + Math.random() * 10,
  ec: 1.0 + Math.random() * 0.5,
  dissolvedOxygen: 6 + Math.random() * 2,
}));

export default function Home() {
  const [sensorData, setSensorData] = useState({
    temperatureCelsius: 0,
    waterTemperatureCelsius: 0,
    humidity: 0,
    pH: 0,
    waterLevelCm: 0,
    ec: 0,
    dissolvedOxygen: 0,
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
      title: "動作已記錄",
      description: "您的動作已記錄。",
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
        waterTemperatureCelsius: sensorData.waterTemperatureCelsius,
        humidity: sensorData.humidity,
        pH: sensorData.pH,
        waterLevelCm: sensorData.waterLevelCm,
        ec: sensorData.ec,
        dissolvedOxygen: sensorData.dissolvedOxygen,
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
        <h1 className="text-2xl font-bold">水耕系統儀表板</h1>
      </header>
      <main className="container mx-auto p-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>溫度</CardTitle>
              <CardDescription>目前溫度 (攝氏度)</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.temperatureCelsius}°C</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>水溫</CardTitle>
              <CardDescription>目前水溫 (攝氏度)</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.waterTemperatureCelsius}°C</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>濕度</CardTitle>
              <CardDescription>目前濕度百分比</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.humidity}%</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>酸鹼值</CardTitle>
              <CardDescription>目前酸鹼值</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.pH}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>水位</CardTitle>
              <CardDescription>目前水位 (公分)</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.waterLevelCm} cm</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>電導度 (EC)</CardTitle>
              <CardDescription>目前電導度</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.ec}</CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>溶氧量</CardTitle>
              <CardDescription>目前溶氧量 (ppm)</CardDescription>
            </CardHeader>
            <CardContent>{sensorData.dissolvedOxygen} ppm</CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">歷史資料</h2>
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
                  <Recharts.Line type="monotone" dataKey="waterTemperature" stroke="var(--chart-2)"/>
                  <Recharts.Line type="monotone" dataKey="humidity" stroke="var(--chart-3)"/>
                  <Recharts.Line type="monotone" dataKey="pH" stroke="var(--chart-4)"/>
                   <Recharts.Line type="monotone" dataKey="waterLevel" stroke="var(--chart-5)"/>
                  <Recharts.Line type="monotone" dataKey="ec" stroke="var(--chart-1)"/>
                  <Recharts.Line type="monotone" dataKey="dissolvedOxygen" stroke="var(--chart-2)"/>
                </Recharts.LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">動作紀錄</h2>
            <Card>
              <CardContent>
                <form onSubmit={handleLogAction} className="flex flex-col gap-4">
                  <Textarea
                    placeholder="記錄採取的動作 (例如：營養調整、換水)"
                    value={actionLog}
                    onChange={(e) => setActionLog(e.target.value)}
                  />
                  <Button type="submit">記錄動作</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">AI 生長建議</h2>
            <Card>
              <CardContent>
                <p>{growthRecommendations}</p>
                <Button onClick={handleGetRecommendations} className="mt-4">
                  取得建議
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="px-6 py-4 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HydroView. 保留所有權利。</p>
      </footer>
    </div>
  );
}
