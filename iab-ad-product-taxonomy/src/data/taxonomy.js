/**
 * IAB Ad Product Taxonomy 2.0
 *
 * Complete taxonomy data for product/service classification in advertising.
 * Source: IAB Tech Lab Ad Product Taxonomy 2.0 (November 2024)
 * https://github.com/InteractiveAdvertisingBureau/Taxonomies
 */

// Tier 1 Categories (Top-Level)
export const IAB_AD_PRODUCT_TIER1 = {
  1001: { id: 1001, name: 'Ad Safety Risk', tier: 1 },
  1002: { id: 1002, name: 'Alcohol', tier: 1 },
  1008: { id: 1008, name: 'Adult Products and Services', tier: 1 },
  1010: { id: 1010, name: 'Business and Industrial', tier: 1 },
  1050: { id: 1050, name: 'Cannabis', tier: 1 },
  1055: { id: 1055, name: 'Clothing and Accessories', tier: 1 },
  1085: { id: 1085, name: 'Collectables and Antiques', tier: 1 },
  1090: { id: 1090, name: 'Computer Software', tier: 1 },
  1110: { id: 1110, name: 'Cosmetic Services', tier: 1 },
  1115: { id: 1115, name: 'Consumer Electronics', tier: 1 },
  1150: { id: 1150, name: 'Consumer Packaged Goods', tier: 1 },
  1200: { id: 1200, name: 'Culture and Fine Arts', tier: 1 },
  1210: { id: 1210, name: 'Dating', tier: 1 },
  1215: { id: 1215, name: 'Debated Sensitive Social Issue', tier: 1 },
  1220: { id: 1220, name: 'Dieting and Weight Loss', tier: 1 },
  1225: { id: 1225, name: 'Durable Goods', tier: 1 },
  1260: { id: 1260, name: 'Education and Careers', tier: 1 },
  1290: { id: 1290, name: 'Events and Performances', tier: 1 },
  1310: { id: 1310, name: 'Family and Parenting', tier: 1 },
  1340: { id: 1340, name: 'Finance and Insurance', tier: 1 },
  1390: { id: 1390, name: 'Fitness Activities', tier: 1 },
  1410: { id: 1410, name: 'Food and Beverage Services', tier: 1 },
  1440: { id: 1440, name: 'Gambling', tier: 1 },
  1460: { id: 1460, name: 'Gifts and Holiday Items', tier: 1 },
  1470: { id: 1470, name: 'Green/Eco', tier: 1 },
  1480: { id: 1480, name: 'Health and Medical Services', tier: 1 },
  1520: { id: 1520, name: 'Home and Garden Services', tier: 1 },
  1550: { id: 1550, name: 'Legal Services', tier: 1 },
  1560: { id: 1560, name: 'Media', tier: 1 },
  1610: { id: 1610, name: 'Metals', tier: 1 },
  1620: { id: 1620, name: 'Non-Fiat Currency', tier: 1 },
  1630: { id: 1630, name: 'Non-Profits', tier: 1 },
  1640: { id: 1640, name: 'Personal/Consumer Telecom', tier: 1 },
  1660: { id: 1660, name: 'Pet Ownership', tier: 1 },
  1680: { id: 1680, name: 'Pharmaceuticals', tier: 1 },
  1710: { id: 1710, name: 'Politics', tier: 1 },
  1720: { id: 1720, name: 'Real Estate', tier: 1 },
  1740: { id: 1740, name: 'Religion and Spirituality', tier: 1 },
  1750: { id: 1750, name: 'Retail', tier: 1 },
  1760: { id: 1760, name: 'Sexual Health', tier: 1 },
  1770: { id: 1770, name: 'Sporting Goods', tier: 1 },
  1800: { id: 1800, name: 'Tobacco', tier: 1 },
  1810: { id: 1810, name: 'Travel and Tourism', tier: 1 },
  1860: { id: 1860, name: 'Vehicles', tier: 1 },
  1920: { id: 1920, name: 'Weapons and Ammunition', tier: 1 }
};

// Full Taxonomy with Subcategories
export const IAB_AD_PRODUCT_TAXONOMY = {
  // Ad Safety Risk
  1001: { id: 1001, name: 'Ad Safety Risk', tier: 1, parent: null },

  // Alcohol
  1002: { id: 1002, name: 'Alcohol', tier: 1, parent: null },
  1003: { id: 1003, name: 'Bars', tier: 2, parent: 1002 },
  1004: { id: 1004, name: 'Beer', tier: 2, parent: 1002 },
  1005: { id: 1005, name: 'Hard Sodas, Seltzers, Alco Pops', tier: 2, parent: 1002 },
  1006: { id: 1006, name: 'Spirits', tier: 2, parent: 1002 },
  1007: { id: 1007, name: 'Wine', tier: 2, parent: 1002 },

  // Adult Products and Services
  1008: { id: 1008, name: 'Adult Products and Services', tier: 1, parent: null },
  1009: { id: 1009, name: 'Adult Entertainment', tier: 2, parent: 1008 },

  // Business and Industrial
  1010: { id: 1010, name: 'Business and Industrial', tier: 1, parent: null },
  1011: { id: 1011, name: 'Advertising and Marketing', tier: 2, parent: 1010 },
  1012: { id: 1012, name: 'Business Services', tier: 2, parent: 1010 },
  1013: { id: 1013, name: 'Consulting', tier: 3, parent: 1012 },
  1014: { id: 1014, name: 'Human Resources', tier: 3, parent: 1012 },
  1015: { id: 1015, name: 'Office Supplies', tier: 3, parent: 1012 },
  1016: { id: 1016, name: 'Printing and Publishing', tier: 3, parent: 1012 },
  1020: { id: 1020, name: 'Construction', tier: 2, parent: 1010 },
  1025: { id: 1025, name: 'Energy Industry', tier: 2, parent: 1010 },
  1026: { id: 1026, name: 'Oil and Gas', tier: 3, parent: 1025 },
  1027: { id: 1027, name: 'Renewable Energy', tier: 3, parent: 1025 },
  1030: { id: 1030, name: 'Manufacturing', tier: 2, parent: 1010 },
  1035: { id: 1035, name: 'Industrial Equipment', tier: 2, parent: 1010 },
  1040: { id: 1040, name: 'Transportation and Logistics', tier: 2, parent: 1010 },
  1045: { id: 1045, name: 'Agriculture', tier: 2, parent: 1010 },

  // Cannabis
  1050: { id: 1050, name: 'Cannabis', tier: 1, parent: null },
  1051: { id: 1051, name: 'CBD Products', tier: 2, parent: 1050 },
  1052: { id: 1052, name: 'THC Products', tier: 2, parent: 1050 },
  1053: { id: 1053, name: 'Cannabis Accessories', tier: 2, parent: 1050 },

  // Clothing and Accessories
  1055: { id: 1055, name: 'Clothing and Accessories', tier: 1, parent: null },
  1056: { id: 1056, name: 'Womens Apparel', tier: 2, parent: 1055 },
  1057: { id: 1057, name: 'Mens Apparel', tier: 2, parent: 1055 },
  1058: { id: 1058, name: 'Childrens Apparel', tier: 2, parent: 1055 },
  1060: { id: 1060, name: 'Footwear', tier: 2, parent: 1055 },
  1065: { id: 1065, name: 'Jewelry', tier: 2, parent: 1055 },
  1070: { id: 1070, name: 'Watches', tier: 2, parent: 1055 },
  1075: { id: 1075, name: 'Handbags and Accessories', tier: 2, parent: 1055 },
  1080: { id: 1080, name: 'Eyewear', tier: 2, parent: 1055 },

  // Collectables and Antiques
  1085: { id: 1085, name: 'Collectables and Antiques', tier: 1, parent: null },

  // Computer Software
  1090: { id: 1090, name: 'Computer Software', tier: 1, parent: null },
  1091: { id: 1091, name: 'Business Software', tier: 2, parent: 1090 },
  1092: { id: 1092, name: 'Consumer Software', tier: 2, parent: 1090 },
  1093: { id: 1093, name: 'Mobile Apps', tier: 2, parent: 1090 },
  1095: { id: 1095, name: 'Video Games', tier: 2, parent: 1090 },
  1100: { id: 1100, name: 'Security Software', tier: 2, parent: 1090 },
  1105: { id: 1105, name: 'Cloud Services', tier: 2, parent: 1090 },

  // Cosmetic Services
  1110: { id: 1110, name: 'Cosmetic Services', tier: 1, parent: null },
  1111: { id: 1111, name: 'Cosmetic Surgery', tier: 2, parent: 1110 },
  1112: { id: 1112, name: 'Spa and Wellness', tier: 2, parent: 1110 },
  1113: { id: 1113, name: 'Hair and Nail Services', tier: 2, parent: 1110 },

  // Consumer Electronics
  1115: { id: 1115, name: 'Consumer Electronics', tier: 1, parent: null },
  1116: { id: 1116, name: 'Computers and Laptops', tier: 2, parent: 1115 },
  1117: { id: 1117, name: 'Tablets', tier: 2, parent: 1115 },
  1118: { id: 1118, name: 'Smartphones', tier: 2, parent: 1115 },
  1120: { id: 1120, name: 'Wearables', tier: 2, parent: 1115 },
  1121: { id: 1121, name: 'Smartwatches', tier: 3, parent: 1120 },
  1122: { id: 1122, name: 'Fitness Trackers', tier: 3, parent: 1120 },
  1125: { id: 1125, name: 'Audio Equipment', tier: 2, parent: 1115 },
  1126: { id: 1126, name: 'Headphones', tier: 3, parent: 1125 },
  1127: { id: 1127, name: 'Speakers', tier: 3, parent: 1125 },
  1130: { id: 1130, name: 'TVs and Displays', tier: 2, parent: 1115 },
  1135: { id: 1135, name: 'Cameras and Photography', tier: 2, parent: 1115 },
  1140: { id: 1140, name: 'Gaming Hardware', tier: 2, parent: 1115 },
  1145: { id: 1145, name: 'Smart Home Devices', tier: 2, parent: 1115 },

  // Consumer Packaged Goods
  1150: { id: 1150, name: 'Consumer Packaged Goods', tier: 1, parent: null },
  1151: { id: 1151, name: 'Food and Beverages', tier: 2, parent: 1150 },
  1152: { id: 1152, name: 'Snacks', tier: 3, parent: 1151 },
  1153: { id: 1153, name: 'Soft Drinks', tier: 3, parent: 1151 },
  1154: { id: 1154, name: 'Cereal and Breakfast Foods', tier: 3, parent: 1151 },
  1155: { id: 1155, name: 'Dairy Products', tier: 3, parent: 1151 },
  1160: { id: 1160, name: 'Personal Care', tier: 2, parent: 1150 },
  1161: { id: 1161, name: 'Skincare', tier: 3, parent: 1160 },
  1162: { id: 1162, name: 'Hair Care', tier: 3, parent: 1160 },
  1163: { id: 1163, name: 'Oral Care', tier: 3, parent: 1160 },
  1164: { id: 1164, name: 'Deodorant', tier: 3, parent: 1160 },
  1170: { id: 1170, name: 'Household Products', tier: 2, parent: 1150 },
  1171: { id: 1171, name: 'Cleaning Products', tier: 3, parent: 1170 },
  1172: { id: 1172, name: 'Laundry Products', tier: 3, parent: 1170 },
  1175: { id: 1175, name: 'Beauty and Cosmetics', tier: 2, parent: 1150 },
  1176: { id: 1176, name: 'Makeup', tier: 3, parent: 1175 },
  1177: { id: 1177, name: 'Fragrance', tier: 3, parent: 1175 },
  1180: { id: 1180, name: 'Baby Products', tier: 2, parent: 1150 },
  1181: { id: 1181, name: 'Diapers', tier: 3, parent: 1180 },
  1182: { id: 1182, name: 'Baby Food', tier: 3, parent: 1180 },
  1185: { id: 1185, name: 'Pet Food and Supplies', tier: 2, parent: 1150 },
  1190: { id: 1190, name: 'HFSS Products', tier: 2, parent: 1150 },

  // Culture and Fine Arts
  1200: { id: 1200, name: 'Culture and Fine Arts', tier: 1, parent: null },
  1201: { id: 1201, name: 'Art', tier: 2, parent: 1200 },
  1202: { id: 1202, name: 'Museums', tier: 2, parent: 1200 },
  1203: { id: 1203, name: 'Theater', tier: 2, parent: 1200 },

  // Dating
  1210: { id: 1210, name: 'Dating', tier: 1, parent: null },
  1211: { id: 1211, name: 'Dating Services', tier: 2, parent: 1210 },
  1212: { id: 1212, name: 'Matchmaking', tier: 2, parent: 1210 },

  // Debated Sensitive Social Issue
  1215: { id: 1215, name: 'Debated Sensitive Social Issue', tier: 1, parent: null },

  // Dieting and Weight Loss
  1220: { id: 1220, name: 'Dieting and Weight Loss', tier: 1, parent: null },
  1221: { id: 1221, name: 'Diet Programs', tier: 2, parent: 1220 },
  1222: { id: 1222, name: 'Weight Loss Supplements', tier: 2, parent: 1220 },

  // Durable Goods
  1225: { id: 1225, name: 'Durable Goods', tier: 1, parent: null },
  1226: { id: 1226, name: 'Appliances', tier: 2, parent: 1225 },
  1227: { id: 1227, name: 'Kitchen Appliances', tier: 3, parent: 1226 },
  1228: { id: 1228, name: 'Laundry Appliances', tier: 3, parent: 1226 },
  1230: { id: 1230, name: 'Furniture', tier: 2, parent: 1225 },
  1231: { id: 1231, name: 'Living Room Furniture', tier: 3, parent: 1230 },
  1232: { id: 1232, name: 'Bedroom Furniture', tier: 3, parent: 1230 },
  1233: { id: 1233, name: 'Outdoor Furniture', tier: 3, parent: 1230 },
  1240: { id: 1240, name: 'Home Improvement', tier: 2, parent: 1225 },
  1241: { id: 1241, name: 'Tools', tier: 3, parent: 1240 },
  1242: { id: 1242, name: 'Building Materials', tier: 3, parent: 1240 },
  1250: { id: 1250, name: 'Bedding and Linens', tier: 2, parent: 1225 },

  // Education and Careers
  1260: { id: 1260, name: 'Education and Careers', tier: 1, parent: null },
  1261: { id: 1261, name: 'Colleges and Universities', tier: 2, parent: 1260 },
  1262: { id: 1262, name: 'Online Education', tier: 2, parent: 1260 },
  1263: { id: 1263, name: 'Vocational Training', tier: 2, parent: 1260 },
  1265: { id: 1265, name: 'Job Search', tier: 2, parent: 1260 },
  1270: { id: 1270, name: 'Professional Development', tier: 2, parent: 1260 },
  1275: { id: 1275, name: 'K-12 Education', tier: 2, parent: 1260 },
  1280: { id: 1280, name: 'Test Preparation', tier: 2, parent: 1260 },
  1285: { id: 1285, name: 'Language Learning', tier: 2, parent: 1260 },

  // Events and Performances
  1290: { id: 1290, name: 'Events and Performances', tier: 1, parent: null },
  1291: { id: 1291, name: 'Concerts', tier: 2, parent: 1290 },
  1292: { id: 1292, name: 'Sports Events', tier: 2, parent: 1290 },
  1293: { id: 1293, name: 'Festivals', tier: 2, parent: 1290 },
  1295: { id: 1295, name: 'Conferences', tier: 2, parent: 1290 },
  1300: { id: 1300, name: 'Ticketing', tier: 2, parent: 1290 },

  // Family and Parenting
  1310: { id: 1310, name: 'Family and Parenting', tier: 1, parent: null },
  1311: { id: 1311, name: 'Parenting Resources', tier: 2, parent: 1310 },
  1312: { id: 1312, name: 'Childcare', tier: 2, parent: 1310 },
  1315: { id: 1315, name: 'Pregnancy', tier: 2, parent: 1310 },
  1320: { id: 1320, name: 'Childrens Products', tier: 2, parent: 1310 },
  1321: { id: 1321, name: 'Toys', tier: 3, parent: 1320 },
  1322: { id: 1322, name: 'Games', tier: 3, parent: 1320 },
  1325: { id: 1325, name: 'Education Products', tier: 2, parent: 1310 },
  1330: { id: 1330, name: 'Family Activities', tier: 2, parent: 1310 },

  // Finance and Insurance
  1340: { id: 1340, name: 'Finance and Insurance', tier: 1, parent: null },
  1341: { id: 1341, name: 'Banking', tier: 2, parent: 1340 },
  1342: { id: 1342, name: 'Checking Accounts', tier: 3, parent: 1341 },
  1343: { id: 1343, name: 'Savings Accounts', tier: 3, parent: 1341 },
  1345: { id: 1345, name: 'Credit Cards', tier: 2, parent: 1340 },
  1350: { id: 1350, name: 'Loans', tier: 2, parent: 1340 },
  1351: { id: 1351, name: 'Personal Loans', tier: 3, parent: 1350 },
  1352: { id: 1352, name: 'Mortgages', tier: 3, parent: 1350 },
  1353: { id: 1353, name: 'Auto Loans', tier: 3, parent: 1350 },
  1355: { id: 1355, name: 'Insurance', tier: 2, parent: 1340 },
  1356: { id: 1356, name: 'Auto Insurance', tier: 3, parent: 1355 },
  1357: { id: 1357, name: 'Home Insurance', tier: 3, parent: 1355 },
  1358: { id: 1358, name: 'Life Insurance', tier: 3, parent: 1355 },
  1359: { id: 1359, name: 'Health Insurance', tier: 3, parent: 1355 },
  1365: { id: 1365, name: 'Investments', tier: 2, parent: 1340 },
  1366: { id: 1366, name: 'Stocks', tier: 3, parent: 1365 },
  1367: { id: 1367, name: 'Bonds', tier: 3, parent: 1365 },
  1368: { id: 1368, name: 'Mutual Funds', tier: 3, parent: 1365 },
  1370: { id: 1370, name: 'Retirement Planning', tier: 2, parent: 1340 },
  1375: { id: 1375, name: 'Tax Services', tier: 2, parent: 1340 },
  1380: { id: 1380, name: 'Financial Planning', tier: 2, parent: 1340 },
  1385: { id: 1385, name: 'Fintech', tier: 2, parent: 1340 },

  // Fitness Activities
  1390: { id: 1390, name: 'Fitness Activities', tier: 1, parent: null },
  1391: { id: 1391, name: 'Gyms and Fitness Centers', tier: 2, parent: 1390 },
  1392: { id: 1392, name: 'Fitness Classes', tier: 2, parent: 1390 },
  1393: { id: 1393, name: 'Personal Training', tier: 2, parent: 1390 },
  1395: { id: 1395, name: 'Yoga and Pilates', tier: 2, parent: 1390 },
  1400: { id: 1400, name: 'Fitness Apps', tier: 2, parent: 1390 },

  // Food and Beverage Services
  1410: { id: 1410, name: 'Food and Beverage Services', tier: 1, parent: null },
  1411: { id: 1411, name: 'Restaurants', tier: 2, parent: 1410 },
  1412: { id: 1412, name: 'Fast Food', tier: 3, parent: 1411 },
  1413: { id: 1413, name: 'Casual Dining', tier: 3, parent: 1411 },
  1414: { id: 1414, name: 'Fine Dining', tier: 3, parent: 1411 },
  1420: { id: 1420, name: 'Food Delivery', tier: 2, parent: 1410 },
  1425: { id: 1425, name: 'Meal Kits', tier: 2, parent: 1410 },
  1430: { id: 1430, name: 'Coffee and Tea', tier: 2, parent: 1410 },
  1435: { id: 1435, name: 'Grocery', tier: 2, parent: 1410 },

  // Gambling
  1440: { id: 1440, name: 'Gambling', tier: 1, parent: null },
  1441: { id: 1441, name: 'Casinos', tier: 2, parent: 1440 },
  1442: { id: 1442, name: 'Lottery', tier: 2, parent: 1440 },
  1443: { id: 1443, name: 'Sports Betting', tier: 2, parent: 1440 },
  1445: { id: 1445, name: 'Online Gambling', tier: 2, parent: 1440 },
  1450: { id: 1450, name: 'Fantasy Sports', tier: 2, parent: 1440 },

  // Gifts and Holiday Items
  1460: { id: 1460, name: 'Gifts and Holiday Items', tier: 1, parent: null },
  1461: { id: 1461, name: 'Gift Cards', tier: 2, parent: 1460 },
  1462: { id: 1462, name: 'Holiday Decorations', tier: 2, parent: 1460 },
  1465: { id: 1465, name: 'Flowers and Gifts', tier: 2, parent: 1460 },

  // Green/Eco
  1470: { id: 1470, name: 'Green/Eco', tier: 1, parent: null },
  1471: { id: 1471, name: 'Sustainable Products', tier: 2, parent: 1470 },
  1472: { id: 1472, name: 'Electric Vehicles', tier: 2, parent: 1470 },
  1473: { id: 1473, name: 'Solar Energy', tier: 2, parent: 1470 },

  // Health and Medical Services
  1480: { id: 1480, name: 'Health and Medical Services', tier: 1, parent: null },
  1481: { id: 1481, name: 'Healthcare Providers', tier: 2, parent: 1480 },
  1482: { id: 1482, name: 'Hospitals', tier: 3, parent: 1481 },
  1483: { id: 1483, name: 'Clinics', tier: 3, parent: 1481 },
  1485: { id: 1485, name: 'Dental Services', tier: 2, parent: 1480 },
  1490: { id: 1490, name: 'Vision Care', tier: 2, parent: 1480 },
  1495: { id: 1495, name: 'Mental Health Services', tier: 2, parent: 1480 },
  1500: { id: 1500, name: 'Telemedicine', tier: 2, parent: 1480 },
  1505: { id: 1505, name: 'Medical Devices', tier: 2, parent: 1480 },
  1510: { id: 1510, name: 'Senior Care', tier: 2, parent: 1480 },
  1515: { id: 1515, name: 'Alternative Medicine', tier: 2, parent: 1480 },

  // Home and Garden Services
  1520: { id: 1520, name: 'Home and Garden Services', tier: 1, parent: null },
  1521: { id: 1521, name: 'Home Security', tier: 2, parent: 1520 },
  1522: { id: 1522, name: 'Home Cleaning', tier: 2, parent: 1520 },
  1525: { id: 1525, name: 'Landscaping', tier: 2, parent: 1520 },
  1530: { id: 1530, name: 'HVAC Services', tier: 2, parent: 1520 },
  1535: { id: 1535, name: 'Plumbing', tier: 2, parent: 1520 },
  1540: { id: 1540, name: 'Pest Control', tier: 2, parent: 1520 },
  1545: { id: 1545, name: 'Moving Services', tier: 2, parent: 1520 },

  // Legal Services
  1550: { id: 1550, name: 'Legal Services', tier: 1, parent: null },
  1551: { id: 1551, name: 'Personal Injury', tier: 2, parent: 1550 },
  1552: { id: 1552, name: 'Family Law', tier: 2, parent: 1550 },
  1553: { id: 1553, name: 'Criminal Law', tier: 2, parent: 1550 },
  1555: { id: 1555, name: 'Business Law', tier: 2, parent: 1550 },

  // Media
  1560: { id: 1560, name: 'Media', tier: 1, parent: null },
  1561: { id: 1561, name: 'Streaming Services', tier: 2, parent: 1560 },
  1562: { id: 1562, name: 'Video Streaming', tier: 3, parent: 1561 },
  1563: { id: 1563, name: 'Music Streaming', tier: 3, parent: 1561 },
  1565: { id: 1565, name: 'News Media', tier: 2, parent: 1560 },
  1570: { id: 1570, name: 'Podcasts', tier: 2, parent: 1560 },
  1575: { id: 1575, name: 'Books and Publications', tier: 2, parent: 1560 },
  1580: { id: 1580, name: 'Movies', tier: 2, parent: 1560 },
  1585: { id: 1585, name: 'TV Shows', tier: 2, parent: 1560 },
  1590: { id: 1590, name: 'Music', tier: 2, parent: 1560 },
  1595: { id: 1595, name: 'Radio', tier: 2, parent: 1560 },
  1600: { id: 1600, name: 'Social Media', tier: 2, parent: 1560 },

  // Metals
  1610: { id: 1610, name: 'Metals', tier: 1, parent: null },
  1611: { id: 1611, name: 'Gold', tier: 2, parent: 1610 },
  1612: { id: 1612, name: 'Silver', tier: 2, parent: 1610 },

  // Non-Fiat Currency
  1620: { id: 1620, name: 'Non-Fiat Currency', tier: 1, parent: null },
  1621: { id: 1621, name: 'Cryptocurrency', tier: 2, parent: 1620 },
  1622: { id: 1622, name: 'NFTs', tier: 2, parent: 1620 },

  // Non-Profits
  1630: { id: 1630, name: 'Non-Profits', tier: 1, parent: null },
  1631: { id: 1631, name: 'Charities', tier: 2, parent: 1630 },
  1632: { id: 1632, name: 'Advocacy Groups', tier: 2, parent: 1630 },

  // Personal/Consumer Telecom
  1640: { id: 1640, name: 'Personal/Consumer Telecom', tier: 1, parent: null },
  1641: { id: 1641, name: 'Mobile Carriers', tier: 2, parent: 1640 },
  1642: { id: 1642, name: 'Internet Service Providers', tier: 2, parent: 1640 },
  1645: { id: 1645, name: 'Cable and Satellite', tier: 2, parent: 1640 },
  1650: { id: 1650, name: 'VoIP Services', tier: 2, parent: 1640 },

  // Pet Ownership
  1660: { id: 1660, name: 'Pet Ownership', tier: 1, parent: null },
  1661: { id: 1661, name: 'Pet Supplies', tier: 2, parent: 1660 },
  1662: { id: 1662, name: 'Pet Services', tier: 2, parent: 1660 },
  1665: { id: 1665, name: 'Veterinary Services', tier: 2, parent: 1660 },
  1670: { id: 1670, name: 'Pet Insurance', tier: 2, parent: 1660 },

  // Pharmaceuticals
  1680: { id: 1680, name: 'Pharmaceuticals', tier: 1, parent: null },
  1681: { id: 1681, name: 'Prescription Drugs', tier: 2, parent: 1680 },
  1682: { id: 1682, name: 'OTC Medications', tier: 2, parent: 1680 },
  1685: { id: 1685, name: 'Vitamins and Supplements', tier: 2, parent: 1680 },
  1690: { id: 1690, name: 'Pharmacies', tier: 2, parent: 1680 },

  // Politics
  1710: { id: 1710, name: 'Politics', tier: 1, parent: null },
  1711: { id: 1711, name: 'Political Campaigns', tier: 2, parent: 1710 },
  1712: { id: 1712, name: 'Political Advocacy', tier: 2, parent: 1710 },

  // Real Estate
  1720: { id: 1720, name: 'Real Estate', tier: 1, parent: null },
  1721: { id: 1721, name: 'Residential Real Estate', tier: 2, parent: 1720 },
  1722: { id: 1722, name: 'Home Sales', tier: 3, parent: 1721 },
  1723: { id: 1723, name: 'Home Rentals', tier: 3, parent: 1721 },
  1725: { id: 1725, name: 'Commercial Real Estate', tier: 2, parent: 1720 },
  1730: { id: 1730, name: 'Real Estate Agents', tier: 2, parent: 1720 },
  1735: { id: 1735, name: 'Property Management', tier: 2, parent: 1720 },

  // Religion and Spirituality
  1740: { id: 1740, name: 'Religion and Spirituality', tier: 1, parent: null },
  1741: { id: 1741, name: 'Religious Organizations', tier: 2, parent: 1740 },
  1742: { id: 1742, name: 'Spiritual Products', tier: 2, parent: 1740 },

  // Retail
  1750: { id: 1750, name: 'Retail', tier: 1, parent: null },
  1751: { id: 1751, name: 'E-commerce', tier: 2, parent: 1750 },
  1752: { id: 1752, name: 'Department Stores', tier: 2, parent: 1750 },
  1755: { id: 1755, name: 'Specialty Retail', tier: 2, parent: 1750 },

  // Sexual Health
  1760: { id: 1760, name: 'Sexual Health', tier: 1, parent: null },
  1761: { id: 1761, name: 'Contraception', tier: 2, parent: 1760 },
  1762: { id: 1762, name: 'STI Testing', tier: 2, parent: 1760 },

  // Sporting Goods
  1770: { id: 1770, name: 'Sporting Goods', tier: 1, parent: null },
  1771: { id: 1771, name: 'Fitness Equipment', tier: 2, parent: 1770 },
  1772: { id: 1772, name: 'Outdoor Recreation', tier: 2, parent: 1770 },
  1773: { id: 1773, name: 'Camping and Hiking', tier: 3, parent: 1772 },
  1774: { id: 1774, name: 'Fishing', tier: 3, parent: 1772 },
  1775: { id: 1775, name: 'Hunting', tier: 3, parent: 1772 },
  1780: { id: 1780, name: 'Team Sports Equipment', tier: 2, parent: 1770 },
  1785: { id: 1785, name: 'Water Sports', tier: 2, parent: 1770 },
  1790: { id: 1790, name: 'Winter Sports', tier: 2, parent: 1770 },
  1795: { id: 1795, name: 'Golf Equipment', tier: 2, parent: 1770 },

  // Tobacco
  1800: { id: 1800, name: 'Tobacco', tier: 1, parent: null },
  1801: { id: 1801, name: 'Cigarettes', tier: 2, parent: 1800 },
  1802: { id: 1802, name: 'Cigars', tier: 2, parent: 1800 },
  1803: { id: 1803, name: 'Vaping', tier: 2, parent: 1800 },

  // Travel and Tourism
  1810: { id: 1810, name: 'Travel and Tourism', tier: 1, parent: null },
  1811: { id: 1811, name: 'Airlines', tier: 2, parent: 1810 },
  1812: { id: 1812, name: 'Hotels', tier: 2, parent: 1810 },
  1813: { id: 1813, name: 'Vacation Rentals', tier: 2, parent: 1810 },
  1815: { id: 1815, name: 'Car Rentals', tier: 2, parent: 1810 },
  1820: { id: 1820, name: 'Cruises', tier: 2, parent: 1810 },
  1825: { id: 1825, name: 'Travel Packages', tier: 2, parent: 1810 },
  1830: { id: 1830, name: 'Travel Booking Sites', tier: 2, parent: 1810 },
  1835: { id: 1835, name: 'Luggage and Travel Gear', tier: 2, parent: 1810 },
  1840: { id: 1840, name: 'Theme Parks', tier: 2, parent: 1810 },
  1845: { id: 1845, name: 'Business Travel', tier: 2, parent: 1810 },
  1850: { id: 1850, name: 'Adventure Travel', tier: 2, parent: 1810 },

  // Vehicles
  1860: { id: 1860, name: 'Vehicles', tier: 1, parent: null },
  1861: { id: 1861, name: 'Automotive', tier: 2, parent: 1860 },
  1862: { id: 1862, name: 'New Cars', tier: 3, parent: 1861 },
  1863: { id: 1863, name: 'Used Cars', tier: 3, parent: 1861 },
  1864: { id: 1864, name: 'Car Dealerships', tier: 3, parent: 1861 },
  1870: { id: 1870, name: 'Auto Parts', tier: 2, parent: 1860 },
  1875: { id: 1875, name: 'Auto Services', tier: 2, parent: 1860 },
  1876: { id: 1876, name: 'Auto Repair', tier: 3, parent: 1875 },
  1877: { id: 1877, name: 'Car Wash', tier: 3, parent: 1875 },
  1880: { id: 1880, name: 'Motorcycles', tier: 2, parent: 1860 },
  1885: { id: 1885, name: 'Boats and Watercraft', tier: 2, parent: 1860 },
  1890: { id: 1890, name: 'RVs and Campers', tier: 2, parent: 1860 },
  1895: { id: 1895, name: 'Bicycles', tier: 2, parent: 1860 },
  1900: { id: 1900, name: 'Electric Vehicles', tier: 2, parent: 1860 },
  1905: { id: 1905, name: 'Trucks and SUVs', tier: 2, parent: 1860 },
  1910: { id: 1910, name: 'Commercial Vehicles', tier: 2, parent: 1860 },

  // Weapons and Ammunition
  1920: { id: 1920, name: 'Weapons and Ammunition', tier: 1, parent: null },
  1921: { id: 1921, name: 'Firearms', tier: 2, parent: 1920 },
  1922: { id: 1922, name: 'Ammunition', tier: 2, parent: 1920 },
  1923: { id: 1923, name: 'Knives and Blades', tier: 2, parent: 1920 }
};

// ID to Code mapping (IAB-AP-XXXX format)
export function getIABCode(id) {
  return `IAB-AP-${id}`;
}

// Code to ID extraction
export function getIdFromCode(code) {
  if (!code) return null;
  const match = code.match(/IAB-AP-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Get category by ID
export function getCategoryById(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return IAB_AD_PRODUCT_TAXONOMY[numId] || null;
}

// Get all tier 1 categories
export function getTier1Categories() {
  return Object.values(IAB_AD_PRODUCT_TAXONOMY).filter(cat => cat.tier === 1);
}

// Get children of a category
export function getChildCategories(parentId) {
  const numId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
  return Object.values(IAB_AD_PRODUCT_TAXONOMY).filter(cat => cat.parent === numId);
}

// Get full path from child to root
export function getCategoryPath(id) {
  const path = [];
  let current = getCategoryById(id);

  while (current) {
    path.unshift(current);
    current = current.parent ? getCategoryById(current.parent) : null;
  }

  return path;
}

// Get label path (e.g., "Consumer Electronics > Wearables > Smartwatches")
export function getCategoryLabel(id) {
  const path = getCategoryPath(id);
  return path.map(cat => cat.name).join(' > ');
}

// Validate category ID
export function isValidCategory(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return numId in IAB_AD_PRODUCT_TAXONOMY;
}

// Get tier 1 parent of any category
export function getTier1Parent(id) {
  const path = getCategoryPath(id);
  return path.length > 0 ? path[0] : null;
}

export default {
  IAB_AD_PRODUCT_TAXONOMY,
  IAB_AD_PRODUCT_TIER1,
  getIABCode,
  getIdFromCode,
  getCategoryById,
  getTier1Categories,
  getChildCategories,
  getCategoryPath,
  getCategoryLabel,
  isValidCategory,
  getTier1Parent
};
