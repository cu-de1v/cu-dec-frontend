// ===============================
// SIDEBAR TOGGLE (UNCHANGED)
// ===============================
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const sidebarLinks = document.querySelectorAll(".sidebar-link");
const urlInput = document.getElementById("urlInput");

const overlay = document.createElement("div");
overlay.classList.add("sidebar-overlay");
document.body.appendChild(overlay);

function toggleSidebar() {
  hamburger.classList.toggle("active");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
}

function closeSidebar() {
  hamburger.classList.remove("active");
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
}

hamburger.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", closeSidebar);

sidebarLinks.forEach(link => {
  link.addEventListener("click", closeSidebar);
});

document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeSidebar();
  }
});

// ===============================
// INPUT BUTTONS (PASTE / CLEAR)
// ===============================
const clearBtn = document.getElementById("clearBtn");
const pasteBtn = document.getElementById("pasteBtn");

function offerInputButtons() {
  if (urlInput.value.trim() === "") {
    clearBtn.style.display = "none";
    pasteBtn.style.display = "flex";
  } else {
    clearBtn.style.display = "flex";
    pasteBtn.style.display = "none";
  }
}

offerInputButtons();
urlInput.addEventListener("input", offerInputButtons);

clearBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  urlInput.value = "";
  offerInputButtons();
  urlInput.focus();
});

pasteBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    urlInput.value = text;
    offerInputButtons();
    urlInput.focus();
  } catch {
    alert("Clipboard permission denied");
  }
});

// ===============================
// 🔥 REAL TIKTOK DOWNLOAD LOGIC
// ===============================
const downloadBtn = document.querySelector(".download-btn");

downloadBtn.addEventListener("click", async () => {
  const tiktokUrl = urlInput.value.trim();

  if (!tiktokUrl.includes("tiktok.com")) {
    alert("Please paste a valid TikTok URL");
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Processing...";

  try {
    // 1️⃣ Fetch TikTok page (browser allowed)
    const html = await fetch(tiktokUrl).then(res => res.text());

    // 2️⃣ Extract TikTok JSON data
    const match = html.match(
      /__UNIVERSAL_DATA_FOR_REHYDRATION__=(.*?);<\/script>/
    );

    if (!match) throw new Error("Failed to parse TikTok page");

    const data = JSON.parse(match[1]);

    // 3️⃣ Get mp4 video URL
    const videoUrl =
      data.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct
        ?.video?.playAddr;

    if (!videoUrl) throw new Error("Video URL not found");

    // 4️⃣ Encode & redirect to backend stream
    const encoded = encodeURIComponent(videoUrl);
    window.location.href = `http://localhost:3000/stream?video=${encoded}`;

  } catch (err) {
    console.error(err);
    alert("Failed to download TikTok video");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download Video";
  }
});
