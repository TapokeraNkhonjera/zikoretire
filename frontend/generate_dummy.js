const XLSX = require('xlsx');

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create worksheet data containing the keywords the engine looks for
const data = [
  ["Date", "Description", "Amount"],
  ["2023-05-15", "Harvest Sale Deposit", 200000],
  ["2023-06-15", "Harvest Sale Deposit", 250000],
  ["2023-07-15", "Harvest Sale Deposit", 300000],
  ["2023-08-15", "Late Sale Deposit", 100000],
  
  ["2024-05-10", "Harvest Sale Deposit", 220000],
  ["2024-06-12", "Harvest Sale Deposit", 280000],
  ["2024-07-15", "Harvest Sale Deposit", 280000],
  ["2024-08-10", "Late Sale Deposit", 90000],
  
  ["2025-05-15", "Harvest Sale Deposit", 250000],
  ["2025-06-15", "Harvest Sale Deposit", 300000],
  ["2025-07-15", "Harvest Sale Deposit", 300000],
  ["2025-08-15", "Late Sale Deposit", 100000],
  
  ["", "", ""],
  ["Account Details", "", ""],
  ["Age", 42, ""],
  ["Current Savings", 2000000, ""],
  ["Monthly Income", 400000, ""]
];

// Convert data array to a worksheet
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Append worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

// Write to Desktop
XLSX.writeFile(workbook, "C:\\Users\\stati\\Desktop\\Ziko_Dummy_Pension_Data.xlsx");
console.log("Dummy file created successfully!");
