// import model Talents
const Talents = require("../../api/v1/talents/model");
// Import checking image
const { checkingImage } = require("./images");
// import custom error not found dan bad request
const { NotFoundError, BadRequestError } = require("../../errors");

const getAllTalents = async (req) => {
  // Membuat request query berdasarkan keyword atau pencarian
  const { keyword } = req.query;

  // Menampung objek berupa organizer yang sedang login
  let condition = { organizer: req.user.organizer };

  /* Melakukan checking terhadap keyword, apabila hasil keyword ada maka akan mengumpulkan semua objek yang ada di condition
  dengan $regex sebagai pembantu mempermudah keyword/pencarian berdasarkan huruf awal */
  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: "i" } };
  }

  // Melihat seluruh collection talents dengan cara populate berdasarkan field path : "image" dan select : "_id name"
  const result = await Talents.find(condition)
    .populate({
      path: "image", // path berdasarkan referensi field image yang ada pada model talent
      select: "_id name", // select/pemilihan berdasarkan id dan name pada field image dibagian model talent
    })
    .select("_id name role image"); // Fungsi select bagian ini untuk menampilkan getAllTalents berdasarkan (_id name role image)

  // Melakukan return pada result jika semuanya terlaksana
  return result;
};

const createTalents = async (req) => {
  // Membuat request body berdasarkan {name, role, image}
  const { name, role, image } = req.body;

  // cari image dengan field image
  await checkingImage(image);

  // cari talents dengan field name
  const check = await Talents.findOne({ name, organizer: req.user.organizer });

  // apa bila check true / data talents sudah ada maka kita tampilkan error bad request dengan message pembicara duplikat
  if (check) throw new BadRequestError("pembicara nama duplikat");

  // Melakukan create talents berdasarkan organizer yang login
  const result = await Talents.create({
    name,
    image,
    role,
    organizer: req.user.organizer,
  });

  // Melakukan return result pada create talent
  return result;
};

const getOneTalents = async (req) => {
  // Membuat request params berdasarkan id
  const { id } = req.params;

  // Melakukan findOne talent berdasarkan organizer yang login
  const result = await Talents.findOne({
    _id: id,
    organizer: req.user.organizer,
  })
    .populate({
      path: "image", // path berdasarkan referensi field image yang ada pada model talent
      select: "_id name", // select/pemilihan berdasarkan id dan name pada field image dibagian model talent
    })
    .select("_id name role image"); // Fungsi select bagian ini untuk menampilkan getAllTalents berdasarkan (_id name role image)

  // Jika talent tidak ada, maka akan menampilkan message `Tidak ada pembicara dengan id :  ${id}`
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Melakukan return result pada findOne talent
  return result;
};

const updateTalents = async (req) => {
  // Membuat request berdasarkan params dan body
  const { id } = req.params;
  const { name, image, role } = req.body;

  // cari image dengan field image
  await checkingImage(image);

  // cari talents dengan field name dan id selain dari yang dikirim dari params
  const check = await Talents.findOne({
    name,
    organizer: req.user.organizer,
    _id: { $ne: id }, // fungsi $ne = not equal untuk menampilkan seluruh collection talents kecuali yang _id talent yang dikirim dari params
  });

  // apa bila check true / data talents sudah ada maka kita tampilkan error bad request dengan message pembicara nama duplikat
  if (check) throw new BadRequestError("pembicara nama duplikat");

  // Melakukan findOneAnd Update pada talent
  const result = await Talents.findOneAndUpdate(
    { _id: id },
    { name, image, role, organizer: req.user.organizer },
    { new: true, runValidators: true }
  );

  // jika id result false / null maka akan menampilkan error `Tidak ada pembicara dengan id` yang dikirim client
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Melakukan return result findOneAndUpdate pada talent
  return result;
};

const deleteTalents = async (req) => {
  // Membuat request berdasarkan params
  const { id } = req.params;

  // Melakukan findOne untuk delete collection talent berdasarkan id
  const result = await Talents.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // Melakukan pengecekan, jika talent berdasarkan id tidak ditemukan, maka menampilkan message `Tidak ada pembicara dengan id :  ${id}`
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Melakukan remove pada collection talent berdasarkan id yang dipilih
  await result.remove();

  // Melukan return result hasil deleteTalents
  return result;
};

const checkingTalents = async (id) => {
  // Melkukan findOne pada talent berdasarkan id
  const result = await Talents.findOne({ _id: id });

  // Pengecekan berdasarkan id pada talent, jika talent tidak ditemukan maka akan menampilkan NotFoundError
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Melakukan return result hasil dari checkingTalents
  return result;
};

module.exports = {
  getAllTalents,
  createTalents,
  getOneTalents,
  updateTalents,
  deleteTalents,
  checkingTalents,
};
