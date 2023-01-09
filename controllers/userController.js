const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

const unlinkAsync = promisify(fs.unlink);

// upload image processing

// use below function if we dont want to save photo
// directly into our filesystem
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // first argument is error if its there 2nd is destination
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });
// use below function if want to first store file in buffer
// than process later (here we want to resize it)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // null means no error and true means we can proceed
    } else {
        cb(new AppError('Not an image. Please upload only image!', 400), false);
    }
};
const upload = multer({ fileFilter, storage });
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    // if no photo is there
    if (!req.file) {
        return next();
    }

    // we store name to use in update me function
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500) // it also reduces the file size to great extent say sometimes 1.5 MB to 150 KB
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) // after resize again reducing percentage from 1 to 100
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});
const filterObj = (body, ...fieldKeep) => {
    const obj = {};
    Object.keys(body).forEach(el => {
        if (fieldKeep.includes(el)) {
            obj[el] = body[el];
        }
    });
    return obj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'You do not have access to change password, if you want then go to /updateMyPassword',
                401
            )
        );
    }
    // filtered out unwanted files that are not allowed
    const filteredBody = filterObj(req.body, 'name', 'email');
    // add image file name additionally if it exists
    if (req.file) {
        filteredBody.photo = req.file.filename;
    }

    // note here we are not using because then either all validator run
    // or we can turn all off hence we are using particular function
    // so that only their validaror will run
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    // remove old image from file system only if new exists and it is not default one
    if (req.file && req.user.photo !== 'default.jpg') {
        // Delete the file like normal
        try {
            await unlinkAsync(`public/img/users/${req.user.photo}`);
        } catch (err) {
            console.log(err);
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    // get the user id using privous middleware as (req.user.id) and delete it
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
