import { useState, useEffect, useCallback } from 'react'

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }, [deferred])

  return { canInstall: !!deferred, promptInstall }
}
