/**
 * Map ImageNet / MobileNet class names (food-related) to display name and approximate calories per typical serving.
 * Used by Calorie Tracker when running TensorFlow.js MobileNet in the browser (no Gemini API).
 */
const FOOD_CALORIE_MAP = {
  guacamole: { displayName: "Guacamole", calories: 240 },
  consomme: { displayName: "Consomme", calories: 30 },
  "hot pot": { displayName: "Hot pot", calories: 350 },
  trifle: { displayName: "Trifle", calories: 280 },
  "ice cream": { displayName: "Ice cream", calories: 200 },
  icecream: { displayName: "Ice cream", calories: 200 },
  "ice lolly": { displayName: "Ice lolly / Popsicle", calories: 70 },
  lollipop: { displayName: "Lollipop", calories: 70 },
  popsicle: { displayName: "Popsicle", calories: 70 },
  "french loaf": { displayName: "French bread", calories: 180 },
  bagel: { displayName: "Bagel", calories: 250 },
  pretzel: { displayName: "Pretzel", calories: 110 },
  cheeseburger: { displayName: "Cheeseburger", calories: 350 },
  "hot dog": { displayName: "Hot dog", calories: 250 },
  hotdog: { displayName: "Hot dog", calories: 250 },
  "mashed potato": { displayName: "Mashed potato", calories: 220 },
  "head cabbage": { displayName: "Cabbage", calories: 25 },
  broccoli: { displayName: "Broccoli", calories: 55 },
  cauliflower: { displayName: "Cauliflower", calories: 25 },
  zucchini: { displayName: "Zucchini", calories: 20 },
  courgette: { displayName: "Zucchini", calories: 20 },
  "spaghetti squash": { displayName: "Spaghetti squash", calories: 40 },
  "acorn squash": { displayName: "Acorn squash", calories: 115 },
  "butternut squash": { displayName: "Butternut squash", calories: 80 },
  cucumber: { displayName: "Cucumber", calories: 15 },
  cuke: { displayName: "Cucumber", calories: 15 },
  "artichoke": { displayName: "Artichoke", calories: 60 },
  "bell pepper": { displayName: "Bell pepper", calories: 30 },
  "cardoon": { displayName: "Cardoon", calories: 20 },
  mushroom: { displayName: "Mushroom", calories: 20 },
  apple: { displayName: "Apple", calories: 52 }, // CSV: APPLES,RAW,WITH SKIN = 52 kcal
  "granny smith": { displayName: "Apple", calories: 95 },
  "granny smith apple": { displayName: "Apple", calories: 95 },
  "red apple": { displayName: "Apple", calories: 95 },
  "green apple": { displayName: "Apple", calories: 95 },
  "golden apple": { displayName: "Apple", calories: 95 },
  "gala apple": { displayName: "Apple", calories: 95 },
  "fuji apple": { displayName: "Apple", calories: 95 },
  "honeycrisp apple": { displayName: "Apple", calories: 95 },
  "macintosh apple": { displayName: "Apple", calories: 95 },
  "mcintosh apple": { displayName: "Apple", calories: 95 },
  "cortland apple": { displayName: "Apple", calories: 95 },
  "empire apple": { displayName: "Apple", calories: 95 },
  "braeburn apple": { displayName: "Apple", calories: 95 },
  "pink lady apple": { displayName: "Apple", calories: 95 },
  "crispin apple": { displayName: "Apple", calories: 95 },
  "jazz apple": { displayName: "Apple", calories: 95 },
  "ambrosia apple": { displayName: "Apple", calories: 95 },
  "envy apple": { displayName: "Apple", calories: 95 },
  "sweetango apple": { displayName: "Apple", calories: 95 },
  "cosmic crisp apple": { displayName: "Apple", calories: 95 },
  strawberry: { displayName: "Strawberry", calories: 32 }, // CSV: STRAWBERRIES,RAW = 32 kcal
  "strawberries": { displayName: "Strawberry", calories: 32 },
  orange: { displayName: "Orange", calories: 60 },
  lemon: { displayName: "Lemon", calories: 20 },
  fig: { displayName: "Fig", calories: 50 },
  "pineapple": { displayName: "Pineapple", calories: 50 }, // CSV: PINEAPPLE,RAW,ALL VAR = 50 kcal
  banana: { displayName: "Banana", calories: 89 }, // CSV: BANANAS,RAW = 89 kcal
  grapes: { displayName: "Grapes", calories: 69 }, // CSV: GRAPES,RED OR GRN = 69 kcal
  grape: { displayName: "Grapes", calories: 69 },
  "red grapes": { displayName: "Grapes", calories: 69 },
  "green grapes": { displayName: "Grapes", calories: 69 },
  "thompson seedless": { displayName: "Grapes", calories: 69 },
  "banana, plantain": { displayName: "Banana", calories: 105 },
  plantain: { displayName: "Banana", calories: 105 },
  "cavendish banana": { displayName: "Banana", calories: 105 },
  "lady finger banana": { displayName: "Banana", calories: 105 },
  "red banana": { displayName: "Banana", calories: 105 },
  "yellow banana": { displayName: "Banana", calories: 105 },
  "jackfruit": { displayName: "Jackfruit", calories: 150 },
  "custard apple": { displayName: "Custard apple", calories: 95 },
  pomegranate: { displayName: "Pomegranate", calories: 230 },
  mango: { displayName: "Mango", calories: 60 },
  "ripe mango": { displayName: "Mango", calories: 60 },
  "raw mango": { displayName: "Raw Mango", calories: 50 },
  papaya: { displayName: "Papaya", calories: 43 },
  watermelon: { displayName: "Watermelon", calories: 30 },
  "water melon": { displayName: "Watermelon", calories: 30 },
  muskmelon: { displayName: "Muskmelon", calories: 34 },
  "cantaloupe": { displayName: "Cantaloupe", calories: 34 },
  kiwi: { displayName: "Kiwi", calories: 61 },
  "kiwi fruit": { displayName: "Kiwi", calories: 61 },
  cherry: { displayName: "Cherry", calories: 50 },
  cherries: { displayName: "Cherry", calories: 50 },
  peach: { displayName: "Peach", calories: 59 },
  plum: { displayName: "Plum", calories: 46 },
  apricot: { displayName: "Apricot", calories: 48 },
  pear: { displayName: "Pear", calories: 57 },
  "green pear": { displayName: "Pear", calories: 57 },
  "red pear": { displayName: "Pear", calories: 57 },
  guava: { displayName: "Guava", calories: 68 },
  lychee: { displayName: "Lychee", calories: 66 },
  "dragon fruit": { displayName: "Dragon Fruit", calories: 60 },
  "passion fruit": { displayName: "Passion Fruit", calories: 97 },
  "star fruit": { displayName: "Star Fruit", calories: 31 },
  "custard apple": { displayName: "Custard Apple", calories: 95 },
  "sweet lime": { displayName: "Sweet Lime", calories: 43 },
  "mosambi": { displayName: "Sweet Lime", calories: 43 },
  "sapodilla": { displayName: "Sapodilla", calories: 83 },
  "chikoo": { displayName: "Sapodilla", calories: 83 },
  "jamun": { displayName: "Jamun", calories: 62 },
  "black plum": { displayName: "Jamun", calories: 62 },
  "wood apple": { displayName: "Wood Apple", calories: 140 },
  "bela": { displayName: "Wood Apple", calories: 140 },
  "date": { displayName: "Date", calories: 282 },
  dates: { displayName: "Date", calories: 282 },
  "dry dates": { displayName: "Dry Dates", calories: 282 },
  "raisin": { displayName: "Raisin", calories: 299 },
  raisins: { displayName: "Raisin", calories: 299 },
  "dry grapes": { displayName: "Raisin", calories: 299 },
  "almond": { displayName: "Almond", calories: 579 },
  almonds: { displayName: "Almond", calories: 579 },
  "cashew": { displayName: "Cashew", calories: 553 },
  cashews: { displayName: "Cashew", calories: 553 },
  "walnut": { displayName: "Walnut", calories: 654 },
  walnuts: { displayName: "Walnut", calories: 654 },
  "peanut": { displayName: "Peanut", calories: 567 },
  peanuts: { displayName: "Peanut", calories: 567 },
  "pistachio": { displayName: "Pistachio", calories: 560 },
  pistachios: { displayName: "Pistachio", calories: 560 },
  hay: { displayName: "(skip)", calories: 0 },
  hip: { displayName: "(skip)", calories: 0 },
  "rose hip": { displayName: "(skip)", calories: 0 },
  rosehip: { displayName: "(skip)", calories: 0 },
  vase: { displayName: "(skip)", calories: 0 },
  "flower pot": { displayName: "(skip)", calories: 0 },
  pot: { displayName: "(skip)", calories: 0 },
  "flowerpot": { displayName: "(skip)", calories: 0 },
  carbonara: { displayName: "Pasta carbonara", calories: 450 },
  "chocolate sauce": { displayName: "Chocolate sauce", calories: 150 },
  "dough": { displayName: "Dough / Bread", calories: 150 },
  "meat loaf": { displayName: "Meat loaf", calories: 350 },
  pizza: { displayName: "Pizza", calories: 280 },
  potpie: { displayName: "Pot pie", calories: 400 },
  burrito: { displayName: "Burrito", calories: 400 },
  "red wine": { displayName: "Red wine", calories: 125 },
  espresso: { displayName: "Espresso", calories: 5 },
  "espresso maker": { displayName: "Espresso", calories: 5 },
  "coffee mug": { displayName: "Coffee", calories: 5 },
  "coffeepot": { displayName: "Coffee", calories: 5 },
  "tea": { displayName: "Tea", calories: 2 },
  "beer bottle": { displayName: "Beer", calories: 150 },
  "beer glass": { displayName: "Beer", calories: 150 },
  "wine bottle": { displayName: "Wine", calories: 125 },
  "pop bottle": { displayName: "Soda", calories: 150 },
  "soda bottle": { displayName: "Soda", calories: 150 },
  "cola": { displayName: "Cola", calories: 150 },
  "soft drink": { displayName: "Soft Drink", calories: 150 },
  "cold drink": { displayName: "Soft Drink", calories: 150 },
  "water bottle": { displayName: "Water", calories: 0 },
  "water jug": { displayName: "Water", calories: 0 },
  "whiskey jug": { displayName: "Whiskey", calories: 105 },
  "soup bowl": { displayName: "Soup", calories: 120 },
  "mixing bowl": { displayName: "Bowl (food)", calories: 150 },
  "frying pan": { displayName: "Cooked food (pan)", calories: 200 },
  skillet: { displayName: "Cooked food", calories: 200 },
  wok: { displayName: "Stir-fry / Wok dish", calories: 250 },
  "dining table": { displayName: "Meal (table)", calories: 400 },
  plate: { displayName: "Plate (meal)", calories: 350 },
  "grocery store": { displayName: "(skip)", calories: 0 },
  "restaurant": { displayName: "(skip)", calories: 0 },
  bakery: { displayName: "(skip)", calories: 0 },
  "confectionery": { displayName: "Sweets", calories: 200 },
  "menu": { displayName: "(skip)", calories: 0 },
  "ladle": { displayName: "Soup / Curry", calories: 150 },
  "measuring cup": { displayName: "(skip)", calories: 0 },
  "teapot": { displayName: "Tea", calories: 2 },
  "water jug": { displayName: "Water", calories: 0 },
  goblet: { displayName: "Drink", calories: 100 },
  "croissant": { displayName: "Croissant", calories: 230 },
  "french toast": { displayName: "French toast", calories: 350 },
  "waffle": { displayName: "Waffle", calories: 250 },
  "french loaf": { displayName: "Bread", calories: 180 },
  "dough": { displayName: "Bread / Dough", calories: 150 },
  "mashed potato": { displayName: "Mashed potato", calories: 220 },
  "head cabbage": { displayName: "Cabbage", calories: 25 },
  broccoli: { displayName: "Broccoli", calories: 55 },
  cauliflower: { displayName: "Cauliflower", calories: 25 },
  zucchini: { displayName: "Zucchini", calories: 20 },
  spaghetti: { displayName: "Spaghetti", calories: 220 },
  "pad thai": { displayName: "Pad Thai", calories: 400 },
  "fried rice": { displayName: "Fried rice", calories: 350 },
  // Indian dishes - requested foods
  dal: { displayName: "Dal", calories: 200 },
  "dal makhani": { displayName: "Dal Makhani", calories: 350 },
  "dal makhni": { displayName: "Dal Makhani", calories: 350 },
  "butter naan": { displayName: "Butter Naan", calories: 350 },
  "butter naan bread": { displayName: "Butter Naan", calories: 350 },
  "kadhi chawal": { displayName: "Kadhi Chawal", calories: 320 },
  "kadhi rice": { displayName: "Kadhi Chawal", calories: 320 },
  kadhi: { displayName: "Kadhi", calories: 180 },
  rajma: { displayName: "Rajma", calories: 280 },
  "rajma curry": { displayName: "Rajma", calories: 280 },
  "kidney beans curry": { displayName: "Rajma", calories: 280 },
  curry: { displayName: "Curry", calories: 250 },
  biryani: { displayName: "Biryani", calories: 450 },
  "chicken biryani": { displayName: "Chicken Biryani", calories: 500 },
  "mutton biryani": { displayName: "Mutton Biryani", calories: 550 },
  "vegetable biryani": { displayName: "Vegetable Biryani", calories: 400 },
  dosa: { displayName: "Dosa", calories: 150 },
  "masala dosa": { displayName: "Masala Dosa", calories: 250 },
  idli: { displayName: "Idli", calories: 60 },
  naan: { displayName: "Naan", calories: 320 },
  roti: { displayName: "Roti", calories: 120 },
  "chapati": { displayName: "Roti", calories: 120 },
  paratha: { displayName: "Paratha", calories: 260 },
  "aloo paratha": { displayName: "Aloo Paratha", calories: 320 },
  "gobi paratha": { displayName: "Gobi Paratha", calories: 300 },
  samosa: { displayName: "Samosa", calories: 260 },
  "pakora": { displayName: "Pakora", calories: 150 },
  "rice": { displayName: "Rice", calories: 200 },
  "basmati rice": { displayName: "Basmati Rice", calories: 200 },
  "fried rice": { displayName: "Fried Rice", calories: 350 },
  "chicken": { displayName: "Chicken", calories: 250 },
  "chicken curry": { displayName: "Chicken Curry", calories: 300 },
  "chicken tikka": { displayName: "Chicken Tikka", calories: 280 },
  "butter chicken": { displayName: "Butter Chicken", calories: 450 },
  "chicken masala": { displayName: "Chicken Masala", calories: 350 },
  "grilled chicken": { displayName: "Grilled Chicken", calories: 250 },
  "roasted chicken": { displayName: "Roasted Chicken", calories: 280 },
  "chicken wings": { displayName: "Chicken Wings", calories: 200 },
  "chicken breast": { displayName: "Chicken Breast", calories: 230 },
  paneer: { displayName: "Paneer", calories: 300 },
  "paneer curry": { displayName: "Paneer Curry", calories: 350 },
  "paneer tikka": { displayName: "Paneer Tikka", calories: 280 },
  "palak paneer": { displayName: "Palak Paneer", calories: 320 },
  "mutter paneer": { displayName: "Mutter Paneer", calories: 350 },
  chole: { displayName: "Chole", calories: 250 },
  "chole bhature": { displayName: "Chole Bhature", calories: 550 },
  "aloo gobi": { displayName: "Aloo Gobi", calories: 200 },
  "baingan bharta": { displayName: "Baingan Bharta", calories: 180 },
  "pav bhaji": { displayName: "Pav Bhaji", calories: 400 },
  "vada pav": { displayName: "Vada Pav", calories: 300 },
  "dhokla": { displayName: "Dhokla", calories: 120 },
  "khandvi": { displayName: "Khandvi", calories: 100 },
  "uttapam": { displayName: "Uttapam", calories: 200 },
  "poha": { displayName: "Poha", calories: 250 },
  "upma": { displayName: "Upma", calories: 200 },
  "sabzi": { displayName: "Sabzi", calories: 150 },
  "vegetable curry": { displayName: "Vegetable Curry", calories: 200 },
  "fish": { displayName: "Fish", calories: 200 },
  "salmon": { displayName: "Salmon", calories: 280 },
  "omelette": { displayName: "Omelette", calories: 250 },
  "scrambled egg": { displayName: "Scrambled eggs", calories: 200 },
  "salad": { displayName: "Salad", calories: 100 },
  "sandwich": { displayName: "Sandwich", calories: 350 },
  "soup": { displayName: "Soup", calories: 120 },
  "pasta": { displayName: "Pasta", calories: 220 },
  "noodle": { displayName: "Noodles", calories: 220 },
  "cake": { displayName: "Cake", calories: 350 },
  "chocolate cake": { displayName: "Chocolate Cake", calories: 400 },
  "vanilla cake": { displayName: "Vanilla Cake", calories: 350 },
  "donut": { displayName: "Donut", calories: 250 },
  "cookie": { displayName: "Cookie", calories: 150 },
  "chocolate chip cookie": { displayName: "Chocolate Chip Cookie", calories: 150 },
  "chocolate": { displayName: "Chocolate", calories: 150 },
  "dark chocolate": { displayName: "Dark Chocolate", calories: 150 },
  "milk chocolate": { displayName: "Milk Chocolate", calories: 150 },
  "pie": { displayName: "Pie", calories: 300 },
  "apple pie": { displayName: "Apple Pie", calories: 300 },
  "pancake": { displayName: "Pancake", calories: 230 },
  // Indian desserts
  "gulab jamun": { displayName: "Gulab Jamun", calories: 150 },
  "gulabjamun": { displayName: "Gulab Jamun", calories: 150 },
  "jalebi": { displayName: "Jalebi", calories: 150 },
  "rasgulla": { displayName: "Rasgulla", calories: 120 },
  "ras malai": { displayName: "Ras Malai", calories: 200 },
  "rasmalai": { displayName: "Ras Malai", calories: 200 },
  "kheer": { displayName: "Kheer", calories: 250 },
  "rice kheer": { displayName: "Kheer", calories: 250 },
  "payasam": { displayName: "Payasam", calories: 250 },
  "halwa": { displayName: "Halwa", calories: 300 },
  "gajar halwa": { displayName: "Gajar Halwa", calories: 350 },
  "carrot halwa": { displayName: "Gajar Halwa", calories: 350 },
  "sooji halwa": { displayName: "Sooji Halwa", calories: 300 },
  "suji halwa": { displayName: "Sooji Halwa", calories: 300 },
  "besan halwa": { displayName: "Besan Halwa", calories: 320 },
  "moong dal halwa": { displayName: "Moong Dal Halwa", calories: 300 },
  "barfi": { displayName: "Barfi", calories: 200 },
  "kaju barfi": { displayName: "Kaju Barfi", calories: 250 },
  "kaju katli": { displayName: "Kaju Barfi", calories: 250 },
  "besan ladoo": { displayName: "Besan Ladoo", calories: 150 },
  "motichoor ladoo": { displayName: "Motichoor Ladoo", calories: 150 },
  "coconut ladoo": { displayName: "Coconut Ladoo", calories: 120 },
  "kulfi": { displayName: "Kulfi", calories: 200 },
  "falooda": { displayName: "Falooda", calories: 300 },
  "rabri": { displayName: "Rabri", calories: 250 },
  "shrikhand": { displayName: "Shrikhand", calories: 200 },
  "gajar ka halwa": { displayName: "Gajar Halwa", calories: 350 },
  "badam halwa": { displayName: "Badam Halwa", calories: 350 },
  "kheer": { displayName: "Kheer", calories: 250 },
  "phirni": { displayName: "Phirni", calories: 200 },
  "sandesh": { displayName: "Sandesh", calories: 100 },
  "rosogolla": { displayName: "Rasgulla", calories: 120 },
  "laddu": { displayName: "Ladoo", calories: 150 },
  "ladoo": { displayName: "Ladoo", calories: 150 },
  // More desserts
  "ice cream": { displayName: "Ice Cream", calories: 200 },
  "vanilla ice cream": { displayName: "Vanilla Ice Cream", calories: 200 },
  "chocolate ice cream": { displayName: "Chocolate Ice Cream", calories: 250 },
  "strawberry ice cream": { displayName: "Strawberry Ice Cream", calories: 200 },
  "brownie": { displayName: "Brownie", calories: 250 },
  "chocolate brownie": { displayName: "Brownie", calories: 250 },
  "muffin": { displayName: "Muffin", calories: 200 },
  "chocolate muffin": { displayName: "Chocolate Muffin", calories: 250 },
  "cupcake": { displayName: "Cupcake", calories: 200 },
  "chocolate cupcake": { displayName: "Chocolate Cupcake", calories: 250 },
  "cheesecake": { displayName: "Cheesecake", calories: 350 },
  "tiramisu": { displayName: "Tiramisu", calories: 300 },
  "pudding": { displayName: "Pudding", calories: 150 },
  "chocolate pudding": { displayName: "Chocolate Pudding", calories: 200 },
  "custard": { displayName: "Custard", calories: 150 },
  "fruit custard": { displayName: "Fruit Custard", calories: 200 },
  "pastry": { displayName: "Pastry", calories: 300 },
  "eclair": { displayName: "Eclair", calories: 200 },
  "macaron": { displayName: "Macaron", calories: 100 },
  "truffle": { displayName: "Chocolate Truffle", calories: 100 },
  "fudge": { displayName: "Fudge", calories: 150 },
  "chocolate fudge": { displayName: "Chocolate Fudge", calories: 150 },
  // More common foods
  "bread": { displayName: "Bread", calories: 80 },
  "white bread": { displayName: "White Bread", calories: 80 },
  "brown bread": { displayName: "Brown Bread", calories: 80 },
  "whole wheat bread": { displayName: "Whole Wheat Bread", calories: 80 },
  "toast": { displayName: "Toast", calories: 80 },
  "butter toast": { displayName: "Butter Toast", calories: 150 },
  "egg": { displayName: "Egg", calories: 70 },
  "boiled egg": { displayName: "Boiled Egg", calories: 70 },
  "fried egg": { displayName: "Fried Egg", calories: 90 },
  "scrambled egg": { displayName: "Scrambled Eggs", calories: 200 },
  "omelette": { displayName: "Omelette", calories: 250 },
  "cheese omelette": { displayName: "Cheese Omelette", calories: 300 },
  "milk": { displayName: "Milk", calories: 150 },
  "whole milk": { displayName: "Whole Milk", calories: 150 },
  "skim milk": { displayName: "Skim Milk", calories: 80 },
  "yogurt": { displayName: "Yogurt", calories: 150 },
  "curd": { displayName: "Curd", calories: 150 },
  "dahi": { displayName: "Curd", calories: 150 },
  "butter": { displayName: "Butter", calories: 100 },
  "cheese": { displayName: "Cheese", calories: 100 },
  "cheddar cheese": { displayName: "Cheddar Cheese", calories: 100 },
  "mozzarella": { displayName: "Mozzarella", calories: 80 },
  "paneer": { displayName: "Paneer", calories: 300 },
  "fish": { displayName: "Fish", calories: 200 },
  "fried fish": { displayName: "Fried Fish", calories: 250 },
  "grilled fish": { displayName: "Grilled Fish", calories: 200 },
  "salmon": { displayName: "Salmon", calories: 280 },
  "tuna": { displayName: "Tuna", calories: 200 },
  "prawn": { displayName: "Prawn", calories: 100 },
  "shrimp": { displayName: "Shrimp", calories: 100 },
  "mutton": { displayName: "Mutton", calories: 300 },
  "mutton curry": { displayName: "Mutton Curry", calories: 350 },
  "lamb": { displayName: "Lamb", calories: 300 },
  "beef": { displayName: "Beef", calories: 250 },
  "pork": { displayName: "Pork", calories: 250 },
  "turkey": { displayName: "Turkey", calories: 200 },
  "salad": { displayName: "Salad", calories: 100 },
  "green salad": { displayName: "Green Salad", calories: 50 },
  "fruit salad": { displayName: "Fruit Salad", calories: 150 },
  "sandwich": { displayName: "Sandwich", calories: 350 },
  "veg sandwich": { displayName: "Vegetable Sandwich", calories: 300 },
  "cheese sandwich": { displayName: "Cheese Sandwich", calories: 400 },
  "chicken sandwich": { displayName: "Chicken Sandwich", calories: 450 },
  "burger": { displayName: "Burger", calories: 350 },
  "veg burger": { displayName: "Vegetable Burger", calories: 300 },
  "chicken burger": { displayName: "Chicken Burger", calories: 450 },
  "roll": { displayName: "Roll", calories: 280 },
  "veg roll": { displayName: "Veg Roll", calories: 260 },
  "chicken roll": { displayName: "Chicken Roll", calories: 320 },
  "kathi roll": { displayName: "Kathi Roll", calories: 320 },
  "frankie": { displayName: "Frankie Roll", calories: 320 },
  "spring roll": { displayName: "Spring Roll", calories: 150 },
  "momo": { displayName: "Momos", calories: 45 },
  "momos": { displayName: "Momos", calories: 45 },
  "veg momo": { displayName: "Veg Momos", calories: 45 },
  "chicken momo": { displayName: "Chicken Momos", calories: 55 },
  "pasta": { displayName: "Pasta", calories: 220 },
  "spaghetti": { displayName: "Spaghetti", calories: 220 },
  "penne pasta": { displayName: "Penne Pasta", calories: 220 },
  "macaroni": { displayName: "Macaroni", calories: 220 },
  "noodle": { displayName: "Noodles", calories: 220 },
  "ramen": { displayName: "Ramen", calories: 400 },
  "soup": { displayName: "Soup", calories: 120 },
  "tomato soup": { displayName: "Tomato Soup", calories: 100 },
  "chicken soup": { displayName: "Chicken Soup", calories: 150 },
  "vegetable soup": { displayName: "Vegetable Soup", calories: 100 },
  "corn": { displayName: "Corn", calories: 100 },
  "sweet corn": { displayName: "Sweet Corn", calories: 100 },
  "popcorn": { displayName: "Popcorn", calories: 100 },
  "potato": { displayName: "Potato", calories: 100 },
  "boiled potato": { displayName: "Boiled Potato", calories: 100 },
  "fried potato": { displayName: "Fried Potato", calories: 200 },
  "french fries": { displayName: "French Fries", calories: 300 },
  "chips": { displayName: "Potato Chips", calories: 150 },
  "nachos": { displayName: "Nachos", calories: 290 },
  "onion": { displayName: "Onion", calories: 40 },
  "tomato": { displayName: "Tomato", calories: 20 },
  "carrot": { displayName: "Carrot", calories: 40 },
  "beetroot": { displayName: "Beetroot", calories: 43 },
  "radish": { displayName: "Radish", calories: 16 },
  "turnip": { displayName: "Turnip", calories: 28 },
  "sweet potato": { displayName: "Sweet Potato", calories: 100 },
  "lady finger": { displayName: "Lady Finger", calories: 30 },
  "okra": { displayName: "Okra", calories: 30 },
  "bhindi": { displayName: "Bhindi", calories: 30 },
  "brinjal": { displayName: "Brinjal", calories: 25 },
  "eggplant": { displayName: "Eggplant", calories: 25 },
  "baingan": { displayName: "Brinjal", calories: 25 },
  "beans": { displayName: "Beans", calories: 30 },
  "green beans": { displayName: "Green Beans", calories: 30 },
  "french beans": { displayName: "French Beans", calories: 30 },
  "peas": { displayName: "Peas", calories: 80 },
  "green peas": { displayName: "Green Peas", calories: 80 },
  "mutter": { displayName: "Peas", calories: 80 },
  "corn": { displayName: "Corn", calories: 100 },
  "sweet corn": { displayName: "Sweet Corn", calories: 100 },
  "lentil": { displayName: "Lentil", calories: 200 },
  "moong dal": { displayName: "Moong Dal", calories: 200 },
  "toor dal": { displayName: "Toor Dal", calories: 200 },
  "masoor dal": { displayName: "Masoor Dal", calories: 200 },
  "urad dal": { displayName: "Urad Dal", calories: 200 },
  "chana dal": { displayName: "Chana Dal", calories: 200 },
  "chickpea": { displayName: "Chickpea", calories: 200 },
  "chana": { displayName: "Chickpea", calories: 200 },
  "black gram": { displayName: "Black Gram", calories: 200 },
  "green gram": { displayName: "Green Gram", calories: 200 },
  "red gram": { displayName: "Red Gram", calories: 200 },
  "yellow gram": { displayName: "Yellow Gram", calories: 200 },
};

const DEFAULT_FOOD = { displayName: "Detected item", calories: 180 };

/**
 * Normalize MobileNet className for lookup (lowercase, trim).
 */
function normalizeClassName(className) {
  if (!className || typeof className !== "string") return "";
  return className.toLowerCase().trim();
}

/**
 * Check if a class name should be skipped (non-food item).
 */
function isSkipItem(className) {
  const skipKeywords = [
    "hip", "rose hip", "rosehip", "vase", "pot", "flowerpot", "flower pot",
    "hay", "grocery store", "restaurant", "bakery", "menu", "measuring cup",
    "plate rack", "dishrag", "dishcloth"
  ];
  
  const norm = normalizeClassName(className);
  if (!norm) return false;
  
  // Check if any skip keyword is in the normalized class name
  for (const skip of skipKeywords) {
    if (norm.includes(skip)) return true;
  }
  
  return false;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toCompactKey(str) {
  return normalizeClassName(str).replace(/[^a-z0-9]+/g, "");
}

function editDistanceWithin(a, b, maxDist) {
  // Fast-ish Levenshtein with early exit; returns true if distance <= maxDist
  if (a === b) return true;
  if (!a || !b) return false;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDist) return false;

  // Ensure a is shorter
  if (la > lb) return editDistanceWithin(b, a, maxDist);

  let prev = new Array(la + 1);
  let curr = new Array(la + 1);
  for (let i = 0; i <= la; i++) prev[i] = i;

  for (let j = 1; j <= lb; j++) {
    curr[0] = j;
    let rowMin = curr[0];
    const bj = b.charCodeAt(j - 1);
    for (let i = 1; i <= la; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      const del = prev[i] + 1;
      const ins = curr[i - 1] + 1;
      const sub = prev[i - 1] + cost;
      const v = Math.min(del, ins, sub);
      curr[i] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > maxDist) return false;
    const tmp = prev; prev = curr; curr = tmp;
  }

  return prev[la] <= maxDist;
}

function findBestFoodEntry(norm) {
  if (!norm) return null;

  // Exact match first (fast path)
  if (FOOD_CALORIE_MAP[norm]) {
    const entry = FOOD_CALORIE_MAP[norm];
    return entry && entry.displayName !== "(skip)" ? entry : null;
  }

  // Compact exact match (handles dalmakhani -> dal makhani, butternaan -> butter naan, etc.)
  const normCompact = toCompactKey(norm);
  if (normCompact) {
    for (const [key, value] of Object.entries(FOOD_CALORIE_MAP)) {
      if (!value || value.displayName === "(skip)") continue;
      if (toCompactKey(key) === normCompact) return value;
    }

    // Compact fuzzy match for small typos (e.g. graps -> grapes)
    if (normCompact.length >= 4) {
      let bestFuzzy = null;
      let bestLen = -1;
      for (const [key, value] of Object.entries(FOOD_CALORIE_MAP)) {
        if (!value || value.displayName === "(skip)") continue;
        const kc = toCompactKey(key);
        if (!kc) continue;
        const maxDist = normCompact.length <= 6 ? 1 : 2;
        if (editDistanceWithin(normCompact, kc, maxDist)) {
          // Prefer closer-length (more specific) matches
          if (kc.length > bestLen) {
            bestLen = kc.length;
            bestFuzzy = value;
          }
        }
      }
      if (bestFuzzy) return bestFuzzy;
    }
  }

  // Partial match (choose best/most specific match)
  let best = null;
  let bestScore = -1;

  for (const [key, value] of Object.entries(FOOD_CALORIE_MAP)) {
    if (!value || value.displayName === "(skip)") continue;
    const keyNorm = normalizeClassName(key);
    if (!keyNorm) continue;

    if (!(norm.includes(keyNorm) || keyNorm.includes(norm))) continue;

    const keyCompact = toCompactKey(keyNorm);
    let score = 0;

    // Prefer more specific / longer keys so "dal makhani" beats "dal"
    score += Math.min(60, keyCompact.length);
    if (keyNorm.includes(" ")) score += 8;
    if (norm.startsWith(keyNorm) || keyNorm.startsWith(norm)) score += 10;

    try {
      const re = new RegExp(`\\b${escapeRegExp(keyNorm)}\\b`, "i");
      if (re.test(norm)) score += 25;
    } catch {
      // ignore regex issues
    }

    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }

  return best;
}

/**
 * Find calorie entry for a prediction. Tries exact match, then partial (contains).
 * Returns null if it's a skip item (non-food).
 */
export function getFoodCalorie(className) {
  const norm = normalizeClassName(className);
  if (!norm) return null;
  
  // CRITICAL: Check skip items FIRST - if the whole string contains skip keywords, reject immediately
  if (isSkipItem(norm)) return null;
  
  // Handle comma-separated class names (e.g., "hip, rose hip, rosehip")
  // But if the whole string is a skip item, we already returned null above
  const parts = norm.split(",").map(p => p.trim()).filter(p => p);
  
  // If we have multiple parts, check each one
  if (parts.length > 1) {
    // If ALL parts are skip items, return null
    const allSkip = parts.every(part => isSkipItem(part));
    if (allSkip) return null;
    
    // Try each part for food matches (skip non-food parts)
    for (const part of parts) {
      if (isSkipItem(part)) continue; // Skip non-food parts

      const entry = findBestFoodEntry(part);
      if (entry) return entry;
    }
    
    // If we got here, no food parts matched, return null
    return null;
  }
  
  // Single class name (no commas)
  return findBestFoodEntry(norm);
}
