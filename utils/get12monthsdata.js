

// exports.getYearlyAnalyticsData = async (model) => {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const yearlyAnalyticsData = [];

//     for (let month = 0; month <= currentDate.getMonth(); month++) {
//         const startOfMonth = new Date(currentYear, month, 1);
//         const endOfMonth = new Date(currentYear, month + 1, 0);
//         const monthYear = startOfMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' });
//         const count = await model.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });

//         yearlyAnalyticsData.push({ month: monthYear, count });
//     }

//     return yearlyAnalyticsData;
// }

// exports.getYearlyAnalyticsData = async (model) => {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth();
//     const yearlyAnalyticsData = [];

//     // Determine the starting month based on the current month
//     const startingMonth = currentMonth >= 11 ? currentMonth - 11 : currentMonth + 1;
//     const startingYear = currentMonth >= 11 ? currentYear : currentYear - 1;

//     for (let i = 0; i < 12; i++) {
//         let month = startingMonth + i;
//         let year = startingYear;

//         if (month >= 12) {
//             month -= 12;
//             year += 1;
//         }

//         const startOfMonth = new Date(year, month, 1);
//         const endOfMonth = new Date(year, month + 1, 0);
//         const monthYear = startOfMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' });
//         const count = await model.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });

//         yearlyAnalyticsData.push({ month: monthYear, count });
//     }

//     return yearlyAnalyticsData;
// }

//const CumulativeAnalytics = require('./models/cumulativeAnalytics'); // Import your CumulativeAnalytics model/schema

// exports.getMonthlyAnalyticsData = async (model) => {
//     const currentDate = new Date();
//     const currentMonth = currentDate.getMonth();
//     const currentYear = currentDate.getFullYear();

//     // Fetch existing cumulative analytics data from the database
//     let cumulativeData = await model.findOne({ year: currentYear });

//     if (!cumulativeData) {
//         // If no data exists for the current year, initialize with empty data
//         cumulativeData = new CumulativeAnalytics({ year: currentYear, data: [] });
//     }

//     // Calculate analytics data for the current month
//     const startOfMonth = new Date(currentYear, currentMonth, 1);
//     const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
//     const count = await model.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });

//     // Update the cumulative data with the analytics data for the current month
//     cumulativeData.data[currentMonth] = count;

//     // Save the updated cumulative data back to the database
//     await cumulativeData.save();

//     return { month: currentMonth + 1, count, cumulativeData };
// }


