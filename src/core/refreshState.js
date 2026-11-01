export let isBrowserRefresh=performance.getEntriesByType('navigation')[0]?.type==='reload';
export function finishBrowserRefresh(){isBrowserRefresh=false;}
