export async function fetchUserRepos(
  githubAccessToken: string,
  per_page: number = 20,
  page: number = 1
) {
  const response = await fetch(
    `https://api.github.com/user/repos?per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export async function fetchUserOrgs(githubAccessToken: string) {
  const response = await fetch(`https://api.github.com/user/orgs`, {
    headers: {
      Authorization: `Bearer ${githubAccessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
}

export async function fetchOrgRepos(
  githubAccessToken: string,
  org: string,
  per_page: number = 20,
  page: number = 1
) {
  const response = await fetch(
    `https://api.github.com/orgs/${org}/repos?per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
}

export async function fetchOrgContributorsNumber(
  githubAccessToken: string,
  org: string
): Promise<number> {
  const reposData = await fetchOrgRepos(githubAccessToken, org, 100, 1);
  const repoNames = reposData.map((repo: any) => repo.name);

  async function fetchContributors(repo: string): Promise<string[]> {
    const res = await fetch(
      `https://api.github.com/repos/${org}/${repo}/contributors?per_page=100`,
      {
        headers: { Authorization: `Bearer ${githubAccessToken}` },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((contributor: any) => contributor.login);
  }

  const allContributors: string[] = [];

  for (const repo of repoNames) {
    const contributors = await fetchContributors(repo);
    allContributors.push(...contributors);
  }

  const uniqueContributors = new Set(allContributors);
  return uniqueContributors.size;
}

export async function fetchRecentCommits(
  githubAccessToken: string,
  user: { login: string; name?: string | null }
) {
  if (!user || !user.login) {
    return [];
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const response = await fetch(
    `https://api.github.com/users/${user.login}/events`,
    {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error(
      `GitHub API error fetching events: ${response.status} ${response.statusText}`
    );
    return [];
  }

  const events = await response.json();
  const recentCommits: any[] = [];
  const addedShas = new Set<string>();

  for (const event of events) {
    const eventDate = new Date(event.created_at);
    if (eventDate < sevenDaysAgo) {
      continue;
    }

    if (
      event.type === "PushEvent" &&
      event.payload?.head &&
      event.payload?.before
    ) {
      const headSha = event.payload.head;
      const beforeSha = event.payload.before;
      const repoName = event.repo.name;

      try {
        const compareResponse = await fetch(
          `https://api.github.com/repos/${repoName}/compare/${beforeSha}...${headSha}`,
          {
            headers: {
              Authorization: `Bearer ${githubAccessToken}`,
            },
          }
        );

        if (compareResponse.ok) {
          const compareData = await compareResponse.json();
          const commits = compareData.commits || [];

          for (const commit of commits) {
            if (
              commit.sha &&
              commit.commit?.message &&
              !addedShas.has(commit.sha)
            ) {
              const commitAuthorDate =
                commit.commit.author?.date || event.created_at;
              recentCommits.push({
                sha: commit.sha,
                message: commit.commit.message.split("\n")[0],
                repo: repoName,
                date: commitAuthorDate,
              });
              addedShas.add(commit.sha);
            }
          }
        } else {
          const commitResponse = await fetch(
            `https://api.github.com/repos/${repoName}/commits/${headSha}`,
            {
              headers: {
                Authorization: `Bearer ${githubAccessToken}`,
              },
            }
          );

          if (commitResponse.ok) {
            const commitData = await commitResponse.json();
            if (
              commitData.sha &&
              commitData.commit?.message &&
              !addedShas.has(commitData.sha)
            ) {
              recentCommits.push({
                sha: commitData.sha,
                message: commitData.commit.message.split("\n")[0],
                repo: repoName,
                date: event.created_at,
              });
              addedShas.add(commitData.sha);
            }
          }
        }
      } catch (error) {}
    }
  }

  recentCommits.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return recentCommits;
}

export function getGithubAccessTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|; )github_access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
