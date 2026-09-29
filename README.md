# Workout TV

Workout TV is a lightweight static workout site. **Content is controlled by the `.txt` files**, so you normally only edit text files when adding or changing exercises.

## Media system

Media no longer appears as a **Play video** button.

- Direct image links are shown directly inside the post.
- Direct video links (`.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`) are shown as a real paused video surface.
- Videos **never autoplay in the post**. Clicking/tapping the video opens the full viewer and starts playback.
- YouTube links automatically become a thumbnail preview. Clicking/tapping opens the YouTube player.
- YouTube `watch`, `youtu.be`, `shorts`, and `embed` links are supported.
- Public Facebook video/reel/watch links are detected and opened through Facebook's video embed player when clicked.
- GitHub `.../blob/...` media links are automatically converted to `raw.githubusercontent.com` so direct images/videos can render.
- Query strings after media URLs are supported, for example `video.mp4?x=123` and `photo.jpg?size=large`.
- Media loads only when it is actually displayed/opened, keeping the page lightweight.

### Important limitation

A normal Facebook/YouTube page URL is **not itself a direct MP4 file**. The browser cannot turn an arbitrary social-media page into a native `<video>` element. Workout TV therefore uses the official embedded player for those links. If a Facebook video is private, region-restricted, login-required, or has embedding disabled, Facebook may refuse to display it.

## Post format

A line containing only dashes separates posts.

```text
-
Dumbbell Curl
Biceps. 3 sets of 10-12 reps.
Keep your elbows close to your body.
https://example.com/photo.jpg
https://example.com/clip.mp4
https://www.youtube.com/watch?v=XXXXXXXXXXX
https://www.facebook.com/...
-
Next exercise
-
```

The first normal text line becomes the exercise title. Other normal text lines become descriptions.

You can put several media links in one post. Images and videos are displayed together automatically.

## Files

- `categories.txt` — topics/categories
- `arms.txt`, `chest.txt`, `back.txt`, `legs.txt`, `abs.txt`, etc. — workout posts
- `index.html` — page shell
- `style.css` — lightweight styling
- `script.js` — media detection, routing and viewer

## Add a category

Create a new file such as `yoga.txt`, then add:

```text
---
id: yoga
name: Yoga
file: yoga.txt
description: Yoga exercises.
```

to `categories.txt`.

## Run locally

Browsers normally block `fetch()` for `.txt` files from `file://`. Use a small local server:

```bash
python -m http.server
```

Then open `http://localhost:8000`.

GitHub Pages works without changes.
