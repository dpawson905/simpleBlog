module.exports = {
  getIndex(req, res, next) {
    const userCheck = ''
    res.render('index', {
      url: 'home',
      userCheck
    });
  }
}