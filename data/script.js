const $ = (id) => document.getElementById(id);
const count = $("count");
const time = $("time");
const strip = $("strip");
const frames = $("frames");
const wheel = $("wheel");
const wheelMarker = $("wheelMarker");
const enabled = $("enabled");
const dot = $("dot");
const frameNumber = $("number");
const frameTotal = $("total");
const ledNumber = $("lednum");
const colors = ["#ff6b4a", "#ffb45d", "#f6e58d", "#8de3de", "#7599ff", "#bb83ff"];

const state = {
  ledCount: 30,
  frameTime: 500,
  frame: 0,
  led: 0,
  frames: []
};

function hexToRgb(hex) {
  const value = hex.slice(1);
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
}

function rgbToHex(values) {
  return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function hsvToRgb(hue, saturation, value) {
  const chroma = value * saturation;
  const part = hue / 60;
  const second = chroma * (1 - Math.abs((part % 2) - 1));
  const match = value - chroma;
  const channels = part < 1 ? [chroma, second, 0]
    : part < 2 ? [second, chroma, 0]
      : part < 3 ? [0, chroma, second]
        : part < 4 ? [0, second, chroma]
          : part < 5 ? [second, 0, chroma]
            : [chroma, 0, second];
  return channels.map((channel) => Math.round((channel + match) * 255));
}

function createFrame(index) {
  return {
    leds: Array.from({ length: state.ledCount }, (_, led) => ({
      color: colors[(led + index) % colors.length],
      enabled: index !== 2 || led % 3 !== 0
    }))
  };
}

function colorFromHsv(hue, saturation) {
  return hsvToRgb(hue, saturation, 1);
}

function colorToHsv(color) {
  const values = hexToRgb(color).map((channel) => channel / 255);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const difference = max - min;
  let hue = 0;

  if (difference) {
    hue = max === values[0]
      ? 60 * (((values[1] - values[2]) / difference) % 6)
      : max === values[1]
        ? 60 * ((values[2] - values[0]) / difference + 2)
        : 60 * ((values[0] - values[1]) / difference + 4);
  }

  return {
    hue: (hue + 360) % 360,
    saturation: max ? difference / max : 0
  };
}

function drawWheel() {
  const context = wheel.getContext("2d");
  const size = wheel.width;
  const center = size / 2;
  const radius = center - 8;
  const image = context.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.hypot(dx, dy);
      const pixel = (y * size + x) * 4;

      if (distance <= radius) {
        const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const color = colorFromHsv(hue, distance / radius);
        image.data[pixel] = color[0];
        image.data[pixel + 1] = color[1];
        image.data[pixel + 2] = color[2];
        image.data[pixel + 3] = 255;
      }
    }
  }

  context.putImageData(image, 0, 0);
}

function updateWheelMarker(color) {
  const selected = colorToHsv(color);
  const angle = selected.hue * Math.PI / 180;
  const distance = selected.saturation * wheelRadius();
  wheelMarker.style.left = `calc(50% + ${Math.cos(angle) * distance}px)`;
  wheelMarker.style.top = `calc(50% + ${Math.sin(angle) * distance}px)`;
}

function wheelRadius() {
  const size = wheel.getBoundingClientRect().width;
  return size / 2 - (8 * size / wheel.width);
}

function render() {
  const current = state.frames[state.frame];
  frameNumber.textContent = String(state.frame + 1).padStart(2, "0");
  frameTotal.textContent = String(state.frames.length).padStart(2, "0");

  strip.innerHTML = current.leds.map((led, index) => `
    <button class="led ${index === state.led ? "sel" : ""} ${led.enabled ? "" : "off"}"
      data-led="${index}" style="color:${led.color};background:${led.enabled ? led.color : "#aaa"}"
      aria-label="LED ${index + 1}"></button>
  `).join("");

  frames.innerHTML = state.frames.map((frame, index) => `
    <div class="frame ${index === state.frame ? "sel" : ""}" data-frame="${index}">
      <div class="frame-top">
        FRAME ${String(index + 1).padStart(2, "0")}
        ${state.frames.length > 1 ? `<button class="del" data-delete="${index}">×</button>` : ""}
      </div>
      <div class="mini">${frame.leds.slice(0, 12).map((led) =>
    `<i style="background:${led.enabled ? led.color : "#aaa"}"></i>`).join("")}</div>
    </div>
  `).join("");

  const selected = current.leds[state.led];
  ledNumber.textContent = String(state.led + 1).padStart(2, "0");
  dot.style.background = selected.color;
  enabled.checked = selected.enabled;
  updateWheelMarker(selected.color);
}

function chooseColor(event) {
  const bounds = wheel.getBoundingClientRect();
  const x = event.clientX - (bounds.left + bounds.width / 2);
  const y = event.clientY - (bounds.top + bounds.height / 2);
  const distance = Math.min(Math.hypot(x, y), wheelRadius());
  const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  state.frames[state.frame].leds[state.led].color =
    rgbToHex(colorFromHsv(hue, distance / wheelRadius()));
  const selected = state.frames[state.frame].leds[state.led];
  dot.style.background = selected.color;
  updateWheelMarker(selected.color);
}

strip.onclick = (event) => {
  const led = event.target.closest("[data-led]");
  if (led) {
    state.led = Number(led.dataset.led);
    render();
  }
};

frames.onclick = (event) => {
  const frame = event.target.closest("[data-frame]");
  if (!frame) return;
  if (event.target.dataset.delete !== undefined) {
    state.frames.splice(Number(event.target.dataset.delete), 1);
    state.frame = Math.min(state.frame, state.frames.length - 1);
  } else {
    state.frame = Number(frame.dataset.frame);
  }
  render();
};

wheel.onpointerdown = (event) => {
  wheel.setPointerCapture(event.pointerId);
  chooseColor(event);
};

wheel.onpointermove = (event) => {
  if (event.buttons) chooseColor(event);
};

enabled.onchange = (event) => {
  state.frames[state.frame].leds[state.led].enabled = event.target.checked;
  render();
};

$("prev").onclick = () => {
  state.frame = (state.frame + state.frames.length - 1) % state.frames.length;
  render();
};

$("next").onclick = () => {
  state.frame = (state.frame + 1) % state.frames.length;
  render();
};

$("add").onclick = () => {
  state.frame += 1;
  state.frames.splice(state.frame, 0, createFrame(state.frame));
  render();
};

$("all").onclick = () => {
  const selected = state.frames[state.frame].leds[state.led];
  state.frames[state.frame].leds.forEach((led) => {
    led.color = selected.color;
  });
  render();
};


$("upload").onclick = async () => {
  const data = {
    ledCount: state.ledCount,
    frameTime: state.frameTime,
    frames: state.frames.map(frame => ({
      leds: frame.leds.map(led => ({
        color: led.color,
        enabled: led.enabled
      }))
    }))
  };

  const response = await fetch("/api/animation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  console.log("Animation uploaded!");
};


count.onchange = (event) => {
  state.ledCount = Math.max(1, Math.min(64, Number(event.target.value) || 1));
  state.frames.forEach((frame) => {
    frame.leds = frame.leds.slice(0, state.ledCount);
    while (frame.leds.length < state.ledCount) {
      frame.leds.push({ color: "#ff6b4a", enabled: true });
    }
  });
  state.led = Math.min(state.led, state.ledCount - 1);
  render();
};

time.onchange = (event) => {
  state.frameTime = Math.max(20, Number(event.target.value) || 20);
  event.target.value = state.frameTime;
};

drawWheel();
state.frames = [createFrame(0), createFrame(1), createFrame(2)];
render();
