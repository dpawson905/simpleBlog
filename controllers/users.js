module.exports = {
  async getProfile(req, res, next) {
    res.send('Profile index page');
  },

  async getEditProfile(req, res, next) {
    res.send('Edit profile page');
  },

  async putEditProfile(req, res, next) {
    res.send('Update profile PUT');
  },

  async putUpdatePassword(req, res, next) {
    res.send('Update password PUT');
  },

  async removeAccount(req, res, next) {
    res.send('Delete profile');
  }
}