import mongoose from 'mongoose';

const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || process.env.DB_LOCAL);

    console.log(`Connected to db Successfully!`);
  } catch (error) {
    console.log(`db connection error: ${error}`);
  }
};

// using mongoose.createConnection
export const connect = async () => {
  mongoose.Promise = Promise;
  mongoose.connect(process.env.DB_LOCAL || process.env.DB_URI);
};

export const disconnect = async (done) => {
  mongoose.disconnect(done);
};

export default connection;
