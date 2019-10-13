// get the query variables from the URL
export const getQueryVar = (variable) => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
};

export const viewportToPixels = (value) => {
  const parts = value.match(/([0-9\.]+)(vh|vw)/);
  const q = Number(parts[1]);
  const side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]];
  return side * (q / 100);
};
