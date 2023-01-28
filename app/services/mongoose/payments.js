const Payments = require("../../api/v1/payments/model");
const { checkingImage } = require("./images");

const { NotFoundError, BadRequestError } = require("../../errors");

const getAllPayments = async (req) => {
  // Menampung objek berupa organizer yang sedang login
  let condition = { organizer: req.user.organizer };

  // Melakukan find getAllPayment 
  const result = await Payments.find(condition)
    .populate({
      path: "image",  // path berdasarkan referensi field image yang ada pada model payment
      select: "_id name", // select/pemilihan berdasarkan id dan name pada field image dibagian model payment
    })
    .select("_id type status image"); // select/pemilihan berdasarkan (id, type, status, image) pada model payment

  // Melakukan return terhadap result getAllPayment
  return result;
};

const createPayments = async (req) => {
  // Melakukan request body bersarkan type dan image
  const { type, image } = req.body;

  // Melakukan check image
  await checkingImage(image);

  // Melakukan check payment berdasarkan organizer yang login
  const check = await Payments.findOne({ type, organizer: req.user.organizer });

  // Jika saat check ditemukan payment sudah ada, maka akan diberikan msg "Tipe pembayaran duplikat"
  if (check) throw new BadRequestError("Tipe pembayaran duplikat");

  // Melakukan create payment berdasarkan organizer yang login
  const result = await Payments.create({
    image,
    type,
    organizer: req.user.organizer,
  });

  // Mengembalikan return result
  return result;
};

const getOnePayments = async (req) => {
  // Mmebuat request params berdasarkan id
  const { id } = req.params;

  // Melakukan findOne payment berdasarkan organizer yang login
  const result = await Payments.findOne({
    _id: id,
    organizer: req.user.organizer,
  })
    .populate({
      path: "image", // path berdasarkan referensi field image yang ada pada model payment
      select: "_id name",  // select/pemilihan berdasarkan id dan name pada field image dibagian model payment
    })
    .select("_id type status image"); // select/pemilihan berdasarkan (id, type, status, image) pada model payment

  // Jika result tidak ada, maka akan menampilkan message `Tidak ada tipe pembayaran dengan id :  ${id}`
  if (!result)
    throw new NotFoundError(`Tidak ada tipe pembayaran dengan id :  ${id}`);

  // Melakukan return terhadap result getOnePayment
  return result;
};

const updatePayments = async (req) => {
  // Membuat req.params untuk id dan req.body untuk type dan image
  const { id } = req.params;
  const { type, image } = req.body;

  // Melakukan checking image
  await checkingImage(image);

  // Melakukan findOne payments berdasarkan organizer yang login
  const check = await Payments.findOne({
    type,
    organizer: req.user.organizer,
    _id: { $ne: id }, //$ne mencari semua collection pada payments kecuali id yang dipanggil
  });

  // Jika saat check payment sudah ada, maka akan memberikan msg "Tipe pembayaran duplikat" 
  if (check) throw new BadRequestError("Tipe pembayaran duplikat");

  // Melakukan findOneAndUpdate payment berdasarkan organizer yang login
  const result = await Payments.findOneAndUpdate(
    { _id: id },
    { type, image, organizer: req.user.organizer },
    { new: true, runValidators: true }
  );

  // Jika check result dari findOneAndUpdate payment tidak ada, maka akan memberikan msg `Tidak ada tipe pembayaran dengan id :  ${id}` 
  if (!result)
    throw new NotFoundError(`Tidak ada tipe pembayaran dengan id :  ${id}`);

  // Menampilkan return terhadap result updatePayments
  return result;
};

const deletePayments = async (req) => {
  // Membuat request params berdasarkan id
  const { id } = req.params;

  // Melakukan findOne Payment berdasarkan organizer yang login
  const result = await Payments.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // Jika result findOne payment tidak ada, makan akan memberikan msg `Tidak ada tipe pembayaran dengan id :  ${id}`
  if (!result)
    throw new NotFoundError(`Tidak ada tipe pembayaran dengan id :  ${id}`);

  // Jika ada, maka payment berdasarkan id yang dicari akan di remove
  await result.remove();

  // Menampilkan return dari result deletePayment
  return result;
};

const checkingPayments = async (id) => {
  // Melakukan check findOne payment berdasarkan id
  const result = await Payments.findOne({ _id: id });

  // Jika result check findOne payment berdasarkan id tidak ada, maka akan memberikan msg `Tidak ada tipe pembayaran dengan id :  ${id}`
  if (!result)
    throw new NotFoundError(`Tidak ada tipe pembayaran dengan id :  ${id}`);

  // Mengembalikan return dari result checkingPayment
  return result;
};

module.exports = {
  getAllPayments,
  createPayments,
  getOnePayments,
  updatePayments,
  deletePayments,
  checkingPayments,
};
