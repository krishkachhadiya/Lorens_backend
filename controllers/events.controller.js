const Events = require('../models/Events.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

// ==========================================
// GET ALL EVENTS
// ==========================================
const getEvents = asyncHandler(async (req, res) => {
  const events = await Events.find().sort({ createdAt: -1 });
  // Matching your cms controller's raw array list response signature
  return res.json(events);
});

// ==========================================
// GET EVENT BY ID
// ==========================================
const getEventById = asyncHandler(async (req, res) => {
  const event = await Events.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  // Matching your custom data wrapper structure: { event }
  return success(res, { event }, 'Event fetched');
});

// ==========================================
// GET EVENT BY SLUG (Frontend)
// ==========================================
const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Events.findOne({ slug: req.params.slug, status: 'active' });
  if (!event) throw new ApiError(404, 'Event not found');
  
  return success(res, { event }, 'Event fetched');
});

// ==========================================
// CREATE EVENT
// ==========================================
const createEvent = asyncHandler(async (req, res) => {
  let { title, slug, image, address, dates, timeWindow, eventType, expectedVisitors, description, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim())  throw new ApiError(400, 'Slug is required');
  if (!address?.trim()) throw new ApiError(400, 'Address is required');
  if (!dates?.trim()) throw new ApiError(400, 'Dates are required');

  const slugExists = await Events.findOne({ slug: slug.toLowerCase() });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const event = await Events.create({
    title: title.trim(),
    slug: slug.toLowerCase(),
    image: image || '',
    address: address.trim(),
    dates: dates.trim(),
    timeWindow: timeWindow || '10:00 to 21:00',
    eventType: eventType || 'Exhibition',
    expectedVisitors: expectedVisitors || '',
    description: description || '',
    status: status || 'active'
  });

  // Matching your payload response object layout along with explicit 201 status code injection
  return success(res, { event }, 'Event Added Successfully', 201);
});

// ==========================================
// UPDATE EVENT
// ==========================================
const updateEvent = asyncHandler(async (req, res) => {
  const { title, slug, image, address, dates, timeWindow, eventType, expectedVisitors, description, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');

  const slugExists = await Events.findOne({ slug: slug?.toLowerCase(), _id: { $ne: req.params.id } });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const event = await Events.findByIdAndUpdate(
    req.params.id,
    { 
      title: title.trim(), 
      slug: slug?.toLowerCase(), 
      image, 
      address, 
      dates, 
      timeWindow, 
      eventType, 
      expectedVisitors, 
      description, 
      status 
    },
    { new: true, runValidators: true }
  );

  if (!event) throw new ApiError(404, 'Event not found');

  return success(res, { event }, 'Event Updated Successfully');
});

// ==========================================
// DELETE EVENT
// ==========================================
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Events.findByIdAndDelete(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  // Matching your cms deletion clean empty literal payload block return style
  return success(res, {}, 'Event Deleted Successfully');
});

module.exports = { 
  getEvents, 
  getEventById, 
  getEventBySlug, 
  createEvent, 
  updateEvent, 
  deleteEvent 
};