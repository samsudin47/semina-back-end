const Participant = require("../../api/v1/participants/model");
const Events = require("../../api/v1/events/model");
const Orders = require("../../api/v1/orders/model");
const Payments = require("../../api/v1/payments/model");
const { BadRequestError, NotFoundError, Unauthorized } = require("../../errors");
const { createJWT, createTokenParticipant } = require("../../utils");
const { otpMail } = require("../mail");

const signupParticipant = async(req) => {
    const { firstName, lastName, email, password, role } = req.body;

    // jika email dan status tidak aktif
    let result = await Participant.findOne({
        email,
        status: "tidak aktif",
    });

    if (result) {
        result.firstName = firstName;
        result.lastName = lastName;
        result.role = role;
        result.email = email;
        result.password = password;
        result.otp = Math.floor(Math.random() * 9999); // kirim kode otp ulang secara random dengan 4 digit angka
        await result.save();
    } else {
        // jika false maka akan nge-create akun baru
        result = await Participant.create({
            firstName,
            lastName,
            email,
            password,
            role,
            otp: Math.floor(Math.random() * 9999),
        });
    }
    await otpMail(email, result);

    delete result._doc.password; // delete field object

    return result;
};

const activateParticipant = async(req) => {
    const { otp, email } = req.body; // waktu daftar kirim otp dan email
    const check = await Participant.findOne({
        email, // pengecekan email ada atau tidak
    });

    if (!check) throw new NotFoundError("Partisipan belum terdaftar"); // jika email belum terdaftar maka seperti ini

    if (check && check.otp !== otp) throw new BadRequestError("Kode otp salah"); // otp tidak sama dengan otp

    const result = await Participant.findByIdAndUpdate(
        check._id, {
            status: "aktif", // sukses email terdaftar
        }, {
            new: true,
        }
    );

    delete result._doc.password;
    delete result._doc.otp;
    return result;
};

const signinParticipant = async(req) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }

    const result = await Participant.findOne({ email: email });

    if (!result) {
        throw new Unauthorized("Invalid Credentials");
    }

    if (result.status === "tidak aktif") {
        throw new Unauthorized("Akun anda belum aktif");
    }

    const isPasswordCorrect = await result.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new Unauthorized("Invalid Credentials");
    }

    const token = createJWT({ payload: createTokenParticipant(result) });

    return token;
};

const getAllEvents = async(req) => {
    const result = await Events.find({ statusEvent: "Published" }).populate("category").populate("image").select("_id title date tickets venueName");

    return result;
};

const getOneEvent = async(req) => {
    const { id } = req.params;
    const result = await Events.findOne({ _id: id }).populate("category").populate({ path: "talent", populate: "image" }).populate("image");

    if (!result) throw new NotFoundError(`Tidak ada acara dengan id : ${id}`);

    return result;
};

const getAllOrders = async(req) => {
    console.log(req.participant);
    const result = await Orders.find({ participant: req.participant.id });
    return result;
};

/**
 * Tugas Send email invoice
 * TODO : Ambil data email dari personal detail
 **/

const checkoutOrder = async(req) => {
    const { event, personalDetail, payment, tickets } = req.body;

    // check id event ada atau tidak
    const checkingEvent = await Events.findOne({ _id: event });
    if (!checkingEvent) {
        throw new NotFoundError("Tidak ada acara dengan id :" + event);
    }

    // check payment method ada atau tidak
    const checkingPayment = await Payments.findOne({ _id: payment });
    if (!checkingPayment) {
        throw new NotFoundError("Tidak ada metode pembayaran dengan id :" + payment);
    }

    // logika dari kode dibawah
    // misal :
    // {
    //      type = a
    //      price = 1000
    //      sumTicket = 1

    //      type = b
    //      price = 1000
    //      sumTicket = 1

    //      let total = 2000
    //      total = total + (price * sumTicket)
    //  }
    let totalPay = 0,
        totalOrderTicket = 0;
    await tickets.forEach((tic) => {
        checkingEvent.tickets.forEach((ticket) => {
            if (tic.ticketCategories.type === ticket.type) {
                if (tic.sumTicket > ticket.stock) {
                    throw new NotFoundError("Stock event tidak mencukupi");
                } else {
                    ticket.stock -= tic.sumTicket;

                    totalOrderTicket += tic.sumTicket;
                    totalPay += tic.ticketCategories.price * tic.sumTicket;
                }
            }
        });
        console.log(totalPay);
    });
    await checkingEvent.save();

    const historyEvent = {
        title: checkingEvent.title,
        date: checkingEvent.date,
        about: checkingEvent.about,
        tagline: checkingEvent.tagline,
        keyPoint: checkingEvent.keyPoint,
        venueName: checkingEvent.venueName,
        tickets: tickets,
        image: checkingEvent.image,
        category: checkingEvent.category,
        talent: checkingEvent.talent,
        organizer: checkingEvent.organizer,
    };

    const result = new Orders({
        date: new Date(),
        personalDetail: personalDetail,
        totalPay,
        totalOrderTicket,
        orderItems: tickets,
        participant: req.participant.id,
        event,
        historyEvent,
        payment,
    });

    await result.save();
    return result;
};

const getAllPaymentsByOrganizer = async(req) => {
    const { organizer } = req.params;

    const result = await Payments.find({ organizer: organizer });

    return result;
};

module.exports = { signupParticipant, activateParticipant, signinParticipant, getAllEvents, getOneEvent, getAllOrders, checkoutOrder, getAllPaymentsByOrganizer };