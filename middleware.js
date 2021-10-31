const wait = (ms) => new Promise((resolve) => setTimeout(() => {
  resolve();
}, ms));

module.exports = async (req, res, next) => {
  await wait(500); // slow down dem requests
  next();
};
