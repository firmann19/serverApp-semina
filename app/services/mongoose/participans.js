const Orders = require("../../api/v1/orders/model");
const Payments = require("../../api/v1/payments/model");
const Events = require("../../api/v1/events/model");
const Participant = require("../../api/v1/participants/model");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../../errors");

const { createTokenParticipant, createJWT } = require("../../utils");

const { otpMail } = require("../mail");

const signupParticipant = async (req) => {
  const { firstName, lastName, email, password, role } = req.body;

  // jika email dan status tidak aktif
  let result = await Participant.findOne({
    email,
    status: "tidak aktif",
  });

  // Jika email sudah ada, tetapi status tidak aktif maka akan dikirin kode otp ulang
  if (result) {
    result.firstName = firstName;
    result.lastName = lastName;
    result.role = role;
    result.email = email;
    result.password = password;
    result.otp = Math.floor(Math.random() * 9999);
    await result.save();
  } else {
    // Jika signup false, maka akan disuruh buat ulang dan dikirim kode otp setelah signup ulang
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

  delete result._doc.password;
  delete result._doc.otp;

  return result;
};

const activateParticipant = async (req) => {
  // Membuat request body untuk otp dan email
  const { otp, email } = req.body;

  // Melakukan check terhadap email
  const check = await Participant.findOne({
    email,
  });

  // Jika emailnya tidak ada maka akan memberikan message dari NotFoundError
  if (!check) throw new NotFoundError("Partisipan belum terdaftar");

  // Jika emailnya ada, tetapi kode otp nya salah maka akan memberikan message dari BadRequestError
  if (check && check.otp !== otp) throw new BadRequestError("Kode otp salah");

  // Jika check sukses maka akan dibuat status menjadi aktif pada participants berdasarkan id
  const result = await Participant.findByIdAndUpdate(
    check._id,
    {
      status: "aktif",
    },
    { new: true }
  );

  delete result._doc.password;

  return result;
};

const signinParticipant = async (req) => {
  // Membuat request body untuk email dan password
  const { email, password } = req.body;

  // melakukan check, jika email dan password tidak ada maka akan memberikan message BadRequestError
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  
  // melakukan check participant berdasarkan email
  const result = await Participant.findOne({ email: email });

  // Jika participant tidak ada, maka akan memberikan message UnauthorizedError
  if (!result) {
    throw new UnauthorizedError("Invalid Credentials");
  }

  // Jika participant ada, tetapi statusnya tidak aktif maka akan diberikan message "Akun anda belum aktif"
  if (result.status === "tidak aktif") {
    throw new UnauthorizedError("Akun anda belum aktif");
  }

  // Jika password benar, maka akan di compare
  const isPasswordCorrect = await result.comparePassword(password);

  // Jika password salah, maka akan diberikan message pada UnauthorizedError
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid Credentials");
  }

  // setelah password di compare, maka akan dibuatkan token
  const token = createJWT({ payload: createTokenParticipant(result) });

  return token;
};

const getAllEvents = async (req) => {
  // Menampilkan seluruh event yang mempunyai status published
  const result = await Events.find({ statusEvent: "Published" })
    .populate("category") // path berdasarkan referensi field category yang ada pada model event
    .populate("image") // path berdasarkan referensi field image yang ada pada model event
    .select("_id title date tickets venueName"); // Fungsi select bagian ini untuk menampilkan getAllEvents berdasarkan (_id title date tickets venueName)

  return result;
};

const getOneEvents = async (req) => {
  // Membuat request params berdasarkan id
  const { id } = req.params;

  // Menampilkan event berdasarkan id yang dipanggil/request
  const result = await Events.findOne({ _id: id })
    .populate("category") // path berdasarkan referensi field category yang ada pada model event
    .populate({ path: "talent", populate: "image" }) // path berdasarkan referensi field talent dan melakukan populate image
    .populate("image"); // path berdasarkan referensi field image yang ada pada model event

  // Jika event yang dipangil berdasarkan id tidak ada, maka akan memberikan message NotFoundError
  if (!result) throw new NotFoundError(`Tidak ada acara dengan id :  ${id}`);

  return result;
};

const getAllOrders = async (req) => {
  console.log(req.participant)
  // Menampilkan semua order berdasarkan id participant
  const result = await Orders.find({ participant: req.participant.id });
  return result;
};

const checkoutOrder = async (req) => {
  const { event, personalDetail, payment, tickets } = req.body;

  const checkingEvent = await Events.findOne({ _id: event });
  if (!checkingEvent) {
    throw new NotFoundError("Tidak ada acara dengan id : " + event);
  }

  const checkingPayment = await Payments.findOne({ _id: payment });

  if (!checkingPayment) {
    throw new NotFoundError(
      "Tidak ada metode pembayaran dengan id :" + payment
    );
  }

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

const getAllPaymentByOrganizer = async (req) => {
  const { organizer } = req.params;

  const result = await Payments.find({ organizer: organizer });

  return result;
};

module.exports = {
  signupParticipant,
  activateParticipant,
  signinParticipant,
  getAllEvents,
  getOneEvents,
  getAllPaymentByOrganizer,
  checkoutOrder,
  getAllOrders,
};
