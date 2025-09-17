
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Cloud, Sun, Cloudy, Umbrella, Wind, Zap } from 'lucide-react';
import { getCurrentWeather } from '@/services/weather';
import { format } from 'date-fns';

const weatherIcons: { [key: string]: React.ReactNode } = {
    'Sunny': <Sun className="w-8 h-8 text-yellow-400" />,
    'Partly Cloudy': <Cloudy className="w-8 h-8 text-gray-400" />,
    'Cloudy': <Cloud className="w-8 h-8 text-gray-500" />,
    'Rainy': <Umbrella className="w-8 h-8 text-blue-400" />,
    'Windy': <Wind className="w-8 h-8 text-gray-400" />,
    'Stormy': <Zap className="w-8 h-8 text-yellow-500" />,
};


function DashboardHeader() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const fetchWeather = async () => {
            try {
                // In a real app, location would be dynamic
                const weatherCondition = await getCurrentWeather('Mountain View, CA');
                setWeather(weatherCondition);
            } catch (error) {
                console.error("Failed to fetch weather", error);
                setWeather("N/A");
            }
        };

        fetchWeather();

        return () => {
            clearInterval(timer);
        };
    }, []);

    const WeatherIcon = weather ? (weatherIcons[weather] || <Cloud className="w-8 h-8 text-gray-400" />) : <Cloud className="w-8 h-8 text-gray-400" />;

    return (
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-xl font-bold font-headline">{format(currentTime, 'EEEE')}</p>
                        <p className="text-sm text-muted-foreground">{format(currentTime, 'MMMM do, yyyy')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        {WeatherIcon}
                        <div>
                            <p className="font-bold text-lg">{weather || 'Loading...'}</p>
                            <p className="text-sm text-muted-foreground">Weather</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary"/>
                        <div>
                            <p className="font-bold text-lg">{format(currentTime, 'h:mm:ss a')}</p>
                            <p className="text-sm text-muted-foreground">Current Time</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default DashboardHeader;
