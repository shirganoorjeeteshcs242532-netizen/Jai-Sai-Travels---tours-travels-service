const mongoose = require('mongoose');

const fleetPhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Toyota Innova Crysta'
  },
  category: {
    type: String,
    default: 'Exterior'
  }
});

const fleetFeatureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'airline_seat_recline_extra'
  },
  color: {
    type: String,
    default: 'amber'
  }
});

const fleetSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Toyota Innova Crysta'
  },
  tagline: {
    type: String,
    default: 'Flagship Chauffeur Fleet • Since 2005'
  },
  rating: {
    type: String,
    default: '4.9/5 Customer Rating'
  },
  description: {
    type: String,
    default: 'Renowned worldwide for supreme ride stability, whisper-quiet cabin, and plush seating ambiance. Engineered to turn long highway tours, airport commutes, and family vacations into effortless relaxation.'
  },
  photos: {
    type: [fleetPhotoSchema],
    default: []
  },
  features: {
    type: [fleetFeatureSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fleet', fleetSchema);
