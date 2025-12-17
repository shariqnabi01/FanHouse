import * as Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime | null {
  if (!ablyClient) {
    const apiKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (apiKey) {
      ablyClient = new Ably.Realtime({ key: apiKey });
    } else {
      // Mock for development
      console.warn('Ably key not configured, real-time features disabled');
      return null;
    }
  }
  return ablyClient;
}

export function subscribeToChannel(
  channelName: string,
  callback: (message: Ably.Message) => void
) {
  const client = getAblyClient();
  if (!client) {
    console.warn(`Ably not configured, skipping subscription to ${channelName}`);
    return () => {};
  }
  
  const channel = client.channels.get(channelName);
  channel.subscribe(callback);
  
  return () => {
    channel.unsubscribe();
  };
}

