const Service = require('../models/Service');

// Default initial services fallback
const defaultServices = [
  {
    _id: 'srv-local',
    title: 'Local City Travel',
    description: 'Flexible 4-hour and 8-hour city packages for shopping, temple visits, meetings, and family sightseeing.',
    icon: 'location_city',
    features: ['8 Hours / 80 KMs Packages', 'Clean Air Conditioned Fleet', 'Experienced Local Chauffeurs', 'Zero Toll Confusion'],
    priceRange: 'Starting from ₹2,200 / day',
    isActive: true,
    order: 1
  },
  {
    _id: 'srv-outstation',
    title: 'Outstation Trips',
    description: 'Round-trip and one-way outstation cab services across Maharashtra and all major Indian destinations.',
    icon: 'travel_explore',
    features: ['Per KM Transparent Billing', 'Night Charges Included Options', 'Highway-Trained Drivers', 'Toll & State Tax Assistance'],
    priceRange: 'Starting from ₹13 / KM',
    isActive: true,
    order: 2
  },
  {
    _id: 'srv-airport',
    title: 'Airport Pickup & Drop (24/7)',
    description: 'Guaranteed on-time airport transfers with flight tracking and polite meet & greet assistance.',
    icon: 'flight_takeoff',
    features: ['24/7 Availability', 'Flight Delay Monitoring', 'Luggage Handling Assistance', 'Fixed Flat Rates'],
    priceRange: 'Starting from ₹1,500 Flat',
    isActive: true,
    order: 3
  },
  {
    _id: 'srv-corporate',
    title: 'Corporate Travel',
    description: 'Executive car rentals and monthly cab dispatch solutions tailored for business leaders and corporate delegations.',
    icon: 'business_center',
    features: ['GST Invoicing Available', 'Premium Innova Crysta Fleet', 'Priority Support Desk', 'Monthly Billing Cycles'],
    priceRange: 'Custom Corporate Packages',
    isActive: true,
    order: 4
  },
  {
    _id: 'srv-wedding',
    title: 'Wedding & Event Rentals',
    description: 'Luxury fleet coordination and decorative guest convoys for unforgettable wedding celebrations and VIP guests.',
    icon: 'celebration',
    features: ['Decorated Vehicle Options', 'Fleet Dispatch Manager', 'Punctual Convoy Coordination', 'Uniformed Chauffeurs'],
    priceRange: 'Custom Event Quotes',
    isActive: true,
    order: 5
  },
  {
    _id: 'srv-longterm',
    title: 'Long-Term Car Rental',
    description: 'Cost-effective weekly, monthly, and seasonal dedicated vehicle leases with or without professional drivers.',
    icon: 'calendar_month',
    features: ['Zero Maintenance Headaches', 'Replacement Vehicle Guarantee', 'Dedicated Driver Assignment', 'Flexible Contract Terms'],
    priceRange: 'From ₹45,000 / month',
    isActive: true,
    order: 6
  }
];

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    let services = await Service.find(filter).sort({ order: 1, createdAt: -1 });

    if (services.length === 0) {
      services = defaultServices;
    }

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.warn('⚠️ getServices DB note:', error.message, '- falling back to defaultServices');
    res.status(200).json({
      success: true,
      count: defaultServices.length,
      data: defaultServices
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res, next) => {
  try {
    const { title, description, icon, features, priceRange, isActive, order } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const service = await Service.create({
      title,
      description,
      icon: icon || 'directions_car',
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []),
      priceRange: priceRange || 'Best Rates Guaranteed',
      isActive: isActive !== undefined ? isActive : true,
      order: order ? Number(order) : 0
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (req.body.features && typeof req.body.features === 'string') {
      req.body.features = req.body.features.split(',').map(f => f.trim());
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  defaultServices
};
