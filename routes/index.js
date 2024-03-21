const express = require('express');
const hbs = require('hbs');
const { getAllDatasets } = require('@openactive/dataset-utils');
const { fetchIssueCount } = require('../helpers/github.js');
const { checkFeedIsValidJSON } = require('../helpers/feedChecker.js');

const catalogUrls = [
  'https://openactive.io/data-catalogs/data-catalog-collection.jsonld',
  'https://openactive.io/data-catalogs/data-catalog-collection-preview.jsonld',
  'https://openactive.io/data-catalogs/data-catalog-collection-test.jsonld'
];

const refreshTimestamp = new Date().toUTCString();

const datasetCatalogs = [];

function renderLegendMissingName(name, url) {
  // If a Legend provider that's missing data, extract "hcandl" from the Legend URL e.g. "https://hcandl-openactive.legendonlineservices.co.uk/openactive/";
  if (name === ' Sessions and Facilities') {
    // Use a regex pattern to extract the desired part
    const regex = /https:\/\/(.*?)-openactive/;
    const match = url.match(regex);

    // If there's a match, the desired part will be in the first capturing group
    const extractedPart = match ? match[1] : name;

    return extractedPart;
  }
  return name;
}

// Get data for all catalogs asynchronously
(async () => {
  const catalogs = await Promise.all(catalogUrls.map(url => getAllDatasets(url)));
  datasetCatalogs.push(...catalogs);

  // Fetch additional data for each dataset asynchronously
  datasetCatalogs.forEach(catalog => {
    // Augment the datasets with GitHub issue counts asynchronously
    catalog.datasets.forEach(async dataset => {
      console.log(`Fetching GitHub API result for ${dataset.discussionUrl}`);
      dataset.issueCount = await fetchIssueCount(process.env.GITHUB_API_KEY, dataset.discussionUrl).catch(err => {
        console.log(`GitHub API Error for Issues Board for ${dataset.discussionUrl}: ${err.message}`);
        dataset.issueBoardError = err.message;
        return "⚠️";
      });
    });

    // Check the feeds are valid JSON asynchronously
    catalog.datasets.forEach(dataset => {
      dataset.distribution?.forEach(async feed => {
        feed.status = await checkFeedIsValidJSON(feed.contentUrl).then(result => '✅').catch(err => {
          console.log(`Feed check error for ${feed.contentUrl}: ${err.message}`);
          feed.error = err.message;
          return "⚠️";
        });
      });
    });

    console.log(catalog.catalogMetadata?.name);
    //console.log(catalog.datasets);
    catalog.errors.forEach(error => {
      console.log(`Error fetching URL: ${error.url}`);
      console.log(`HTTP Status Code: ${error.status}`);
      console.log(`Message: ${error.message}`);
    });
  });
})().catch(error => {
  console.log(error);
});


var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const statusData = datasetCatalogs.map(catalog => ({
    name: catalog.catalogMetadata?.name,
    url: catalog.catalogMetadata?.url,
    description: catalog.catalogMetadata?.description,
    datasets: [].concat(
      // List datasets in alphabetical order
      catalog.datasets.map(dataset => ({
        csPublisherId: dataset['@id'],
        name: dataset.publisher?.name || renderLegendMissingName(dataset.name, dataset.url) || 'Unnamed Dataset',
        url: dataset.url,
        logoUrl: dataset.publisher?.logo?.url,
        license: dataset.license,
        issueCount: dataset.issueCount,
        issueBoardError: dataset.issueBoardError,
        discussionUrl: dataset.discussionUrl,
        feeds: dataset.distribution?.map(feed => ({
          name: feed.name ?? 'Unnamed Feed',
          url: feed.contentUrl,
          status: feed.status,
          error: feed.error,
        }))
      })).sort((a, b) => a.name.localeCompare(b.name)),
      // Create placeholders for datasets that errored, in alphabetical order
      catalog.errors.map(error => ({
        csPublisherId: error.url,
        name: error.url,
        url: error.url,
        issueCount: '⚠️',
        issueBoardError: 'The Dataset Site, which should contain the GitHub Issues Board URL, could not be retrieved',
        feeds: [{
          name: 'Unavailable Dataset',
          status: '❌',
          error: error.message,
        }]
      })).sort((a, b) => a.name.localeCompare(b.name))
    )
  }));

  let error = undefined;

  hbs.registerHelper('licenseSnippet', function (license) {
    /* Add more licenses here when needed  */
    if (typeof license === 'string' && license.indexOf("https://creativecommons.org/licenses/by/4.0") != -1) {
      const template = hbs.compile('<a href="{{license}}"><img src="images/by.png" alt="CC BY 4.0" style="height: 15px" /></a>');
      return template({ license: license });
    }
  });

  res.render('index', {
    statusData: statusData,
    error: error,
    refreshTimestamp,
  });
});

router.get('/about', async function (req, res, next) {
  let error = undefined;
  res.render('about');


});

module.exports = router;
