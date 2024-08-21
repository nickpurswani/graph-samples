const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Mongoose schema for collections
const Order = mongoose.model('Order', new mongoose.Schema({}, { collection: 'shopifyOrders' }));
const Customer = mongoose.model('Customer', new mongoose.Schema({}, { collection: 'shopifyCustomers' }));

// Helper function to convert a string to date in the pipeline
const convertStringToDate = (field) => ({
  $dateFromString: {
    dateString: `$${field}`
  }
});

// 1. Total Sales Over Time
router.get('/sales-over-time', async (req, res) => {
    try {
      const interval = req.query.interval || 'monthly';
      let groupBy;
  
      switch (interval) {
        case 'monthly':
          groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
          break;
        case 'quarterly':
          groupBy = { $dateToString: { format: "%Y-Q", date: "$date" } };
          break;
        case 'yearly':
          groupBy = { $dateToString: { format: "%Y", date: "$date" } };
          break;
        default:
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
      }
  
      const salesData = await Order.aggregate([
        {
          $facet: {
            salesData2022: [
              { $match: { created_at: { $regex: /^2022/ } } },  // Match documents where created_at starts with "2022"
              {
                $addFields: {
                  date: { $dateFromString: { dateString: "$created_at" } }  // Convert string to date
                }
              },
              {
                $group: {
                  _id: groupBy,
                  totalSales: { $sum: { $convert: { input: "$total_price_set.shop_money.amount", to: "double" } } }
                }
              },
              { $sort: { _id: 1 } }
            ],
            salesData2023: [
              { $match: { created_at: { $regex: /^2023/ } } },  // Match documents where created_at starts with "2023"
              {
                $addFields: {
                  date: { $dateFromString: { dateString: "$created_at" } }  // Convert string to date
                }
              },
              {
                $group: {
                  _id: groupBy,
                  totalSales: { $sum: { $convert: { input: "$total_price_set.shop_money.amount", to: "double" } } }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        },
        {
          $project: {
            salesData2022: {
              $map: {
                input: "$salesData2022",
                as: "data",
                in: {
                  key: "$$data._id",
                  value: "$$data.totalSales"
                }
              }
            },
            salesData2023: {
              $map: {
                input: "$salesData2023",
                as: "data",
                in: {
                  key: "$$data._id",
                  value: "$$data.totalSales"
                }
              }
            }
          }
        }
      ]);
  
      // Extract sales data from the aggregated result
      const { salesData2022, salesData2023 } = salesData[0];
  
      res.send([
        { "name": "2023", "data": salesData2023 },
        { "name": "2022", "data": salesData2022 ,
        "color": "red",
        "isComparison": true}
      ]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

// 2. Sales Growth Rate Over Time
router.get('/sales-growth-rate', async (req, res) => {
    try {
      const interval = req.query.interval || 'monthly';
      let groupBy;
  
      switch (interval) {
        case 'monthly':
          groupBy = { $dateToString: { format: "%Y-%m", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        case 'quarterly':
          groupBy = { $dateToString: { format: "%Y-Q", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        case 'yearly':
          groupBy = { $dateToString: { format: "%Y", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        default:
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: { $dateFromString: { dateString: "$created_at" } } } };
      }
  
      const salesData = await Order.aggregate([
        {
          $facet: {
            salesData2022: [
              { $match: { created_at: { $regex: /^2022/ } } },
              {
                $addFields: {
                  date: { $dateFromString: { dateString: "$created_at" } }
                }
              },
              {
                $group: {
                  _id: groupBy,
                  totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
                }
              },
              { $sort: { _id: 1 } }
            ],
            salesData2023: [
              { $match: { created_at: { $regex: /^2023/ } } },
              {
                $addFields: {
                  date: { $dateFromString: { dateString: "$created_at" } }
                }
              },
              {
                $group: {
                  _id: groupBy,
                  totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        },
        {
          $project: {
            salesData2022: {
              $map: {
                input: "$salesData2022",
                as: "data",
                in: {
                  key: "$$data._id",
                  value: {
                    $let: {
                      vars: {
                        prevTotalSales: {
                          $arrayElemAt: [
                            "$salesData2022.totalSales",
                            { $subtract: [{ $indexOfArray: ["$salesData2022._id", "$$data._id"] }, 1] }
                          ]
                        }
                      },
                      in: {
                        $cond: {
                          if: { $gte: [ { $indexOfArray: ["$salesData2022._id", "$$data._id"] }, 1 ] },
                          then: {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $subtract: ["$$data.totalSales", "$$prevTotalSales"]
                                  },
                                  "$$prevTotalSales"
                                ]
                              },
                              100
                            ]
                          },
                          else: 0
                        }
                      }
                    }
                  }
                }
              }
            },
            salesData2023: {
              $map: {
                input: "$salesData2023",
                as: "data",
                in: {
                  key: "$$data._id",
                  value: {
                    $let: {
                      vars: {
                        prevTotalSales: {
                          $arrayElemAt: [
                            "$salesData2023.totalSales",
                            { $subtract: [{ $indexOfArray: ["$salesData2023._id", "$$data._id"] }, 1] }
                          ]
                        }
                      },
                      in: {
                        $cond: {
                          if: { $gte: [ { $indexOfArray: ["$salesData2023._id", "$$data._id"] }, 1 ] },
                          then: {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $subtract: ["$$data.totalSales", "$$prevTotalSales"]
                                  },
                                  "$$prevTotalSales"
                                ]
                              },
                              100
                            ]
                          },
                          else: 0
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]);
  
      // Extract sales data from the aggregated result
      const { salesData2022, salesData2023 } = salesData[0];
  
      res.json([
        { name: "2023", data: salesData2023.map(item => ({ key: new Date(item.key).toISOString(), value: item.value })) },
        { name: "2022", data: salesData2022.map(item => ({ key: new Date(item.key).toISOString(), value: item.value })),"color":"purple", "isComparison": true }
      ]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

// 3. New Customers Added Over Time
router.get('/customer-data', async (req, res) => {
    try {
      const interval = req.query.interval || 'monthly';
      let groupBy;
  
      switch (interval) {
        case 'monthly':
          groupBy = { $dateToString: { format: "%Y-%m", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        case 'quarterly':
          groupBy = { $dateToString: { format: "%Y-Q", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        case 'yearly':
          groupBy = { $dateToString: { format: "%Y", date: { $dateFromString: { dateString: "$created_at" } } } };
          break;
        default:
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: { $dateFromString: { dateString: "$created_at" } } } };
      }
  
      // New Customers
      const newCustomerData = await Customer.aggregate([
        {
          $group: {
            _id: groupBy,
            newCustomers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      // Repeat Customers
      const repeatCustomerData = await Order.aggregate([
        {
          $group: {
            _id: { customerId: "$customer.id", date: groupBy },
            purchaseCount: { $sum: 1 }
          }
        },
        { $match: { purchaseCount: { $gt: 1 } } },
        {
          $group: {
            _id: "$_id.date",
            repeatCustomers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      // Format the data to match the required structure
      const formattedNewCustomerData = newCustomerData.map((data) => ({
        key: data._id,
        value: data.newCustomers
      }));
  
      const formattedRepeatCustomerData = repeatCustomerData.map((data) => ({
        key: data._id,
        value: data.repeatCustomers
      }));
  
      res.json([
        { name: 'First-time Customers', data: formattedNewCustomerData },
        { name: 'Repeat Customers', data: formattedRepeatCustomerData }
      ]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

// 5. Geographical Distribution of Customers
router.get('/geographical-distribution', async (req, res) => {
  try {
    const geoData = await Customer.aggregate([
      {
        $group: {
          _id: "$default_address.city",
          customerCount: { $sum: 1 }
        }
      },
      { $sort: { customerCount: -1 } }
    ]);
    var s=0
    geoData.forEach(e=>{
      s+=e["customerCount"]
    })
    res.json([['us',s]]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 6. Customer Lifetime Value by Cohorts
router.get('/customer-lifetime-value', async (req, res) => {
  try {
    const cohortData = await Customer.aggregate([
      {
        $addFields: {
          created_at: { $toDate: "$created_at" } // Convert string to date
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          customers: { $push: "$_id" }
        }
      },
      {
        $lookup: {
          from: 'shopifyOrders',
          localField: 'customers',
          foreignField: 'customer.id',
          as: 'orders'
        }
      },
      {
        $unwind: "$orders" // Unwind orders to process each order individually
      },
      {
        $group: {
          _id: "$_id", // Re-group by cohort
          cohort: { $first: "$_id" },
          lifetimeValue: {
            $sum: { $toDouble: "$orders.total_price_set.shop_money.amount" }
          }
        }
      },
      { $sort: { cohort: 1 } }
    ]);
    const formattedData = {};

    cohortData.forEach(({ _id, lifetimeValue }) => {
      const [year, month] = _id.split('-');
      const monthIndex = parseInt(month, 10) - 1; // Convert month to 0-based index
  
      if (!formattedData[year]) {
        formattedData[year] = Array(12).fill(null); // Initialize array with 12 nulls for each month
      }
  
      formattedData[year][monthIndex] = lifetimeValue; // Set lifetimeValue at the correct month index
    });
    res.json(formattedData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


module.exports = router;
