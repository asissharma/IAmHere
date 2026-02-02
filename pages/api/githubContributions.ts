import type { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

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
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    return res.status(500).json({ error: 'GitHub credentials missing' });
  }

  const mode = (req.query.mode as string) || 'calendar';

  try {
    let payload: any;

    // ============================================================
    // MODE: COMMITS (Now using Search API)
    // ============================================================
    if (mode === 'commits') {
      // We search for commits authored by the user, sorted by date (newest first)
      const query = encodeURIComponent(`author:${GITHUB_USERNAME} sort:author-date-desc`);
      const endpoint = `https://api.github.com/search/commits?q=${query}&per_page=10`;
      
      const restResponse = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          // This specific header is often required for the Search Commits API
          'Accept': 'application/vnd.github.v3+json', 
        },
        cache: 'no-store'
      });

      if (!restResponse.ok) {
        const errText = await restResponse.text();
        // If search fails, we might want to degrade gracefully, but for now throw error
        throw new Error(`GitHub Search API Error: ${restResponse.status} ${errText}`);
      }
      
      const data = await restResponse.json();
      
      // The Search API returns an 'items' array
      payload = data.items.map((item: any) => {
        const repoFullName = item.repository ? item.repository.full_name : 'unknown/repo';
        const isPrivate = item.repository ? item.repository.private : false;
        
        return {
          msg: item.commit.message.split('\n')[0], // Only take the first line of the message
          date: item.commit.author.date,
          hash: item.sha.substring(0, 7),
          repo: isPrivate ? "confidential/module" : repoFullName.split('/')[1] 
        };
      });

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

      const user = data.data?.user;
      if (!user) throw new Error("User not found");

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

    // Cache success response
    const hasData = Array.isArray(payload) ? payload.length > 0 : !!payload;
    if (hasData) {
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    } else {
        res.setHeader('Cache-Control', 'no-store');
    }

    return res.status(200).json(payload);

  } catch (error: any) {
    console.error("FULL API ERROR:", error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ 
      error: 'Failed to fetch GitHub data', 
      details: error.message 
    });
  }
}