"""
Mixpeek IAB Ad Product Taxonomy Connector - Keyword Mapping

Deterministic keyword-to-category mapping for IAB Ad Product Taxonomy 2.0.
"""

from typing import Dict, List, Optional, Any
from .taxonomy import get_category_by_id, get_category_path

# Keyword to category ID mapping
KEYWORD_MAPPINGS: Dict[str, int] = {
    # Alcohol (1002)
    "alcohol": 1002, "alcoholic": 1002, "liquor": 1002,
    "bar": 1003, "pub": 1003, "nightclub": 1003,
    "beer": 1004, "lager": 1004, "ale": 1004, "ipa": 1004,
    "hard seltzer": 1005, "seltzer": 1005,
    "spirits": 1006, "whiskey": 1006, "vodka": 1006, "rum": 1006, "gin": 1006, "tequila": 1006,
    "wine": 1007, "champagne": 1007, "prosecco": 1007,

    # Business and Industrial (1010)
    "business": 1010, "b2b": 1010, "enterprise": 1010,
    "advertising": 1011, "marketing": 1011, "agency": 1011,
    "construction": 1020, "contractor": 1020,
    "energy": 1025, "manufacturing": 1030, "logistics": 1040, "agriculture": 1045,

    # Cannabis (1050)
    "cannabis": 1050, "marijuana": 1050, "cbd": 1051, "thc": 1052,

    # Clothing and Accessories (1055)
    "clothing": 1055, "apparel": 1055, "fashion": 1055,
    "shoes": 1060, "footwear": 1060, "sneakers": 1060, "boots": 1060,
    "jewelry": 1065, "jewellery": 1065, "necklace": 1065, "bracelet": 1065,
    "watch": 1070, "watches": 1070,
    "handbag": 1075, "purse": 1075,
    "sunglasses": 1080, "eyeglasses": 1080,

    # Computer Software (1090)
    "software": 1090, "app": 1090, "application": 1090,
    "saas": 1091, "crm": 1091, "erp": 1091,
    "mobile app": 1093,
    "video game": 1095, "game": 1095, "gaming": 1095, "playstation": 1095, "xbox": 1095,
    "antivirus": 1100, "vpn": 1100,
    "cloud": 1105, "aws": 1105, "azure": 1105,

    # Consumer Electronics (1115)
    "electronics": 1115, "gadget": 1115, "tech": 1115,
    "computer": 1116, "laptop": 1116, "pc": 1116, "desktop": 1116, "macbook": 1116,
    "tablet": 1117, "ipad": 1117,
    "smartphone": 1118, "phone": 1118, "iphone": 1118, "android": 1118, "mobile": 1118,
    "wearable": 1120, "wearables": 1120,
    "smartwatch": 1121, "apple watch": 1121,
    "fitness tracker": 1122, "fitbit": 1122,
    "headphones": 1126, "earbuds": 1126, "airpods": 1126,
    "speaker": 1127, "speakers": 1127,
    "tv": 1130, "television": 1130, "monitor": 1130,
    "camera": 1135, "photography": 1135,
    "gaming console": 1140, "ps5": 1140,
    "smart home": 1145, "alexa": 1145,

    # Consumer Packaged Goods (1150)
    "cpg": 1150, "fmcg": 1150,
    "food": 1151, "beverage": 1151,
    "snack": 1151, "chips": 1151, "candy": 1151,
    "personal care": 1160, "skincare": 1160, "shampoo": 1160,
    "cleaning": 1170, "detergent": 1170,
    "makeup": 1175, "cosmetics": 1175, "lipstick": 1175,
    "baby": 1180, "diaper": 1180,
    "pet food": 1185, "dog food": 1185, "cat food": 1185,

    # Dating (1210)
    "dating": 1210, "dating app": 1211, "tinder": 1211, "bumble": 1211,

    # Dieting and Weight Loss (1220)
    "diet": 1220, "weight loss": 1220, "diet program": 1221,

    # Durable Goods (1225)
    "appliance": 1226, "refrigerator": 1226, "oven": 1226,
    "furniture": 1230, "sofa": 1230, "couch": 1230,
    "home improvement": 1240, "tools": 1240,

    # Education and Careers (1260)
    "education": 1260, "learning": 1260, "school": 1260,
    "college": 1261, "university": 1261,
    "online course": 1262, "coursera": 1262, "udemy": 1262,
    "job": 1265, "career": 1265, "job search": 1265,

    # Finance and Insurance (1340)
    "finance": 1340, "financial": 1340, "money": 1340,
    "bank": 1341, "banking": 1341,
    "credit card": 1345, "visa": 1345, "mastercard": 1345,
    "loan": 1350, "mortgage": 1350,
    "insurance": 1355, "car insurance": 1355, "life insurance": 1355,
    "investment": 1365, "stock": 1365, "stocks": 1365, "trading": 1365,
    "retirement": 1370, "401k": 1370,

    # Fitness Activities (1390)
    "fitness": 1390, "workout": 1390, "exercise": 1390,
    "gym": 1391, "fitness center": 1391,
    "yoga": 1395, "pilates": 1395,

    # Food and Beverage Services (1410)
    "restaurant": 1411, "dining": 1411,
    "fast food": 1411, "mcdonalds": 1411,
    "food delivery": 1420, "doordash": 1420, "ubereats": 1420,
    "coffee": 1430, "starbucks": 1430,
    "grocery": 1435, "supermarket": 1435,

    # Gambling (1440)
    "gambling": 1440, "casino": 1441, "betting": 1443, "sports betting": 1443, "draftkings": 1443,

    # Health and Medical Services (1480)
    "health": 1480, "healthcare": 1480, "medical": 1480,
    "doctor": 1481, "hospital": 1481, "clinic": 1481,
    "dentist": 1485, "dental": 1485,
    "mental health": 1495, "therapy": 1495, "therapist": 1495,
    "telemedicine": 1500, "telehealth": 1500,

    # Media (1560)
    "media": 1560, "entertainment": 1560,
    "streaming": 1561, "netflix": 1561, "hulu": 1561, "disney+": 1561,
    "news": 1565, "journalism": 1565,
    "podcast": 1570, "podcasts": 1570,
    "movie": 1580, "movies": 1580, "film": 1580,
    "music": 1590, "album": 1590,
    "social media": 1600, "facebook": 1600, "instagram": 1600, "twitter": 1600, "tiktok": 1600,

    # Non-Fiat Currency (1620)
    "crypto": 1621, "cryptocurrency": 1621, "bitcoin": 1621, "ethereum": 1621,

    # Pet Ownership (1660)
    "pet": 1660, "pets": 1660,
    "pet supplies": 1661, "pet store": 1661,
    "vet": 1665, "veterinarian": 1665,

    # Pharmaceuticals (1680)
    "pharmaceutical": 1680, "drug": 1680, "medication": 1680,
    "prescription": 1681,
    "otc": 1682, "aspirin": 1682,
    "vitamin": 1685, "vitamins": 1685, "supplement": 1685, "supplements": 1685,
    "pharmacy": 1690, "cvs": 1690, "walgreens": 1690,

    # Real Estate (1720)
    "real estate": 1720, "property": 1720,
    "home for sale": 1721, "house": 1721, "zillow": 1721,
    "apartment": 1721, "rent": 1721, "rental": 1721,
    "commercial real estate": 1725,

    # Retail (1750)
    "retail": 1750, "store": 1750, "shop": 1750,
    "ecommerce": 1751, "e-commerce": 1751, "amazon": 1751,
    "department store": 1752,

    # Sporting Goods (1770)
    "sporting goods": 1770, "sports equipment": 1770,
    "fitness equipment": 1771, "treadmill": 1771, "weights": 1771,
    "outdoor": 1772, "camping": 1772, "hiking": 1772,
    "team sports": 1780,
    "golf": 1795, "golf clubs": 1795,

    # Tobacco (1800)
    "tobacco": 1800,
    "cigarette": 1801, "cigarettes": 1801,
    "vape": 1803, "vaping": 1803, "e-cigarette": 1803, "juul": 1803,

    # Travel and Tourism (1810)
    "travel": 1810, "vacation": 1810, "trip": 1810, "tourism": 1810,
    "airline": 1811, "flight": 1811, "flights": 1811,
    "hotel": 1812, "hotels": 1812, "marriott": 1812, "hilton": 1812,
    "vacation rental": 1813, "airbnb": 1813, "vrbo": 1813,
    "car rental": 1815, "hertz": 1815,
    "cruise": 1820, "cruises": 1820,

    # Vehicles (1860)
    "vehicle": 1860, "vehicles": 1860,
    "car": 1861, "cars": 1861, "automobile": 1861, "auto": 1861,
    "auto parts": 1870, "car parts": 1870,
    "auto repair": 1875, "mechanic": 1875,
    "motorcycle": 1880, "motorbike": 1880,
    "bicycle": 1895, "bike": 1895,
    "electric car": 1900, "ev": 1900, "tesla": 1900, "electric vehicle": 1900,

    # Weapons and Ammunition (1920)
    "weapon": 1920, "weapons": 1920,
    "gun": 1921, "firearm": 1921, "rifle": 1921, "pistol": 1921,
    "ammunition": 1922, "ammo": 1922,
}


def map_keyword_to_category(keyword: str) -> Optional[Dict[str, Any]]:
    """Map a single keyword to IAB Ad Product category."""
    if not keyword or not isinstance(keyword, str):
        return None

    normalized = keyword.lower().strip()
    category_id = KEYWORD_MAPPINGS.get(normalized)

    if not category_id:
        return None

    category = get_category_by_id(category_id)
    if not category:
        return None

    return {
        "id": category["id"],
        "name": category["name"],
        "tier": category["tier"],
        "parent": category.get("parent"),
        "confidence": 0.95  # High confidence for exact keyword match
    }


def map_keywords_to_categories(keywords: List[str]) -> List[Dict[str, Any]]:
    """Map multiple keywords to IAB Ad Product categories."""
    if not keywords or not isinstance(keywords, list):
        return []

    category_scores: Dict[int, Dict[str, Any]] = {}

    for keyword in keywords:
        match = map_keyword_to_category(keyword)
        if match:
            cat_id = match["id"]
            if cat_id in category_scores:
                category_scores[cat_id]["match_count"] += 1
                category_scores[cat_id]["keywords"].append(keyword)
            else:
                category_scores[cat_id] = {
                    **match,
                    "match_count": 1,
                    "keywords": [keyword]
                }

    # Convert to list and sort by match count
    results = list(category_scores.values())
    for cat in results:
        cat["confidence"] = min(0.95 + (cat["match_count"] - 1) * 0.01, 0.99)

    results.sort(key=lambda x: x["match_count"], reverse=True)
    return results


def find_best_match(text: str) -> Optional[Dict[str, Any]]:
    """Find best category match from text."""
    if not text or not isinstance(text, str):
        return None

    import re
    words = re.sub(r"[^\w\s-]", " ", text.lower()).split()
    words = [w for w in words if len(w) > 2]

    # Try exact keyword matches first
    for word in words:
        match = map_keyword_to_category(word)
        if match:
            return match

    # Try two-word combinations
    for i in range(len(words) - 1):
        phrase = f"{words[i]} {words[i + 1]}"
        match = map_keyword_to_category(phrase)
        if match:
            return match

    return None


def get_keywords_for_category(category_id: int) -> List[str]:
    """Get all keywords for a category."""
    if isinstance(category_id, str):
        category_id = int(category_id)
    return [kw for kw, cid in KEYWORD_MAPPINGS.items() if cid == category_id]


def get_all_keywords() -> List[str]:
    """Get all mapped keywords."""
    return list(KEYWORD_MAPPINGS.keys())
