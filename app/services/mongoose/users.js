const Users = require("../../api/v1/users/model");
const Organizers = require("../../api/v1/organizers/model");
const { BadRequestError } = require("../../errors");

// function Organizers
const createOrganizer = async(req) => {
    const { organizer, role, email, password, confirmPassword, name } = req.body;

    if (password !== confirmPassword) {
        throw new BadRequestError("Password dan confirmPassword tidak cocok");
    }

    const result = await Organizers.create({ organizer });

    const users = await Users.create({
        email,
        name,
        password,
        organizer: result._id,
        role,
    });

    // _doc manipulasi data yang ada di hasil result
    delete users._doc.password;

    return users;
};

// function users
const createUsers = async(req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
        throw new BadRequestError("Password dan confirmPassword tidak cocok");
    }

    const result = await Users.create({
        name,
        email,
        organizer: req.user.organizer,
        password,
        role,
    });

    return result;
};

const getAllUsers = async(req) => {
    const result = await Users.find();

    return result;
};

module.exports = { createOrganizer, createUsers, getAllUsers };