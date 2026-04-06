import fetch from 'node-fetch';

async function test() {
  const query = `[out:json];(way["building"](around:400,41.8845,-87.6244);relation["building"](around:400,41.8845,-87.6244););out geom;`;
  const encodedQuery = encodeURIComponent(query);
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodedQuery,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
