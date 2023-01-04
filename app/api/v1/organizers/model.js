// (1) import package mongoose
const mongoose = require("mongoose");

// (2) ambil module model dan Schema dari package mongoose
const { model, Schema } = mongoose;

let organizersSchema = Schema(
  {
    organizer: {
      type: String,
      required: [true, "Penyelenggara harus diisi"],
    },
  },
  { timestamps: true }
);

module.exports = model("Organizer", organizersSchema);
