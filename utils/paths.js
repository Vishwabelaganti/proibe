// Utility function to get the correct path for GitHub Pages deployment
export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/proibe' : '';
}

export function getFullPath(path) {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}
