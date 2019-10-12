import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PartySchema = new Schema({
  name: String,
});

const Party = mongoose.model('News', PartySchema, 'News');

module.exports = Party;
