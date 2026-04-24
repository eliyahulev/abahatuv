import { useState, useEffect, useCallback } from 'react'

function detectStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectPlatform() {
  const ua = navigator.userAgent || ''
  const isIOS = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream
  const isAndroid = /Android/i.test(ua)
  // crude: if no beforeinstallprompt support AND it's Safari on macOS, we still show manual steps
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua)
  return { isIOS, isAndroid, isSafari }
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [standalone, setStandalone] = useState(() => detectStandalone())
  const [platform] = useState(() => detectPlatform())

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => {
      setDeferred(null)
      setStandalone(true)
    }
    const mq = window.matchMedia?.('(display-mode: standalone)')
    const onDisplayChange = () => setStandalone(detectStandalone())
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    mq?.addEventListener?.('change', onDisplayChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      mq?.removeEventListener?.('change', onDisplayChange)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unsupported'
    deferred.prompt()
    const result = await deferred.userChoice
    setDeferred(null)
    return result?.outcome || 'dismissed'
  }, [deferred])

  // show the button as long as the app isn't already installed
  const canInstall = !standalone
  const hasNativePrompt = !!deferred

  return { canInstall, hasNativePrompt, promptInstall, isIOS: platform.isIOS, isSafari: platform.isSafari }
}
