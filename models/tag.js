const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  tags: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model('Tag', TagSchema);