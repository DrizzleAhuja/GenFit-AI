import streamlit as st
import tensorflow as tf
from tensorflow import keras
import torch
import torchvision.transforms as transforms
from torchvision import models
import numpy as np
from PIL import Image
import cv2
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import requests
import io
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="FitSync Calorie Tracker",
    page_icon="🍎",
    layout="wide"
)

class CalorieTracker:
    def __init__(self):
        self.food_calorie_db = self._load_food_database()
        self.model, self.imagenet_labels = self._load_pretrained_model()
        self.class_names = [
            'apple', 'banana', 'orange', 'pizza', 'burger', 'sandwich', 'french fries',
            'carrot', 'broccoli', 'cake', 'ice cream', 'rice', 'pasta',
            'chicken', 'steak', 'salmon', 'egg', 'bread', 'cheese',
            'tomato', 'cucumber', 'watermelon', 'strawberry', 'grape',
            'potato', 'onion', 'bell pepper', 'mushroom', 'avocado',
            'coffee', 'cupcake', 'donut', 'hot dog', 'hotdog', 'muffin',
            'waffle', 'pancake', 'cookie', 'pretzel', 'popcorn', 'bagel',
            'yogurt', 'milk', 'cereal', 'granola', 'nuts', 'almonds',
            # Indian foods
            'butter naan', 'naan', 'roti', 'chapati', 'paratha', 'kulcha',
            'dal', 'dal makhani', 'dal tadka', 'chana dal', 'toor dal',
            'butter chicken', 'chicken curry', 'chicken tikka', 'chicken biryani',
            'paneer butter masala', 'paneer tikka', 'palak paneer', 'mutter paneer',
            'samosa', 'pakora', 'bhaji', 'pav bhaji', 'dosa', 'idli', 'vada',
            'biryani', 'pulao', 'fried rice', 'rajma', 'chole', 'matar paneer',
            'aloo gobi', 'baingan bharta', 'dal fry', 'tandoori chicken',
            'seekh kebab', 'tikka masala', 'korma', 'vindaloo', 'butter paneer',
            'chai', 'lassi', 'mango lassi', 'gulab jamun', 'rasgulla', 'jalebi',
            'halwa', 'kheer', 'barfi', 'laddu',
            # Asian foods
            'sushi', 'ramen', 'udon', 'soba', 'tempura', 'teriyaki',
            'spring roll', 'dumpling', 'fried rice', 'chow mein', 'lo mein',
            'kung pao chicken', 'general tso chicken', 'sweet and sour',
            'mapo tofu', 'peking duck', 'dim sum', 'miso soup', 'pad thai',
            'green curry', 'red curry', 'pho', 'banh mi', 'bibimbap',
            # Mexican foods
            'taco', 'burrito', 'quesadilla', 'nachos', 'enchilada', 'fajita',
            'guacamole', 'salsa', 'chimichanga', 'tamale', 'churro',
            # Italian foods
            'spaghetti', 'lasagna', 'ravioli', 'gnocchi', 'risotto', 'fettuccine',
            'carbonara', 'alfredo', 'marinara', 'bruschetta', 'antipasto',
            'tiramisu', 'gelato', 'cannoli', 'zeppole',
            # Other cuisines
            'falafel', 'hummus', 'shawarma', 'gyro', 'kebab', 'moussaka',
            'paella', 'tapas', 'gazpacho', 'ratatouille', 'quiche',
            'fish and chips', 'meat pie', 'cottage pie', 'bangers and mash',
            # Additional common foods
            'soup', 'salad', 'smoothie', 'juice', 'tea', 'hot chocolate',
            'pita bread', 'baguette', 'croissant', 'pretzel', 'sourdough',
            'peanut butter', 'jam', 'honey', 'syrup', 'butter', 'ghee',
            'oats', 'quinoa', 'barley', 'lentils', 'beans', 'chickpeas',
            'tofu', 'tempeh', 'seitan', 'cottage cheese', 'cream cheese',
            'sour cream', 'mayonnaise', 'ketchup', 'mustard', 'ranch',
            'fish', 'shrimp', 'crab', 'lobster', 'scallops', 'oysters',
            'turkey', 'pork', 'lamb', 'beef', 'veal', 'bacon', 'sausage',
            'ham', 'prosciutto', 'pepperoni', 'salami', 'chorizo',
            # More Fruits
            'mango', 'pineapple', 'papaya', 'guava', 'lychee', 'dragon fruit',
            'kiwi', 'pomegranate', 'cherry', 'peach', 'plum', 'apricot',
            'pear', 'date', 'fig', 'coconut', 'passion fruit', 'star fruit',
            'persimmon', 'cantaloupe', 'honeydew', 'blueberry', 'raspberry',
            'blackberry', 'cranberry', 'elderberry', 'boysenberry',
            # More Vegetables
            'zucchini', 'eggplant', 'brussels sprouts', 'cabbage', 'cauliflower',
            'spinach', 'kale', 'lettuce', 'cabbage', 'bok choy', 'celery',
            'radish', 'beetroot', 'turnip', 'sweet potato', 'yam', 'corn',
            'peas', 'green beans', 'asparagus', 'artichoke', 'leek', 'garlic',
            'ginger', 'turmeric', 'chili', 'pepper', 'okra', 'pumpkin',
            'squash', 'butternut squash', 'acorn squash',
            # More Indian Foods
            'aloo paratha', 'gobi paratha', 'methi paratha', 'puri', 'bhatura',
            'upma', 'poha', 'sev puri', 'bhel puri', 'pani puri', 'ragda pattice',
            'vada pav', 'dabeli', 'kathi roll', 'frankie', 'chaat', 'bhel',
            'chana masala', 'aloo matar', 'bhindi masala', 'lauki ki sabzi',
            'tinda masala', 'methi malai matar', 'navratan korma', 'vegetable biryani',
            'mushroom biryani', 'egg biryani', 'mutton biryani', 'goat biryani',
            'rajma chawal', 'dal chawal', 'kadhi chawal', 'jeera rice',
            'lemon rice', 'tamarind rice', 'coconut rice', 'curd rice',
            'sambar', 'rasam', 'kootu', 'poriyal', 'thoran', 'avial',
            'appam', 'uttapam', 'pongal', 'bisi bele bath', 'bisibele bath',
            'medu vada', 'masala vada', 'dal vada', 'onion pakoda',
            'mirchi bajji', 'banana bajji', 'bread pakora', 'corn pakora',
            'paneer pakora', 'aloo tikki', 'samosa chaat', 'paneer tikka',
            'chicken 65', 'chicken manchurian', 'gobi manchurian',
            'paneer manchurian', 'veg manchurian', 'chilli chicken',
            'drumstick curry', 'potato curry', 'onion curry', 'brinjal curry',
            'tomato curry', 'coconut curry', 'fish curry', 'prawn curry',
            'crab curry', 'mutton curry', 'goat curry', 'lamb curry',
            'keema', 'keema matar', 'nargisi kofta', 'malai kofta',
            'vegetable kofta', 'dal pakora', 'dahi vada', 'dahi puri',
            'papdi chaat', 'aloo chaat', 'fruit chaat', 'golgappa',
            'jhal muri', 'masala puri', 'masala dosa', 'plain dosa',
            'onion dosa', 'rava dosa', 'uttapam', 'idiyappam',
            'puttu', 'ada', 'appam', 'neer dosa', 'set dosa',
            'kesari', 'payasam', 'shrikhand', 'rabri', 'basundi',
            'gajar halwa', 'moong dal halwa', 'sooji halwa', 'badam halwa',
            'gulab jamun', 'rasmalai', 'rabdi', 'malpua', 'imarti',
            'soan papdi', 'besan ladoo', 'coconut ladoo', 'motichoor ladoo',
            'kalakand', 'peda', 'burfi', 'kaju katli', 'kulfi',
            'falooda', 'rabri', 'thandai', 'jaljeera', 'aam panna',
            'rooh afza', 'nimbu pani', 'lassi', 'mango lassi', 'rose lassi',
            # More Asian Foods
            'pho bo', 'pho ga', 'bun cha', 'bun bo nam bo', 'banh xeo',
            'cao lau', 'com tam', 'bun rieu', 'hu tieu', 'bun thit nuong',
            'tom kha', 'tom yum', 'larb', 'som tam', 'khao soi',
            'massaman curry', 'panang curry', 'yellow curry', 'crab curry thai',
            'mango sticky rice', 'pad see ew', 'pad kee mao', 'rad na',
            'khao pad', 'khao man gai', 'gai yang', 'satay', 'mee goreng',
            'nasi goreng', 'rendang', 'gado gado', 'gado-gado', 'bakso',
            'soto ayam', 'nasi padang', 'gado gado', 'pecel', 'lumpia',
            'char kway teow', 'hainanese chicken rice', 'laksa', 'mee rebus',
            'roti canai', 'nasi lemak', 'satay', 'beef rendang',
            'chicken adobo', 'pancit', 'sinigang', 'adobo', 'lechon',
            'kare kare', 'sisig', 'halu halo', 'taho', 'bibingka',
            'puto', 'leche flan', 'turon', 'banana cue', 'taho',
            'bulgogi', 'kimchi', 'bibimbap', 'galbi', 'samgyeopsal',
            'tteokbokki', 'japchae', 'korean bbq', 'kimchi jjigae',
            'sundubu jjigae', 'budae jjigae', 'haemul pajeon', 'gamjatang',
            'haejang-guk', 'seolleongtang', 'gimbap', 'sushi roll',
            'sashimi', 'nigiri', 'maki', 'temaki', 'chirashi',
            'unagi', 'teriyaki chicken', 'yakitori', 'okonomiyaki',
            'takoyaki', 'tonkatsu', 'katsu curry', 'omurice', 'curry rice',
            'karaage', 'gyudon', 'oyakodon', 'katsudon', 'tendon',
            'chawanmushi', 'agedashi tofu', 'edamame', 'miso ramen',
            'shoyu ramen', 'tonkotsu ramen', 'tsukemen', 'soba noodles',
            'udon noodles', 'yakisoba', 'sukiyaki', 'shabu shabu',
            'nabe', 'oden', 'nikujaga', 'oyakodon', 'katsu curry',
            'chicken katsu', 'pork katsu', 'gyoza', 'shumai',
            'char siu bao', 'xiao long bao', 'har gow', 'siu mai',
            'pork bun', 'soup dumpling', 'potsticker', 'wonton',
            'wonton soup', 'hot and sour soup', 'egg drop soup',
            'chicken corn soup', 'szechuan chicken', 'orange chicken',
            'beef with broccoli', 'mongolian beef', 'cashew chicken',
            'honey walnut shrimp', 'lemon chicken', 'black pepper chicken',
            'szechuan shrimp', 'mapo eggplant', 'dry pot', 'hot pot',
            'peking pork', 'bbq pork', 'char siu', 'crispy duck',
            'steamed fish', 'sweet and sour fish', 'fish with black bean sauce',
            'salt and pepper shrimp', 'lobster with ginger scallion',
            'crab rangoon', 'egg foo young', 'chow fun', 'chow mein',
            'lo mein', 'beef lo mein', 'chicken lo mein', 'shrimp lo mein',
            'beef chow mein', 'chicken chow mein', 'vegetable chow mein',
            'beef fried rice', 'chicken fried rice', 'shrimp fried rice',
            'pork fried rice', 'yangzhou fried rice', 'pineapple fried rice',
            'singapore noodles', 'hong kong style noodles', 'dan dan noodles',
            'zhajiangmian', 'hand pulled noodles', 'lanzhou beef noodles',
            'chongqing noodles', 'guilin rice noodles', 'crossing bridge noodles',
            # More Mexican & Latin American
            'empanada', 'arepa', 'ceviche', 'tostada', 'taquitos',
            'flautas', 'taco salad', 'burrito bowl', 'queso dip',
            'refried beans', 'black beans', 'pinto beans', 'mexican rice',
            'spanish rice', 'cilantro lime rice', 'elote', 'mexican corn',
            'pico de gallo', 'pico de gallo', 'refried beans', 'black beans',
            'pinto beans', 'mexican rice', 'spanish rice', 'cilantro lime rice',
            'margarita', 'horchata', 'agua fresca', 'jamaica',
            'tres leches cake', 'flan', 'churro', 'sopapilla',
            'arroz con leche', 'dulce de leche', 'tres leches',
            'feijoada', 'moqueca', 'coxinha', 'pão de açúcar',
            'acai bowl', 'tapioca', 'picanha', 'churrasco',
            'ceviche peruano', 'aji de gallina', 'lomo saltado',
            'causa limeña', 'anticuchos', 'papas a la huancaina',
            'roti', 'doubles', 'pelau', 'callaloo', 'ackee and saltfish',
            'jerk chicken', 'oxtail', 'curry goat', 'rice and peas',
            'festival', 'bammy', 'dumpling', 'beef patty', 'coco bread',
            # More Italian Foods
            'penne', 'fusilli', 'macaroni', 'linguine', 'tagliatelle',
            'ravioli', 'tortellini', 'cannelloni', 'manicotti', 'lasagne',
            'bolognese', 'arrabbiata', 'puttanesca', 'aglio e olio',
            'cacio e pepe', 'pesto pasta', 'primavera', 'mushroom pasta',
            'seafood pasta', 'lobster pasta', 'shrimp scampi',
            'chicken parmesan', 'eggplant parmesan', 'veal parmesan',
            'chicken marsala', 'chicken piccata', 'osso buco',
            'risotto ai funghi', 'risotto alla milanese', 'risotto ai frutti di mare',
            'minestrone', 'pasta e fagioli', 'ribollita', 'pappa al pomodoro',
            'panzanella', 'caprese salad', 'insalata mista', 'arugula salad',
            'margherita pizza', 'pepperoni pizza', 'hawaiian pizza',
            'quattro formaggi', 'diavola', 'napoli', 'romana', 'siciliana',
            'calzone', 'stromboli', 'focaccia', 'ciabatta', 'pane',
            'bruschetta', 'crostini', 'arancini', 'suppli', 'polenta',
            'osso buco', 'cotoletta', 'saltimbocca', 'pollo alla cacciatora',
            'bistecca alla fiorentina', 'osso buco', 'gnocchi alla sorrentina',
            'spaghetti alle vongole', 'linguine alle vongole', 'spaghetti carbonara',
            'pappardelle al cinghiale', 'tagliatelle al ragu', 'tortellini in brodo',
            'minestrone', 'ribollita', 'pappa al pomodoro', 'pasta e fagioli',
            'fagioli all uccelletto', 'zuppa toscana', 'stracciatella',
            'carciofi alla romana', 'carciofi alla giudia', 'melanzane alla parmigiana',
            'caponata', 'peperonata', 'pasta alla norma', 'spaghetti aglio olio e peperoncino',
            'pasta puttanesca', 'pasta alla gricia', 'amatriciana',
            'cacio e pepe', 'pasta al pesto', 'trofie al pesto', 'pasta al pomodoro',
            'penne all arrabbiata', 'penne alla vodka', 'pasta primavera',
            'spaghetti alle vongole', 'linguine alle vongole', 'spaghetti alle cozze',
            'risotto ai funghi', 'risotto ai frutti di mare', 'risotto alla milanese',
            'risotto al nero di seppia', 'risotto con radicchio', 'risotto con zucchine',
            'pizza margherita', 'pizza marinara', 'pizza napoletana',
            'pizza romana', 'pizza siciliana', 'pizza capricciosa',
            'pizza quattro stagioni', 'pizza diavola', 'pizza quattro formaggi',
            'pizza prosciutto e funghi', 'pizza funghi', 'pizza prosciutto',
            'calzone', 'calzone ripieno', 'stromboli', 'panzerotti',
            'focaccia', 'focaccia al rosmarino', 'schiacciata',
            'bruschetta', 'bruschetta al pomodoro', 'crostini',
            'arancini', 'arancini al ragù', 'supplì', 'pallotte cacio e ova',
            'polenta', 'polenta con funghi', 'polenta e salsiccia',
            'osso buco', 'cotoletta alla milanese', 'saltimbocca alla romana',
            'pollo alla cacciatora', 'pollo al mattone', 'pollo alla diavola',
            'bistecca alla fiorentina', 'bistecca alla griglia', 'tagliata',
            'spiedini', 'involtini', 'rollatini', 'braciole',
            'gnocchi', 'gnocchi alla sorrentina', 'gnocchi al pomodoro',
            'gnocchi ai quattro formaggi', 'gnocchi al gorgonzola',
            'ravioli', 'ravioli al burro e salvia', 'ravioli al pomodoro',
            'ravioli ai funghi', 'ravioli di ricotta e spinaci',
            'tortellini', 'tortellini in brodo', 'tortellini al pomodoro',
            'cannelloni', 'cannelloni alla fiorentina', 'cannelloni al forno',
            'lasagne', 'lasagne alla bolognese', 'lasagne verdi',
            'lasagne ai quattro formaggi', 'lasagne vegetariana',
            'tiramisu', 'panna cotta', 'cannoli', 'cannoli siciliani',
            'zeppole', 'sfogliatella', 'pastiera', 'babà', 'saint honoré',
            'gelato', 'sorbetto', 'granita', 'semifreddo', 'affogato',
            'zabaglione', 'panna cotta', 'mascarpone', 'mousse al cioccolato',
            'budino', 'zuppa inglese', 'montebianco', 'castagnaccio',
            'panettone', 'pandoro', 'colomba pasquale', 'crostata',
            'torta della nonna', 'torta caprese', 'torta tenerina',
            # More Mediterranean & Middle Eastern
            'baba ganoush', 'mutabbal', 'muhammara', 'tzatziki', 'taramasalata',
            'skordalia', 'melitzanosalata', 'fava', 'ful medames',
            'tabbouleh', 'fattoush', 'fatoush', 'arabic salad', 'israeli salad',
            'greek salad', 'horiatiki', 'choriatiki salata', 'dakos',
            'dolma', 'dolmades', 'stuffed grape leaves', 'stuffed vine leaves',
            'kibbeh', 'kibbeh nayyeh', 'kibbeh bil sanieh', 'sfiha', 'lahmajoun',
            'manakish', 'zaatar bread', 'manoushe', 'spinach pie',
            'spanakopita', 'tiropita', 'borek', 'burek', 'börek',
            'lahmacun', 'pide', 'simit', 'pretzel', 'bagel',
            'shakshuka', 'shakshouka', 'menemen', 'çilbir', 'ful medames',
            'foul', 'fuul', 'fava beans', 'foul medames', 'ful',
            'koshary', 'koshari', 'molokhia', 'okra stew', 'bamya',
            'kabab', 'koobideh', 'joojeh kabab', 'soltani', 'barg',
            'tahchin', 'zereshk polow', 'baghali polow', 'loobia polow',
            'addas polow', 'shirin polow', 'sabzi polow', 'chelo kebab',
            'joojeh kebab', 'kabab koobideh', 'kabab barg', 'kabab soltani',
            'tahdig', 'ghormeh sabzi', 'gheimeh', 'fesenjan', 'khoresht',
            'zereshk polo', 'baghali polo', 'loobia polo', 'addas polo',
            'shirin polo', 'sabzi polo', 'chelo kebab', 'kabab koobideh',
            'kabab barg', 'kabab soltani', 'tahchin', 'zereshk polow',
            'baghali polow', 'loobia polow', 'addas polow', 'shirin polow',
            'sabzi polow', 'chelo kebab', 'joojeh kebab', 'kabab koobideh',
            'kabab barg', 'kabab soltani', 'tahdig', 'ghormeh sabzi',
            'gheimeh', 'fesenjan', 'khoresht', 'zereshk polo', 'baghali polo',
            'loobia polo', 'addas polo', 'shirin polo', 'sabzi polo',
            'chelo kebab', 'joojeh kebab', 'kabab koobideh', 'kabab barg',
            'kabab soltani', 'tahchin', 'zereshk polow', 'baghali polow',
            'loobia polow', 'addas polow', 'shirin polow', 'sabzi polow',
            'chelo kebab', 'joojeh kebab', 'kabab koobideh', 'kabab barg',
            'kabab soltani', 'tahdig', 'ghormeh sabzi', 'gheimeh', 'fesenjan',
            'khoresht', 'zereshk polo', 'baghali polo', 'loobia polo',
            'addas polo', 'shirin polo', 'sabzi polo', 'chelo kebab',
            'joojeh kebab', 'kabab koobideh', 'kabab barg', 'kabab soltani',
            # More European Foods
            'schnitzel', 'wiener schnitzel', 'jagerschnitzel', 'sauerbraten',
            'bratwurst', 'currywurst', 'sauerkraut', 'pretzel', 'spaetzle',
            'knoedel', 'rouladen', 'kassler', 'eisbein', 'schweinshaxe',
            'black forest cake', 'sachertorte', 'apfelstrudel', 'strudel',
            'brezel', 'bretzel', 'brezel', 'laugenbrezel', 'laugenstange',
            'kaiserschmarrn', 'spaetzle', 'kaesespaetzle', 'kaesespatzle',
            'maultaschen', 'flammkuchen', 'spaetzle', 'knodel', 'knödel',
            'semmelknodel', 'kartoffelknodel', 'speckknodel', 'leberknodel',
            'schweinsbraten', 'schweinebraten', 'kassler', 'eisbein',
            'schweinshaxe', 'schweinshaxn', 'haxn', 'bratwurst', 'weisswurst',
            'currywurst', 'leberkase', 'leberkaese', 'fleischkase',
            'frikadellen', 'buletten', 'koenigsberger klopse',
            'koenigsberger klopse', 'falscher hase', 'rouladen', 'sauerbraten',
            'schweinebraten', 'schweinsbraten', 'kassler', 'eisbein',
            'schweinshaxe', 'schweinshaxn', 'haxn', 'bratwurst', 'weisswurst',
            'currywurst', 'leberkase', 'leberkaese', 'fleischkase',
            'frikadellen', 'buletten', 'koenigsberger klopse',
            'koenigsberger klopse', 'falscher hase', 'rouladen', 'sauerbraten',
            'cottage pie', 'shepherds pie', 'fish pie', 'steak and kidney pie',
            'chicken and mushroom pie', 'pork pie', 'game pie', 'steak pie',
            'cornish pasty', 'pasty', 'sausage roll', 'pork pie', 'game pie',
            'steak pie', 'cornish pasty', 'pasty', 'sausage roll',
            'toad in the hole', 'bubble and squeak', 'spotted dick',
            'trifle', 'etons mess', 'sticky toffee pudding', 'bread and butter pudding',
            'spotted dick', 'trifle', 'etons mess', 'sticky toffee pudding',
            'bread and butter pudding', 'treacle tart', 'bakewell tart',
            'victoria sponge', 'battenberg', 'eccles cake', 'coronation chicken',
            'ploughmans lunch', 'scotch egg', 'pork scratchings', 'pickled eggs',
            'pickled onions', 'branston pickle', 'marmite', 'vegemite',
            'black pudding', 'white pudding', 'haggis', 'neeps and tatties',
            'cullen skink', 'cock a leekie', 'stovies', 'bridie', 'forfar bridie',
            'arbroath smokie', 'smoked salmon', 'kipper', 'bloater',
            'boiled egg and soldiers', 'eggs benedict', 'full english breakfast',
            'fry up', 'english breakfast', 'scottish breakfast', 'irish breakfast',
            'welsh rarebit', 'rarebit', 'welsh rabbit', 'cheese on toast',
            'beans on toast', 'mushrooms on toast', 'scrambled eggs on toast',
            'poached eggs on toast', 'fried eggs on toast', 'boiled eggs',
            'scrambled eggs', 'poached eggs', 'fried eggs', 'omelette',
            'spanish omelette', 'tortilla', 'tortilla española', 'frittata',
            'quiche lorraine', 'quiche', 'flan', 'tart', 'flan', 'clafoutis',
            'soufflé', 'cheese soufflé', 'chocolate soufflé', 'soufflé au chocolat',
            'soufflé au fromage', 'soufflé aux épinards', 'ratatouille',
            'bouillabaisse', 'cassoulet', 'coq au vin', 'boeuf bourguignon',
            'boeuf en daube', 'pot au feu', 'blanquette de veau', 'confit de canard',
            'duck confit', 'magret de canard', 'canard à l orange',
            'poulet basquaise', 'poulet provençal', 'poulet aux olives',
            'lapin à la moutarde', 'civet de lapin', 'gigot d agneau',
            'agneau aux herbes', 'gigot d agneau aux flageolets',
            'côte de boeuf', 'entrecôte', 'faux filet', 'tournedos',
            'chateaubriand', 'filet mignon', 'côtelette', 'côtelette d agneau',
            'côtelette de porc', 'côtelette de veau', 'escalope', 'escalope de veau',
            'escalope de poulet', 'escalope de porc', 'jambon', 'jambon de paris',
            'jambon cru', 'jambon sec', 'prosciutto', 'saucisson', 'saucisson sec',
            'saucisse', 'saucisse de toulouse', 'saucisse de strasbourg',
            'saucisse de montbéliard', 'andouillette', 'boudin noir',
            'boudin blanc', 'boudin antillais', 'cervelas', 'andouille',
            'andouillette', 'boudin', 'boudin noir', 'boudin blanc',
            'boudin antillais', 'cervelas', 'andouille', 'andouillette',
            'boudin', 'boudin noir', 'boudin blanc', 'boudin antillais',
            'cervelas', 'andouille', 'andouillette', 'boudin', 'boudin noir',
            'boudin blanc', 'boudin antillais', 'cervelas', 'andouille',
            # More Snacks & Street Foods
            'chips', 'fries', 'onion rings', 'mozzarella sticks', 'nuggets',
            'chicken nuggets', 'fish fingers', 'fish sticks', 'corn dog',
            'hot dog', 'chili dog', 'slider', 'mini burger', 'sliders',
            'nachos', 'loaded nachos', 'queso', 'guacamole', 'salsa',
            'wings', 'buffalo wings', 'chicken wings', 'wings', 'drumsticks',
            'chicken drumsticks', 'chicken thighs', 'chicken breast',
            'chicken legs', 'chicken quarters', 'fried chicken', 'popcorn chicken',
            'chicken tenders', 'chicken strips', 'chicken fingers',
            'fried calamari', 'fried shrimp', 'fried fish', 'fish and chips',
            'fish tacos', 'fish sandwich', 'fish burger', 'crab cakes',
            'lobster roll', 'lobster bisque', 'clam chowder', 'seafood chowder',
            'oysters rockefeller', 'oysters kilpatrick', 'oysters mornay',
            'escargot', 'snails', 'escargots', 'snails in garlic butter',
            'mussels', 'moules marinière', 'moules frites', 'mussels in white wine',
            'mussels in tomato sauce', 'mussels in cream sauce',
            'shrimp cocktail', 'crab cocktail', 'lobster cocktail',
            'ceviche', 'shrimp ceviche', 'fish ceviche', 'octopus ceviche',
            'tuna tartare', 'salmon tartare', 'beef tartare', 'steak tartare',
            'carpaccio', 'beef carpaccio', 'salmon carpaccio', 'tuna carpaccio',
            'crudo', 'fish crudo', 'salmon crudo', 'tuna crudo',
            'sashimi', 'salmon sashimi', 'tuna sashimi', 'yellowtail sashimi',
            'mackerel sashimi', 'squid sashimi', 'octopus sashimi',
            'scallop sashimi', 'uni', 'sea urchin', 'ikura', 'salmon roe',
            'tobiko', 'flying fish roe', 'masago', 'capelin roe',
            'tamago', 'egg', 'tamagoyaki', 'japanese omelette',
            'chawanmushi', 'steamed egg', 'japanese steamed egg',
            'agedashi tofu', 'miso soup', 'clear soup', 'soup', 'miso',
            'miso soup', 'clear soup', 'soup', 'miso', 'miso soup',
            'clear soup', 'soup', 'miso', 'miso soup', 'clear soup',
            'soup', 'miso', 'miso soup', 'clear soup', 'soup', 'miso',
            # More Beverages
            'orange juice', 'apple juice', 'grape juice', 'cranberry juice',
            'pomegranate juice', 'pineapple juice', 'mango juice', 'guava juice',
            'coconut water', 'coconut milk', 'almond milk', 'soy milk',
            'oat milk', 'rice milk', 'hemp milk', 'cashew milk',
            'horchata', 'tiger nut milk', 'jamaica', 'hibiscus tea',
            'agua fresca', 'fresh water', 'aguas frescas', 'tamarind drink',
            'mango lassi', 'sweet lassi', 'salted lassi', 'buttermilk',
            'chaas', 'mattha', 'lassi', 'mango lassi', 'sweet lassi',
            'salted lassi', 'buttermilk', 'chaas', 'mattha', 'lassi',
            'thandai', 'bhang lassi', 'bhang', 'bhang thandai',
            'falooda', 'rose milk', 'badam milk', 'kesar milk',
            'turmeric latte', 'golden milk', 'haldi doodh', 'turmeric milk',
            'green tea', 'black tea', 'white tea', 'oolong tea',
            'pu erh tea', 'jasmine tea', 'chamomile tea', 'peppermint tea',
            'ginger tea', 'lemon tea', 'honey lemon tea', 'lemon ginger tea',
            'masala chai', 'chai latte', 'chai', 'indian tea',
            'chai tea', 'spiced tea', 'ginger tea', 'cardamom tea',
            'tulsi tea', 'holy basil tea', 'ashwagandha tea',
            'macha', 'matcha', 'matcha latte', 'matcha tea',
            'sencha', 'gyokuro', 'genmaicha', 'houjicha', 'kukicha',
            'bancha', 'konacha', 'kabusecha', 'shincha', 'ichibancha',
            'nibancha', 'sanbancha', 'yonbancha', 'gobancha',
            'coffee', 'espresso', 'cappuccino', 'latte', 'macchiato',
            'americano', 'flat white', 'cortado', 'piccolo', 'lungo',
            'ristretto', 'doppio', 'affogato', 'frappe', 'frappuccino',
            'iced coffee', 'cold brew', 'nitro coffee', 'pour over',
            'french press', 'aeropress', 'chemex', 'v60', 'siphon',
            'moka pot', 'turkish coffee', 'greek coffee', 'vietnamese coffee',
            'ca phe sua da', 'egg coffee', 'kopi luwak', 'civet coffee',
            'hot chocolate', 'chocolate milk', 'white hot chocolate',
            'mint hot chocolate', 'peppermint hot chocolate',
            'smoothie', 'fruit smoothie', 'green smoothie', 'protein smoothie',
            'banana smoothie', 'strawberry smoothie', 'mango smoothie',
            'pineapple smoothie', 'berry smoothie', 'tropical smoothie',
            'peach smoothie', 'pear smoothie', 'apple smoothie',
            'orange smoothie', 'grapefruit smoothie', 'watermelon smoothie',
            'cucumber smoothie', 'spinach smoothie', 'kale smoothie',
            'celery smoothie', 'carrot smoothie', 'beetroot smoothie',
            'turmeric smoothie', 'ginger smoothie', 'matcha smoothie',
            'coffee smoothie', 'chocolate smoothie', 'vanilla smoothie',
            'almond smoothie', 'peanut butter smoothie', 'cashew smoothie',
            'coconut smoothie', 'avocado smoothie', 'banana avocado smoothie',
            'mango coconut smoothie', 'pineapple coconut smoothie',
            'strawberry banana smoothie', 'berry banana smoothie',
            'tropical fruit smoothie', 'mixed fruit smoothie',
            'fruit and vegetable smoothie', 'green detox smoothie',
            'weight loss smoothie', 'muscle building smoothie',
            'protein powder smoothie', 'whey protein smoothie',
            'plant protein smoothie', 'pea protein smoothie',
            'hemp protein smoothie', 'brown rice protein smoothie',
            'soy protein smoothie', 'casein protein smoothie',
            'collagen protein smoothie', 'bone broth protein smoothie',
            'milkshake', 'vanilla milkshake', 'chocolate milkshake',
            'strawberry milkshake', 'banana milkshake', 'mango milkshake',
            'pineapple milkshake', 'berry milkshake', 'tropical milkshake',
            'peach milkshake', 'pear milkshake', 'apple milkshake',
            'orange milkshake', 'grapefruit milkshake', 'watermelon milkshake',
            'cucumber milkshake', 'spinach milkshake', 'kale milkshake',
            'celery milkshake', 'carrot milkshake', 'beetroot milkshake',
            'turmeric milkshake', 'ginger milkshake', 'matcha milkshake',
            'coffee milkshake', 'chocolate milkshake', 'vanilla milkshake',
            'almond milkshake', 'peanut butter milkshake', 'cashew milkshake',
            'coconut milkshake', 'avocado milkshake', 'banana avocado milkshake',
            'mango coconut milkshake', 'pineapple coconut milkshake',
            'strawberry banana milkshake', 'berry banana milkshake',
            'tropical fruit milkshake', 'mixed fruit milkshake',
            'fruit and vegetable milkshake', 'green detox milkshake',
            'weight loss milkshake', 'muscle building milkshake',
            'protein powder milkshake', 'whey protein milkshake',
            'plant protein milkshake', 'pea protein milkshake',
            'hemp protein milkshake', 'brown rice protein milkshake',
            'soy protein milkshake', 'casein protein milkshake',
            'collagen protein milkshake', 'bone broth protein milkshake'
        ]
    
    def _load_food_database(self):
        """Load comprehensive food calorie database"""
        food_db = {
            # Fruits
            'apple': {'calories': 52, 'carbs': 14, 'protein': 0.3, 'fat': 0.2},
            'banana': {'calories': 89, 'carbs': 23, 'protein': 1.1, 'fat': 0.3},
            'orange': {'calories': 47, 'carbs': 12, 'protein': 0.9, 'fat': 0.1},
            'watermelon': {'calories': 30, 'carbs': 8, 'protein': 0.6, 'fat': 0.2},
            'strawberry': {'calories': 32, 'carbs': 7.7, 'protein': 0.7, 'fat': 0.3},
            'grape': {'calories': 69, 'carbs': 18, 'protein': 0.7, 'fat': 0.2},
            
            # Vegetables
            'carrot': {'calories': 41, 'carbs': 10, 'protein': 0.9, 'fat': 0.2},
            'broccoli': {'calories': 34, 'carbs': 7, 'protein': 2.8, 'fat': 0.4},
            'tomato': {'calories': 18, 'carbs': 3.9, 'protein': 0.9, 'fat': 0.2},
            'cucumber': {'calories': 15, 'carbs': 3.6, 'protein': 0.7, 'fat': 0.1},
            'potato': {'calories': 77, 'carbs': 17, 'protein': 2, 'fat': 0.1},
            'onion': {'calories': 40, 'carbs': 9, 'protein': 1.1, 'fat': 0.1},
            'bell pepper': {'calories': 31, 'carbs': 6, 'protein': 1, 'fat': 0.3},
            'mushroom': {'calories': 22, 'carbs': 3.3, 'protein': 3.1, 'fat': 0.3},
            'avocado': {'calories': 160, 'carbs': 9, 'protein': 2, 'fat': 15},
            
            # Fast Food
            'pizza': {'calories': 285, 'carbs': 36, 'protein': 12, 'fat': 10},
            'burger': {'calories': 354, 'carbs': 35, 'protein': 17, 'fat': 15},
            'sandwich': {'calories': 250, 'carbs': 30, 'protein': 10, 'fat': 8},
            'french fries': {'calories': 312, 'carbs': 41, 'protein': 3.4, 'fat': 15},
            'hot dog': {'calories': 290, 'carbs': 5, 'protein': 11, 'fat': 26},
            'hotdog': {'calories': 290, 'carbs': 5, 'protein': 11, 'fat': 26},
            
            # Grains & Bread
            'rice': {'calories': 130, 'carbs': 28, 'protein': 2.7, 'fat': 0.3},
            'pasta': {'calories': 131, 'carbs': 25, 'protein': 5, 'fat': 1.1},
            'bread': {'calories': 265, 'carbs': 49, 'protein': 9, 'fat': 3.2},
            'bagel': {'calories': 250, 'carbs': 49, 'protein': 10, 'fat': 1.5},
            'pita bread': {'calories': 275, 'carbs': 56, 'protein': 9, 'fat': 1.2},
            'baguette': {'calories': 289, 'carbs': 57, 'protein': 11, 'fat': 1.7},
            'croissant': {'calories': 406, 'carbs': 45, 'protein': 8, 'fat': 21},
            'sourdough': {'calories': 289, 'carbs': 57, 'protein': 11, 'fat': 1.7},
            
            # Indian Breads
            'naan': {'calories': 262, 'carbs': 45, 'protein': 8, 'fat': 5},
            'butter naan': {'calories': 310, 'carbs': 45, 'protein': 8, 'fat': 12},
            'roti': {'calories': 104, 'carbs': 20, 'protein': 3, 'fat': 2},
            'chapati': {'calories': 104, 'carbs': 20, 'protein': 3, 'fat': 2},
            'paratha': {'calories': 295, 'carbs': 42, 'protein': 7, 'fat': 12},
            'kulcha': {'calories': 280, 'carbs': 50, 'protein': 9, 'fat': 6},
            
            # Indian Curries & Dals
            'dal': {'calories': 132, 'carbs': 20, 'protein': 9, 'fat': 1},
            'dal makhani': {'calories': 220, 'carbs': 25, 'protein': 12, 'fat': 8},
            'dal tadka': {'calories': 150, 'carbs': 22, 'protein': 10, 'fat': 3},
            'chana dal': {'calories': 164, 'carbs': 27, 'protein': 9, 'fat': 2},
            'toor dal': {'calories': 132, 'carbs': 20, 'protein': 9, 'fat': 1},
            'rajma': {'calories': 127, 'carbs': 22, 'protein': 8, 'fat': 1},
            'chole': {'calories': 164, 'carbs': 27, 'protein': 9, 'fat': 2},
            'dal fry': {'calories': 150, 'carbs': 22, 'protein': 10, 'fat': 3},
            
            # Indian Chicken Dishes
            'butter chicken': {'calories': 320, 'carbs': 8, 'protein': 25, 'fat': 20},
            'chicken curry': {'calories': 223, 'carbs': 6, 'protein': 20, 'fat': 14},
            'chicken tikka': {'calories': 200, 'carbs': 3, 'protein': 30, 'fat': 8},
            'chicken biryani': {'calories': 350, 'carbs': 45, 'protein': 22, 'fat': 10},
            'tandoori chicken': {'calories': 180, 'carbs': 2, 'protein': 28, 'fat': 7},
            'seekh kebab': {'calories': 220, 'carbs': 4, 'protein': 20, 'fat': 14},
            'tikka masala': {'calories': 280, 'carbs': 12, 'protein': 24, 'fat': 16},
            'korma': {'calories': 250, 'carbs': 10, 'protein': 22, 'fat': 15},
            'vindaloo': {'calories': 230, 'carbs': 8, 'protein': 20, 'fat': 14},
            
            # Indian Paneer Dishes
            'paneer butter masala': {'calories': 350, 'carbs': 10, 'protein': 18, 'fat': 28},
            'paneer tikka': {'calories': 280, 'carbs': 5, 'protein': 22, 'fat': 20},
            'palak paneer': {'calories': 260, 'carbs': 8, 'protein': 15, 'fat': 20},
            'mutter paneer': {'calories': 280, 'carbs': 12, 'protein': 16, 'fat': 22},
            'matar paneer': {'calories': 280, 'carbs': 12, 'protein': 16, 'fat': 22},
            'butter paneer': {'calories': 350, 'carbs': 10, 'protein': 18, 'fat': 28},
            
            # Indian Vegetarian Dishes
            'aloo gobi': {'calories': 120, 'carbs': 18, 'protein': 4, 'fat': 4},
            'baingan bharta': {'calories': 140, 'carbs': 12, 'protein': 3, 'fat': 9},
            
            # Indian Snacks
            'samosa': {'calories': 262, 'carbs': 33, 'protein': 4, 'fat': 13},
            'pakora': {'calories': 280, 'carbs': 30, 'protein': 5, 'fat': 15},
            'bhaji': {'calories': 180, 'carbs': 20, 'protein': 3, 'fat': 10},
            'pav bhaji': {'calories': 320, 'carbs': 45, 'protein': 8, 'fat': 12},
            
            # South Indian
            'dosa': {'calories': 133, 'carbs': 24, 'protein': 4, 'fat': 3},
            'idli': {'calories': 58, 'carbs': 12, 'protein': 2, 'fat': 0.3},
            'vada': {'calories': 350, 'carbs': 38, 'protein': 6, 'fat': 18},
            
            # Indian Rice Dishes
            'biryani': {'calories': 350, 'carbs': 45, 'protein': 22, 'fat': 10},
            'pulao': {'calories': 200, 'carbs': 40, 'protein': 5, 'fat': 4},
            'fried rice': {'calories': 228, 'carbs': 35, 'protein': 5, 'fat': 8},
            
            # Indian Beverages & Desserts
            'chai': {'calories': 45, 'carbs': 8, 'protein': 1, 'fat': 1},
            'lassi': {'calories': 100, 'carbs': 15, 'protein': 5, 'fat': 2},
            'mango lassi': {'calories': 180, 'carbs': 30, 'protein': 5, 'fat': 3},
            'gulab jamun': {'calories': 149, 'carbs': 21, 'protein': 3, 'fat': 6},
            'rasgulla': {'calories': 186, 'carbs': 36, 'protein': 6, 'fat': 4},
            'jalebi': {'calories': 300, 'carbs': 65, 'protein': 4, 'fat': 8},
            'halwa': {'calories': 250, 'carbs': 40, 'protein': 4, 'fat': 10},
            'kheer': {'calories': 220, 'carbs': 35, 'protein': 5, 'fat': 7},
            'barfi': {'calories': 160, 'carbs': 22, 'protein': 3, 'fat': 7},
            'laddu': {'calories': 140, 'carbs': 20, 'protein': 3, 'fat': 6},
            
            # Asian - Japanese
            'sushi': {'calories': 105, 'carbs': 20, 'protein': 5, 'fat': 0.3},
            'ramen': {'calories': 436, 'carbs': 60, 'protein': 18, 'fat': 14},
            'udon': {'calories': 274, 'carbs': 58, 'protein': 8, 'fat': 0.4},
            'soba': {'calories': 99, 'carbs': 21, 'protein': 5, 'fat': 0.1},
            'tempura': {'calories': 320, 'carbs': 28, 'protein': 8, 'fat': 18},
            'teriyaki': {'calories': 185, 'carbs': 15, 'protein': 22, 'fat': 4},
            'miso soup': {'calories': 35, 'carbs': 4, 'protein': 2, 'fat': 1},
            
            # Asian - Chinese
            'spring roll': {'calories': 160, 'carbs': 18, 'protein': 5, 'fat': 8},
            'dumpling': {'calories': 40, 'carbs': 5, 'protein': 2, 'fat': 1},
            'chow mein': {'calories': 240, 'carbs': 38, 'protein': 8, 'fat': 7},
            'lo mein': {'calories': 260, 'carbs': 40, 'protein': 9, 'fat': 8},
            'kung pao chicken': {'calories': 290, 'carbs': 12, 'protein': 28, 'fat': 15},
            'general tso chicken': {'calories': 310, 'carbs': 25, 'protein': 20, 'fat': 15},
            'sweet and sour': {'calories': 280, 'carbs': 35, 'protein': 15, 'fat': 10},
            'mapo tofu': {'calories': 180, 'carbs': 8, 'protein': 12, 'fat': 12},
            'peking duck': {'calories': 337, 'carbs': 0, 'protein': 19, 'fat': 28},
            'dim sum': {'calories': 80, 'carbs': 10, 'protein': 4, 'fat': 2},
            
            # Asian - Thai & Vietnamese
            'pad thai': {'calories': 357, 'carbs': 50, 'protein': 15, 'fat': 12},
            'green curry': {'calories': 190, 'carbs': 8, 'protein': 12, 'fat': 13},
            'red curry': {'calories': 195, 'carbs': 9, 'protein': 13, 'fat': 13},
            'pho': {'calories': 350, 'carbs': 50, 'protein': 20, 'fat': 8},
            'banh mi': {'calories': 280, 'carbs': 35, 'protein': 12, 'fat': 10},
            'bibimbap': {'calories': 430, 'carbs': 55, 'protein': 18, 'fat': 16},
            
            # Mexican
            'taco': {'calories': 226, 'carbs': 20, 'protein': 13, 'fat': 11},
            'burrito': {'calories': 494, 'carbs': 54, 'protein': 22, 'fat': 18},
            'quesadilla': {'calories': 320, 'carbs': 28, 'protein': 16, 'fat': 18},
            'nachos': {'calories': 346, 'carbs': 37, 'protein': 8, 'fat': 19},
            'enchilada': {'calories': 270, 'carbs': 25, 'protein': 15, 'fat': 14},
            'fajita': {'calories': 320, 'carbs': 30, 'protein': 25, 'fat': 12},
            'guacamole': {'calories': 160, 'carbs': 8, 'protein': 2, 'fat': 15},
            'salsa': {'calories': 36, 'carbs': 7, 'protein': 2, 'fat': 0.2},
            'chimichanga': {'calories': 400, 'carbs': 38, 'protein': 20, 'fat': 20},
            'tamale': {'calories': 285, 'carbs': 33, 'protein': 9, 'fat': 12},
            'churro': {'calories': 116, 'carbs': 16, 'protein': 2, 'fat': 5},
            
            # Italian
            'spaghetti': {'calories': 220, 'carbs': 43, 'protein': 8, 'fat': 1.3},
            'lasagna': {'calories': 285, 'carbs': 28, 'protein': 17, 'fat': 12},
            'ravioli': {'calories': 250, 'carbs': 38, 'protein': 10, 'fat': 8},
            'gnocchi': {'calories': 131, 'carbs': 27, 'protein': 3, 'fat': 0.2},
            'risotto': {'calories': 180, 'carbs': 35, 'protein': 5, 'fat': 4},
            'fettuccine': {'calories': 220, 'carbs': 43, 'protein': 8, 'fat': 1.3},
            'carbonara': {'calories': 330, 'carbs': 35, 'protein': 14, 'fat': 15},
            'alfredo': {'calories': 400, 'carbs': 38, 'protein': 12, 'fat': 24},
            'marinara': {'calories': 180, 'carbs': 30, 'protein': 6, 'fat': 5},
            'bruschetta': {'calories': 142, 'carbs': 18, 'protein': 4, 'fat': 6},
            'antipasto': {'calories': 250, 'carbs': 8, 'protein': 15, 'fat': 18},
            'tiramisu': {'calories': 240, 'carbs': 35, 'protein': 4, 'fat': 11},
            'gelato': {'calories': 207, 'carbs': 24, 'protein': 3.5, 'fat': 11},
            'cannoli': {'calories': 170, 'carbs': 22, 'protein': 3, 'fat': 8},
            'zeppole': {'calories': 130, 'carbs': 18, 'protein': 2, 'fat': 6},
            
            # Mediterranean & Middle Eastern
            'falafel': {'calories': 333, 'carbs': 32, 'protein': 13, 'fat': 18},
            'hummus': {'calories': 166, 'carbs': 14, 'protein': 8, 'fat': 10},
            'shawarma': {'calories': 320, 'carbs': 30, 'protein': 25, 'fat': 12},
            'gyro': {'calories': 220, 'carbs': 24, 'protein': 15, 'fat': 8},
            'kebab': {'calories': 180, 'carbs': 2, 'protein': 26, 'fat': 7},
            'moussaka': {'calories': 280, 'carbs': 20, 'protein': 18, 'fat': 16},
            
            # European
            'paella': {'calories': 280, 'carbs': 38, 'protein': 18, 'fat': 8},
            'tapas': {'calories': 200, 'carbs': 12, 'protein': 12, 'fat': 12},
            'gazpacho': {'calories': 74, 'carbs': 14, 'protein': 2, 'fat': 2},
            'ratatouille': {'calories': 50, 'carbs': 9, 'protein': 2, 'fat': 1},
            'quiche': {'calories': 300, 'carbs': 18, 'protein': 14, 'fat': 20},
            'fish and chips': {'calories': 595, 'carbs': 64, 'protein': 25, 'fat': 25},
            'meat pie': {'calories': 320, 'carbs': 30, 'protein': 15, 'fat': 17},
            'cottage pie': {'calories': 285, 'carbs': 28, 'protein': 18, 'fat': 13},
            'bangers and mash': {'calories': 450, 'carbs': 45, 'protein': 20, 'fat': 20},
            
            # Proteins
            'chicken': {'calories': 165, 'carbs': 0, 'protein': 31, 'fat': 3.6},
            'steak': {'calories': 271, 'carbs': 0, 'protein': 25, 'fat': 19},
            'salmon': {'calories': 208, 'carbs': 0, 'protein': 20, 'fat': 13},
            'egg': {'calories': 155, 'carbs': 1.1, 'protein': 13, 'fat': 11},
            'turkey': {'calories': 189, 'carbs': 0, 'protein': 29, 'fat': 7},
            'pork': {'calories': 242, 'carbs': 0, 'protein': 27, 'fat': 14},
            'lamb': {'calories': 294, 'carbs': 0, 'protein': 25, 'fat': 21},
            'beef': {'calories': 250, 'carbs': 0, 'protein': 26, 'fat': 17},
            'veal': {'calories': 172, 'carbs': 0, 'protein': 24, 'fat': 8},
            'bacon': {'calories': 541, 'carbs': 1.4, 'protein': 37, 'fat': 42},
            'sausage': {'calories': 301, 'carbs': 1.9, 'protein': 13, 'fat': 27},
            'ham': {'calories': 145, 'carbs': 1.5, 'protein': 21, 'fat': 6},
            'prosciutto': {'calories': 263, 'carbs': 0.1, 'protein': 25, 'fat': 18},
            'pepperoni': {'calories': 494, 'carbs': 2.2, 'protein': 23, 'fat': 43},
            'salami': {'calories': 336, 'carbs': 1.7, 'protein': 22, 'fat': 26},
            'chorizo': {'calories': 455, 'carbs': 2.1, 'protein': 24, 'fat': 38},
            'fish': {'calories': 206, 'carbs': 0, 'protein': 22, 'fat': 12},
            'shrimp': {'calories': 99, 'carbs': 0.2, 'protein': 24, 'fat': 0.3},
            'crab': {'calories': 97, 'carbs': 0, 'protein': 19, 'fat': 1.5},
            'lobster': {'calories': 90, 'carbs': 0.9, 'protein': 19, 'fat': 0.9},
            'scallops': {'calories': 88, 'carbs': 3.2, 'protein': 16, 'fat': 0.8},
            'oysters': {'calories': 68, 'carbs': 4, 'protein': 7, 'fat': 2},
            
            # Dairy & Alternatives
            'cheese': {'calories': 402, 'carbs': 1.3, 'protein': 25, 'fat': 33},
            'cottage cheese': {'calories': 98, 'carbs': 3.4, 'protein': 11, 'fat': 4.3},
            'cream cheese': {'calories': 342, 'carbs': 4.1, 'protein': 6, 'fat': 34},
            'sour cream': {'calories': 198, 'carbs': 4.6, 'protein': 2.4, 'fat': 19},
            'yogurt': {'calories': 59, 'carbs': 4, 'protein': 10, 'fat': 0.4},
            'milk': {'calories': 42, 'carbs': 5, 'protein': 3.4, 'fat': 1},
            'tofu': {'calories': 76, 'carbs': 1.9, 'protein': 8, 'fat': 4.8},
            'tempeh': {'calories': 193, 'carbs': 9, 'protein': 19, 'fat': 11},
            'seitan': {'calories': 370, 'carbs': 8, 'protein': 75, 'fat': 2},
            
            # Condiments & Spreads
            'peanut butter': {'calories': 588, 'carbs': 20, 'protein': 25, 'fat': 50},
            'jam': {'calories': 265, 'carbs': 69, 'protein': 0.4, 'fat': 0.1},
            'honey': {'calories': 304, 'carbs': 82, 'protein': 0.3, 'fat': 0},
            'syrup': {'calories': 260, 'carbs': 67, 'protein': 0, 'fat': 0},
            'butter': {'calories': 717, 'carbs': 0.1, 'protein': 0.9, 'fat': 81},
            'ghee': {'calories': 900, 'carbs': 0, 'protein': 0, 'fat': 100},
            'mayonnaise': {'calories': 680, 'carbs': 0.6, 'protein': 1, 'fat': 75},
            'ketchup': {'calories': 112, 'carbs': 26, 'protein': 1.7, 'fat': 0.3},
            'mustard': {'calories': 66, 'carbs': 5, 'protein': 4, 'fat': 3.8},
            'ranch': {'calories': 322, 'carbs': 3.8, 'protein': 0.9, 'fat': 34},
            
            # Beverages
            'coffee': {'calories': 2, 'carbs': 0, 'protein': 0.3, 'fat': 0},
            'tea': {'calories': 2, 'carbs': 0, 'protein': 0, 'fat': 0},
            'hot chocolate': {'calories': 192, 'carbs': 28, 'protein': 5, 'fat': 7},
            'juice': {'calories': 45, 'carbs': 11, 'protein': 0.5, 'fat': 0.1},
            'smoothie': {'calories': 150, 'carbs': 30, 'protein': 3, 'fat': 2},
            
            # Breakfast Items
            'cereal': {'calories': 379, 'carbs': 84, 'protein': 7, 'fat': 2},
            'oats': {'calories': 389, 'carbs': 66, 'protein': 17, 'fat': 7},
            'granola': {'calories': 471, 'carbs': 64, 'protein': 10, 'fat': 20},
            'quinoa': {'calories': 368, 'carbs': 64, 'protein': 14, 'fat': 6},
            'barley': {'calories': 354, 'carbs': 73, 'protein': 12, 'fat': 2.3},
            'waffle': {'calories': 218, 'carbs': 24, 'protein': 7, 'fat': 10},
            'pancake': {'calories': 227, 'carbs': 28, 'protein': 6, 'fat': 9},
            'muffin': {'calories': 377, 'carbs': 44, 'protein': 6, 'fat': 19},
            
            # Legumes & Beans
            'lentils': {'calories': 116, 'carbs': 20, 'protein': 9, 'fat': 0.4},
            'beans': {'calories': 127, 'carbs': 22, 'protein': 8, 'fat': 0.5},
            'chickpeas': {'calories': 164, 'carbs': 27, 'protein': 9, 'fat': 2.6},
            
            # Snacks & Desserts
            'cake': {'calories': 371, 'carbs': 53, 'protein': 5, 'fat': 15},
            'ice cream': {'calories': 207, 'carbs': 24, 'protein': 3.5, 'fat': 11},
            'cupcake': {'calories': 225, 'carbs': 35, 'protein': 3, 'fat': 9},
            'donut': {'calories': 226, 'carbs': 25, 'protein': 4, 'fat': 12},
            'cookie': {'calories': 502, 'carbs': 70, 'protein': 6, 'fat': 22},
            'pretzel': {'calories': 384, 'carbs': 79, 'protein': 10, 'fat': 3},
            'popcorn': {'calories': 387, 'carbs': 78, 'protein': 13, 'fat': 5},
            'nuts': {'calories': 607, 'carbs': 21, 'protein': 20, 'fat': 54},
            'almonds': {'calories': 579, 'carbs': 22, 'protein': 21, 'fat': 50},
            
            # Soups & Salads
            'soup': {'calories': 75, 'carbs': 10, 'protein': 3, 'fat': 2},
            'salad': {'calories': 20, 'carbs': 4, 'protein': 1, 'fat': 0.2},
            
            # More Fruits
            'mango': {'calories': 60, 'carbs': 15, 'protein': 0.8, 'fat': 0.4},
            'pineapple': {'calories': 50, 'carbs': 13, 'protein': 0.5, 'fat': 0.1},
            'papaya': {'calories': 43, 'carbs': 11, 'protein': 0.5, 'fat': 0.3},
            'guava': {'calories': 68, 'carbs': 14, 'protein': 2.6, 'fat': 1},
            'lychee': {'calories': 66, 'carbs': 17, 'protein': 0.8, 'fat': 0.4},
            'dragon fruit': {'calories': 60, 'carbs': 13, 'protein': 1.2, 'fat': 0.4},
            'kiwi': {'calories': 61, 'carbs': 15, 'protein': 1.1, 'fat': 0.5},
            'pomegranate': {'calories': 83, 'carbs': 19, 'protein': 1.7, 'fat': 1.2},
            'cherry': {'calories': 63, 'carbs': 16, 'protein': 1.1, 'fat': 0.2},
            'peach': {'calories': 39, 'carbs': 10, 'protein': 0.9, 'fat': 0.3},
            'plum': {'calories': 46, 'carbs': 11, 'protein': 0.7, 'fat': 0.3},
            'apricot': {'calories': 48, 'carbs': 11, 'protein': 1.4, 'fat': 0.4},
            'pear': {'calories': 57, 'carbs': 15, 'protein': 0.4, 'fat': 0.1},
            'date': {'calories': 282, 'carbs': 75, 'protein': 2.5, 'fat': 0.4},
            'fig': {'calories': 74, 'carbs': 19, 'protein': 0.8, 'fat': 0.3},
            'coconut': {'calories': 354, 'carbs': 15, 'protein': 3.3, 'fat': 33},
            'passion fruit': {'calories': 97, 'carbs': 23, 'protein': 2.2, 'fat': 0.7},
            'star fruit': {'calories': 31, 'carbs': 7, 'protein': 1, 'fat': 0.3},
            'persimmon': {'calories': 70, 'carbs': 18, 'protein': 0.6, 'fat': 0.2},
            'cantaloupe': {'calories': 34, 'carbs': 8, 'protein': 0.8, 'fat': 0.2},
            'honeydew': {'calories': 36, 'carbs': 9, 'protein': 0.5, 'fat': 0.1},
            'blueberry': {'calories': 57, 'carbs': 14, 'protein': 0.7, 'fat': 0.3},
            'raspberry': {'calories': 52, 'carbs': 12, 'protein': 1.2, 'fat': 0.7},
            'blackberry': {'calories': 43, 'carbs': 10, 'protein': 1.4, 'fat': 0.5},
            'cranberry': {'calories': 46, 'carbs': 12, 'protein': 0.4, 'fat': 0.1},
            'elderberry': {'calories': 73, 'carbs': 18, 'protein': 0.7, 'fat': 0.5},
            'boysenberry': {'calories': 43, 'carbs': 10, 'protein': 1, 'fat': 0.5},
            
            # More Vegetables
            'zucchini': {'calories': 17, 'carbs': 3.1, 'protein': 1.2, 'fat': 0.3},
            'eggplant': {'calories': 25, 'carbs': 6, 'protein': 1, 'fat': 0.2},
            'brussels sprouts': {'calories': 43, 'carbs': 9, 'protein': 3.4, 'fat': 0.3},
            'cabbage': {'calories': 25, 'carbs': 6, 'protein': 1.3, 'fat': 0.1},
            'cauliflower': {'calories': 25, 'carbs': 5, 'protein': 1.9, 'fat': 0.3},
            'spinach': {'calories': 23, 'carbs': 3.6, 'protein': 2.9, 'fat': 0.4},
            'kale': {'calories': 49, 'carbs': 9, 'protein': 4.3, 'fat': 0.9},
            'lettuce': {'calories': 15, 'carbs': 3, 'protein': 1.4, 'fat': 0.2},
            'bok choy': {'calories': 13, 'carbs': 2.2, 'protein': 1.5, 'fat': 0.2},
            'celery': {'calories': 16, 'carbs': 3, 'protein': 0.7, 'fat': 0.2},
            'radish': {'calories': 16, 'carbs': 3.4, 'protein': 0.7, 'fat': 0.1},
            'beetroot': {'calories': 43, 'carbs': 10, 'protein': 1.6, 'fat': 0.2},
            'turnip': {'calories': 28, 'carbs': 6, 'protein': 0.9, 'fat': 0.1},
            'sweet potato': {'calories': 86, 'carbs': 20, 'protein': 1.6, 'fat': 0.1},
            'yam': {'calories': 118, 'carbs': 28, 'protein': 1.5, 'fat': 0.2},
            'corn': {'calories': 86, 'carbs': 19, 'protein': 3.3, 'fat': 1.2},
            'peas': {'calories': 81, 'carbs': 14, 'protein': 5.4, 'fat': 0.4},
            'green beans': {'calories': 31, 'carbs': 7, 'protein': 1.8, 'fat': 0.1},
            'asparagus': {'calories': 20, 'carbs': 4, 'protein': 2.2, 'fat': 0.1},
            'artichoke': {'calories': 47, 'carbs': 11, 'protein': 3.3, 'fat': 0.2},
            'leek': {'calories': 61, 'carbs': 14, 'protein': 1.5, 'fat': 0.3},
            'garlic': {'calories': 149, 'carbs': 33, 'protein': 6.4, 'fat': 0.5},
            'ginger': {'calories': 80, 'carbs': 18, 'protein': 1.8, 'fat': 0.8},
            'turmeric': {'calories': 354, 'carbs': 65, 'protein': 7.8, 'fat': 9.9},
            'chili': {'calories': 40, 'carbs': 9, 'protein': 2, 'fat': 0.2},
            'pepper': {'calories': 27, 'carbs': 5, 'protein': 1, 'fat': 0.3},
            'okra': {'calories': 33, 'carbs': 7, 'protein': 2, 'fat': 0.2},
            'pumpkin': {'calories': 26, 'carbs': 7, 'protein': 1, 'fat': 0.1},
            'squash': {'calories': 16, 'carbs': 3.4, 'protein': 1.2, 'fat': 0.2},
            'butternut squash': {'calories': 45, 'carbs': 12, 'protein': 1, 'fat': 0.1},
            'acorn squash': {'calories': 40, 'carbs': 11, 'protein': 1, 'fat': 0.1},
            
            # More Indian Foods
            'aloo paratha': {'calories': 320, 'carbs': 48, 'protein': 8, 'fat': 12},
            'gobi paratha': {'calories': 280, 'carbs': 45, 'protein': 8, 'fat': 10},
            'methi paratha': {'calories': 270, 'carbs': 44, 'protein': 8, 'fat': 9},
            'puri': {'calories': 350, 'carbs': 45, 'protein': 7, 'fat': 17},
            'bhatura': {'calories': 380, 'carbs': 50, 'protein': 8, 'fat': 18},
            'upma': {'calories': 220, 'carbs': 42, 'protein': 6, 'fat': 5},
            'poha': {'calories': 180, 'carbs': 38, 'protein': 4, 'fat': 3},
            'sev puri': {'calories': 320, 'carbs': 45, 'protein': 6, 'fat': 12},
            'bhel puri': {'calories': 280, 'carbs': 42, 'protein': 5, 'fat': 10},
            'pani puri': {'calories': 35, 'carbs': 6, 'protein': 0.5, 'fat': 1},
            'ragda pattice': {'calories': 350, 'carbs': 48, 'protein': 8, 'fat': 14},
            'vada pav': {'calories': 320, 'carbs': 42, 'protein': 7, 'fat': 13},
            'dabeli': {'calories': 280, 'carbs': 40, 'protein': 6, 'fat': 11},
            'kathi roll': {'calories': 350, 'carbs': 38, 'protein': 15, 'fat': 16},
            'frankie': {'calories': 340, 'carbs': 36, 'protein': 14, 'fat': 15},
            'chaat': {'calories': 250, 'carbs': 38, 'protein': 5, 'fat': 9},
            'bhel': {'calories': 240, 'carbs': 40, 'protein': 4, 'fat': 8},
            'chana masala': {'calories': 180, 'carbs': 28, 'protein': 10, 'fat': 4},
            'aloo matar': {'calories': 150, 'carbs': 25, 'protein': 5, 'fat': 4},
            'bhindi masala': {'calories': 120, 'carbs': 12, 'protein': 3, 'fat': 7},
            'lauki ki sabzi': {'calories': 80, 'carbs': 10, 'protein': 2, 'fat': 3},
            'tinda masala': {'calories': 90, 'carbs': 11, 'protein': 2, 'fat': 4},
            'methi malai matar': {'calories': 200, 'carbs': 15, 'protein': 8, 'fat': 12},
            'navratan korma': {'calories': 220, 'carbs': 18, 'protein': 6, 'fat': 14},
            'vegetable biryani': {'calories': 320, 'carbs': 50, 'protein': 8, 'fat': 10},
            'mushroom biryani': {'calories': 310, 'carbs': 48, 'protein': 10, 'fat': 10},
            'egg biryani': {'calories': 340, 'carbs': 45, 'protein': 15, 'fat': 12},
            'mutton biryani': {'calories': 380, 'carbs': 45, 'protein': 25, 'fat': 14},
            'goat biryani': {'calories': 375, 'carbs': 45, 'protein': 24, 'fat': 13},
            'rajma chawal': {'calories': 250, 'carbs': 45, 'protein': 12, 'fat': 4},
            'dal chawal': {'calories': 280, 'carbs': 50, 'protein': 12, 'fat': 5},
            'kadhi chawal': {'calories': 240, 'carbs': 42, 'protein': 8, 'fat': 6},
            'jeera rice': {'calories': 200, 'carbs': 42, 'protein': 4, 'fat': 4},
            'lemon rice': {'calories': 210, 'carbs': 43, 'protein': 4, 'fat': 5},
            'tamarind rice': {'calories': 230, 'carbs': 45, 'protein': 4, 'fat': 6},
            'coconut rice': {'calories': 250, 'carbs': 46, 'protein': 4, 'fat': 8},
            'curd rice': {'calories': 180, 'carbs': 35, 'protein': 5, 'fat': 4},
            'sambar': {'calories': 80, 'carbs': 12, 'protein': 4, 'fat': 2},
            'rasam': {'calories': 25, 'carbs': 5, 'protein': 1, 'fat': 0.5},
            'kootu': {'calories': 120, 'carbs': 15, 'protein': 4, 'fat': 4},
            'poriyal': {'calories': 90, 'carbs': 12, 'protein': 2, 'fat': 4},
            'thoran': {'calories': 85, 'carbs': 10, 'protein': 2, 'fat': 4},
            'avial': {'calories': 150, 'carbs': 18, 'protein': 4, 'fat': 7},
            'appam': {'calories': 150, 'carbs': 30, 'protein': 3, 'fat': 2},
            'uttapam': {'calories': 180, 'carbs': 32, 'protein': 6, 'fat': 4},
            'pongal': {'calories': 200, 'carbs': 38, 'protein': 6, 'fat': 5},
            'bisi bele bath': {'calories': 280, 'carbs': 48, 'protein': 8, 'fat': 8},
            'bisibele bath': {'calories': 280, 'carbs': 48, 'protein': 8, 'fat': 8},
            'medu vada': {'calories': 320, 'carbs': 35, 'protein': 10, 'fat': 15},
            'masala vada': {'calories': 310, 'carbs': 32, 'protein': 9, 'fat': 14},
            'dal vada': {'calories': 290, 'carbs': 30, 'protein': 11, 'fat': 13},
            'onion pakoda': {'calories': 280, 'carbs': 28, 'protein': 6, 'fat': 16},
            'mirchi bajji': {'calories': 200, 'carbs': 22, 'protein': 4, 'fat': 11},
            'banana bajji': {'calories': 220, 'carbs': 30, 'protein': 3, 'fat': 10},
            'bread pakora': {'calories': 280, 'carbs': 32, 'protein': 6, 'fat': 14},
            'corn pakora': {'calories': 250, 'carbs': 35, 'protein': 5, 'fat': 11},
            'paneer pakora': {'calories': 320, 'carbs': 25, 'protein': 14, 'fat': 18},
            'aloo tikki': {'calories': 220, 'carbs': 30, 'protein': 4, 'fat': 10},
            'samosa chaat': {'calories': 300, 'carbs': 38, 'protein': 6, 'fat': 14},
            'chicken 65': {'calories': 280, 'carbs': 12, 'protein': 22, 'fat': 16},
            'chicken manchurian': {'calories': 320, 'carbs': 25, 'protein': 20, 'fat': 16},
            'gobi manchurian': {'calories': 280, 'carbs': 35, 'protein': 6, 'fat': 13},
            'paneer manchurian': {'calories': 340, 'carbs': 28, 'protein': 14, 'fat': 18},
            'veg manchurian': {'calories': 250, 'carbs': 30, 'protein': 5, 'fat': 12},
            'chilli chicken': {'calories': 290, 'carbs': 15, 'protein': 24, 'fat': 15},
            'drumstick curry': {'calories': 100, 'carbs': 12, 'protein': 3, 'fat': 4},
            'potato curry': {'calories': 140, 'carbs': 22, 'protein': 3, 'fat': 5},
            'onion curry': {'calories': 110, 'carbs': 15, 'protein': 2, 'fat': 4},
            'brinjal curry': {'calories': 120, 'carbs': 12, 'protein': 2, 'fat': 7},
            'tomato curry': {'calories': 90, 'carbs': 14, 'protein': 2, 'fat': 3},
            'coconut curry': {'calories': 180, 'carbs': 12, 'protein': 4, 'fat': 13},
            'fish curry': {'calories': 220, 'carbs': 8, 'protein': 22, 'fat': 12},
            'prawn curry': {'calories': 200, 'carbs': 6, 'protein': 24, 'fat': 9},
            'crab curry': {'calories': 190, 'carbs': 8, 'protein': 20, 'fat': 9},
            'mutton curry': {'calories': 300, 'carbs': 6, 'protein': 26, 'fat': 20},
            'goat curry': {'calories': 295, 'carbs': 6, 'protein': 25, 'fat': 19},
            'lamb curry': {'calories': 310, 'carbs': 6, 'protein': 27, 'fat': 21},
            'keema': {'calories': 280, 'carbs': 4, 'protein': 22, 'fat': 20},
            'keema matar': {'calories': 290, 'carbs': 12, 'protein': 22, 'fat': 18},
            'nargisi kofta': {'calories': 320, 'carbs': 15, 'protein': 20, 'fat': 20},
            'malai kofta': {'calories': 340, 'carbs': 20, 'protein': 12, 'fat': 24},
            'vegetable kofta': {'calories': 280, 'carbs': 28, 'protein': 8, 'fat': 15},
            'dahi vada': {'calories': 180, 'carbs': 25, 'protein': 6, 'fat': 6},
            'dahi puri': {'calories': 250, 'carbs': 35, 'protein': 6, 'fat': 9},
            'papdi chaat': {'calories': 280, 'carbs': 38, 'protein': 6, 'fat': 11},
            'aloo chaat': {'calories': 200, 'carbs': 28, 'protein': 4, 'fat': 8},
            'fruit chaat': {'calories': 120, 'carbs': 28, 'protein': 2, 'fat': 1},
            'golgappa': {'calories': 35, 'carbs': 6, 'protein': 0.5, 'fat': 1},
            'jhal muri': {'calories': 150, 'carbs': 22, 'protein': 3, 'fat': 6},
            'masala puri': {'calories': 280, 'carbs': 36, 'protein': 6, 'fat': 11},
            'masala dosa': {'calories': 280, 'carbs': 40, 'protein': 8, 'fat': 10},
            'plain dosa': {'calories': 160, 'carbs': 28, 'protein': 4, 'fat': 5},
            'onion dosa': {'calories': 200, 'carbs': 32, 'protein': 5, 'fat': 6},
            'rava dosa': {'calories': 240, 'carbs': 38, 'protein': 5, 'fat': 8},
            'idiyappam': {'calories': 150, 'carbs': 32, 'protein': 3, 'fat': 1},
            'puttu': {'calories': 160, 'carbs': 34, 'protein': 4, 'fat': 1},
            'ada': {'calories': 180, 'carbs': 30, 'protein': 4, 'fat': 5},
            'neer dosa': {'calories': 140, 'carbs': 30, 'protein': 3, 'fat': 2},
            'set dosa': {'calories': 150, 'carbs': 28, 'protein': 4, 'fat': 4},
            'kesari': {'calories': 220, 'carbs': 35, 'protein': 3, 'fat': 8},
            'payasam': {'calories': 200, 'carbs': 32, 'protein': 4, 'fat': 6},
            'shrikhand': {'calories': 180, 'carbs': 28, 'protein': 6, 'fat': 6},
            'rabri': {'calories': 250, 'carbs': 30, 'protein': 8, 'fat': 12},
            'basundi': {'calories': 240, 'carbs': 28, 'protein': 7, 'fat': 11},
            'gajar halwa': {'calories': 260, 'carbs': 40, 'protein': 4, 'fat': 11},
            'moong dal halwa': {'calories': 280, 'carbs': 38, 'protein': 6, 'fat': 12},
            'sooji halwa': {'calories': 250, 'carbs': 42, 'protein': 3, 'fat': 10},
            'badam halwa': {'calories': 300, 'carbs': 35, 'protein': 6, 'fat': 15},
            'rasmalai': {'calories': 220, 'carbs': 32, 'protein': 8, 'fat': 8},
            'malpua': {'calories': 280, 'carbs': 48, 'protein': 4, 'fat': 10},
            'imarti': {'calories': 300, 'carbs': 68, 'protein': 4, 'fat': 8},
            'soan papdi': {'calories': 380, 'carbs': 55, 'protein': 5, 'fat': 16},
            'besan ladoo': {'calories': 320, 'carbs': 40, 'protein': 8, 'fat': 15},
            'coconut ladoo': {'calories': 280, 'carbs': 35, 'protein': 4, 'fat': 14},
            'motichoor ladoo': {'calories': 340, 'carbs': 48, 'protein': 5, 'fat': 14},
            'kalakand': {'calories': 290, 'carbs': 38, 'protein': 10, 'fat': 12},
            'peda': {'calories': 300, 'carbs': 42, 'protein': 8, 'fat': 13},
            'burfi': {'calories': 280, 'carbs': 40, 'protein': 5, 'fat': 12},
            'kaju katli': {'calories': 320, 'carbs': 35, 'protein': 6, 'fat': 18},
            'kulfi': {'calories': 180, 'carbs': 25, 'protein': 4, 'fat': 8},
            'falooda': {'calories': 320, 'carbs': 55, 'protein': 6, 'fat': 9},
            'thandai': {'calories': 150, 'carbs': 22, 'protein': 4, 'fat': 6},
            'jaljeera': {'calories': 25, 'carbs': 5, 'protein': 0.5, 'fat': 0.2},
            'aam panna': {'calories': 80, 'carbs': 18, 'protein': 0.5, 'fat': 0.2},
            'rooh afza': {'calories': 120, 'carbs': 28, 'protein': 0.5, 'fat': 0},
            'nimbu pani': {'calories': 30, 'carbs': 7, 'protein': 0.2, 'fat': 0.1},
            'rose lassi': {'calories': 110, 'carbs': 16, 'protein': 5, 'fat': 3},
        }
        return food_db
    
    def _load_pretrained_model(self):
        """Load pretrained ResNet50 model and ImageNet labels"""
        try:
            weights = models.ResNet50_Weights.DEFAULT
            model = models.resnet50(weights=weights)
            model.eval()
            imagenet_labels = weights.meta.get('categories', [])
            return model, imagenet_labels
        except Exception as e:
            st.error(f"Error loading model: {e}")
            return None, []
    
    def preprocess_image(self, image):
        """Preprocess image for model prediction"""
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        image = image.convert('RGB')
        return transform(image).unsqueeze(0)
    
    def predict_food(self, image):
        """Predict food item from image"""
        try:
            input_tensor = self.preprocess_image(image)
            
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
            # Get top 3 predictions
            top3_prob, top3_catid = torch.topk(probabilities, 3)
            
            predictions = []
            for i in range(3):
                # Map ImageNet classes to our food classes (simplified mapping)
                imagenet_label = self.imagenet_labels[top3_catid[i].item()] if self.imagenet_labels else str(top3_catid[i].item())
                predicted_class = self._map_to_food_class(imagenet_label)
                confidence = top3_prob[i].item()
                predictions.append({
                    'food_item': predicted_class,
                    'confidence': confidence,
                    'calories': self.food_calorie_db.get(predicted_class, {}).get('calories', 0)
                })
            
            return predictions
            
        except Exception as e:
            st.error(f"Prediction error: {e}")
            return None
    
    def _map_to_food_class(self, imagenet_label):
        """Map ImageNet label string to our food class name"""
        if not imagenet_label:
            return 'unknown'
        
        label = imagenet_label.lower()
        
        keyword_map = {
            'pizza': 'pizza',
            'cheeseburger': 'burger',
            'hamburger': 'burger',
            'hotdog': 'hot dog',
            'hot dog': 'hot dog',
            'ice cream': 'ice cream',
            'ice lolly': 'ice cream',
            'icecream': 'ice cream',
            'bagel': 'bagel',
            'pretzel': 'pretzel',
            'sandwich': 'sandwich',
            'burrito': 'burrito',
            'guacamole': 'guacamole',
            'taco': 'taco',
            'pancake': 'pancake',
            'waffle': 'waffle',
            'spaghetti': 'spaghetti',
            'carbonara': 'pasta',
            'meat loaf': 'meat pie',
            'omelet': 'egg',
            'omelette': 'egg',
            'sushi': 'sushi',
            'ramen': 'ramen',
            'edible fungus': 'mushroom',
            'plate': 'unknown',
            'coffee': 'coffee',
            'espresso': 'coffee',
            'cup': 'unknown',
            'cappuccino': 'coffee',
            'milk': 'milk',
            'dough': 'bread',
            'french loaf': 'bread',
            'baguette': 'baguette',
            'corn': 'corn',
            'cauliflower': 'cauliflower',
            'bell pepper': 'bell pepper',
            'banana': 'banana',
            'orange': 'orange',
            'granny smith': 'apple',
            'apple': 'apple',
            'strawberry': 'strawberry',
            'pineapple': 'pineapple',
            'lemon': 'lemon',
            'fig': 'fig',
            'pomegranate': 'pomegranate',
            'watermelon': 'watermelon',
            'cucumber': 'cucumber',
            'artichoke': 'artichoke',
            'broccoli': 'broccoli',
            'carrot': 'carrot',
            'potato': 'potato',
            'sweet potato': 'sweet potato',
            'turnip': 'turnip',
            'mushroom': 'mushroom',
            'chocolate sauce': 'dessert',
            'custard': 'dessert',
            'soup': 'soup',
            'minestrone': 'soup',
            'red wine': 'wine',
            'beer': 'beer',
            'bottle': 'unknown',
            'lobster': 'lobster',
            'crab': 'crab',
            'shrimp': 'shrimp',
            'oyster': 'oysters',
            'salmon': 'salmon',
            'tuna': 'fish',
            'cod': 'fish',
            'chicken': 'chicken',
            'turkey': 'turkey',
            'steak': 'steak',
            'pork': 'pork',
            'sausage': 'sausage',
            'bacon': 'bacon',
            'meatball': 'meat pie',
            'french fries': 'french fries',
            'mashed potato': 'potato',
            'rice': 'rice',
            'paella': 'paella',
            'risotto': 'risotto',
            'chocolate cake': 'cake',
            'cheesecake': 'cake',
            'cupcake': 'cupcake',
            'doughnut': 'donut',
            'bagel': 'bagel',
            'croissant': 'croissant',
            'pretzel': 'pretzel',
            'popcorn': 'popcorn',
            'almond': 'almonds',
            'peanut': 'nuts',
            'cashew': 'nuts',
            'hazelnut': 'nuts',
            'walnut': 'nuts',
        }
        
        for keyword, mapped_food in keyword_map.items():
            if keyword in label:
                return mapped_food
        
        # Try direct match with database foods
        for food in self.food_calorie_db.keys():
            if food in label:
                return food
        
        # Fallback to ImageNet label itself
        return label
    
    def estimate_portion_size(self, image):
        """Estimate portion size using image analysis"""
        # Convert to numpy array for OpenCV processing
        img_array = np.array(image)
        
        # Simple object detection based on color and contours
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            # Simple area to portion size estimation
            if area < 1000:
                return 'small'
            elif area < 5000:
                return 'medium'
            else:
                return 'large'
        
        return 'medium'
    
    def calculate_calories(self, food_item, portion_size='medium'):
        """Calculate calories based on food item and portion size"""
        portion_multipliers = {
            'small': 0.7,
            'medium': 1.0,
            'large': 1.5
        }
        
        if not food_item:
            return None
        
        # Normalize food item name
        food_item_lower = food_item.lower().strip()
        
        # Direct lookup
        food_data = self.food_calorie_db.get(food_item_lower)
        
        # If not found, try partial matching for variations
        if not food_data:
            # Try to find similar food names (handles variations like "butter naan" -> "butter naan")
            for key in self.food_calorie_db.keys():
                if food_item_lower in key or key in food_item_lower:
                    food_data = self.food_calorie_db[key]
                    break
        
        if food_data:
            multiplier = portion_multipliers.get(portion_size.lower(), 1.0)
            return {
                'calories': round(food_data['calories'] * multiplier, 1),
                'carbs': round(food_data.get('carbs', 0) * multiplier, 1),
                'protein': round(food_data.get('protein', 0) * multiplier, 1),
                'fat': round(food_data.get('fat', 0) * multiplier, 1)
            }
        
        # Fallback: Provide estimated values for unknown foods based on food category
        estimated_nutrition = self._estimate_nutrition(food_item_lower)
        if estimated_nutrition:
            multiplier = portion_multipliers.get(portion_size.lower(), 1.0)
            return {
                'calories': round(estimated_nutrition['calories'] * multiplier, 1),
                'carbs': round(estimated_nutrition.get('carbs', 0) * multiplier, 1),
                'protein': round(estimated_nutrition.get('protein', 0) * multiplier, 1),
                'fat': round(estimated_nutrition.get('fat', 0) * multiplier, 1)
            }
        
        return None
    
    def _estimate_nutrition(self, food_item):
        """AI-powered estimation for ANY unknown food based on intelligent keyword analysis"""
        food_lower = food_item.lower()
        
        # High-fat/rich foods (fried, creamy, buttery)
        if any(word in food_lower for word in ['fried', 'deep fried', 'butter', 'creamy', 'cream', 'rich', 'ghee']):
            base_calories = 350
            base_fat = 20
        # Desserts and sweets
        elif any(word in food_lower for word in ['dessert', 'sweet', 'halwa', 'kheer', 'cake', 'pastry', 'ice cream', 'chocolate', 'candy', 'ladoo', 'barfi', 'gulab jamun']):
            return {'calories': 250, 'carbs': 40, 'protein': 4, 'fat': 10}
        # Heavy meats
        elif any(word in food_lower for word in ['mutton', 'goat', 'lamb', 'beef', 'steak', 'roast']):
            return {'calories': 280, 'carbs': 0, 'protein': 26, 'fat': 20}
        # Poultry
        elif any(word in food_lower for word in ['chicken', 'poultry', 'turkey']):
            if any(word in food_lower for word in ['curry', 'masala', 'gravy']):
                return {'calories': 220, 'carbs': 8, 'protein': 24, 'fat': 12}
            elif any(word in food_lower for word in ['fried', 'crispy']):
                return {'calories': 280, 'carbs': 10, 'protein': 25, 'fat': 16}
            else:
                return {'calories': 165, 'carbs': 0, 'protein': 31, 'fat': 3.6}
        # Rice dishes
        elif any(word in food_lower for word in ['rice', 'biryani', 'pulao', 'fried rice', 'risotto', 'khichdi']):
            if any(word in food_lower for word in ['biryani', 'pulao', 'fried']):
                return {'calories': 280, 'carbs': 45, 'protein': 12, 'fat': 8}
            else:
                return {'calories': 130, 'carbs': 28, 'protein': 2.7, 'fat': 0.3}
        # Breads and flatbreads
        elif any(word in food_lower for word in ['bread', 'roti', 'naan', 'paratha', 'chapati', 'kulcha', 'puri', 'bhatura', 'pita', 'bagel']):
            if any(word in food_lower for word in ['butter', 'paratha', 'puri']):
                return {'calories': 310, 'carbs': 45, 'protein': 8, 'fat': 12}
            else:
                return {'calories': 265, 'carbs': 49, 'protein': 9, 'fat': 3.2}
        # Pasta and noodles
        elif any(word in food_lower for word in ['pasta', 'noodles', 'spaghetti', 'lasagna', 'macaroni', 'ramen', 'udon', 'soba', 'dosa']):
            return {'calories': 220, 'carbs': 38, 'protein': 8, 'fat': 5}
        # Curries and gravies
        elif any(word in food_lower for word in ['curry', 'masala', 'gravy', 'sauce']):
            return {'calories': 180, 'carbs': 12, 'protein': 8, 'fat': 12}
        # Dals and legumes
        elif any(word in food_lower for word in ['dal', 'lentil', 'legume', 'bean', 'chana', 'rajma', 'chole']):
            return {'calories': 150, 'carbs': 22, 'protein': 10, 'fat': 3}
        # Fish and seafood
        elif any(word in food_lower for word in ['fish', 'seafood', 'salmon', 'tuna', 'prawn', 'shrimp', 'crab', 'lobster']):
            if any(word in food_lower for word in ['fried', 'battered']):
                return {'calories': 280, 'carbs': 15, 'protein': 22, 'fat': 15}
            else:
                return {'calories': 200, 'carbs': 2, 'protein': 22, 'fat': 10}
        # Eggs
        elif any(word in food_lower for word in ['egg', 'anda', 'omelet', 'omelette']):
            if any(word in food_lower for word in ['fried', 'scrambled', 'omelet']):
                return {'calories': 200, 'carbs': 2, 'protein': 14, 'fat': 14}
            else:
                return {'calories': 155, 'carbs': 1.1, 'protein': 13, 'fat': 11}
        # Cheese and paneer
        elif any(word in food_lower for word in ['cheese', 'paneer', 'cottage cheese']):
            if any(word in food_lower for word in ['fried', 'tikka', 'paneer']):
                return {'calories': 320, 'carbs': 8, 'protein': 18, 'fat': 22}
            else:
                return {'calories': 300, 'carbs': 2, 'protein': 20, 'fat': 25}
        # Fruits
        elif any(word in food_lower for word in ['fruit', 'apple', 'banana', 'mango', 'orange', 'grape', 'berry', 'kiwi', 'pineapple', 'watermelon']):
            return {'calories': 50, 'carbs': 12, 'protein': 0.5, 'fat': 0.2}
        # Vegetables
        elif any(word in food_lower for word in ['vegetable', 'sabzi', 'veggie', 'veggies', 'potato', 'onion', 'tomato', 'carrot', 'broccoli', 'cauliflower', 'cabbage']):
            if any(word in food_lower for word in ['fried', 'pakora', 'fries']):
                return {'calories': 220, 'carbs': 25, 'protein': 4, 'fat': 12}
            else:
                return {'calories': 50, 'carbs': 10, 'protein': 2, 'fat': 1}
        # Soups
        elif any(word in food_lower for word in ['soup', 'shorba', 'broth', 'stew']):
            return {'calories': 75, 'carbs': 10, 'protein': 3, 'fat': 2}
        # Salads
        elif any(word in food_lower for word in ['salad']):
            return {'calories': 30, 'carbs': 5, 'protein': 2, 'fat': 0.5}
        # Pizza
        elif any(word in food_lower for word in ['pizza']):
            return {'calories': 285, 'carbs': 36, 'protein': 12, 'fat': 10}
        # Burgers and sandwiches
        elif any(word in food_lower for word in ['burger', 'sandwich', 'wrap', 'roll']):
            return {'calories': 320, 'carbs': 35, 'protein': 15, 'fat': 14}
        # Snacks
        elif any(word in food_lower for word in ['snack', 'chips', 'crisps', 'samosa', 'pakora', 'bhaji', 'fritter', 'vada']):
            return {'calories': 280, 'carbs': 30, 'protein': 5, 'fat': 15}
        # Dumplings and momos
        elif any(word in food_lower for word in ['momo', 'dumpling', 'gyoza', 'wonton', 'dim sum']):
            return {'calories': 200, 'carbs': 25, 'protein': 8, 'fat': 8}
        # Beverages
        elif any(word in food_lower for word in ['drink', 'juice', 'smoothie', 'shake', 'lassi', 'coffee', 'tea', 'chai']):
            return {'calories': 100, 'carbs': 20, 'protein': 2, 'fat': 2}
        # Cereals and breakfast
        elif any(word in food_lower for word in ['cereal', 'oats', 'porridge', 'khichdi', 'upma', 'poha']):
            return {'calories': 200, 'carbs': 35, 'protein': 6, 'fat': 4}
        # Default: balanced meal estimate
        else:
            return {'calories': 220, 'carbs': 25, 'protein': 12, 'fat': 8}

def main():
    st.title("🍎 FitSync AI Calorie Tracker")
    st.markdown("### 🚀 Analyze **ANY** Food - Powered by AI!")
    st.markdown("*Upload an image OR type the name of ANY food to get instant nutritional analysis. Our AI works with any cuisine, any dish, any ingredient!*")
    
    # Initialize tracker
    if 'tracker' not in st.session_state:
        st.session_state.tracker = CalorieTracker()
    if 'meal_history' not in st.session_state:
        st.session_state.meal_history = []
    
    tracker = st.session_state.tracker
    
    # Sidebar for navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Calorie Analysis", "Meal History", "Nutrition Insights"])
    
    if page == "Calorie Analysis":
        render_calorie_analysis(tracker)
    elif page == "Meal History":
        render_meal_history()
    elif page == "Nutrition Insights":
        render_nutrition_insights()

def render_calorie_analysis(tracker):
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("📸 Option 1: Upload Food Image")
        st.markdown("*Take a photo of ANY food and our AI will analyze it!*")
        uploaded_file = st.file_uploader(
            "Choose an image of ANY food...", 
            type=['jpg', 'jpeg', 'png'],
            help="Upload a clear image of ANY food - our AI can analyze any cuisine or dish!"
        )
        
        if uploaded_file is not None:
            # Display uploaded image
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Food Image", use_column_width=True)
            
            # Analyze button
            if st.button("Analyze Food", type="primary"):
                with st.spinner("Analyzing your food..."):
                    # Clear any manual selections when analyzing image
                    if 'manual_food_selected' in st.session_state:
                        del st.session_state.manual_food_selected
                    if 'manual_nutrition' in st.session_state:
                        del st.session_state.manual_nutrition
                    
                    # Predict food items
                    predictions = tracker.predict_food(image)
                    
                    if predictions:
                        st.session_state.predictions = predictions
                        st.session_state.current_image = image
                        
                        # Estimate portion size
                        portion_size = tracker.estimate_portion_size(image)
                        st.session_state.portion_size = portion_size
                        
                        st.success("Analysis complete!")
        
        # Manual food entry option
        st.divider()
        st.subheader("🎯 Enter ANY Food (AI-Powered Analysis)")
        st.markdown("*Type the name of ANY food - our AI will analyze it even if it's not in our database!*")
        
        # Option 1: Type ANY food name (free-form entry)
        food_name_input = st.text_input(
            "✨ Type any food name:",
            placeholder="e.g., butter naan, momos, pasta, pizza, sushi, biryani, any food...",
            help="Enter ANY food name - our system will analyze it automatically!",
            key='food_input'
        )
        
        # Option 2: Select from dropdown (optional)
        selected_food_dropdown = ''
        with st.expander("🔍 Or browse from our database (optional)"):
            food_list = sorted(tracker.food_calorie_db.keys())
            selected_food_dropdown = st.selectbox(
                "Choose from database:",
                options=[''] + food_list,
                help="Select a food from our comprehensive database",
                key='food_dropdown'
            )
        
        # Determine which food was selected
        selected_food = None
        food_input_used = False
        
        # Priority: Use dropdown if selected, otherwise use text input
        if selected_food_dropdown:
            selected_food = selected_food_dropdown
        elif food_name_input:
            food_input_used = True
            food_name_lower = food_name_input.lower().strip()
            
            # First try exact match
            if food_name_lower in tracker.food_calorie_db:
                selected_food = food_name_lower
            else:
                # Try partial/fuzzy match
                best_match = None
                best_match_score = 0
                
                for key in tracker.food_calorie_db.keys():
                    # Check if food name contains key or key contains food name
                    if food_name_lower in key or key in food_name_lower:
                        # Score based on match length
                        match_length = min(len(food_name_lower), len(key))
                        if match_length > best_match_score:
                            best_match_score = match_length
                            best_match = key
                
                if best_match:
                    selected_food = best_match
                    st.info(f"📌 Found similar food: '{best_match}'. Using this for analysis.")
                else:
                    # No match found - use the typed food name directly
                    selected_food = food_name_lower
                    st.info(f"🆕 '{food_name_input}' not in database. Using AI estimation based on food category.")
        
        if selected_food:
            # Clear any previous predictions when manually selecting
            if 'predictions' in st.session_state:
                del st.session_state.predictions
            
            st.session_state.manual_food_selected = selected_food
            st.session_state.current_image = None
            
            # Portion size selector for manual entry
            portion_size = st.selectbox(
                "Select portion size:",
                options=['small', 'medium', 'large'],
                index=1,
                key='manual_portion'
            )
            st.session_state.portion_size = portion_size
            
            # Calculate nutrition for manual selection (will work for ANY food due to fallback)
            nutrition = tracker.calculate_calories(selected_food, portion_size)
            if nutrition:
                st.session_state.manual_nutrition = nutrition
                if food_input_used and selected_food not in tracker.food_calorie_db:
                    st.success(f"✅ Analyzing '{selected_food.title()}' using AI estimation!")
                else:
                    st.success(f"✅ Ready to track: {selected_food.title()}")
            else:
                # This should rarely happen now due to fallback, but just in case
                st.error(f"Could not analyze '{selected_food}'. Please try rephrasing the food name.")

    with col2:
        # Handle manual food selection
        if hasattr(st.session_state, 'manual_food_selected') and st.session_state.manual_food_selected:
            st.subheader("Food Information")
            
            selected_food = st.session_state.manual_food_selected
            portion_size = st.session_state.portion_size
            
            st.metric(
                label="Selected Food",
                value=selected_food.title()
            )
            
            st.metric(
                label="Portion Size",
                value=portion_size.title()
            )
            
            nutrition = st.session_state.get('manual_nutrition')
            if nutrition:
                # Check if using AI estimation or database match
                is_ai_estimate = selected_food not in tracker.food_calorie_db
                if is_ai_estimate:
                    st.info("🤖 Using AI-powered estimation based on food category")
                
                st.subheader("Nutritional Information")
                
                col3, col4, col5, col6 = st.columns(4)
                
                with col3:
                    st.metric("Calories", f"{nutrition['calories']:.0f}")
                with col4:
                    st.metric("Carbs (g)", f"{nutrition['carbs']:.1f}")
                with col5:
                    st.metric("Protein (g)", f"{nutrition['protein']:.1f}")
                with col6:
                    st.metric("Fat (g)", f"{nutrition['fat']:.1f}")
                
                # Add to meal history
                if st.button("Add to Meal History", key='add_manual'):
                    meal_entry = {
                        'timestamp': datetime.now(),
                        'food_item': selected_food,
                        'portion_size': portion_size,
                        'calories': nutrition['calories'],
                        'carbs': nutrition['carbs'],
                        'protein': nutrition['protein'],
                        'fat': nutrition['fat'],
                        'image': None
                    }
                    st.session_state.meal_history.append(meal_entry)
                    st.success("Added to meal history!")
                    # Clear manual selection after adding
                    if 'manual_food_selected' in st.session_state:
                        del st.session_state.manual_food_selected
                    if 'manual_nutrition' in st.session_state:
                        del st.session_state.manual_nutrition
                    st.rerun()
        
        # Handle image-based predictions
        elif hasattr(st.session_state, 'predictions'):
            st.subheader("Analysis Results")
            
            # Display top prediction
            top_prediction = st.session_state.predictions[0]
            portion_size = st.session_state.get('portion_size', 'medium')
            
            # Check if food item is in database
            food_item = top_prediction['food_item']
            
            # Handle unknown foods - allow AI estimation
            if food_item == 'unknown':
                st.warning("⚠️ Food not recognized from image. Please type the food name manually below.")
            else:
                # Check if using AI estimation
                is_ai_estimate = food_item not in tracker.food_calorie_db
                if is_ai_estimate:
                    st.info(f"🤖 Using AI estimation for '{food_item}' (not in database)")
            
            st.metric(
                label="Detected Food",
                    value=food_item.title(),
                delta=f"{top_prediction['confidence']*100:.1f}% confidence"
            )
            
            st.metric(
                label="Portion Size",
                value=portion_size.title()
            )
            
                # Calculate nutritional information (will work for ANY food now)
                nutrition = tracker.calculate_calories(food_item, portion_size)
            
            if nutrition:
                st.subheader("Nutritional Information")
                
                col3, col4, col5, col6 = st.columns(4)
                
                with col3:
                    st.metric("Calories", f"{nutrition['calories']:.0f}")
                with col4:
                    st.metric("Carbs (g)", f"{nutrition['carbs']:.1f}")
                with col5:
                    st.metric("Protein (g)", f"{nutrition['protein']:.1f}")
                with col6:
                    st.metric("Fat (g)", f"{nutrition['fat']:.1f}")
                
                # Add to meal history
                    if st.button("Add to Meal History", key='add_predicted'):
                    meal_entry = {
                        'timestamp': datetime.now(),
                            'food_item': food_item,
                        'portion_size': portion_size,
                        'calories': nutrition['calories'],
                        'carbs': nutrition['carbs'],
                        'protein': nutrition['protein'],
                        'fat': nutrition['fat'],
                            'image': st.session_state.get('current_image')
                    }
                    st.session_state.meal_history.append(meal_entry)
                    st.success("Added to meal history!")
                
                # Show alternative predictions
                    if len(st.session_state.predictions) > 1:
                st.subheader("Alternative Predictions")
                for i, pred in enumerate(st.session_state.predictions[1:], 1):
                            alt_food = pred['food_item']
                            alt_nutrition = tracker.calculate_calories(alt_food, portion_size)
                            if alt_nutrition and alt_food != 'unknown':
                                st.write(f"{i}. {alt_food.title()} "
                               f"({pred['confidence']*100:.1f}% confidence) - "
                               f"{alt_nutrition['calories']:.0f} calories")
                else:
                    st.error(f"Nutritional information not available for '{food_item}'. Please select manually.")

def render_meal_history():
    st.subheader("Meal History")
    
    if not st.session_state.meal_history:
        st.info("No meals recorded yet. Analyze some food images to get started!")
        return
    
    # Display meal history in a table
    df_data = []
    for meal in st.session_state.meal_history:
        df_data.append({
            'Time': meal['timestamp'].strftime('%H:%M'),
            'Date': meal['timestamp'].strftime('%Y-%m-%d'),
            'Food Item': meal['food_item'].title(),
            'Portion': meal['portion_size'].title(),
            'Calories': meal['calories'],
            'Carbs (g)': meal['carbs'],
            'Protein (g)': meal['protein'],
            'Fat (g)': meal['fat']
        })
    
    df = pd.DataFrame(df_data)
    st.dataframe(df, use_container_width=True)
    
    # Summary statistics
    st.subheader("Daily Summary")
    today = datetime.now().strftime('%Y-%m-%d')
    today_meals = [meal for meal in st.session_state.meal_history 
                  if meal['timestamp'].strftime('%Y-%m-%d') == today]
    
    if today_meals:
        total_calories = sum(meal['calories'] for meal in today_meals)
        total_carbs = sum(meal['carbs'] for meal in today_meals)
        total_protein = sum(meal['protein'] for meal in today_meals)
        total_fat = sum(meal['fat'] for meal in today_meals)
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Calories", f"{total_calories:.0f}")
        with col2:
            st.metric("Total Carbs", f"{total_carbs:.1f}g")
        with col3:
            st.metric("Total Protein", f"{total_protein:.1f}g")
        with col4:
            st.metric("Total Fat", f"{total_fat:.1f}g")
        
        # Nutrition pie chart
        fig, ax = plt.subplots()
        macros = [total_carbs, total_protein, total_fat]
        labels = ['Carbs', 'Protein', 'Fat']
        colors = ['#ff9999', '#66b3ff', '#99ff99']
        ax.pie(macros, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        ax.axis('equal')
        st.pyplot(fig)

def render_nutrition_insights():
    st.subheader("Nutrition Insights")
    
    if not st.session_state.meal_history:
        st.info("Analyze some food images to get nutritional insights!")
        return
    
    # Create insights based on meal history
    df_data = []
    for meal in st.session_state.meal_history:
        df_data.append({
            'date': meal['timestamp'].date(),
            'calories': meal['calories'],
            'carbs': meal['carbs'],
            'protein': meal['protein'],
            'fat': meal['fat'],
            'food_item': meal['food_item']
        })
    
    df = pd.DataFrame(df_data)
    
    # Weekly trends
    st.subheader("Weekly Calorie Trends")
    df['date'] = pd.to_datetime(df['date'])
    weekly_calories = df.groupby(df['date'].dt.isocalendar().week)['calories'].sum()
    
    fig, ax = plt.subplots(figsize=(10, 6))
    weekly_calories.plot(kind='bar', ax=ax, color='skyblue')
    ax.set_xlabel('Week Number')
    ax.set_ylabel('Total Calories')
    ax.set_title('Weekly Calorie Consumption')
    st.pyplot(fig)
    
    # Food frequency
    st.subheader("Most Frequently Eaten Foods")
    food_freq = df['food_item'].value_counts().head(10)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    food_freq.plot(kind='barh', ax=ax, color='lightgreen')
    ax.set_xlabel('Frequency')
    ax.set_title('Top 10 Most Frequent Foods')
    st.pyplot(fig)
    
    # Macronutrient distribution
    st.subheader("Macronutrient Distribution")
    total_carbs = df['carbs'].sum()
    total_protein = df['protein'].sum()
    total_fat = df['fat'].sum()
    
    fig, ax = plt.subplots()
    macros = [total_carbs, total_protein, total_fat]
    labels = ['Carbohydrates', 'Protein', 'Fat']
    colors = ['#ffcc99', '#99ccff', '#ff9999']
    ax.pie(macros, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
    ax.axis('equal')
    ax.set_title('Overall Macronutrient Distribution')
    st.pyplot(fig)

if __name__ == "__main__":
    main()