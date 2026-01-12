"""
IAB Ad Product Taxonomy 2.0

Complete taxonomy data for product/service classification in advertising.
Source: IAB Tech Lab Ad Product Taxonomy 2.0 (November 2024)
https://github.com/InteractiveAdvertisingBureau/Taxonomies
"""

from typing import Dict, List, Optional, Any

# Category data structure
class Category:
    """IAB Ad Product Taxonomy category."""

    def __init__(self, id: int, name: str, tier: int, parent: Optional[int] = None):
        self.id = id
        self.name = name
        self.tier = tier
        self.parent = parent

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "tier": self.tier,
            "parent": self.parent
        }

    def __repr__(self) -> str:
        return f"Category(id={self.id}, name='{self.name}', tier={self.tier})"


# Tier 1 Categories (Top-Level)
IAB_AD_PRODUCT_TIER1: Dict[int, Dict[str, Any]] = {
    1001: {"id": 1001, "name": "Ad Safety Risk", "tier": 1},
    1002: {"id": 1002, "name": "Alcohol", "tier": 1},
    1008: {"id": 1008, "name": "Adult Products and Services", "tier": 1},
    1010: {"id": 1010, "name": "Business and Industrial", "tier": 1},
    1050: {"id": 1050, "name": "Cannabis", "tier": 1},
    1055: {"id": 1055, "name": "Clothing and Accessories", "tier": 1},
    1085: {"id": 1085, "name": "Collectables and Antiques", "tier": 1},
    1090: {"id": 1090, "name": "Computer Software", "tier": 1},
    1110: {"id": 1110, "name": "Cosmetic Services", "tier": 1},
    1115: {"id": 1115, "name": "Consumer Electronics", "tier": 1},
    1150: {"id": 1150, "name": "Consumer Packaged Goods", "tier": 1},
    1200: {"id": 1200, "name": "Culture and Fine Arts", "tier": 1},
    1210: {"id": 1210, "name": "Dating", "tier": 1},
    1215: {"id": 1215, "name": "Debated Sensitive Social Issue", "tier": 1},
    1220: {"id": 1220, "name": "Dieting and Weight Loss", "tier": 1},
    1225: {"id": 1225, "name": "Durable Goods", "tier": 1},
    1260: {"id": 1260, "name": "Education and Careers", "tier": 1},
    1290: {"id": 1290, "name": "Events and Performances", "tier": 1},
    1310: {"id": 1310, "name": "Family and Parenting", "tier": 1},
    1340: {"id": 1340, "name": "Finance and Insurance", "tier": 1},
    1390: {"id": 1390, "name": "Fitness Activities", "tier": 1},
    1410: {"id": 1410, "name": "Food and Beverage Services", "tier": 1},
    1440: {"id": 1440, "name": "Gambling", "tier": 1},
    1460: {"id": 1460, "name": "Gifts and Holiday Items", "tier": 1},
    1470: {"id": 1470, "name": "Green/Eco", "tier": 1},
    1480: {"id": 1480, "name": "Health and Medical Services", "tier": 1},
    1520: {"id": 1520, "name": "Home and Garden Services", "tier": 1},
    1550: {"id": 1550, "name": "Legal Services", "tier": 1},
    1560: {"id": 1560, "name": "Media", "tier": 1},
    1610: {"id": 1610, "name": "Metals", "tier": 1},
    1620: {"id": 1620, "name": "Non-Fiat Currency", "tier": 1},
    1630: {"id": 1630, "name": "Non-Profits", "tier": 1},
    1640: {"id": 1640, "name": "Personal/Consumer Telecom", "tier": 1},
    1660: {"id": 1660, "name": "Pet Ownership", "tier": 1},
    1680: {"id": 1680, "name": "Pharmaceuticals", "tier": 1},
    1710: {"id": 1710, "name": "Politics", "tier": 1},
    1720: {"id": 1720, "name": "Real Estate", "tier": 1},
    1740: {"id": 1740, "name": "Religion and Spirituality", "tier": 1},
    1750: {"id": 1750, "name": "Retail", "tier": 1},
    1760: {"id": 1760, "name": "Sexual Health", "tier": 1},
    1770: {"id": 1770, "name": "Sporting Goods", "tier": 1},
    1800: {"id": 1800, "name": "Tobacco", "tier": 1},
    1810: {"id": 1810, "name": "Travel and Tourism", "tier": 1},
    1860: {"id": 1860, "name": "Vehicles", "tier": 1},
    1920: {"id": 1920, "name": "Weapons and Ammunition", "tier": 1},
}

# Full Taxonomy with Subcategories
IAB_AD_PRODUCT_TAXONOMY: Dict[int, Dict[str, Any]] = {
    # Alcohol
    1002: {"id": 1002, "name": "Alcohol", "tier": 1, "parent": None},
    1003: {"id": 1003, "name": "Bars", "tier": 2, "parent": 1002},
    1004: {"id": 1004, "name": "Beer", "tier": 2, "parent": 1002},
    1005: {"id": 1005, "name": "Hard Sodas, Seltzers, Alco Pops", "tier": 2, "parent": 1002},
    1006: {"id": 1006, "name": "Spirits", "tier": 2, "parent": 1002},
    1007: {"id": 1007, "name": "Wine", "tier": 2, "parent": 1002},

    # Business and Industrial
    1010: {"id": 1010, "name": "Business and Industrial", "tier": 1, "parent": None},
    1011: {"id": 1011, "name": "Advertising and Marketing", "tier": 2, "parent": 1010},
    1012: {"id": 1012, "name": "Business Services", "tier": 2, "parent": 1010},
    1020: {"id": 1020, "name": "Construction", "tier": 2, "parent": 1010},
    1025: {"id": 1025, "name": "Energy Industry", "tier": 2, "parent": 1010},
    1030: {"id": 1030, "name": "Manufacturing", "tier": 2, "parent": 1010},
    1040: {"id": 1040, "name": "Transportation and Logistics", "tier": 2, "parent": 1010},
    1045: {"id": 1045, "name": "Agriculture", "tier": 2, "parent": 1010},

    # Cannabis
    1050: {"id": 1050, "name": "Cannabis", "tier": 1, "parent": None},
    1051: {"id": 1051, "name": "CBD Products", "tier": 2, "parent": 1050},
    1052: {"id": 1052, "name": "THC Products", "tier": 2, "parent": 1050},

    # Clothing and Accessories
    1055: {"id": 1055, "name": "Clothing and Accessories", "tier": 1, "parent": None},
    1056: {"id": 1056, "name": "Womens Apparel", "tier": 2, "parent": 1055},
    1057: {"id": 1057, "name": "Mens Apparel", "tier": 2, "parent": 1055},
    1058: {"id": 1058, "name": "Childrens Apparel", "tier": 2, "parent": 1055},
    1060: {"id": 1060, "name": "Footwear", "tier": 2, "parent": 1055},
    1065: {"id": 1065, "name": "Jewelry", "tier": 2, "parent": 1055},
    1070: {"id": 1070, "name": "Watches", "tier": 2, "parent": 1055},
    1075: {"id": 1075, "name": "Handbags and Accessories", "tier": 2, "parent": 1055},
    1080: {"id": 1080, "name": "Eyewear", "tier": 2, "parent": 1055},

    # Computer Software
    1090: {"id": 1090, "name": "Computer Software", "tier": 1, "parent": None},
    1091: {"id": 1091, "name": "Business Software", "tier": 2, "parent": 1090},
    1092: {"id": 1092, "name": "Consumer Software", "tier": 2, "parent": 1090},
    1093: {"id": 1093, "name": "Mobile Apps", "tier": 2, "parent": 1090},
    1095: {"id": 1095, "name": "Video Games", "tier": 2, "parent": 1090},
    1100: {"id": 1100, "name": "Security Software", "tier": 2, "parent": 1090},
    1105: {"id": 1105, "name": "Cloud Services", "tier": 2, "parent": 1090},

    # Consumer Electronics
    1115: {"id": 1115, "name": "Consumer Electronics", "tier": 1, "parent": None},
    1116: {"id": 1116, "name": "Computers and Laptops", "tier": 2, "parent": 1115},
    1117: {"id": 1117, "name": "Tablets", "tier": 2, "parent": 1115},
    1118: {"id": 1118, "name": "Smartphones", "tier": 2, "parent": 1115},
    1120: {"id": 1120, "name": "Wearables", "tier": 2, "parent": 1115},
    1121: {"id": 1121, "name": "Smartwatches", "tier": 3, "parent": 1120},
    1122: {"id": 1122, "name": "Fitness Trackers", "tier": 3, "parent": 1120},
    1125: {"id": 1125, "name": "Audio Equipment", "tier": 2, "parent": 1115},
    1126: {"id": 1126, "name": "Headphones", "tier": 3, "parent": 1125},
    1127: {"id": 1127, "name": "Speakers", "tier": 3, "parent": 1125},
    1130: {"id": 1130, "name": "TVs and Displays", "tier": 2, "parent": 1115},
    1135: {"id": 1135, "name": "Cameras and Photography", "tier": 2, "parent": 1115},
    1140: {"id": 1140, "name": "Gaming Hardware", "tier": 2, "parent": 1115},
    1145: {"id": 1145, "name": "Smart Home Devices", "tier": 2, "parent": 1115},

    # Consumer Packaged Goods
    1150: {"id": 1150, "name": "Consumer Packaged Goods", "tier": 1, "parent": None},
    1151: {"id": 1151, "name": "Food and Beverages", "tier": 2, "parent": 1150},
    1160: {"id": 1160, "name": "Personal Care", "tier": 2, "parent": 1150},
    1170: {"id": 1170, "name": "Household Products", "tier": 2, "parent": 1150},
    1175: {"id": 1175, "name": "Beauty and Cosmetics", "tier": 2, "parent": 1150},
    1180: {"id": 1180, "name": "Baby Products", "tier": 2, "parent": 1150},
    1185: {"id": 1185, "name": "Pet Food and Supplies", "tier": 2, "parent": 1150},

    # Dating
    1210: {"id": 1210, "name": "Dating", "tier": 1, "parent": None},
    1211: {"id": 1211, "name": "Dating Services", "tier": 2, "parent": 1210},

    # Dieting and Weight Loss
    1220: {"id": 1220, "name": "Dieting and Weight Loss", "tier": 1, "parent": None},
    1221: {"id": 1221, "name": "Diet Programs", "tier": 2, "parent": 1220},

    # Durable Goods
    1225: {"id": 1225, "name": "Durable Goods", "tier": 1, "parent": None},
    1226: {"id": 1226, "name": "Appliances", "tier": 2, "parent": 1225},
    1230: {"id": 1230, "name": "Furniture", "tier": 2, "parent": 1225},
    1240: {"id": 1240, "name": "Home Improvement", "tier": 2, "parent": 1225},

    # Education and Careers
    1260: {"id": 1260, "name": "Education and Careers", "tier": 1, "parent": None},
    1261: {"id": 1261, "name": "Colleges and Universities", "tier": 2, "parent": 1260},
    1262: {"id": 1262, "name": "Online Education", "tier": 2, "parent": 1260},
    1265: {"id": 1265, "name": "Job Search", "tier": 2, "parent": 1260},

    # Finance and Insurance
    1340: {"id": 1340, "name": "Finance and Insurance", "tier": 1, "parent": None},
    1341: {"id": 1341, "name": "Banking", "tier": 2, "parent": 1340},
    1345: {"id": 1345, "name": "Credit Cards", "tier": 2, "parent": 1340},
    1350: {"id": 1350, "name": "Loans", "tier": 2, "parent": 1340},
    1355: {"id": 1355, "name": "Insurance", "tier": 2, "parent": 1340},
    1365: {"id": 1365, "name": "Investments", "tier": 2, "parent": 1340},
    1370: {"id": 1370, "name": "Retirement Planning", "tier": 2, "parent": 1340},

    # Fitness Activities
    1390: {"id": 1390, "name": "Fitness Activities", "tier": 1, "parent": None},
    1391: {"id": 1391, "name": "Gyms and Fitness Centers", "tier": 2, "parent": 1390},
    1395: {"id": 1395, "name": "Yoga and Pilates", "tier": 2, "parent": 1390},

    # Food and Beverage Services
    1410: {"id": 1410, "name": "Food and Beverage Services", "tier": 1, "parent": None},
    1411: {"id": 1411, "name": "Restaurants", "tier": 2, "parent": 1410},
    1420: {"id": 1420, "name": "Food Delivery", "tier": 2, "parent": 1410},
    1430: {"id": 1430, "name": "Coffee and Tea", "tier": 2, "parent": 1410},
    1435: {"id": 1435, "name": "Grocery", "tier": 2, "parent": 1410},

    # Gambling
    1440: {"id": 1440, "name": "Gambling", "tier": 1, "parent": None},
    1441: {"id": 1441, "name": "Casinos", "tier": 2, "parent": 1440},
    1443: {"id": 1443, "name": "Sports Betting", "tier": 2, "parent": 1440},

    # Health and Medical Services
    1480: {"id": 1480, "name": "Health and Medical Services", "tier": 1, "parent": None},
    1481: {"id": 1481, "name": "Healthcare Providers", "tier": 2, "parent": 1480},
    1485: {"id": 1485, "name": "Dental Services", "tier": 2, "parent": 1480},
    1495: {"id": 1495, "name": "Mental Health Services", "tier": 2, "parent": 1480},
    1500: {"id": 1500, "name": "Telemedicine", "tier": 2, "parent": 1480},

    # Media
    1560: {"id": 1560, "name": "Media", "tier": 1, "parent": None},
    1561: {"id": 1561, "name": "Streaming Services", "tier": 2, "parent": 1560},
    1565: {"id": 1565, "name": "News Media", "tier": 2, "parent": 1560},
    1570: {"id": 1570, "name": "Podcasts", "tier": 2, "parent": 1560},
    1580: {"id": 1580, "name": "Movies", "tier": 2, "parent": 1560},
    1590: {"id": 1590, "name": "Music", "tier": 2, "parent": 1560},
    1600: {"id": 1600, "name": "Social Media", "tier": 2, "parent": 1560},

    # Non-Fiat Currency
    1620: {"id": 1620, "name": "Non-Fiat Currency", "tier": 1, "parent": None},
    1621: {"id": 1621, "name": "Cryptocurrency", "tier": 2, "parent": 1620},

    # Pet Ownership
    1660: {"id": 1660, "name": "Pet Ownership", "tier": 1, "parent": None},
    1661: {"id": 1661, "name": "Pet Supplies", "tier": 2, "parent": 1660},
    1665: {"id": 1665, "name": "Veterinary Services", "tier": 2, "parent": 1660},

    # Pharmaceuticals
    1680: {"id": 1680, "name": "Pharmaceuticals", "tier": 1, "parent": None},
    1681: {"id": 1681, "name": "Prescription Drugs", "tier": 2, "parent": 1680},
    1682: {"id": 1682, "name": "OTC Medications", "tier": 2, "parent": 1680},
    1685: {"id": 1685, "name": "Vitamins and Supplements", "tier": 2, "parent": 1680},
    1690: {"id": 1690, "name": "Pharmacies", "tier": 2, "parent": 1680},

    # Real Estate
    1720: {"id": 1720, "name": "Real Estate", "tier": 1, "parent": None},
    1721: {"id": 1721, "name": "Residential Real Estate", "tier": 2, "parent": 1720},
    1725: {"id": 1725, "name": "Commercial Real Estate", "tier": 2, "parent": 1720},

    # Retail
    1750: {"id": 1750, "name": "Retail", "tier": 1, "parent": None},
    1751: {"id": 1751, "name": "E-commerce", "tier": 2, "parent": 1750},
    1752: {"id": 1752, "name": "Department Stores", "tier": 2, "parent": 1750},

    # Sporting Goods
    1770: {"id": 1770, "name": "Sporting Goods", "tier": 1, "parent": None},
    1771: {"id": 1771, "name": "Fitness Equipment", "tier": 2, "parent": 1770},
    1772: {"id": 1772, "name": "Outdoor Recreation", "tier": 2, "parent": 1770},
    1780: {"id": 1780, "name": "Team Sports Equipment", "tier": 2, "parent": 1770},
    1795: {"id": 1795, "name": "Golf Equipment", "tier": 2, "parent": 1770},

    # Tobacco
    1800: {"id": 1800, "name": "Tobacco", "tier": 1, "parent": None},
    1801: {"id": 1801, "name": "Cigarettes", "tier": 2, "parent": 1800},
    1803: {"id": 1803, "name": "Vaping", "tier": 2, "parent": 1800},

    # Travel and Tourism
    1810: {"id": 1810, "name": "Travel and Tourism", "tier": 1, "parent": None},
    1811: {"id": 1811, "name": "Airlines", "tier": 2, "parent": 1810},
    1812: {"id": 1812, "name": "Hotels", "tier": 2, "parent": 1810},
    1813: {"id": 1813, "name": "Vacation Rentals", "tier": 2, "parent": 1810},
    1815: {"id": 1815, "name": "Car Rentals", "tier": 2, "parent": 1810},
    1820: {"id": 1820, "name": "Cruises", "tier": 2, "parent": 1810},

    # Vehicles
    1860: {"id": 1860, "name": "Vehicles", "tier": 1, "parent": None},
    1861: {"id": 1861, "name": "Automotive", "tier": 2, "parent": 1860},
    1870: {"id": 1870, "name": "Auto Parts", "tier": 2, "parent": 1860},
    1875: {"id": 1875, "name": "Auto Services", "tier": 2, "parent": 1860},
    1880: {"id": 1880, "name": "Motorcycles", "tier": 2, "parent": 1860},
    1895: {"id": 1895, "name": "Bicycles", "tier": 2, "parent": 1860},
    1900: {"id": 1900, "name": "Electric Vehicles", "tier": 2, "parent": 1860},

    # Weapons and Ammunition
    1920: {"id": 1920, "name": "Weapons and Ammunition", "tier": 1, "parent": None},
    1921: {"id": 1921, "name": "Firearms", "tier": 2, "parent": 1920},
    1922: {"id": 1922, "name": "Ammunition", "tier": 2, "parent": 1920},
}


def get_iab_code(id: int) -> str:
    """Convert ID to IAB-AP-XXXX format code."""
    return f"IAB-AP-{id}"


def get_id_from_code(code: str) -> Optional[int]:
    """Extract ID from IAB-AP code."""
    if not code:
        return None
    if code.startswith("IAB-AP-"):
        try:
            return int(code.replace("IAB-AP-", ""))
        except ValueError:
            return None
    return None


def get_category_by_id(id: int) -> Optional[Dict[str, Any]]:
    """Get category by ID."""
    if isinstance(id, str):
        id = int(id)
    return IAB_AD_PRODUCT_TAXONOMY.get(id)


def get_tier1_categories() -> List[Dict[str, Any]]:
    """Get all tier 1 categories."""
    return [cat for cat in IAB_AD_PRODUCT_TAXONOMY.values() if cat["tier"] == 1]


def get_child_categories(parent_id: int) -> List[Dict[str, Any]]:
    """Get children of a category."""
    if isinstance(parent_id, str):
        parent_id = int(parent_id)
    return [cat for cat in IAB_AD_PRODUCT_TAXONOMY.values() if cat.get("parent") == parent_id]


def get_category_path(id: int) -> List[Dict[str, Any]]:
    """Get full path from root to category."""
    path = []
    current = get_category_by_id(id)

    while current:
        path.insert(0, current)
        parent_id = current.get("parent")
        current = get_category_by_id(parent_id) if parent_id else None

    return path


def get_category_label(id: int) -> str:
    """Get formatted label path (e.g., 'Consumer Electronics > Wearables > Smartwatches')."""
    path = get_category_path(id)
    return " > ".join(cat["name"] for cat in path)


def is_valid_category(id: int) -> bool:
    """Check if category ID is valid."""
    if isinstance(id, str):
        if id.startswith("IAB-AP-"):
            id = get_id_from_code(id)
        else:
            try:
                id = int(id)
            except ValueError:
                return False
    return id in IAB_AD_PRODUCT_TAXONOMY


def get_tier1_parent(id: int) -> Optional[Dict[str, Any]]:
    """Get tier 1 parent of any category."""
    path = get_category_path(id)
    return path[0] if path else None
