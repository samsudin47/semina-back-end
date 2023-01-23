// import services images
const { StatusCodes } = require("http-status-codes");
const { createImages } = require("../../../services/mongoose/images");

const create = async(req, res) => {
    try {
        const result = await createImages(req);

        res.status(StatusCodes.CREATED).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { create };