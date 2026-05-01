import fs from 'fs';

const buffer = fs.readFileSync('public/assests/model.glb');
console.log('Size:', buffer.length);
console.log('Magic:', buffer.toString('utf8', 0, 4));
console.log('Version:', buffer.readUInt32LE(4));
console.log('Length:', buffer.readUInt32LE(8));
