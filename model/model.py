import requests
import pandas as pd
from geopy.distance import geodesic
import sys
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

# Define API parameters
url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
params = {
    "format": "geojson",
    "starttime": "2022-01-01",  
    "endtime": "2024-11-09",  
    "minlatitude": 6.0,
    "maxlatitude": 36.0,
    "minlongitude": 68.0,
    "maxlongitude": 97.0,
    "minmagnitude": 1.0
}

# Fetch earthquake data
response = requests.get(url, params=params)
data = response.json()

# Process data into a DataFrame
earthquake_data = pd.DataFrame([
    {
        'magnitude': eq['properties']['mag'],
        'depth': eq['geometry']['coordinates'][2], 
        'latitude': eq['geometry']['coordinates'][1],
        'longitude': eq['geometry']['coordinates'][0],
        'place': eq['properties']['place'],
        'time': eq['properties']['time']
    }
    for eq in data['features']
])

def calculate_min_distance_to_city(lat, lon, cities):
    distances = [geodesic((lat, lon), (city[1], city[2])).km for city in cities]
    return min(distances)

# Define cities
cities = [
    ('Delhi', 28.6139, 77.2090),
    ('Mumbai', 19.0760, 72.8777),
    ('Bangalore', 12.9716, 77.5946),
    ('Kolkata', 22.5726, 88.3639),
    ('Chennai', 13.0827, 80.2707),
    ('Hyderabad', 17.3850, 78.4867),
    ('Ahmedabad', 23.0225, 72.5714),
    ('Pune', 18.5204, 73.8567),
    ('Jaipur', 26.9124, 75.7873),
    ('Surat', 21.1702, 72.8311),
    ('Lucknow', 26.8467, 80.9462),
    ('Kanpur', 26.4499, 80.3319),
    ('Nagpur', 21.1458, 79.0882),
    ('Indore', 22.7196, 75.8577),
    ('Patna', 25.5941, 85.1376),
    ('Bhopal', 23.2599, 77.4126),
    ('Vadodara', 22.3072, 73.1812),
    ('Ludhiana', 30.9002, 75.8573),
    ('Agra', 27.1767, 78.0081),
    ('Nashik', 19.9975, 73.7898),
    ('Meerut', 28.9845, 77.7064),
    ('Rajkot', 22.3039, 70.8022),
    ('Varanasi', 25.3176, 82.9739),
    ('Srinagar', 34.0837, 74.7973),
    ('Ranchi', 23.3441, 85.3096),
    ('Amritsar', 31.6340, 74.8723),
    ('Coimbatore', 11.0168, 76.9558),
    ('Guwahati', 26.1445, 91.7362),
    ('Kochi', 9.9312, 76.2673),
    ('Mysore', 12.2958, 76.6394)
    # Add more cities as needed
]


# Calculate distance to the nearest city
earthquake_data['distance_to_nearest_city'] = earthquake_data.apply(
    lambda row: calculate_min_distance_to_city(row['latitude'], row['longitude'], cities), axis=1
)

# Define severity classification function
def assign_severity(row):
    if row['magnitude'] >= 6.5 or (row['magnitude'] >= 5.5 and row['distance_to_nearest_city'] <= 50):
        return 'High'
    elif row['magnitude'] >= 4.5 or (row['magnitude'] >= 4.0 and row['distance_to_nearest_city'] <= 100):
        return 'Medium'
    else:
        return 'Low'

# Assign severity
earthquake_data['severity'] = earthquake_data.apply(assign_severity, axis=1)

# Prepare features and labels
X = earthquake_data[['magnitude', 'depth', 'distance_to_nearest_city']]
y = earthquake_data['severity']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train the Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict severity for manual inputs
def predict_manual_data(args):
    magnitude = float(args[0])
    depth = float(args[1])
    distance_to_nearest_city = float(args[2])

    # Prepare data for prediction
    manual_data = pd.DataFrame([[magnitude, depth, distance_to_nearest_city]], 
                               columns=['magnitude', 'depth', 'distance_to_nearest_city'])

    # Scale features
    manual_data = scaler.transform(manual_data)

    # Predict severity
    prediction = model.predict(manual_data)
    print(prediction[0])  # Output severity prediction only

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python model.py <magnitude> <depth> <distance_to_nearest_city>")
    else:
        predict_manual_data(sys.argv[1:])  # Pass command-line arguments
