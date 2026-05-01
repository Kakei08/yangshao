import http from 'http';
http.get('http://localhost:3000/model.gltf', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body start:', data.slice(0, 50)));
}).on('error', console.error);
