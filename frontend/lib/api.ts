const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

// ---- mock data helpers (used until real API endpoints are wired) ----

export type IntentLabel =
  | "seeking_solution"
  | "recommendation_req"
  | "comparing"
  | "complaining"
  | "troubleshooting"
  | "discovery";

export type OpportunityStatus =
  | "new"
  | "reviewed"
  | "drafted"
  | "posted"
  | "replied"
  | "follow_up"
  | "won"
  | "lost";

export interface Opportunity {
  id: string;
  platform: "reddit" | "x";
  subreddit?: string;
  title: string;
  body: string;
  author: string;
  url: string;
  posted_at: string;
  intent_label: IntentLabel;
  intent_confidence: number;
  opportunity_score: number;
  score_factors: string[];
  status: OpportunityStatus;
}

export interface DraftVariant {
  id: string;
  variant_index: number;
  body: string;
  salesiness_score: number;
  warnings: string[];
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    platform: "reddit",
    subreddit: "SaaS",
    title: "How do I find potential customers without cold emailing?",
    body: "I've been running my B2B SaaS for 6 months. Cold email open rates are terrible. Has anyone found a better way to reach early adopters who are actively looking for a solution like mine?",
    author: "indie_founder_42",
    url: "https://reddit.com/r/SaaS/comments/example1",
    posted_at: "2026-02-26T09:15:00Z",
    intent_label: "seeking_solution",
    intent_confidence: 0.91,
    opportunity_score: 0.87,
    score_factors: ["High intent: seeking solution", "Fresh post (2h ago)", "Strong ICP match"],
    status: "new",
  },
  {
    id: "2",
    platform: "reddit",
    subreddit: "Entrepreneur",
    title: "What tools do you use to monitor Reddit for your target audience?",
    body: "I keep hearing that Reddit is a goldmine for finding people who need your product, but manually checking subreddits is exhausting. What's everyone using to automate this? I've tried some keyword alert tools but they're noisy.",
    author: "startup_grind_er",
    url: "https://reddit.com/r/Entrepreneur/comments/example2",
    posted_at: "2026-02-26T07:30:00Z",
    intent_label: "recommendation_req",
    intent_confidence: 0.88,
    opportunity_score: 0.82,
    score_factors: ["Recommendation request", "Competitor alternatives query", "Active thread (14 comments)"],
    status: "new",
  },
  {
    id: "3",
    platform: "reddit",
    subreddit: "smallbusiness",
    title: "Frustrated with LinkedIn outreach — nobody reads them",
    body: "Sent 200 LinkedIn messages last month. Got 3 replies, 0 calls. I'm targeting exactly the right people. The problem isn't targeting, it's the channel. Where else are B2B buyers actually hanging out and willing to engage?",
    author: "b2b_hustler",
    url: "https://reddit.com/r/smallbusiness/comments/example3",
    posted_at: "2026-02-25T21:00:00Z",
    intent_label: "complaining",
    intent_confidence: 0.76,
    opportunity_score: 0.61,
    score_factors: ["Pain signal: outreach frustration", "Moderate recency (17h ago)", "Channel comparison intent"],
    status: "reviewed",
  },
  {
    id: "4",
    platform: "reddit",
    subreddit: "marketing",
    title: "Community-led growth vs outbound — what's actually working in 2026?",
    body: "We're a 5-person team trying to decide where to invest. Outbound SDRs are expensive. Community-led sounds great but hard to measure. Would love to hear what's actually moving the needle for early-stage B2B.",
    author: "growth_at_stage",
    url: "https://reddit.com/r/marketing/comments/example4",
    posted_at: "2026-02-25T14:00:00Z",
    intent_label: "comparing",
    intent_confidence: 0.83,
    opportunity_score: 0.74,
    score_factors: ["Comparing strategies", "Decision-making context", "B2B ICP signal"],
    status: "drafted",
  },
  {
    id: "5",
    platform: "reddit",
    subreddit: "startups",
    title: "Error with Reddit API — getting rate limited immediately",
    body: "Just set up PRAW to pull mentions of our product from Reddit. Works for about 10 requests then hits a rate limit error even though I'm well under the cap. Anyone dealt with this? Using OAuth flow.",
    author: "dev_founder_9",
    url: "https://reddit.com/r/startups/comments/example5",
    posted_at: "2026-02-26T11:00:00Z",
    intent_label: "troubleshooting",
    intent_confidence: 0.94,
    opportunity_score: 0.55,
    score_factors: ["Technical troubleshooting", "Developer ICP", "Reddit API context"],
    status: "new",
  },
];

export const MOCK_DRAFTS: Record<string, DraftVariant[]> = {
  "1": [
    {
      id: "d1a",
      variant_index: 0,
      body: "The cold email struggle is real — especially when you're targeting people who haven't raised their hand yet.\n\nOne thing that's worked well for some founders I know: finding where your ICP is already venting their pain. Reddit, Slack communities, and niche forums are full of people actively describing the exact problem your product solves — they're just not searching for a vendor yet.\n\nQuick question: do you know which specific subreddits or communities your target customer hangs out in? That would change the approach pretty significantly.",
      salesiness_score: 0.0,
      warnings: [],
    },
    {
      id: "d1b",
      variant_index: 1,
      body: "Cold email has a structural problem — you're interrupting people who didn't ask. The founders I've seen break through this usually shift from outbound to \"inbound adjacency\": being in the right place when buyers are already describing their pain.\n\nFor B2B SaaS, that often means monitoring places like relevant subreddits, LinkedIn posts asking for recommendations, or industry Slack channels.\n\nWhat does your ICP look like — are they more technical (devs, ops) or business-side (marketing, founders)?",
      salesiness_score: 0.0,
      warnings: [],
    },
  ],
};
