const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    //1 get tour data from collection
    const tours = await Tour.find();

    //2 build template
    //3 Render that template using tour data
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});
exports.getTour = catchAsync(async (req, res) => {
    // get the data, for requested tour (including reviews and guides)
    // even after adding hash at the end of slug it gives same name as before
    // console.log(req.params.slug);
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        field: 'review rating user'
    });

    //2 build template
    //3 Render that template using tour data
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLogInForm = (req, res) => {
    res.status(200).render('login', {
        titte: 'Log into your account'
    });
};
