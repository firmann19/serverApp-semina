const Images = require("../../api/v1/images/model");
const { NotFoundError } = require("../../errors");

const createImages = async (req) => {
  const result = await Images.create({
    /* Melakukan check terhadap file image, apabila ada maka akan kita ambil berdasarkan filename 
  namun jika tidak ada maka akan menampilkan default avatar */
    name: req.file
      ? `uploads/${req.file.filename}`
      : "uploads/avatar/default.jpeg",
  });
  return result;
};

// tambahkan function checking Image
const checkingImage = async (id) => {
  // Melakukan findOne untuk image berdasarkan id
  const result = await Images.findOne({ _id: id });

  // Jika image berdasarkan id tidak ditemukan, maka akan menampilkan message `Tidak ada Gambar dengan id :  ${id}`
  if (!result) throw new NotFoundError(`Tidak ada Gambar dengan id :  ${id}`);

  // Jika ada, maka akan melakukan return result
  return result;
};

module.exports = { createImages, checkingImage };
