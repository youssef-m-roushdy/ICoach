import pandas as pd
import requests
import os
import shutil

# --- Configuration ---
CSV_FILE = "body_parts_final-edit.csv"  # Path to your CSV file
IMAGE_COLUMN = "gif_link"    # Name of the column containing GIF/image URLs
OUTPUT_FOLDER = "local_gifs"    # Name of the folder to save images

# Ensure the output folder exists
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

# Read the CSV file
try:
    df = pd.read_csv(CSV_FILE)
    print(f"✅ File successfully read: {CSV_FILE}")
except:
    print("❌ File not found, please check the name")
    exit()

# Function to download the image
def download_image(url, index):
    try:
        # Attempt download as a browser (to bypass server restrictions)
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        
        if response.status_code == 200:
            # Extract file extension (gif, png, etc.)
            ext = url.split('.')[-1].split('?')[0]
            if len(ext) > 4: ext = "gif" # Default to 'gif' if extension is unusual
            
            filename = f"exercise_{index}.{ext}"
            file_path = os.path.join(OUTPUT_FOLDER, filename)
            
            with open(file_path, 'wb') as f:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, f)
            
            return file_path # Return the new local path
        else:
            print(f"⚠️ Failed to download link (Code {response.status_code}): {url}")
            return None
    except Exception as e:
        print(f"❌ Error processing link: {url} - {e}")
        return None

# The Main Loop
print("⏳ Downloading images... This may take a moment...")

new_paths = []
for index, row in df.iterrows():
    url = row[IMAGE_COLUMN]
    
    # If the cell is not empty and contains a URL
    if isinstance(url, str) and url.startswith("http"):
        local_path = download_image(url, index)
        if local_path:
            new_paths.append(local_path) # Image saved, use the new path
        else:
            new_paths.append(None) # Download failed, set path to None
    else:
        new_paths.append(url) # If it's not a URL, keep original value

# Update the DataFrame
df['local_image_path'] = new_paths # New column for local paths

# Save the clean, new CSV file
df.to_csv("exercises_fixed.csv", index=False)
print("\n🎉 Success! Images downloaded and new file 'exercises_fixed.csv' created.")
print("Now use the new column 'local_image_path' in Streamlit.")