// import model Events
const Events = require("../../api/v1/events/model");
const { checkingImage } = require("./images");
const { checkingCategories } = require("./categories");
const { checkingTalents } = require("./talents");

// import custom error not found dan bad request
const { NotFoundError, BadRequestError } = require("../../errors");

const getAllEvents = async (req) => {
  // Membuat request query berdasarkan (keyword, category, talent)
  const { keyword, category, talent, status } = req.query;

  // Menampung objek berupa organizer yang sedang login
  let condition = { organizer: req.user.organizer };

  /* Melakukan checking terhadap keyword, apabila hasil keyword ada maka akan mengumpulkan semua objek yang ada di condition
  dengan $regex sebagai pembantu mempermudah keyword/pencarian berdasarkan huruf awal */
  if (keyword) {
    condition = { ...condition, title: { $regex: keyword, $options: "i" } };
  }

  /* Melakukan checking terhadap category, apabila category ada maka akan mengumpulkan semua objek yang ada di condition */
  if (category) {
    condition = { ...condition, category: category };
  }

  /* Melakukan checking terhadap talent, apabila talent ada maka akan mengumpulkan semua objek yang ada di condition */
  if (talent) {
    condition = { ...condition, talent: talent };
  }

  /* Melakukan checking terhadap status event, harus publish atau draft */
  if (['Draft', 'Published'].includes(status)) {
    condition = {
      ...condition,
      statusEvent: status,
    };
  }

  // Melihat seluruh collection event dengan cara populate image, category, talent
  const result = await Events.find(condition)
    .populate({
      path: "image", // path berdasarkan referensi field image yang ada pada model event
      select: "_id name", // select/pemilihan berdasarkan id dan name pada field image dibagian model event
    })
    .populate({
      path: "category", // path berdasarkan referensi field category yang ada pada model event
      select: "_id name", // select/pemilihan berdasarkan id dan name pada field image dibagian model event
    })
    .populate({
      path: "talent", // path berdasarkan referensi field category yang ada pada model event
      select: "_id name role image", // select/pemilihan berdasarkan id dan name pada field image dibagian model event
      populate: { path: "image", select: "_id  name" },
    });

  return result;
};

const createEvents = async (req) => {
  // membuat request body pada create event dengan field" yang ada di model schema event
  const {
    title,
    date,
    about,
    tagline,
    venueName,
    keyPoint,
    statusEvent,
    tickets,
    image,
    category,
    talent,
  } = req.body;

  // cari Events dengan field title
  const check = await Events.findOne({ title, organizer: req.user.organizer });

  //  apa bila check true / data Events sudah ada maka kita tampilkan error bad request dengan message pembicara duplikat
  if (check) throw new BadRequestError("judul event duplikat");

  // Melakukan create event berdasarkan organizer yang login
  const result = await Events.create({
    title,
    date,
    about,
    tagline,
    venueName,
    keyPoint,
    statusEvent,
    tickets,
    image,
    category,
    talent,
    organizer: req.user.organizer,
  });

  // Melakukan return result pada createEvent
  return result;
};

const getOneEvents = async (req) => {
  // membuat request params pada getOneEvents berdasarkan id
  const { id } = req.params;

  // Melihat collection event berdasarkan id dengan cara populate image, category, talent
  const result = await Events.findOne({
    _id: id,
    organizer: req.user.organizer,
  })
    .populate({ path: "image", select: "_id name" })
    .populate({
      path: "category",
      select: "_id name",
    })
    .populate({
      path: "talent",
      select: "_id name role image",
      populate: { path: "image", select: "_id  name" },
    });

  // Jika result nya tidak ditemukan, makan akan menampilkan message dari NotFoundError
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Melakukan return result pada field getOneEvents
  return result;
};

const updateEvents = async (req) => {
  // membuat request params berdasarkan id dan rquest body pada create event dengan field" yang ada di model schema event
  const { id } = req.params;
  const {
    title,
    date,
    about,
    tagline,
    venueName,
    keyPoint,
    statusEvent,
    tickets,
    image,
    category,
    talent,
  } = req.body;

  // cari image, category dan talent dengan field id
  await checkingImage(image);
  await checkingCategories(category);
  await checkingTalents(talent);

  // cari Events dengan field title dan id selain dari yang dikirim dari params
  const check = await Events.findOne({
    title,
    organizer: req.user.organizer,
    _id: { $ne: id },
  });

  // apa bila check true / data Events sudah ada maka kita tampilkan error bad request dengan message pembicara duplikat
  if (check) throw new BadRequestError("judul event duplikat");

  // Melakukan update event berdasarkan organizer yang login
  const result = await Events.findOneAndUpdate(
    { _id: id },
    {
      title,
      date,
      about,
      tagline,
      venueName,
      keyPoint,
      statusEvent,
      tickets,
      image,
      category,
      talent,
      organizer: req.user.organizer,
    },
    { new: true, runValidators: true }
  );

  // jika id result false / null maka akan menampilkan error `Tidak ada pembicara dengan id` yang dikirim client
  if (!result) throw new NotFoundError(`Tidak ada acara dengan id :  ${id}`);

  // Melakukan return result pada updateEvents
  return result;
};

const deleteEvents = async (req) => {
  // membuat request params berdasarkan id 
  const { id } = req.params;

   // cari Events dengan field title dan id selain dari yang dikirim dari params
  const result = await Events.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // jika id result false / null maka akan menampilkan error `Tidak ada pembicara dengan id` yang dikirim client
  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  // Jika id nya ditemukan, maka event yang dicari akan di remove
  await result.remove();

  // Melakukan return result pada deleteEvent
  return result;
};

const changeStatusEvents = async (req) => {
  const { id } = req.params;
  const { statusEvent } = req.body;

  // Jika status event bukan draft ataupun published maka akan menampilkan message dari BadRequestError
  if (!["Draft", "Published"].includes(statusEvent)) {
    throw new BadRequestError("Status harus Draft atau Published");
  }

  // cari event berdasarkan field id
  const checkEvent = await Events.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  // jika id result false / null maka akan menampilkan error `Tidak ada acara dengan id` yang dikirim client
  if (!checkEvent)
    throw new NotFoundError(`Tidak ada acara dengan id :  ${id}`);

  checkEvent.statusEvent = statusEvent;

  // Jika status event draft ataupun published, maka akan di save
  await checkEvent.save();

  // Menampilkan return checkEvent pada changeStatusEvent
  return checkEvent;
};

module.exports = {
  getAllEvents,
  createEvents,
  getOneEvents,
  updateEvents,
  deleteEvents,
  changeStatusEvents,
};
