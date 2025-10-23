const Hashids = require('hashids/cjs');

const hashids = new Hashids(
  process.env.HASHIDS_SALT || 'mi-salt-super-secreto',
  10,
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
);

exports.encodeId = (id) => {
  return hashids.encode(id);
};

exports.decodeId = (hash) => {
  const decoded = hashids.decode(hash);
  return decoded.length > 0 ? decoded[0] : null;
};