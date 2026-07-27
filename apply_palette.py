import os
import re

amber_palette = {
    "surface-tint": "#FFB000",
    "on-primary": "#4A2800",
    "on-secondary-fixed-variant": "#5C4300",
    "inverse-primary": "#A04100",
    "outline": "#A78B7E",
    "surface-container": "#291D17",
    "surface-variant": "#40322B",
    "secondary-fixed": "#FFDFA0",
    "on-secondary": "#402D00",
    "tertiary": "#AAC7FF",
    "on-primary-fixed-variant": "#7A3000",
    "led-green": "#22C55E",
    "surface-dim": "#1C110C",
    "secondary-fixed-dim": "#FBBC00",
    "on-tertiary-fixed": "#001B3E",
    "on-secondary-container": "#6D5000",
    "background-matte": "#1A1100",
    "on-error": "#690005",
    "error-container": "#93000A",
    "primary-fixed": "#FFDBCC",
    "surface-container-low": "#251913",
    "primary": "#FFB000",
    "border-graphite": "#332200",
    "outline-variant": "#584238",
    "terminal-dim": "#662B00",
    "on-tertiary-container": "#002958",
    "surface-container-high": "#342721",
    "tertiary-fixed-dim": "#AAC7FF",
    "background": "#1A1100",
    "on-primary-container": "#4B1B00",
    "on-primary-fixed": "#351000",
    "on-error-container": "#FFDAD6",
    "secondary": "#FFD000",
    "surface-container-highest": "#40322B",
    "on-tertiary": "#002F64",
    "tertiary-container": "#3E90FF",
    "inverse-surface": "#F5DED4",
    "inverse-on-surface": "#3B2D27",
    "on-surface": "#FFE066",
    "surface-container-lowest": "#160C07",
    "tertiary-fixed": "#D6E3FF",
    "surface-bright": "#443630",
    "surface": "#1A1100",
    "primary-fixed-dim": "#FFB693",
    "on-surface-variant": "#E0C0B2",
    "primary-container": "#EA6B1E",
    "error": "#FFB4AB",
    "led-red": "#EF4444",
    "on-secondary-fixed": "#261A00",
    "surface-steel": "#261A00"
}

def update_colors(html_content):
    # Find the colors object inside tailwind.config
    colors_pattern = re.compile(r'(colors:\s*\{)(.*?)(\},)', re.DOTALL)
    
    # Format the new colors dict
    new_colors_str = "\n".join([f'                        "{k}": "{v}",' for k, v in amber_palette.items()])
    new_colors_str = new_colors_str.rstrip(',') + "\n                    "
    
    def replacer(match):
        return f"{match.group(1)}\n{new_colors_str}{match.group(3)}"
        
    return colors_pattern.sub(replacer, html_content)

if __name__ == "__main__":
    dir_path = "stitch_screens"
    for filename in os.listdir(dir_path):
        if filename.endswith(".html"):
            filepath = os.path.join(dir_path, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = update_colors(content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
    print("Done applying Amber Monochrome palette.")
