const multer = require('multer');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const multerInstance = multer({ storage });

//middleware for avatrar upload
const multerUpload = multer({ storage }).single('avatar'); // 'avatar' must match the field name from the frontend

// middleware for stories upload
const storyUpload = multerInstance.single('story');


module.exports = { multerUpload, storyUpload };