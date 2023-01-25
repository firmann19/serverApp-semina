// import model categories
const Categories = require("../../api/v1/categories/model");

// import costum error not found dan bad request
const { NotFoundError, BadRequestError } = require("../../errors");

const getAllCategories = async (req) => {
  // Menampilkan seluruh collection categories berdasarkan organizer yang login
  const result = await Categories.find({ organizer: req.user.organizer });

  // Melakukan return terhadap semua collection categories
  return result;
};

const createCategories = async (req) => {
  // Melakukan request pembuatan categories berdasarkan field name
  const { name } = req.body;

  // cari categories dengan field name oleh organizer yang login
  const check = await Categories.findOne({
    name,
    organizer: req.user.organizer,
  });

  // apabila check true / data categories sudah ada maka kita tampilkan error bad request dengan message kategori nama duplikat
  if (check) throw new BadRequestError("kategori nama duplikat");

  /* apabila check false / data categories tidak ada maka akan terbuat categories baru berdasarkan field name yang sudah request
yang dibuat oleh organizer yang login */
  const result = await Categories.create({
    name,
    organizer: req.user.organizer,
  });

  // melakukan return hasil categories yang dibuat
  return result;
};

const getOneCategories = async (req) => {
  // Melakukan request melihat categories berdasarkan field id
  const { id } = req.params;

  // cari categories dengan field id oleh organizer yang login
  const result = await Categories.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // apabila hasil pencarian categories berdasarkan id tidak ada, maka akan menampilkan NotFoundError
  if (!result) throw new NotFoundError(`Tidak ada kategori dengan id: ${id}`);

  // Apabila ada, maka akan melakukan return categories berdasarkan id yang dicari
  return result;
};

const updateCategories = async (req) => {
  // Melakukan request update categories berdasarkan params id dan body field name
  const { id } = req.params;
  const { name } = req.body;

  // cari categories dengan field name dan id selain dari yang dikirim dari params
  const check = await Categories.findOne({
    name,
    organizer: req.user.organizer,
    _id: { $ne: id }, //$ne mencari semua collection pada categories kecuali id yang dipanggil
  });

  // apabila check true / data categories sudah ada maka kita tampilkan error bad request
  if (check) throw new BadRequestError("kategori nama duplikat");

  // menampilkan hasil update categories berdasarkan id yang dipilih dan field name yang dibuat
  const result = await Categories.findOneAndUpdate(
    { _id: id },
    { name },
    { new: true, runValidators: true }
  );

  // jika id result false / null maka akan menampilkan error 'Tidak ada error dengan id'
  if (!result) throw new NotFoundError(`Tidak ada category dengan id : ${id}`);

  // apabila ada, maka akan menampilkan return hasilnya
  return result;
};

const deleteCategories = async (req) => {
  // request parameter berdasarkan id untuk collection yang akan di delete
  const { id } = req.params;

  // melakukan findOne atau pengecekan untuk collection categories berdasarkan id oleh organizer
  const result = await Categories.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // apabila id tidak ditemukan maka diberikan attention NotFoundError
  if (!result) throw new NotFoundError(`Tidak ada kategori dengan id : ${id}`);

  // apabila id nya ada, maka kita lakukan remove
  await result.remove();

  // terakhir adalah melakukan return untuk deleteCategories
  return result;
};

const checkingCategories = async (id) => {
  // Melakukan cek terhadap categories berdasarkan id
  const result = await Categories.findOne({ _id: id });

  // apabila categories yang dicari berdasarkan id tidak ada, maka akan menampilkan custom error NotFoundError
  if (!result) throw new NotFoundError(`Tidak ada Kategori dengan id :  ${id}`);

  // apabila ada, maka akan melakukan return result
  return result;
};

const checkingTalents = async (id) => {
  // Mencari talent berdasarkan id yang dipanggil
  const result = await Talents.findOne({ _id: id });

  // Apbalia talent berdasarkan id yang dipanggil tidak ada, maka akan menampilkan NotFoundError
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Apabila ada, maka akan melakukan return result
  return result;
};

module.exports = {
  getAllCategories,
  createCategories,
  getOneCategories,
  updateCategories,
  deleteCategories,
  checkingCategories,
  checkingTalents,
};
