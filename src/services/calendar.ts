
/**
 * @fileOverview Service to fetch events from Google Calendar.
 */

export interface CalendarEvent {
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    description?: string;
}

export async function fetchGoogleCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
    const now = new Date();
    const timeMin = now.toISOString();
    const nextTwoDays = new Date(now);
    nextTwoDays.setDate(now.getDate() + 2);
    const timeMax = nextTwoDays.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

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
