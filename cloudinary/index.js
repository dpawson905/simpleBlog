const crypto = require('crypto');
const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'campcloud',
	api_key: '687951443796369',
	api_secret: process.env.CLOUDINARY_SECRET,
	url: process.env.CLOUDINARY_URL
});
const cloudinaryStorage = require('multer-storage-cloudinary');
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'Simple-Blog',
	allowedFormats: ['jpeg', 'jpg', 'png'],
	// transformation: {
	// 	width: 800,
	// 	height: 600
	// },
  filename: function (req, file, cb) {
  	let buf = crypto.randomBytes(16);
  	buf = buf.toString('hex');
  	let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/ig, '');
  	uniqFileName += buf;
    cb(undefined, uniqFileName );
  }
});

module.exports = {
	cloudinary,
	storage
}