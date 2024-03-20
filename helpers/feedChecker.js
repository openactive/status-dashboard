const axios = require('axios');

/*
* Handle rate limits (429) with random backoff, to avoid causing a thundering herd
* System-specific workaround: Note that rate limits in Legend can cause this request to fail with a 403 (?), so we retry up to 5 times
* TODO: Ask Legend to return a 429 instead
*/
async function axiosGetWithRetry(url) {
  let response;
  const maxRetries = 5; // Define a maximum number of retries

  async function sleep(milliseconds) {
    return new Promise((resolve) => { setTimeout(resolve, milliseconds); });
  }

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      response = await axios.get(url, { timeout: 60000 });
      break; // Exit the loop if the request was successful
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 429) && attempt < maxRetries - 1) {
        // Log a warning and retry after sleeping for a random duration between 1 and 20 seconds
        // A random duration is used to avoid clients retrying at the same time and causing a thundering herd,
        // particularly when a single service is serving multiple datasets.
        console.warn(`Attempt ${attempt + 1}: Access forbidden (403) for URL: ${url}. Retrying...`);
        await sleep(1000 + Math.random() * 19000); // Sleep for 1 to 20 seconds
      } else {
        throw error;
      }
    }
  }
  return response;
}

/**
 * Check if the URL returns valid JSON.
 * 
 * @param {string} feedUrl - The URL of the feed to check.
 * @returns {Promise<boolean>} True if the URL returns valid JSON, or throws an error otherwise.
 */
async function checkFeedIsValidJSON(feedUrl) {
  if (!feedUrl) throw new Error('Feed URL was not provided');

  try {
    const response = await axiosGetWithRetry(feedUrl);
    
    // Axios automatically attempts to parse JSON, so if this line is reached,
    // the response was successfully parsed as JSON.
    return true;
  } catch (error) {
    // If the request failed or the response couldn't be parsed as JSON,
    // Axios will throw an error.
    throw new Error(`Invalid JSON or could not fetch feed: ${error.message}`);
  }
}

module.exports = { checkFeedIsValidJSON };