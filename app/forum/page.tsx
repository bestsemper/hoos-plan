"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  addForumReply,
  createForumPost,
  getForumPageData,
  voteOnForumReply,
} from '../actions';

type ForumAnswerItem = {
  id: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
  voteScore: number;
  currentUserVote: 1 | -1 | 0;
};

type ForumPostItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
  attachedPlan: { id: string; title: string } | null;
  answers: ForumAnswerItem[];
};

export default function ForumPage() {
  const [isPending, startTransition] = useTransition();

  const [posts, setPosts] = useState<ForumPostItem[]>([]);
  const [plans, setPlans] = useState<Array<{ id: string; title: string }>>([]);
  const [canPost, setCanPost] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [search, setSearch] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [attachedPlanId, setAttachedPlanId] = useState('');
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const res = await getForumPageData();
    setPosts(res.posts);
    setPlans(res.plans);
    setCanPost(res.canPost);
    setDataLoaded(true);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedPlanLabel = attachedPlanId
    ? plans.find((plan) => plan.id === attachedPlanId)?.title || 'Attach plan'
    : 'No plan attached';

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;

    return posts.filter((post) => {
      const inPost = `${post.title} ${post.body} ${post.authorDisplayName}`.toLowerCase().includes(term);
      const inReplies = post.answers.some((answer) =>
        `${answer.body} ${answer.authorDisplayName}`.toLowerCase().includes(term)
      );
      return inPost || inReplies;
    });
  }, [posts, search]);

  const handleCreatePost = () => {
    setError(null);

    startTransition(async () => {
      const res = await createForumPost(newPostTitle, newPostBody, attachedPlanId || undefined);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setNewPostTitle('');
      setNewPostBody('');
      setAttachedPlanId('');
      await loadData();
    });
  };

  const handleReply = (postId: string) => {
    setError(null);

    startTransition(async () => {
      const res = await addForumReply(postId, replyDrafts[postId] || '');
      if (res?.error) {
        setError(res.error);
        return;
      }
      setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
      setExpandedPostId(postId);
      await loadData();
    });
  };

  const handleVote = (answerId: string, value: 1 | -1) => {
    setError(null);

    startTransition(async () => {
      const res = await voteOnForumReply(answerId, value);
      if (res?.error) {
        setError(res.error);
        return;
      }
      await loadData();
    });
  };

  if (!dataLoaded) {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-pulse">
        <div className="mb-6 border-b border-panel-border pb-4">
          <div className="h-9 w-64 rounded bg-input-disabled" />
        </div>

        <div className="mb-6">
          <div className="h-12 w-full rounded-md bg-input-disabled" />
        </div>

        <div className="bg-panel-bg border border-panel-border rounded-md p-4 mb-6 space-y-3">
          <div className="h-6 w-40 rounded bg-input-disabled" />
          <div className="h-12 w-full rounded-md bg-input-disabled" />
          <div className="h-28 w-full rounded-md bg-input-disabled" />
          <div className="h-12 w-full rounded-md bg-input-disabled" />
          <div className="h-10 w-24 rounded bg-input-disabled" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-panel-bg border border-panel-border p-5 rounded-md space-y-3">
              <div className="h-7 w-4/5 rounded bg-input-disabled" />
              <div className="h-4 w-1/2 rounded bg-input-disabled" />
              <div className="h-4 w-full rounded bg-input-disabled" />
              <div className="h-4 w-3/4 rounded bg-input-disabled" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6 border-b border-panel-border pb-4">
        <h1 className="text-3xl font-bold text-heading">Community Forum</h1>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts and replies..."
          className="w-full p-3 border border-panel-border rounded-md bg-input-bg text-text-primary outline-none"
        />
      </div>

      <div className="bg-panel-bg border border-panel-border rounded-md p-4 mb-6">
        <h2 className="text-lg font-bold text-heading mb-3">Create New Post</h2>
        {!canPost && (
          <p className="text-sm text-text-secondary mb-3">Log in to create posts, reply, and vote.</p>
        )}
        <div className="space-y-3">
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Post title"
            className="w-full p-3 border border-panel-border rounded-md bg-input-bg text-text-primary outline-none"
            disabled={!canPost || isPending}
          />
          <textarea
            value={newPostBody}
            onChange={(e) => setNewPostBody(e.target.value)}
            placeholder="Ask your question or share your advice"
            rows={4}
            className="w-full p-3 border border-panel-border rounded-md bg-input-bg text-text-primary outline-none"
            disabled={!canPost || isPending}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsPlanDropdownOpen((prev) => !prev);
                setHoveredPlanId(null);
              }}
              onBlur={() =>
                setTimeout(() => {
                  setIsPlanDropdownOpen(false);
                  setHoveredPlanId(null);
                }, 150)
              }
              className="w-full p-3 border border-panel-border rounded-md bg-input-bg text-text-primary outline-none text-left cursor-pointer flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canPost || isPending}
            >
              <span>{selectedPlanLabel}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-4 h-4 ml-2 transition-transform ${isPlanDropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isPlanDropdownOpen && canPost && !isPending && (
              <div className="absolute z-10 w-full mt-1 bg-panel-bg border border-panel-border-strong rounded-md max-h-48 overflow-y-auto">
                <div
                  onMouseEnter={() => setHoveredPlanId('__none__')}
                  onMouseLeave={() => setHoveredPlanId(null)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${attachedPlanId === '' && hoveredPlanId === null ? 'bg-uva-blue text-white' : 'text-text-primary hover:bg-uva-blue hover:text-white'}`}
                  onClick={() => {
                    setAttachedPlanId('');
                    setHoveredPlanId(null);
                    setIsPlanDropdownOpen(false);
                  }}
                >
                  No plan attached
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onMouseEnter={() => setHoveredPlanId(plan.id)}
                    onMouseLeave={() => setHoveredPlanId(null)}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${attachedPlanId === plan.id && (hoveredPlanId === null || hoveredPlanId === plan.id) ? 'bg-uva-blue text-white' : 'text-text-primary hover:bg-uva-blue hover:text-white'}`}
                    onClick={() => {
                      setAttachedPlanId(plan.id);
                      setHoveredPlanId(null);
                      setIsPlanDropdownOpen(false);
                    }}
                  >
                    Attach: {plan.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={!canPost || isPending}
            className="px-4 py-2 bg-uva-orange text-white rounded hover:bg-[#cc6600] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-500 px-4 py-2 rounded-md text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPostId === post.id;
          return (
            <div key={post.id} className="bg-panel-bg border border-panel-border p-5 rounded-md">
              <button
                type="button"
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                className="w-full text-left cursor-pointer"
              >
                <h2 className="text-xl font-bold mb-1 text-heading hover:text-uva-orange transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-text-secondary mb-2">
                  Posted by <span className="text-uva-orange font-semibold">{post.authorDisplayName}</span> • {new Date(post.createdAt).toLocaleString()} • {post.answers.length} replies
                </p>
                {post.attachedPlan && (
                  <p className="text-xs font-semibold text-uva-orange mb-2">Attached plan: {post.attachedPlan.title}</p>
                )}
                <p className="text-text-primary whitespace-pre-wrap">{post.body}</p>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-panel-border space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-text-secondary">Replies</h3>

                  {post.answers.length === 0 && (
                    <p className="text-sm text-text-secondary">No replies yet.</p>
                  )}

                  {post.answers.map((answer) => (
                    <div key={answer.id} className="border border-panel-border rounded-md p-3 bg-panel-bg-alt">
                      <p className="text-text-primary whitespace-pre-wrap">{answer.body}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-text-secondary">
                          {answer.authorDisplayName} • {new Date(answer.createdAt).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVote(answer.id, 1)}
                            disabled={!canPost || isPending}
                            className={`px-2 py-1 rounded border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              answer.currentUserVote === 1
                                ? 'border-uva-orange text-uva-orange bg-badge-orange-bg'
                                : 'border-panel-border text-text-secondary hover:bg-hover-bg'
                            }`}
                          >
                            Upvote
                          </button>
                          <span className="text-sm font-bold text-text-primary min-w-6 text-center">{answer.voteScore}</span>
                          <button
                            type="button"
                            onClick={() => handleVote(answer.id, -1)}
                            disabled={!canPost || isPending}
                            className={`px-2 py-1 rounded border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              answer.currentUserVote === -1
                                ? 'border-red-400 text-red-500 bg-red-500/10'
                                : 'border-panel-border text-text-secondary hover:bg-hover-bg'
                            }`}
                          >
                            Downvote
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <textarea
                      value={replyDrafts[post.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Write a reply"
                      className="w-full p-3 border border-panel-border rounded-md bg-input-bg text-text-primary outline-none"
                      disabled={!canPost || isPending}
                    />
                    <button
                      type="button"
                      onClick={() => handleReply(post.id)}
                      disabled={!canPost || isPending}
                      className="mt-2 px-3 py-2 bg-uva-blue text-white rounded hover:bg-uva-blue-dark font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? 'Submitting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
