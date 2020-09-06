const catchAsync = require("../utils/catchAsync.util");
const User = require("../models/User.model");
const AppError = require("../utils/appError.util");
const filter = require("../utils/filterObj.util");
const sendEmail = require("../utils/email");
const crypto = require('crypto');
const createToken = require("../utils/createToken");
const ApiFeatures = require("../utils/apiFeatures");



exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user)return next(new AppError('User not found',404))

    res.status(200).json({
        status: 'success',
        user
    })
});

exports.sendUser = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status: 'success',
        user: req.user
    });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        users
    })
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const userData = filter(req.body, 'name', 'password', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.params.id, userData, { new: true });

    if (!updatedUser) return next(new AppError('User not Found', 404));

    res.status(200).json({
        status: 'success',
        user: updatedUser
    })
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
    const updatedAdmin = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedAdmin) return next(new AppError('User not Found', 404));

    res.status(200).json({
        status: 'success',
        user: updatedAdmin
    })
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    console.log(req)
    if (!email) return next(new AppError('Please Provide an Email', 400))

    const user = await User.findOne({ email })

    if (!user) return next(new AppError('This Email Does not exist', 404))

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateModifiedOnly: true })

    const resetUrl = `${req.headers.origin}/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a request with your new password at ${resetUrl}.\nif you did not forget your password then just ignore it.`;

    try {
        const response = await sendEmail({
            email: user.email,
            subject: 'Password reset token (valid for 30min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Please Check your Email for Token'
        });
        console.log(response)

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateModifiedOnly: true })
        console.log(error)

        return next(new AppError('Error,Sending Email.Trying again later',500))
    }


});

exports.resetPassword = catchAsync(async (req, res, next) => {
    console.log(req)
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() }
    });

    console.log(req.body)

    if(!user) return next(new AppError('Invalid Token or Token Expired',400))

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateModifiedOnly: true })

    const token = createToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
        user
    });

});

exports.userSearch = catchAsync( async(req,res,next)=>{
    const features = new ApiFeatures(User.find(),req.query).search().select('name email')
    const users    = await features.query;

    if(!users)return next(new AppError('Failed to get users',500))

    res.status(200).json({
        status: 'success',
        users
    })
});