const mongoose = require("mongoose");
const { model, Schema } = mongoose;

let talentSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Nama harus diisi"],
    },
    role: {
      type: String,
      default: "-",
    },
    // Untuk file  `app/ap1/v1/talents/model.js` belum kita siapkan sekarang buat folder dengan nama `talents` pada `app/api/v1` dan tambahkan file `model.js` maka file akan menjadi `app/api/v1/talents/model.js` pada `model.js` ketikan code berikut :
    image: {
      type: mongoose.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    organizer: {
      type: mongoose.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("Talent", talentSchema);
