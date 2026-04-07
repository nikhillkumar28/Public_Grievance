import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UpvoteContext = createContext(null);

export const UpvoteProvider = ({ children }) => {
  const [upvotedIds, setUpvotedIds] = useState(() => new Set());
  const [upvotingIds, setUpvotingIds] = useState(() => new Set());

  const markUpvoted = useCallback((id) => {
    if (!id) return;
    setUpvotedIds((prev) => new Set(prev).add(id));
  }, []);

  const unmarkUpvoted = useCallback((id) => {
    if (!id) return;
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const setUpvoting = useCallback((id, value) => {
    if (!id) return;
    setUpvotingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      upvotedIds,
      upvotingIds,
      markUpvoted,
      unmarkUpvoted,
      setUpvoting
    }),
    [markUpvoted, unmarkUpvoted, setUpvoting, upvotedIds, upvotingIds]
  );

  return <UpvoteContext.Provider value={value}>{children}</UpvoteContext.Provider>;
};

export const useUpvotes = () => {
  const ctx = useContext(UpvoteContext);
  if (!ctx) {
    throw new Error("useUpvotes must be used within UpvoteProvider");
  }
  return ctx;
};
