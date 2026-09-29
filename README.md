# Workout TV

A static workout library. The `.txt` files are the content; `script.js` builds the site from them.

## File structure
- `index.html`, `style.css`, `script.js` - the site (no need to edit for content)
- `categories.txt` - the list of categories
- `arms.txt`, `chest.txt`, ... - one file of exercises per category

## Test locally
Browsers block file loading from `file://`. Run `python -m http.server` in this folder and open http://localhost:8000, or deploy to GitHub Pages.

## Categories
`categories.txt` has one block per category, separated by `---`:

    id: arms
    name: Arms
    file: arms.txt
    description: Arm exercises.

## Edit a category
Open its `.txt` file (for example `arms.txt`), change the text, save. The site shows the update on reload.

## Add an exercise
Add a new block at the end of the file. Put `---` on its own line between exercises:

    ---
    name: Hammer Curl
    type: Strength
    difficulty: Beginner
    target: Biceps
    equipment: Dumbbells
    description: A biceps and forearm exercise.
    instructions: Curl the dumbbells with palms facing each other.

Only `name` is required. Any field you leave out is not shown.
Optional fields: `sets`, `reps`, `rest`, `duration`, `tips`, `mistakes`, `benefits`, `source`.

## Add text
Use `description:`, `instructions:`, `tips:`, `mistakes:` or `benefits:`. Keep each on one line.

## Add an image
    image: https://example.com/photo.jpg
(or a file in the same folder: `image: photo.jpg`)

## Add multiple images
Repeat the line:

    image: photo1.jpg
    image: photo2.jpg

## Add a video
    video: https://example.com/clip.mp4

## Add multiple videos
Repeat the line:

    video: clip1.mp4
    video: clip2.mp4

## Add a new category
1. Create `shoulders2.txt` (any name) with your exercises.
2. Add a block to `categories.txt` that points to it with `file: shoulders2.txt`.

## Deploy to GitHub Pages
1. Create a GitHub repository and upload all files to the root.
2. Go to Settings > Pages.
3. Under Source, choose the `main` branch and `/ (root)`, then save.
4. Open the URL GitHub shows after a minute or two.
