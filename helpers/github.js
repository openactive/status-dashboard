const { Octokit } = require("@octokit/rest");

/**
 * Fetch the count of open issues for a GitHub repository.
 * 
 * @param {string} apiKey - Your GitHub API key for authentication.
 * @param {string} issuesBoardUrl - The URL of the GitHub repository's issues board.
 * @returns {Promise<number>} The total count of open issues.
 */
async function fetchIssueCount(apiKey, issuesBoardUrl) {
  // Parse the GitHub repository owner and name from the issuesBoardUrl
  const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
  if (!issuesBoardUrl) throw new Error('GitHub Issue Board URL was not provided');
  const match = issuesBoardUrl.match(urlPattern);
  if (!match) throw new Error('Invalid GitHub Issue Board URL');

  const [, owner, repo] = match;

  const octokit = new Octokit({
    auth: apiKey,
  });

  const graphqlQuery = `
    query repositoryIssues($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        issues(states: OPEN) {
          totalCount
        }
      }
    }   
  `;

  const response = await octokit.graphql(graphqlQuery, {
    owner,
    repo,
  });

  return response.repository.issues.totalCount;
}

module.exports = { fetchIssueCount };