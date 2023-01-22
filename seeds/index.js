const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "63c5c9c9af7f132c493ce0d7",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iusto totam quasi cumque optio qui. Est rerum officia, dolore quia corrupti illo asperiores facere inventore non aliquam eius, iure animi. Nulla.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dymne7cde/image/upload/v1674068728/YelpCamp/ppb5xcjr37vskyxcxcmv.jpg",
          filename: "YelpCamp/ppb5xcjr37vskyxcxcmv",
          url: "https://res.cloudinary.com/dymne7cde/image/upload/v1674068730/YelpCamp/yt2nosr6xcceawx402gv.jpg",
          filename: "YelpCamp/yt2nosr6xcceawx402gv",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
