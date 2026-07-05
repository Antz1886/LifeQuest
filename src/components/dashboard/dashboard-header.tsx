
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
        <Card className="border-none bg-transparent shadow-none md:border md:bg-card md:shadow-sm">
            <CardContent className="p-2 md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary"/>
                    </div>
                    <div>
                        <p className="text-lg md:text-xl font-bold font-headline leading-none">{format(currentTime, 'EEEE')}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{format(currentTime, 'MMMM do, yyyy')}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-3 sm:gap-6 w-full sm:w-auto justify-stretch sm:justify-end">
                    <div className="flex items-center gap-3 bg-muted/30 sm:bg-transparent p-3 sm:p-0 rounded-2xl w-full sm:w-auto border border-border/10 sm:border-none">
                        <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                            {WeatherIcon}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm sm:text-lg leading-tight truncate">{weather || 'Loading...'}</p>
                            <p className="text-[10px] sm:text-sm text-muted-foreground">Local Weather</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 bg-muted/30 sm:bg-transparent p-3 sm:p-0 rounded-2xl w-full sm:w-auto border border-border/10 sm:border-none">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Clock className="w-6 h-6 text-primary"/>
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm sm:text-lg leading-tight truncate">{format(currentTime, 'h:mm:ss a')}</p>
                            <p className="text-[10px] sm:text-sm text-muted-foreground">Current Time</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default DashboardHeader;
