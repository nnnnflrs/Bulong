"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Comment } from "@/types/comment";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants";

export function useRealtimeComments(recordingId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (cursor?: string | null) => {
      try {
        const params = new URLSearchParams({
          limit: COMMENTS_PAGE_SIZE.toString(),
        });
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(
          `/api/recordings/${recordingId}/comments?${params}`
        );
        if (!res.ok) throw new Error("Failed to fetch comments");

        const { data, nextCursor: nc } = await res.json();
        return { data: data as Comment[], nextCursor: nc as string | null };
      } catch (err) {
        console.error("Error fetching comments:", err);
        return { data: [], nextCursor: null };
      }
    },
    [recordingId]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchComments().then(({ data, nextCursor: nc }) => {
      setComments(data);
      setNextCursor(nc);
      setHasMore(nc !== null);
      setIsLoading(false);
    });
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`comments:${recordingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `recording_id=eq.${recordingId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [newComment, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordingId]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    const { data, nextCursor: nc } = await fetchComments(nextCursor);
    setComments((prev) => [...prev, ...data]);
    setNextCursor(nc);
    setHasMore(nc !== null);
  }, [nextCursor, fetchComments]);

  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [comment, ...prev];
    });
  }, []);

  return { comments, isLoading, hasMore, loadMore, addComment };
}
