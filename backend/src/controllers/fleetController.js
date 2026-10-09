const Fleet = require('../models/Fleet');

const defaultFleet = {
  title: 'Toyota Innova Crysta',
  tagline: 'Flagship Chauffeur Fleet • Since 2005',
  rating: '4.9/5 Customer Rating',
  description: 'Renowned worldwide for supreme ride stability, whisper-quiet cabin, and plush seating ambiance. Engineered to turn long highway tours, airport commutes, and family vacations into effortless relaxation.',
  photos: [
    {
      url: '/uploads/photo-1791458143672-606816611.jpeg',
      title: 'Toyota Innova Crysta - Premium Wedding Convoy',
      category: 'Exterior'
    },
    {
      url: '/uploads/photo-1791534170531-29535222.jpeg',
      title: 'Toyota Innova Crysta - Sleek Front Profile',
      category: 'Dashboard'
    },
    {
      url: '/uploads/photo-1791534244480-961044775.jpeg',
      title: 'Toyota Innova Crysta - Hill Station Outstation Tour',
      category: 'Exterior'
    },
    {
      url: '/uploads/photo-1791534367128-460654916.jpeg',
      title: 'Toyota Innova Crysta - Side Luxury Profile',
      category: 'Dashboard'
    }
  ],
  features: [
    {
      title: 'Ultra-Plush Captain Recliners',
      description: 'Individual armrests and adjustable recline angles for first-class comfort.',
      icon: 'airline_seat_recline_extra',
      color: 'amber'
    },
    {
      title: 'Multi-Zone Dual Climate Control',
      description: 'Dedicated roof air-conditioning vents for 2nd and 3rd-row passengers.',
      icon: 'ac_unit',
      color: 'blue'
    },
    {
      title: 'Massive Luggage Capacity',
      description: 'Ample boot space with folding rear seats to fit 4 to 5 large suitcases easily.',
      icon: 'luggage',
      color: 'emerald'
    },
    {
      title: 'Advanced Safety & Airbags',
      description: '7 SRS airbags, ABS with EBD, and robust high-tensile crash safety frame.',
      icon: 'security',
      color: 'purple'
    }
  ]
};

const normalizeIconName = (icon) => {
  if (!icon) return 'star';
  const clean = icon.trim().toLowerCase();
  const map = {
    'armchair': 'airline_seat_recline_extra',
    'chair': 'airline_seat_recline_extra',
    'seat': 'airline_seat_recline_extra',
    'seats': 'airline_seat_recline_extra',
    'sofa': 'airline_seat_recline_extra',
    'couch': 'airline_seat_recline_extra',
    'captain seat': 'airline_seat_recline_extra',
    'captain seats': 'airline_seat_recline_extra',
    'recline': 'airline_seat_recline_extra',
    'recliners': 'airline_seat_recline_extra',
    'snowflake': 'ac_unit',
    'snow': 'ac_unit',
    'ac': 'ac_unit',
    'cooling': 'ac_unit',
    'cooler': 'ac_unit',
    'air conditioning': 'ac_unit',
    'air condition': 'ac_unit',
    'luggage': 'luggage',
    'bag': 'luggage',
    'bags': 'luggage',
    'suitcase': 'luggage',
    'suitcases': 'luggage',
    'boot': 'luggage',
    'trunk': 'luggage',
    'safety': 'security',
    'safe': 'security',
    'airbag': 'security',
    'airbags': 'security',
    'shield': 'security',
    'security': 'security',
    'music': 'music_note',
    'audio': 'headphones',
    'sound': 'volume_up',
    'bluetooth': 'bluetooth',
    'charger': 'power',
    'charging': 'power',
    'power': 'power',
    'usb': 'usb',
    'gps': 'navigation',
    'navigation': 'navigation',
    'wifi': 'wifi',
    'clean': 'cleaning_services',
    'sanitized': 'cleaning_services',
    'luxury': 'workspace_premium',
    'vip': 'workspace_premium',
    'speed': 'speed'
  };
  return map[clean] || icon;
};

const normalizeFeatures = (features) => {
  if (!features || !Array.isArray(features)) return [];
  return features.map(f => {
    const item = f.toObject ? f.toObject() : { ...f };
    if (item.icon) {
      item.icon = normalizeIconName(item.icon);
    }
    return item;
  });
};

let inMemoryFleet = { ...defaultFleet };

// @desc    Get fleet showcase details
// @route   GET /api/fleet
// @access  Public
const getFleet = async (req, res, next) => {
  try {
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const normalizePhotos = (photos) => {
      if (!photos || !Array.isArray(photos)) return [];
      return photos.map(p => {
        const item = p.toObject ? p.toObject() : { ...p };
        if (item.url) {
          if (item.url.startsWith('/uploads/')) {
            item.url = `${baseUrl}${item.url}`;
          } else if (item.url.includes('/uploads/')) {
            item.url = `${baseUrl}/uploads/${item.url.split('/uploads/')[1]}`;
          }
        }
        return item;
      });
    };

    try {
      let fleet = await Fleet.findOne();
      if (!fleet) {
        fleet = await Fleet.create(defaultFleet);
      }
      const data = fleet.toObject ? fleet.toObject() : { ...fleet };
      data.photos = normalizePhotos(data.photos);
      data.features = normalizeFeatures(data.features);

      return res.status(200).json({
        success: true,
        data: data
      });
    } catch (dbErr) {
      const data = { ...inMemoryFleet };
      data.photos = normalizePhotos(data.photos);
      data.features = normalizeFeatures(data.features);
      return res.status(200).json({
        success: true,
        data: data
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update fleet showcase details (photos, features, titles)
// @route   PUT /api/fleet
// @access  Private (Admin)
const updateFleet = async (req, res, next) => {
  try {
    const { title, tagline, rating, description, photos, features } = req.body;
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const normalizePhotos = (arr) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.map(p => {
        const item = p.toObject ? p.toObject() : { ...p };
        if (item.url && item.url.startsWith('/uploads/')) {
          item.url = `${baseUrl}${item.url}`;
        }
        return item;
      });
    };
    
    try {
      let fleet = await Fleet.findOne();
      if (!fleet) {
        fleet = await Fleet.create({
          title,
          tagline,
          rating,
          description,
          photos: photos || [],
          features: features ? normalizeFeatures(features) : []
        });
      } else {
        if (title !== undefined) fleet.title = title;
        if (tagline !== undefined) fleet.tagline = tagline;
        if (rating !== undefined) fleet.rating = rating;
        if (description !== undefined) fleet.description = description;
        if (photos !== undefined) {
          fleet.photos = photos.map(p => {
            const copy = { ...p };
            if (copy.url && copy.url.includes('/uploads/')) {
              copy.url = '/uploads/' + copy.url.split('/uploads/')[1];
            }
            return copy;
          });
        }
        if (features !== undefined) fleet.features = normalizeFeatures(features);

        await fleet.save();
      }

      const data = fleet.toObject ? fleet.toObject() : { ...fleet };
      data.photos = normalizePhotos(data.photos);
      data.features = normalizeFeatures(data.features);

      return res.status(200).json({
        success: true,
        message: 'Vehicle showcase updated successfully',
        data: data
      });
    } catch (dbErr) {
      inMemoryFleet = {
        ...inMemoryFleet,
        ...req.body
      };
      if (inMemoryFleet.features) {
        inMemoryFleet.features = normalizeFeatures(inMemoryFleet.features);
      }
      const data = { ...inMemoryFleet };
      data.photos = normalizePhotos(data.photos);
      data.features = normalizeFeatures(data.features);
      return res.status(200).json({
        success: true,
        message: 'Vehicle showcase updated (In-Memory)',
        data: data
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload vehicle image
// @route   POST /api/fleet/upload
// @access  Private (Admin)
const uploadFleetPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload.'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fullUrl,
      relativeUrl: relativeUrl,
      fullUrl: fullUrl
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFleet,
  updateFleet,
  uploadFleetPhoto,
  defaultFleet
};
