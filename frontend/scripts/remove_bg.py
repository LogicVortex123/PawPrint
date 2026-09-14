import sys
from PIL import Image
from rembg import remove

def process():
    print("Loading cat_sitting.jpg...")
    input_img = Image.open("public/cat_sitting.jpg")
    print("Removing background...")
    output = remove(input_img)
    output.save("public/cat_sitting_transparent.png")
    print("Saved public/cat_sitting_transparent.png successfully!")

if __name__ == "__main__":
    process()
