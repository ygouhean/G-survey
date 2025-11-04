/**
 * Utilitaire de navigation pour les services qui n'ont pas accès à React Router
 * Utilise un système d'événements pour déclencher la navigation depuis n'importe où
 */

let navigationHandler: ((path: string) => void) | null = null

export const setNavigationHandler = (handler: (path: string) => void) => {
  navigationHandler = handler
}

export const navigateTo = (path: string) => {
  if (navigationHandler) {
    navigationHandler(path)
  } else {
    // Fallback: utiliser window.location seulement si aucun handler n'est défini
    // Cela ne devrait jamais arriver en production
    console.warn('Navigation handler not set, using window.location as fallback')
    window.location.href = path
  }
}

