import Pusher from 'pusher';

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_APP_KEY || !process.env.PUSHER_APP_SECRET) {
  throw new Error('Pusher environment variables are not configured');
}

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER || 'eu',
  useTLS: process.env.PUSHER_SCHEME === 'https',
});

export default pusherServer;
