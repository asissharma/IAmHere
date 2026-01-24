import type { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// REPLACE THIS WITH YOUR ACTUAL GITHUB USERNAME
const GITHUB_USERNAME = process.env.GITHUB_USERNAME; 

// --- QUERY DEFINITIONS ---
const GRAPHQL_QUERIES = {
  calendar: `
    query($userName:String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `,
  pinned: `
    query($userName:String!) {
      user(login: $userName) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `,
  stats: `
    query($userName:String!) {
      user(login: $userName) {
        repositories(first: 100) {
          totalCount
        }
        followers {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
        }
      }
    }
  `
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Security Check
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token missing in environment variables' });
  }

  const mode = (req.query.mode as string) || 'calendar';

  try {
    let payload;

    // ============================================================
    // MODE: COMMITS (REST API)
    // ============================================================
    if (mode === 'commits') {
      // FIX: Correct URL structure (added /users/)
      const endpoint = `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`;
      
      const restResponse = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store' // Always fetch fresh from GitHub to server
      });

      if (!restResponse.ok) {
         const errText = await restResponse.text();
         throw new Error(`GitHub REST API Error: ${restResponse.status} ${errText}`);
      }
      
      const events = await restResponse.json();
      
      // Filter for PushEvents that strictly have commits
      const pushEvents = events.filter((e: any) => 
        e.type === 'PushEvent' && 
        e.payload && 
        Array.isArray(e.payload.commits) &&
        e.payload.commits.length > 0
      );
      
      const commits = pushEvents.flatMap((event: any) => {
        const isPrivate = event.public === false; 
        const repoName = event.repo?.name ? event.repo.name.split('/')[1] : 'unknown';

        return event.payload.commits.map((commit: any) => ({
          msg: commit.message || "No message",
          date: event.created_at, 
          hash: commit.sha ? commit.sha.substring(0, 7) : 'xxxxxx',
          repo: isPrivate ? "confidential/module" : repoName 
        })).reverse(); 
      });

      payload = commits.slice(0, 5);
    
    // ============================================================
    // MODE: GRAPHQL (Calendar, Stats, Pinned)
    // ============================================================
    } else {
      const selectedQuery = GRAPHQL_QUERIES[mode as keyof typeof GRAPHQL_QUERIES];
      if (!selectedQuery) {
        return res.status(400).json({ error: `Invalid mode: ${mode}` });
      }

      const ghResponse = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedQuery,
          variables: { userName: GITHUB_USERNAME },
        }),
      });

      const data = await ghResponse.json();

      if (data.errors) {
        console.error("GraphQL Errors:", JSON.stringify(data.errors, null, 2));
        throw new Error("GitHub GraphQL Query Failed");
      }

      const user = data.data.user;

      switch (mode) {
        case 'pinned':
          payload = user.pinnedItems.nodes;
          break;
        case 'stats':
          payload = {
            repos: user.repositories.totalCount,
            followers: user.followers.totalCount,
            commits: user.contributionsCollection.totalCommitContributions,
            private_contribs: user.contributionsCollection.restrictedContributionsCount 
          };
          break;
        case 'calendar':
        default:
          payload = user.contributionsCollection.contributionCalendar;
          break;
      }
    }

    // FIX: INTELLIGENT CACHING
    // If we have valid data, cache it for 10 minutes to save API quota.
    // If data is empty or null, DO NOT cache (so you can retry immediately).
    if (payload && (Array.isArray(payload) ? payload.length > 0 : true)) {
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    } else {
        res.setHeader('Cache-Control', 'no-store');
    }

    return res.status(200).json(payload);

  } catch (error: any) {
    console.error("FULL API ERROR:", error);
    // Never cache an error response
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ 
      error: 'Failed to fetch GitHub data', 
      details: error.message 
    });
  }
}