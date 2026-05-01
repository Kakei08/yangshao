import fs from 'fs';

try {
  const stats = fs.statSync('./public/assests/model.glb');
  console.log('model.glb size:', stats.size);
  const buffer = fs.readFileSync('./public/assests/model.glb');
  console.log('first 16 bytes:', buffer.subarray(0, 16));
} catch (e) {
  console.error(e);
}
