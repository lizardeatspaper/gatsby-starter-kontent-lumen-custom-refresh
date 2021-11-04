import React, { useCallback, useEffect, useState } from 'react'
import { graphql, StaticQuery } from 'gatsby'
import Helmet from 'react-helmet'
import '../../assets/scss/init.scss'
import KontentSmartLink from '@kentico/kontent-smart-link'

const Layout = ({ children }) => {
  const [rebuildInProgress, setRebuildInProgress] = useState()

  const triggerRebuildOnNetlify = useCallback(() => new Promise(resolve => {
    fetch('https://api.netlify.com/build_hooks/6183ab39ae22a8a709d1e818?trigger_title=autorefresh', {
      method: 'POST',
    }).then(() => {
      async function checkDeployStatus() {
        const buildReq = await fetch('/.netlify/functions/deploy-status')
        const buildData = await buildReq.json()

        setRebuildInProgress(buildData.state !== 'ready')

        if (buildData.state === 'ready') {
          resolve()
        } else {
          setTimeout(checkDeployStatus, 3000)
        }
      }

      checkDeployStatus()
    })
  }), [setRebuildInProgress])

  useEffect(() => {
    const plugin = KontentSmartLink.initialize({
      queryParam: 'preview-mode',
    })

    plugin.on('refresh', (data, metadata, originalReload) => {
      triggerRebuildOnNetlify().then(originalReload)
    })

    return () => {
      plugin.destroy()
    }
  }, [triggerRebuildOnNetlify])

  return (
    <StaticQuery
      query={graphql`
        {
          sitePlugin(name: { eq: "@kentico/gatsby-source-kontent" }) {
            pluginOptions {
              projectId
              languageCodenames
            }
          }
        }
      `}
      render={data => (
        <div
          className="layout"
          data-kontent-project-id={data.sitePlugin.pluginOptions.projectId}
          data-kontent-language-codename={
            data.sitePlugin.pluginOptions.languageCodenames[0]
          }
        >
          <Helmet defaultTitle="Blog by John Doe">
            <link href="/favicon.ico" rel="shortcut icon" type="image/x-icon" />
          </Helmet>
          {rebuildInProgress && (
            <div style={{
              background: 'red', color: 'white', fontSize: '13px', padding: '10px', position: 'fixed', top: '0', left: '0', width: '100%',
            }}
            >
              Netlify rebuild in progress
            </div>
          )}
          {children}
        </div>
      )}
    />
  )
}

export default Layout
