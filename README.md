# status-dashboard
Web application displaying data availability and profile conformity of OpenActive endpoints

Using `node` version `13.9`. Project uses standard `express-generator` conventions.

# Install

`$ npm install`

# Run the app (developer)

`$ npm run start-dev `

# Run the app (production)

`$ npm run start`

# Configuration

## Environment variables

* `GITHUB_API_KEY` a GitHub API Key that can be used to query open issues boards using the GraphQL GitHub API.
*  `PORT` the web server port


# Heroku for production

## Initial Setup

Create a new app in the "Europe" region.

Go to "Settings" and "Reveal Config Vars".

Add a Config var and value named `GITHUB_API_KEY` for the corresponding Environment variable.

Do a deploy. If you link your GitHub account you can press a button in the web interface to do this, or you set up the heroku CLI tool. 
Either is fine.

That's it!

## Updating app

Deploy the latest code.

If you link your GitHub account you can press a button in the web interface to do this, or you set up the heroku CLI tool. 
Either is fine.
