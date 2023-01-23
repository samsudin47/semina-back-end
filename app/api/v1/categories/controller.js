const { getAllCategories, createCategories, getOneCategories, updateCategories, deleteCategories } = require("../../../services/mongoose/categories");
const { StatusCodes } = require("http-status-codes");

const create = async(req, res, next) => {
    try {
        const result = await createCategories(req);

        res.status(StatusCodes.CREATED).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const index = async(req, res, next) => {
    try {
        const result = await getAllCategories(req);
        res.status(StatusCodes.OK).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const find = async(req, res, next) => {
    try {
        const result = await getOneCategories(req);

        res.status(StatusCodes.OK).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const update = async(req, res, next) => {
    try {
        // cari dan update categories berdasarkan field _id
        const result = await updateCategories(req); //menampilkan data baru dan menjalankan validation

        res.status(StatusCodes.OK).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const destroy = async(req, res, next) => {
    try {
        const result = await deleteCategories(req);
        res.status(StatusCodes.OK).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    index,
    find,
    create,
    update,
    destroy,
};