
/**
 * @fileOverview Service to fetch events from Google Calendar.
 */

export interface CalendarEvent {
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    description?: string;
}

export async function fetchGoogleCalendarEvents(
    accessToken: string,
    timeMin?: string,
    timeMax?: string
): Promise<CalendarEvent[]> {
    const min = timeMin || new Date().toISOString();
    const max = timeMax || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(min)}&timeMax=${encodeURIComponent(max)}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        const err = new Error(error.error?.message || 'Failed to fetch Google Calendar events');
        (err as any).status = response.status;
        throw err;
    }

    const data = await response.json();
    return data.items || [];
}

// Mock function for Outlook
export async function fetchOutlookCalendarEvents(): Promise<CalendarEvent[]> {
    console.log("Outlook sync requested. Mocking data for now.");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    summary: "Project Review (Outlook Sync Demo)",
                    start: { dateTime: new Date().toISOString() },
                    end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
                    description: "Discuss quarterly goals."
                }
            ]);
        }, 1000);
    });
}
