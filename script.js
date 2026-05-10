const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //fetches canvas API and lets us draw on canvas,canvas is the HTML <canvas> element (your drawing surface)

// Set canvas size to match window dimensions
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  setBackground(); // Redraw background after resize
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const sprayCan = document.getElementById("sprayCan");

// Add spray sound
const spraySound = new Audio("media/main-spray.mp3"); // Change filename if needed
spraySound.preload = "auto";
spraySound.volume = 0.6; // Adjust volume (0.0 to 1.0)
spraySound.loop = true;

let isDrawing = false;
let currentColor = "#FF0000";

// Simple color palette
const colors = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#f9f2f2",
  "#070707",
];
const palette = document.querySelector(".color-palette");

colors.forEach((color) => {
  // Loops through each color in the colors array: ["#FF0000", "#00FF00", etc.]
  const swatch = document.createElement("div");
  // Creates a new <div> element for each color
  swatch.className = "color-swatch";
  // Gives the div the CSS class "color-swatch" (for styling)
  swatch.style.backgroundColor = color;
  // Sets the background color of the div to the current color value
  // This makes each swatch visually show its color

  swatch.addEventListener("click", () => {
    currentColor = color;
    colorPicker.value = color;
  });
  // When clicked, this swatch:
  // 1. Updates the global currentColor variable (used for painting)
  // 2. Updates the color picker input field to match
  palette.appendChild(swatch);
  // Adds the newly created colored div to the palette container
  // This makes it appear on the webpage
});

colorPicker.addEventListener("input", (e) => (currentColor = e.target.value));
//(e) => (currentColor = e.target.value) - This is an arrow function that runs when the event fires:

//e is the event object
//e.target refers to the colorPicker element that triggered the event
//e.target.value gets the selected color as a hex value (like "#FF5733")
//currentColor = e.target.value updates your global currentColor variable

// Background (white or decorative)
function setBackground() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Optional: Add light texture or grid
}
setBackground();

// Spray function
function spray(x, y, color, size) {
  const density = 200; // Particles per spray
  ctx.fillStyle = color;

  for (let i = 0; i < density; i++) {
    const radius = Math.random() * size * 1.5; //distance from center
    const angle = Math.random() * Math.PI * 2; //direction from center

    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    //These convert the random direction + distance into actual horizontal and vertical offsets.

    // Random opacity for realistic spray
    ctx.globalAlpha = Math.random() * 0.7 + 0.3;

    const dotSize = Math.random() * 3 + 1;
    ctx.fillRect(x + offsetX, y + offsetY, dotSize, dotSize);
  }
  ctx.globalAlpha = 1.0;
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  // Gets the canvas's position and size on the webpage
  // Returns: {left, top, right, bottom, width, height, x, y}
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;

  spray(
    lastX,
    lastY,
    //e.clientX and e.clientY give the mouse position relative to the browser window
    // But the canvas might not start at position (0,0) on the page
    // So you need to subtract the canvas's left and top offsets to get the position relative to the canvas
    currentColor,
    parseInt(brushSize.value),
  );
  // Start playing spray sound
  spraySound.currentTime = 0; // Reset to beginning
  spraySound.play().catch((e) => console.log("Audio play failed:", e));
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  // Calculates the mouse position relative to the canvas
  // (same as mousedown - needed because canvas might not be at top-left)

  // Move spray can emoji
  sprayCan.style.left = `${e.clientX - 10}px`;
  sprayCan.style.top = `${e.clientY - 3}px`;
  sprayCan.style.transform = "rotate(-10deg)"; // Tilt effect
  // Positions a spray can emoji (🎨) to follow the mouse cursor
  // e.clientX + 20 = offset 20px to the right of cursor
  // e.clientY - 30 = offset 30px above the cursor
  // rotate(-30deg) = tilts the emoji for a realistic spray can angle

  if (isDrawing) {
    // === INTERPOLATION: Draw between last and current position ===
    const distance = Math.hypot(currentX - lastX, currentY - lastY);
    const steps = Math.max(Math.floor(distance / 2), 1); // Adjust distance/(denom) denom for smoothness

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      //       t = i / steps
      // t is a fraction from 0 to 1
      // it represents how far along the line between the old position and the new position you are
      const x = lastX + (currentX - lastX) * t;
      const y = lastY + (currentY - lastY) * t;
      //       x = lastX + (currentX - lastX) * t
      // y = lastY + (currentY - lastY) * t
      // These calculate a point between lastX,lastY and currentX,currentY
      // When t = 0, the point is exactly at lastX,lastY
      // When t = 1, the point is exactly at currentX,currentY
      // Values in between give evenly spaced intermediate points
      // spray(x, y, currentColor, parseInt(brushSize.value))
      // Draws spray at each interpolated point
      // This fills the gap between mouse moves so the spray looks continuous

      spray(x, y, currentColor, parseInt(brushSize.value));
    }

    lastX = currentX;
    lastY = currentY;
  }

  // if (isDrawing) {
  //   spray(x, y, currentColor, parseInt(brushSize.value));
  //   // Keep sound playing while drawing
  //   if (spraySound.paused) {
  //     spraySound.play().catch((e) => console.log("Audio play failed:", e));
  //   }
  // }
});

// New function to stop sound
function stopDrawingAndSound() {
  if (isDrawing) {
    isDrawing = false;

    // Optional: small fade out for more natural feel
    if (spraySound.volume > 0.1) {
      const originalVolume = spraySound.volume;
      spraySound.volume = 0.15;

      setTimeout(() => {
        spraySound.pause();
        spraySound.currentTime = 0;
        spraySound.volume = originalVolume; // reset volume
      }, 80);
    } else {
      spraySound.pause();
      spraySound.currentTime = 0;
    }
  }
}

canvas.addEventListener("mouseup", stopDrawingAndSound);
canvas.addEventListener("mouseleave", stopDrawingAndSound);

// Buttons
clearBtn.addEventListener("click", () => {
  if (confirm("Clear the wall?")) setBackground();
});

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  // Creates a temporary <a> (anchor/link) element in memory
  link.download = "my-graffiti.png";
  // Sets the filename that will be used when downloading
  //this is the reason:setting the download attribute in anchor tag makes it downloadeable when clicked after dataurl created in href

  link.href = canvas.toDataURL("image/png");
  // Converts the canvas content to a PNG image data URL
  // canvas.toDataURL("image/png") creates a base64-encoded PNG image

  link.click();
  //makes browser click the anchor tag element
  // Programmatically "clicks" the link, triggering the browser's download

  //canvas.toDataURL("image/png") - This is the key method:

  // Captures everything drawn on your canvas (all the spray paint)
  // Converts it to a PNG image format
  // Returns a data URL like: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  //Think of a data URL like a self-contained file:

  // Normal URL: https://example.com/image.png (points to a file on a server)
  // Data URL: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... (contains the actual file data)

  // The temporary link trick - Since you can't directly download canvas content, the code:

  // Creates an invisible <a> element
  // Sets its href to the image data
  // Sets download attribute to specify filename
  // Clicks it programmatically to trigger download

  //   What Actually Happens:
  // User clicks "Save"
  // Browser creates the data URL (encodes canvas as PNG)
  // Browser creates a temporary download link pointing to that data
  // Browser "clicks" the link, which triggers the download dialog
  // User saves my-graffiti.png to their computer
});

//Touch Support (Mobile)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.touches[0].clientX - rect.left;
  lastY = e.touches[0].clientY - rect.top;

  sprayCan.style.left = `${e.touches[0].clientX}px`;
  sprayCan.style.top = `${e.touches[0].clientY}px`;
  sprayCan.style.transform = "rotate(-10deg)";

  spray(lastX, lastY, currentColor, parseInt(brushSize.value));
  spraySound.currentTime = 0;
  spraySound.play().catch(() => {});
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const currentX = e.touches[0].clientX - rect.left;
  const currentY = e.touches[0].clientY - rect.top;

  sprayCan.style.left = `${e.touches[0].clientX}px`;
  sprayCan.style.top = `${e.touches[0].clientY}px`;
  sprayCan.style.transform = "rotate(-10deg)";
  // Positions a spray can emoji (🎨) to follow the mouse cursor
  // e.clientX + 20 = offset 20px to the right of cursor
  // e.clientY - 30 = offset 30px above the cursor
  // rotate(-30deg) = tilts the emoji for a realistic spray can angle

  if (isDrawing) {
    // === INTERPOLATION: Draw between last and current position ===
    const distance = Math.hypot(currentX - lastX, currentY - lastY);
    const steps = Math.max(Math.floor(distance / 2), 1); // Adjust distance/(denom) denom for smoothness

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      //       t = i / steps
      // t is a fraction from 0 to 1
      // it represents how far along the line between the old position and the new position you are
      const x = lastX + (currentX - lastX) * t;
      const y = lastY + (currentY - lastY) * t;
      //       x = lastX + (currentX - lastX) * t
      // y = lastY + (currentY - lastY) * t
      // These calculate a point between lastX,lastY and currentX,currentY
      // When t = 0, the point is exactly at lastX,lastY
      // When t = 1, the point is exactly at currentX,currentY
      // Values in between give evenly spaced intermediate points
      // spray(x, y, currentColor, parseInt(brushSize.value))
      // Draws spray at each interpolated point
      // This fills the gap between mouse moves so the spray looks continuous

      spray(x, y, currentColor, parseInt(brushSize.value));
    }

    lastX = currentX;
    lastY = currentY;
  }

  // if (isDrawing) {
  //   spray(x, y, currentColor, parseInt(brushSize.value));
  //   if (spraySound.paused) spraySound.play().catch(() => {});
  // }
});

canvas.addEventListener("touchend", stopDrawingAndSound);
