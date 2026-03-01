import asyncHandler from 'express-async-handler';

// @desc    Calculate delivery cost (Mock)
// @route   POST /api/delivery/calculate
// @access  Public
const calculateDelivery = asyncHandler(async (req, res) => {
  const { city, service } = req.body;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let price = 0;
  let days = 0;

  if (service === 'Express') {
    price = 1500;
    days = 1;
  } else {
    price = 500;
    days = 3;
  }

  if (city && city.length > 10) {
    price += 200;
    days += 1;
  }

  res.json({
    service,
    price,
    days,
    estimatedDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString(),
  });
});

export { calculateDelivery };
