const githubApi = require("../config/github.config");
const { getMonthLabel } = require("../utils/githubHelpers");
const githubErrorHandler = require("../middleware/githubErrorHandler");

const getGithubProfile = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required.");
    }

    const { data } = await githubApi.get(`/users/${username}`);

    return data;
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch GitHub profile.");
  }
};

const getProfileAnalysis = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required.");
    }

    const [userResponse, reposResponse] = await Promise.all([
      githubApi.get(`/users/${username}`),

      githubApi.get(`/users/${username}/repos?sort=updated&per_page=1`),
    ]);

    const user = userResponse.data;

    const recentRepo = reposResponse.data?.[0] || null;

    return {
      followers: user.followers,

      following: user.following,

      public_repos: user.public_repos,

      recent_repo: recentRepo
        ? {
            name: recentRepo.name,
            html_url: recentRepo.html_url,
            updated_at: recentRepo.updated_at,
          }
        : null,
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch profile analysis.");
  }
};

const getRepositoryAnalysis = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required.");
    }

    const { data: repos } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    if (!repos.length) {
      return {
        total_repos: 0,
        total_stars: 0,
        total_forks: 0,
        top_repo: null,
      };
    }

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0,
    );

    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

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
      total_repos: repos.length,

      total_stars: totalStars,

      total_forks: totalForks,

      top_repo: {
        name: topRepo.name,
        html_url: topRepo.html_url,
        stars: topRepo.stargazers_count,
        forks: topRepo.forks_count,
      },
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch repository analysis.");
  }
};

const getTechnologyStackAnalysis = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required.");
    }

    const { data: repos } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    const languageCount = {};

    repos.forEach((repo) => {
      if (!repo.language) return;

      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    });

    const totalLanguageRepos = Object.values(languageCount).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalLanguageRepos === 0) {
      return {
        total_languages: 0,
        top_languages: [],
      };
    }

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
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch technology stack analysis.");
  }
};

const getActivityAnalysis = async (username) => {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      githubApi.get(`/users/${username}`),

      githubApi.get(`/users/${username}/repos?per_page=100`),
    ]);

    const createdAt = new Date(
      userResponse.data.created_at
    );

    const now = new Date();

    const accountAgeMonths =
      (now.getFullYear() - createdAt.getFullYear()) *
        12 +
      (now.getMonth() - createdAt.getMonth()) +
      1;

    const monthsToShow = Math.min(
      accountAgeMonths,
      12
    );

    const activityMap = {};

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const label = getMonthLabel(date);

      activityMap[label] = {
        label,

        month: date.toLocaleString("default", {
          month: "short",
        }),

        year: String(
          date.getFullYear()
        ).slice(-2),

        commits: 0,

        pullRequests: 0,

        repositoriesCreated: 0,
      };
    }

    const repos = reposResponse.data.filter(
      (repo) => !repo.fork
    );

    repos.forEach((repo) => {
      const label = getMonthLabel(
        new Date(repo.created_at)
      );

      if (activityMap[label]) {
        activityMap[label].repositoriesCreated++;
      }
    });

    const commitRequests = repos.map((repo) =>
      githubApi
        .get(
          `/repos/${username}/${repo.name}/commits?per_page=100`
        )
        .then((response) => ({
          repo: repo.name,

          commits: response.data,
        }))
    );

    const pullRequests = repos.map((repo) =>
      githubApi
        .get(
          `/repos/${username}/${repo.name}/pulls?state=all&per_page=100`
        )
        .then((response) => ({
          repo: repo.name,

          pulls: response.data,
        }))
    );

    const [commitResults, prResults] =
      await Promise.all([
        Promise.allSettled(commitRequests),

        Promise.allSettled(pullRequests),
      ]);

    commitResults.forEach((result) => {
      if (result.status !== "fulfilled") {
        return;
      }

      result.value.commits.forEach((commit) => {
        const commitDate =
          commit?.commit?.author?.date;

        if (!commitDate) {
          return;
        }

        const label = getMonthLabel(
          new Date(commitDate)
        );

        if (activityMap[label]) {
          activityMap[label].commits++;
        }
      });
    });

    prResults.forEach((result) => {
      if (result.status !== "fulfilled") {
        return;
      }

      result.value.pulls.forEach((pull) => {
        const label = getMonthLabel(
          new Date(pull.created_at)
        );

        if (activityMap[label]) {
          activityMap[label].pullRequests++;
        }
      });
    });

    return {
      accountAgeMonths,

      monthsDisplayed: monthsToShow,

      activity: Object.values(activityMap),
    };
  } catch (error) {
    githubErrorHandler(
      error,
      "Failed to fetch activity analysis."
    );
  }
};

const getRepositoryQualityAnalysis = async (username) => {
  try {
    const { data: repos } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    const filteredRepos = repos.filter((repo) => !repo.fork);

    const totalRepos = filteredRepos.length;

    if (!totalRepos) {
      return {
        score: 0,
        metrics: {
          readme: 0,
          description: 0,
          documentation: 0,
          topics: 0,
        },
      };
    }

    let descriptionCount = 0;
    let topicsCount = 0;

    filteredRepos.forEach((repo) => {
      if (repo.description?.trim()) {
        descriptionCount++;
      }

      if (repo.topics?.length) {
        topicsCount++;
      }
    });

    const readmeRequests = filteredRepos.map((repo) =>
      githubApi.get(`/repos/${username}/${repo.name}/readme`).then((res) => ({
        repo,
        readme: res.data,
      })),
    );

    const results = await Promise.allSettled(readmeRequests);

    let readmeCount = 0;
    let documentationCount = 0;

    results.forEach((result) => {
      if (result.status !== "fulfilled") return;

      readmeCount++;

      const content = Buffer.from(
        result.value.readme.content,
        "base64",
      ).toString("utf8");

      const wordCount = content
        .replace(/[#*_`\-\[\]\(\)]/g, "")
        .split(/\s+/)
        .filter(Boolean).length;

      if (wordCount >= 100) {
        documentationCount++;
      }
    });

    const readmeScore = (readmeCount / totalRepos) * 30;

    const descriptionScore = (descriptionCount / totalRepos) * 30;

    const documentationScore = (documentationCount / totalRepos) * 20;

    const topicsScore = (topicsCount / totalRepos) * 20;

    return {
      total_repos: totalRepos,

      score: Math.round(
        readmeScore + descriptionScore + documentationScore + topicsScore,
      ),

      metrics: {
        readme: Math.round(readmeScore),
        description: Math.round(descriptionScore),
        documentation: Math.round(documentationScore),
        topics: Math.round(topicsScore),
      },

      counts: {
        readme: readmeCount,
        description: descriptionCount,
        documentation: documentationCount,
        topics: topicsCount,
      },
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch repository quality analysis.");
  }
};

const getPortfolioReadinessAnalysis = async (username) => {
  try {
    const [userResponse, readmeRepoResponse, reposResponse] =
      await Promise.allSettled([
        githubApi.get(`/users/${username}`),

        // Profile README repository
        githubApi.get(`/repos/${username}/${username}`),

        githubApi.get(
          `/users/${username}/repos?sort=updated&per_page=6`
        ),
      ]);

    const user =
      userResponse.status === "fulfilled"
        ? userResponse.value.data
        : {};

    const nonForkRepos =
      reposResponse.status === "fulfilled"
        ? reposResponse.value.data.filter(
            (repo) => !repo.fork
          )
        : [];

    const hasPinnedRepos = nonForkRepos.length > 0;

    const hasReadmeRepo =
      readmeRepoResponse.status === "fulfilled";

    const checks = [
      {
        name: "Bio",
        status: !!user.bio?.trim(),
        score: user.bio?.trim() ? 20 : 0,
        maxScore: 20,
      },

      {
        name: "Profile Photo",
        status: !!user.avatar_url,
        score: user.avatar_url ? 20 : 0,
        maxScore: 20,
      },

      {
        name: "Website",
        status: !!user.blog?.trim(),
        score: user.blog?.trim() ? 20 : 0,
        maxScore: 20,
      },

      {
        name: "README Quality",
        status: hasReadmeRepo,
        score: hasReadmeRepo ? 20 : 0,
        maxScore: 20,
      },

      {
        name: "Pinned Repos",
        status: hasPinnedRepos,
        score: hasPinnedRepos ? 20 : 0,
        maxScore: 20,
      },
    ];

    return {
      score: checks.reduce(
        (sum, item) => sum + item.score,
        0
      ),

      completed: checks.filter(
        (item) => item.status
      ).length,

      total: checks.length,

      checks,
    };
  } catch (error) {
    githubErrorHandler(
      error,
      "Failed to fetch portfolio readiness."
    );
  }
};

const getMostStarredRepository = async (username) => {
  try {
    const { data: repos } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    if (!repos.length) {
      return null;
    }

    const mostStarredRepo = repos.reduce((best, repo) => {
      if (repo.stargazers_count > best.stargazers_count) {
        return repo;
      }

      if (
        repo.stargazers_count === best.stargazers_count &&
        new Date(repo.updated_at) > new Date(best.updated_at)
      ) {
        return repo;
      }

      return best;
    }, repos[0]);

    return {
      name: mostStarredRepo.name,
      html_url: mostStarredRepo.html_url,
      stars: mostStarredRepo.stargazers_count,
      language: mostStarredRepo.language || "Unknown",
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch most starred repository.");
  }
};

const getMostForkedRepository = async (username) => {
  try {
    const { data: repos } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    if (!repos.length) {
      return null;
    }

    const mostForkedRepo = repos.reduce((best, repo) => {
      if (repo.forks_count > best.forks_count) {
        return repo;
      }

      if (
        repo.forks_count === best.forks_count &&
        new Date(repo.updated_at) > new Date(best.updated_at)
      ) {
        return repo;
      }

      return best;
    }, repos[0]);

    return {
      name: mostForkedRepo.name,
      html_url: mostForkedRepo.html_url,
      forks: mostForkedRepo.forks_count,
      language: mostForkedRepo.language || "Unknown",
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch most forked repository.");
  }
};

const getActivityStatus = async (username) => {
  try {
    const { data } = await githubApi.get(
      `/users/${username}/repos?per_page=100`,
    );

    const repos = data.filter((repo) => !repo.fork);

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let commitCount = 0;
    let lastActive = null;

    const commitDays = new Set();

    const commitRequests = repos.map((repo) =>
      githubApi
        .get(`/repos/${username}/${repo.name}/commits?per_page=100`)
        .then((res) => res.data),
    );

    const results = await Promise.allSettled(commitRequests);

    results.forEach((result) => {
      if (result.status !== "fulfilled") {
        return;
      }

      result.value.forEach((commit) => {
        const commitDate = new Date(commit.commit.author.date);

        if (!lastActive || commitDate > new Date(lastActive)) {
          lastActive = commit.commit.author.date;
        }

        const day = commitDate.toISOString().split("T")[0];

        commitDays.add(day);

        if (commitDate >= thirtyDaysAgo) {
          commitCount++;
        }
      });
    });

    let status = "Inactive";

    if (commitCount >= 20) {
      status = "Highly Active";
    } else if (commitCount >= 10) {
      status = "Moderate";
    } else if (commitCount >= 1) {
      status = "Low";
    }

    let streak = 0;

    const currentDate = new Date();

    while (true) {
      const day = currentDate.toISOString().split("T")[0];

      if (!commitDays.has(day)) {
        break;
      }

      streak++;

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      status,
      commitCount,
      streak,
      lastActive,
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to fetch activity status.");
  }
};

const getDeveloperScore = async (username) => {
  try {
    const [profile, repository, portfolio, activity] = await Promise.all([
      getProfileAnalysis(username),
      getRepositoryAnalysis(username),
      getPortfolioReadinessAnalysis(username),
      getActivityStatus(username),
    ]);

    let score = 0;

    /* Followers */
    if (profile.followers >= 20) score += 10;
    else if (profile.followers >= 10) score += 8;
    else if (profile.followers >= 5) score += 6;
    else if (profile.followers >= 1) score += 3;

    /* Repositories */
    if (repository.total_repos >= 20) score += 20;
    else if (repository.total_repos >= 15) score += 15;
    else if (repository.total_repos >= 10) score += 10;
    else if (repository.total_repos >= 5) score += 5;

    /* Stars */
    if (repository.total_stars >= 20) score += 10;
    else if (repository.total_stars >= 10) score += 8;
    else if (repository.total_stars >= 5) score += 6;
    else if (repository.total_stars >= 1) score += 3;

    /* Forks */
    if (repository.total_forks >= 10) score += 10;
    else if (repository.total_forks >= 5) score += 8;
    else if (repository.total_forks >= 1) score += 4;

    /* Activity */
    if (activity.status === "Highly Active") {
      score += 25;
    } else if (activity.status === "Moderate") {
      score += 15;
    } else if (activity.status === "Low") {
      score += 5;
    }

    /* Portfolio */
    score += Math.round(portfolio.score * 0.25);

    score = Math.min(score, 100);

    let level = "Beginner";

    if (score >= 80) {
      level = "Expert";
    } else if (score >= 60) {
      level = "Advanced";
    } else if (score >= 40) {
      level = "Intermediate";
    }

    return {
      score,
      level,
    };
  } catch (error) {
    githubErrorHandler(error, "Failed to calculate developer score.");
  }
};

module.exports = {
  getGithubProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
  getActivityAnalysis,
  getRepositoryQualityAnalysis,
  getPortfolioReadinessAnalysis,
  getMostStarredRepository,
  getMostForkedRepository,
  getActivityStatus,
  getDeveloperScore,
};
