'use client';

import { useEffect, useRef, useCallback } from 'react';
import pusherClient from '@/lib/pusher/client';
import type { Channel, PresenceChannel } from 'pusher-js';

export function usePusherChannel(
  channelName: string,
  callbacks?: {
    onSubscribe?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    try {
      const channel = pusherClient.subscribe(channelName);

      channel.bind('pusher:subscription_succeeded', () => {
        callbacks?.onSubscribe?.();
      });

      channel.bind('pusher:subscription_error', (error: Error) => {
        callbacks?.onError?.(error);
      });

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          pusherClient.unsubscribe(channelName);
          channelRef.current = null;
        }
      };
    } catch (error) {
      callbacks?.onError?.(error as Error);
    }
  }, [channelName, callbacks]);

  return channelRef.current;
}

export function usePusherEvent(
  channel: Channel | null,
  eventName: string,
  callback: (data: any) => void
) {
  useEffect(() => {
    if (!channel) return;

    channel.bind(eventName, callback);

    return () => {
      if (channel) {
        channel.unbind(eventName, callback);
      }
    };
  }, [channel, eventName, callback]);
}

export function usePusherPresence(
  channelName: string,
  userInfo?: Record<string, any>
) {
  const channelRef = useRef<PresenceChannel | null>(null);
  const membersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!channelName) return;

    try {
      const channel = pusherClient.subscribe(channelName) as PresenceChannel;

      channel.bind('pusher:subscription_succeeded', () => {
        const members = channel.members;
        membersRef.current.clear();
        members.each((member: any) => {
          membersRef.current.set(member.id, member.info);
        });
      });

      channel.bind('pusher:member_added', (member: any) => {
        membersRef.current.set(member.id, member.info);
      });

      channel.bind('pusher:member_removed', (member: any) => {
        membersRef.current.delete(member.id);
      });

      if (userInfo) {
        channel.members.addListener({
          onSubscriptionSucceeded: () => {
            // Success callback
          },
          onMemberAdded: () => {
            // Member added callback
          },
          onMemberRemoved: () => {
            // Member removed callback
          },
        });
      }

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          pusherClient.unsubscribe(channelName);
          channelRef.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to presence channel:', error);
    }
  }, [channelName, userInfo]);

  return {
    channel: channelRef.current,
    members: membersRef.current,
  };
}
