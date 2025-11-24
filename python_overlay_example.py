from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

def create_arabic_thumbnail(image_path, output_path, text, font_path='arial.ttf', font_size=60):
    """
    Overlays Arabic text on an image using Pillow, handling reshaping and Bidi direction.
    """
    try:
        # 1. Load Image
        image = Image.open(image_path)
        draw = ImageDraw.Draw(image)
        
        # 2. Load Font
        # Note: You need a font that supports Arabic characters (e.g., Arial, Cairo)
        try:
            font = ImageFont.truetype(font_path, font_size)
        except IOError:
            print(f"Font not found at {font_path}. Using default.")
            font = ImageFont.load_default()

        # 3. Process Arabic Text
        # Reshape Arabic letters (connect them correctly)
        reshaped_text = arabic_reshaper.reshape(text)
        # Reorder for RTL display
        bidi_text = get_display(reshaped_text)

        # 4. Calculate Position (Centered)
        # Get text bounding box
        bbox = draw.textbbox((0, 0), bidi_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        image_width, image_height = image.size
        x = (image_width - text_width) / 2
        y = (image_height - text_height) / 2

        # 5. Draw Text
        # Optional: Add a shadow/stroke for better visibility
        stroke_width = 2
        stroke_color = "black"
        draw.text((x, y), bidi_text, font=font, fill="white", stroke_width=stroke_width, stroke_fill=stroke_color)

        # 6. Save Result
        image.save(output_path)
        print(f"Thumbnail saved to {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

# Example Usage:
if __name__ == "__main__":
    # Ensure you have an image named 'background.jpg' and a font file
    # create_arabic_thumbnail('background.jpg', 'output.jpg', "كيف تربح من الإنترنت")
    pass
