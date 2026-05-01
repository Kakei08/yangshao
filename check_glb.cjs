const fs = require('fs');
const buffer = fs.readFileSync('public/model.glb');
const magic = buffer.readUInt32LE(0);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);
const chunk0Length = buffer.readUInt32LE(12);
const chunk0Type = buffer.readUInt32LE(16);
console.log({
  magic: magic.toString(16),
  version,
  length,
  chunk0Length,
  chunk0Type: chunk0Type.toString(16),
  actualFileSize: buffer.length
});
