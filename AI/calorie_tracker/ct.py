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
        self.model = self._load_pretrained_model()
        self.class_names = [
            'apple', 'banana', 'orange', 'pizza', 'burger', 'sandwich', 'french fries',
            'carrot', 'broccoli', 'cake', 'ice cream', 'rice', 'pasta',
            'chicken', 'steak', 'salmon', 'egg', 'bread', 'cheese',
            'tomato', 'cucumber', 'watermelon', 'strawberry', 'grape',
            'potato', 'onion', 'bell pepper', 'mushroom', 'avocado',
            'coffee', 'cupcake', 'donut', 'hot dog', 'hotdog', 'muffin',
            'waffle', 'pancake', 'cookie', 'pretzel', 'popcorn', 'bagel',
            'yogurt', 'milk', 'cereal', 'granola', 'nuts', 'almonds'
        ]
    
    def _load_food_database(self):
        """Load food calorie database with quality variance"""
        # Each food now has base values with ±variance for quality differences
        food_db = {
            'apple': {'calories': 52, 'variance': 0.15, 'carbs': 14, 'protein': 0.3, 'fat': 0.2},
            'banana': {'calories': 89, 'carbs': 23, 'protein': 1.1, 'fat': 0.3},
            'french fries': {'calories': 312, 'carbs': 41, 'protein': 3.4, 'fat': 15},
            'orange': {'calories': 47, 'carbs': 12, 'protein': 0.9, 'fat': 0.1},
            'pizza': {'calories': 285, 'carbs': 36, 'protein': 12, 'fat': 10},
            'burger': {'calories': 354, 'carbs': 35, 'protein': 17, 'fat': 15},
            'sandwich': {'calories': 250, 'carbs': 30, 'protein': 10, 'fat': 8},
            'carrot': {'calories': 41, 'carbs': 10, 'protein': 0.9, 'fat': 0.2},
            'broccoli': {'calories': 34, 'carbs': 7, 'protein': 2.8, 'fat': 0.4},
            'cake': {'calories': 371, 'carbs': 53, 'protein': 5, 'fat': 15},
            'ice cream': {'calories': 207, 'carbs': 24, 'protein': 3.5, 'fat': 11},
            'rice': {'calories': 130, 'carbs': 28, 'protein': 2.7, 'fat': 0.3},
            'pasta': {'calories': 131, 'carbs': 25, 'protein': 5, 'fat': 1.1},
            'chicken': {'calories': 165, 'carbs': 0, 'protein': 31, 'fat': 3.6},
            'steak': {'calories': 271, 'carbs': 0, 'protein': 25, 'fat': 19},
            'salmon': {'calories': 208, 'carbs': 0, 'protein': 20, 'fat': 13},
            'egg': {'calories': 155, 'carbs': 1.1, 'protein': 13, 'fat': 11},
            'bread': {'calories': 265, 'carbs': 49, 'protein': 9, 'fat': 3.2},
            'cheese': {'calories': 402, 'carbs': 1.3, 'protein': 25, 'fat': 33},
            'tomato': {'calories': 18, 'carbs': 3.9, 'protein': 0.9, 'fat': 0.2},
            'cucumber': {'calories': 15, 'carbs': 3.6, 'protein': 0.7, 'fat': 0.1},
            'watermelon': {'calories': 30, 'carbs': 8, 'protein': 0.6, 'fat': 0.2},
            'strawberry': {'calories': 32, 'carbs': 7.7, 'protein': 0.7, 'fat': 0.3},
            'grape': {'calories': 69, 'carbs': 18, 'protein': 0.7, 'fat': 0.2},
            'potato': {'calories': 77, 'carbs': 17, 'protein': 2, 'fat': 0.1},
            'onion': {'calories': 40, 'carbs': 9, 'protein': 1.1, 'fat': 0.1},
            'bell pepper': {'calories': 31, 'carbs': 6, 'protein': 1, 'fat': 0.3},
            'mushroom': {'calories': 22, 'carbs': 3.3, 'protein': 3.1, 'fat': 0.3},
            'avocado': {'calories': 160, 'carbs': 9, 'protein': 2, 'fat': 15},
            'coffee': {'calories': 2, 'carbs': 0, 'protein': 0.3, 'fat': 0},
            'cupcake': {'calories': 225, 'carbs': 35, 'protein': 3, 'fat': 9},
            'donut': {'calories': 226, 'carbs': 25, 'protein': 4, 'fat': 12},
            'hot dog': {'calories': 290, 'carbs': 5, 'protein': 11, 'fat': 26},
            'hotdog': {'calories': 290, 'carbs': 5, 'protein': 11, 'fat': 26},
            'muffin': {'calories': 377, 'carbs': 44, 'protein': 6, 'fat': 19},
            'waffle': {'calories': 218, 'carbs': 24, 'protein': 7, 'fat': 10},
            'pancake': {'calories': 227, 'carbs': 28, 'protein': 6, 'fat': 9},
            'cookie': {'calories': 502, 'carbs': 70, 'protein': 6, 'fat': 22},
            'pretzel': {'calories': 384, 'carbs': 79, 'protein': 10, 'fat': 3},
            'popcorn': {'calories': 387, 'carbs': 78, 'protein': 13, 'fat': 5},
            'bagel': {'calories': 250, 'carbs': 49, 'protein': 10, 'fat': 1.5},
            'yogurt': {'calories': 59, 'carbs': 4, 'protein': 10, 'fat': 0.4},
            'milk': {'calories': 42, 'carbs': 5, 'protein': 3.4, 'fat': 1},
            'cereal': {'calories': 379, 'carbs': 84, 'protein': 7, 'fat': 2},
            'granola': {'calories': 471, 'carbs': 64, 'protein': 10, 'fat': 20},
            'nuts': {'calories': 607, 'carbs': 21, 'protein': 20, 'fat': 54},
            'almonds': {'calories': 579, 'carbs': 22, 'protein': 21, 'fat': 50}
        }
        return food_db
    
    def _load_pretrained_model(self):
        """Load pretrained model for food recognition"""
        try:
            # Using ResNet50 pretrained on ImageNet
            model = models.resnet50(pretrained=True)
            model.eval()
            return model
        except Exception as e:
            st.error(f"Error loading model: {e}")
            return None
    
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
                predicted_class = self._map_to_food_class(top3_catid[i].item())
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
    
    def _map_to_food_class(self, class_id):
        """Map ImageNet class ID to food class name"""
        # Simplified mapping - in practice, you'd want a more comprehensive mapping
        food_mapping = {
            # Fruits
            948: 'apple',  # Granny Smith apple
            954: 'banana',
            950: 'orange',  # Orange
            # Vegetables
            945: 'carrot',
            946: 'broccoli',
            987: 'tomato',
            939: 'french fries',  # French fries
            # Meals
            963: 'pizza',
            933: 'burger',
            932: 'sandwich',
            # etc. - you would expand this mapping
        }
        
        return food_mapping.get(class_id, 'unknown')
    
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
        
        food_data = self.food_calorie_db.get(food_item.lower())
        if food_data:
            multiplier = portion_multipliers.get(portion_size, 1.0)
            return {
                'calories': food_data['calories'] * multiplier,
                'carbs': food_data.get('carbs', 0) * multiplier,
                'protein': food_data.get('protein', 0) * multiplier,
                'fat': food_data.get('fat', 0) * multiplier
            }
        return None

def main():
    st.title("🍎 FitSync AI Calorie Tracker")
    st.markdown("Upload an image of your food to get nutritional insights!")
    
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
        st.subheader("Upload Food Image")
        uploaded_file = st.file_uploader(
            "Choose an image...", 
            type=['jpg', 'jpeg', 'png'],
            help="Upload a clear image of your food"
        )
        
        if uploaded_file is not None:
            # Display uploaded image
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Food Image", use_column_width=True)
            
            # Analyze button
            if st.button("Analyze Food", type="primary"):
                with st.spinner("Analyzing your food..."):
                    # Predict food items
                    predictions = tracker.predict_food(image)
                    
                    if predictions:
                        st.session_state.predictions = predictions
                        st.session_state.current_image = image
                        
                        # Estimate portion size
                        portion_size = tracker.estimate_portion_size(image)
                        st.session_state.portion_size = portion_size
                        
                        st.success("Analysis complete!")

    with col2:
        if hasattr(st.session_state, 'predictions'):
            st.subheader("Analysis Results")
            
            # Display top prediction
            top_prediction = st.session_state.predictions[0]
            portion_size = st.session_state.portion_size
            
            st.metric(
                label="Detected Food",
                value=top_prediction['food_item'].title(),
                delta=f"{top_prediction['confidence']*100:.1f}% confidence"
            )
            
            st.metric(
                label="Portion Size",
                value=portion_size.title()
            )
            
            # Calculate nutritional information
            nutrition = tracker.calculate_calories(
                top_prediction['food_item'], 
                portion_size
            )
            
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
                if st.button("Add to Meal History"):
                    meal_entry = {
                        'timestamp': datetime.now(),
                        'food_item': top_prediction['food_item'],
                        'portion_size': portion_size,
                        'calories': nutrition['calories'],
                        'carbs': nutrition['carbs'],
                        'protein': nutrition['protein'],
                        'fat': nutrition['fat'],
                        'image': st.session_state.current_image
                    }
                    st.session_state.meal_history.append(meal_entry)
                    st.success("Added to meal history!")
                
                # Show alternative predictions
                st.subheader("Alternative Predictions")
                for i, pred in enumerate(st.session_state.predictions[1:], 1):
                    alt_nutrition = tracker.calculate_calories(pred['food_item'], portion_size)
                    if alt_nutrition:
                        st.write(f"{i}. {pred['food_item'].title()} "
                               f"({pred['confidence']*100:.1f}% confidence) - "
                               f"{alt_nutrition['calories']:.0f} calories")

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