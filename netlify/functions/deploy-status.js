const siteId = process.env.NETLIFY_SITE_ID
const token = process.env.NETLIFY_TOKEN
const fetch = require('node-fetch')

const handler = async event => {
  try {
    const endpoint = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`
    const result = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await result.json()
    // first entry is last deploy
    const lastDeploy = data[0]
    // it contains a lot more info then we need
    const deploy = {
      state: lastDeploy.state,
      created_at: lastDeploy.created_at,
      updated_at: lastDeploy.updated_at,
      error_message: lastDeploy.error_message,
      published_at: lastDeploy.published_at,
      deploy_time: lastDeploy.deploy_time,
      screeenshot_url: lastDeploy.screeenshot_url,
    }

    return {
      statusCode: 200,
      body: JSON.stringify(deploy),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
