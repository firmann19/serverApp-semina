const Orders = require("../../api/v1/orders/model");

const getAllOrders = async (req) => {
  // Membuat request berdasarkan query (limit, page, startDate, endDate)
  const { limit = 10, page = 1, startDate, endDate } = req.query;

  // Menampung objek
  let condition = {};

  // Jika role bukan owner yang login, maka akan menampilkan history event dari organizer yang login
  if (req.user.role !== "owner") {
    condition = { ...condition, "historyEvent.organizer": req.user.organizer };
  }

  // Melakukan setup jam order dibuat
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    condition = {
      ...condition,
      date: {
        $gte: start,
        $lt: end,
      },
    };
  }

  // Menampilkan getAllOrders
  const result = await Orders.find(condition)
    .limit(limit)
    .skip(limit * (page - 1));

  const count = await Orders.countDocuments(condition);

  // Melakukan return hasil getAllOrders
  return { data: result, pages: Math.ceil(count / limit), total: count };
};

module.exports = {
  getAllOrders,
};
