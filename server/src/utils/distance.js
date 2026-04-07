function getDistance(u1, u2) {
  return Math.sqrt(Math.pow(u2.x - u1.x, 2) + Math.pow(u2.y - u1.y, 2));
}

module.exports = {
  getDistance
};
