# Workout TV

Content lives in `.txt` files. Edit a `.txt` file and reload the site. No need to touch `index.html`, `style.css` or `script.js`.

## How a post works
A line with only dashes (`-`) starts and ends a post. Everything between two dash lines is one post.

    -
    Dumbbell Curl
    Biceps. 3 sets of 10-12 reps.
    Hold the dumbbells at your sides and curl them up.
    https://example.com/photo.jpg
    https://example.com/clip.mp4
    -
    Next post
    -

- The first line is the post title (bold).
- Other text lines are normal text. Links in text become clickable.
- A line that is only a photo link (`.jpg .jpeg .png .gif .webp .avif .svg .bmp`) shows a photo. Click it to open it in a pop-up.
- A line that is only a video link (`.mp4 .webm .ogg .mov .m4v`) shows a Play video button. Click it to play in a pop-up.
- A line that is only a YouTube link (youtube.com or youtu.be) also shows a Play video button.
- Several photo or video lines in a row are shown side by side.
- Files in the same folder work too: `photo.jpg`.
- A photo or video link must end with the file type (like `.jpg` or `.mp4`) to show as a pop-up. Other links are just clickable links.

## Files
- `categories.txt` - list of topics (Arms, Chest, ... Diet)
- `arms.txt`, `chest.txt`, ..., `diet.txt` - the posts of each topic

## Add a new topic
1. Create a file such as `yoga.txt` with posts.
2. Add this to the end of `categories.txt`:

        ---
        id: yoga
        name: Yoga
        file: yoga.txt
        description: Yoga posts.

## Test locally
Browsers block loading `.txt` files from `file://`. Run `python -m http.server` in this folder and open http://localhost:8000, or use GitHub Pages.

## Deploy to GitHub Pages
1. Create a GitHub repository and upload all files to the root.
2. Settings > Pages.
3. Source: `main` branch, `/ (root)`, then save.
4. Open the URL GitHub shows after a minute or two.
