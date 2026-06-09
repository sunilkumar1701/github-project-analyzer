const githubApi = require("../config/github.config");

const getGithubProfile = async (username) => {
  const response = await githubApi.get(`/users/${username}`);

  return response.data;
};

const getProfileAnalysis = async (username) => {
  const userResponse = await githubApi.get(`/users/${username}`);

  const reposResponse = await githubApi.get(
    `/users/${username}/repos?sort=updated&per_page=1`,
  );

  const recentRepo = reposResponse.data[0] || null;

  return {
    followers: userResponse.data.followers,

    following: userResponse.data.following,

    public_repos: userResponse.data.public_repos,

    recent_repo: recentRepo
      ? {
          name: recentRepo.name,
          html_url: recentRepo.html_url,
          updated_at: recentRepo.updated_at,
        }
      : null,
  };
};

const getRepositoryAnalysis = async (username) => {
  const reposResponse = await githubApi.get(
    `/users/${username}/repos?per_page=100`,
  );

  const repos = reposResponse.data;

  const totalRepos = repos.length;

  const totalStars = repos.reduce(
    (total, repo) => total + repo.stargazers_count,
    0,
  );

  const totalForks = repos.reduce((total, repo) => total + repo.forks_count, 0);

  const topRepo = repos.reduce((best, repo) => {
    if (repo.stargazers_count > best.stargazers_count) {
      return repo;
    }

    if (
      repo.stargazers_count === best.stargazers_count &&
      repo.forks_count > best.forks_count
    ) {
      return repo;
    }

    if (
      repo.stargazers_count === best.stargazers_count &&
      repo.forks_count === best.forks_count &&
      new Date(repo.updated_at) > new Date(best.updated_at)
    ) {
      return repo;
    }

    return best;
  }, repos[0]);

  return {
    total_repos: totalRepos,

    total_stars: totalStars,

    total_forks: totalForks,

    top_repo: topRepo
      ? {
          name: topRepo.name,
          html_url: topRepo.html_url,
          stars: topRepo.stargazers_count,
          forks: topRepo.forks_count,
        }
      : null,
  };
};

const getTechnologyStackAnalysis = async (username) => {
  const reposResponse = await githubApi.get(
    `/users/${username}/repos?per_page=100`,
  );

  const repos = reposResponse.data;

  const languageCount = {};

  repos.forEach((repo) => {
    if (!repo.language) return;

    languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
  });

  const totalLanguageRepos = Object.values(languageCount).reduce(
    (sum, count) => sum + count,
    0,
  );

  const topLanguages = Object.entries(languageCount)
    .map(([name, count]) => ({
      name,

      value: Math.round((count / totalLanguageRepos) * 100),

      repos: count,
    }))
    .sort((a, b) => b.repos - a.repos)
    .slice(0, 5);

  return {
    total_languages: topLanguages.length,

    top_languages: topLanguages,
  };
};

const getActivityAnalysis = async (username) => {
  const userResponse = await githubApi.get(`/users/${username}`);

  const createdAt = new Date(userResponse.data.created_at);

  const now = new Date();

  const accountAgeMonths =
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
    (now.getMonth() - createdAt.getMonth()) +
    1;

  const monthsToShow = Math.min(accountAgeMonths, 12);

  const activityMap = {};

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const month = date.toLocaleString("default", {
      month: "short",
    });

    const year = String(date.getFullYear()).slice(-2);

    const label = `${month} ${year}`;

    activityMap[label] = {
      month,
      year,
      label,
      commits: 0,
      pullRequests: 0,
      repositoriesCreated: 0,
    };
  }

  const reposResponse = await githubApi.get(
    `/users/${username}/repos?per_page=100`,
  );

  const repos = reposResponse.data.filter((repo) => !repo.fork);

  await Promise.all(
    repos.map(async (repo) => {
      const repoCreatedDate = new Date(repo.created_at);

      const repoMonth = repoCreatedDate.toLocaleString("default", {
        month: "short",
      });

      const repoYear = String(repoCreatedDate.getFullYear()).slice(-2);

      const repoLabel = `${repoMonth} ${repoYear}`;

      if (activityMap[repoLabel]) {
        activityMap[repoLabel].repositoriesCreated++;
      }

      try {
        const commitsResponse = await githubApi.get(
          `/repos/${username}/${repo.name}/commits?per_page=100`,
        );

        commitsResponse.data.forEach((commit) => {
          const commitDate = new Date(commit.commit.author.date);

          const commitMonth = commitDate.toLocaleString("default", {
            month: "short",
          });

          const commitYear = String(commitDate.getFullYear()).slice(-2);

          const commitLabel = `${commitMonth} ${commitYear}`;

          if (activityMap[commitLabel]) {
            activityMap[commitLabel].commits++;
          }
        });
      } catch {
        console.log(`Commit fetch failed: ${repo.name}`);
      }

      try {
        const pullsResponse = await githubApi.get(
          `/repos/${username}/${repo.name}/pulls?state=all&per_page=100`,
        );

        pullsResponse.data.forEach((pull) => {
          const pullDate = new Date(pull.created_at);

          const pullMonth = pullDate.toLocaleString("default", {
            month: "short",
          });

          const pullYear = String(pullDate.getFullYear()).slice(-2);

          const pullLabel = `${pullMonth} ${pullYear}`;

          if (activityMap[pullLabel]) {
            activityMap[pullLabel].pullRequests++;
          }
        });
      } catch {
        console.log(`PR fetch failed: ${repo.name}`);
      }
    }),
  );

  return {
    accountAgeMonths: accountAgeMonths,

    monthsDisplayed: monthsToShow,

    activity: Object.values(activityMap),
  };
};

module.exports = {
  getGithubProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
  getActivityAnalysis,
};
