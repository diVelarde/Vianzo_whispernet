// frontend/src/utils/index.js

export function createPageUrl(pageName) {
  // Convert a page name like "Feed" into a URL path
  return `/${pageName.toLowerCase()}`;
}
