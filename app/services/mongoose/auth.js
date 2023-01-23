const Users = require("../../api/v1/users/model");
const { BadRequestError, Unauthorized } = require("../../errors");
const { createTokenUser, createJWT } = require("../../utils");

// login mengirim dua field yaitu email dan password
const signin = async(req) => {
    const { email, password } = req.body;

    // notif jika email dan password tidak ada maka di perintahkan isi email dan password
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }

    // pencarian email ada atau tidak menggunakan findOne
    const result = await Users.findOne({ email: email });

    // jika email tidak ada maka invalid credential
    if (!result) {
        throw new Unauthorized("Invalid Credentials");
    }

    // cek password panggil comparePassword dari methods /users/model
    const isPasswordCorrect = await result.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new Unauthorized("Invalid Credentials");
    }
    const token = createJWT({ payload: createTokenUser(result) });

    return token;
};

module.exports = { signin };