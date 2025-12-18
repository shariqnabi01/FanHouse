import Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    const apiKey = process.env.ABLY_API_KEY;
    if (apiKey) {
      ablyClient = new Ably.Realtime({ key: apiKey });
    } else {
      // Mock client for development
      ablyClient = {
        channels: {
          get: (channelName: string) => ({
            publish: async (eventName: string, data: any) => {
              console.log(`[Ably Mock] Channel: ${channelName}, Event: ${eventName}`, data);
            },
            subscribe: () => {},
            presence: {
              enter: async () => {},
              leave: async () => {},
              get: async () => [],
            },
          }),
        },
      } as Ably.Realtime;
    }
  }
  return ablyClient;
}

export async function publishEvent(channel: string, event: string, data: any) {
  const client = getAblyClient();
  const channelInstance = client.channels.get(channel);
  await channelInstance.publish(event, data);
}

