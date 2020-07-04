const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
  canRegister: {
    type: Boolean,
    default: true,
    required: true
  }
});

module.exports = mongoose.model('Permission', PermissionSchema);