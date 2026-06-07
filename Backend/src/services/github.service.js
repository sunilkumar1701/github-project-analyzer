const githubApi = require("../config/github.config");

const getGithubProfile = async (username) => {
  const response = await githubApi.get(
    `/users/${username}`
  );

  return response.data;
};

const getProfileAnalysis = async (
  username
) => {

  const userResponse =
    await githubApi.get(
      `/users/${username}`
    );

  const reposResponse =
    await githubApi.get(
      `/users/${username}/repos?sort=updated&per_page=1`
    );

  const recentRepo =
    reposResponse.data[0] || null;

  return {
    followers:
      userResponse.data.followers,

    following:
      userResponse.data.following,

    public_repos:
      userResponse.data.public_repos,

    recent_repo: recentRepo
      ? {
          name: recentRepo.name,
          html_url:
            recentRepo.html_url,
          updated_at:
            recentRepo.updated_at,
        }
      : null,
  };
};

const getRepositoryAnalysis =
  async (username) => {

    const reposResponse =
      await githubApi.get(
        `/users/${username}/repos?per_page=100`
      );

    const repos =
      reposResponse.data;

    const totalRepos =
      repos.length;

    const totalStars =
      repos.reduce(
        (total, repo) =>
          total +
          repo.stargazers_count,
        0
      );

    const totalForks =
      repos.reduce(
        (total, repo) =>
          total +
          repo.forks_count,
        0
      );

    const topRepo =
      repos.reduce(
        (best, repo) => {

          if (
            repo.stargazers_count >
            best.stargazers_count
          ) {
            return repo;
          }

          if (
            repo.stargazers_count ===
              best.stargazers_count &&
            repo.forks_count >
              best.forks_count
          ) {
            return repo;
          }

          if (
            repo.stargazers_count ===
              best.stargazers_count &&
            repo.forks_count ===
              best.forks_count &&
            new Date(
              repo.updated_at
            ) >
              new Date(
                best.updated_at
              )
          ) {
            return repo;
          }

          return best;

        },
        repos[0]
      );

    return {
      total_repos:
        totalRepos,

      total_stars:
        totalStars,

      total_forks:
        totalForks,

      top_repo: topRepo
        ? {
            name: topRepo.name,
            html_url:
              topRepo.html_url,
            stars:
              topRepo.stargazers_count,
            forks:
              topRepo.forks_count,
          }
        : null,
    };
  };

const getTechnologyStackAnalysis =
  async (username) => {

    const reposResponse =
      await githubApi.get(
        `/users/${username}/repos?per_page=100`
      );

    const repos =
      reposResponse.data;

    const languageCount = {};

    repos.forEach((repo) => {

      if (!repo.language)
        return;

      languageCount[
        repo.language
      ] =
        (languageCount[
          repo.language
        ] || 0) + 1;

    });

    const totalLanguageRepos =
      Object.values(
        languageCount
      ).reduce(
        (sum, count) =>
          sum + count,
        0
      );

    const topLanguages =
      Object.entries(
        languageCount
      )
        .map(
          ([name, count]) => ({
            name,

            value:
              Math.round(
                (count /
                  totalLanguageRepos) *
                  100
              ),

            repos: count,
          })
        )
        .sort(
          (a, b) =>
            b.repos - a.repos
        )
        .slice(0, 5);

    return {
      total_languages:
        topLanguages.length,

      top_languages:
        topLanguages,
    };
  };

module.exports = {
  getGithubProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
};