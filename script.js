const form = document.querySelector("#planner");
const durationInput = document.querySelector("#duration");
const submitButton = document.querySelector("#submit");
const ollamaStatusEl = document.querySelector("#ollama-status");
const demoButton = document.querySelector("#demo-btn");
const trySampleButton = document.querySelector("#try-sample-btn");
const retryButton = document.querySelector("#retry-btn");

// Sample data for quick testing & instant preview
const SAMPLE_INPUTS = {
  name: "Maya",
  interests: "used bookstores, iced matcha, film photography, architecture walks",
  place: "Greenwich Village, NY",
  mood: "low-key & cozy",
  budget: "a little treat",
  duration: "2 hours"
};

const SAMPLE_PLAN = {
  title: "A Gentle Wandering with Maya",
  note: "Tailored for Maya's love of paper, quiet corners, and rich matcha — an afternoon that leaves room to breathe.",
  plan: [
    {
      time: "2:00 PM · 35 min",
      activity: "Browsing dusty poetry stacks at Mercer Street Books",
      details: "Slip between the floor-to-ceiling wooden shelves. Find a book with an inscription inside the cover to read aloud.",
      cost: "Free (or ~$8 for a paperback)"
    },
    {
      time: "2:40 PM · 25 min",
      activity: "Ceremonial matcha stop at Cha An Teahouse",
      details: "Grab iced ceremonial matcha lattes in ceramic cups and sit by the sunlit window nook.",
      cost: "~$6.50 each"
    },
    {
      time: "3:10 PM · 50 min",
      activity: "Washington Mews secret photo walk",
      details: "Stroll down the historic cobblestone mews lined with ivy-covered carriage houses. Snap a couple of candid film portraits.",
      cost: "Free"
    }
  ],
  tiny_extra: "Sneak a secret postcard inside whatever book she picks out when she isn't looking.",
  bring: "A 35mm point-and-shoot camera and a tote bag with extra room"
};

function showView(viewName) {
  ["empty", "loading", "error", "plan"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.hidden = id !== viewName;
    }
  });
}

// Time chip toggle
document.querySelectorAll(".time-chip").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-chip").forEach((chip) => {
      chip.classList.remove("selected");
    });
    button.classList.add("selected");
    durationInput.value = button.dataset.value;
  });
});

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function displayPlan(data) {
  const article = document.querySelector("#plan");
  article.replaceChildren();

  const heading = makeElement("h2", "", data.title || "A little adventure");
  article.append(heading);

  if (data.note) {
    article.append(makeElement("p", "personal-note", data.note));
  }

  const list = makeElement("ol", "timeline");
  (data.plan || []).forEach((item) => {
    const listItem = makeElement("li");
    listItem.append(
      makeElement("time", "", item.time || "Next stop"),
      makeElement("h3", "", item.activity || "A little stop"),
      makeElement("p", "", item.details || "")
    );
    if (item.cost) {
      listItem.append(makeElement("span", "cost", item.cost));
    }
    list.append(listItem);
  });
  article.append(list);

  if (data.tiny_extra) {
    const extra = makeElement("div", "plan-extra");
    extra.append(
      makeElement("strong", "", "THE LITTLE EXTRA"),
      makeElement("p", "", data.tiny_extra)
    );
    article.append(extra);
  }

  if (data.bring) {
    article.append(
      makeElement("p", "plan-bottom", `Bring along: ${data.bring}`)
    );
  }

  // Action buttons
  const actionRow = makeElement("div", "plan-actions");

  const resetButton = makeElement("button", "reset-button", "↺ Make another plan");
  resetButton.type = "button";
  resetButton.addEventListener("click", () => {
    showView("empty");
    window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
  });

  const copyButton = makeElement("button", "copy-button", "📋 Copy itinerary");
  copyButton.type = "button";
  copyButton.addEventListener("click", () => {
    copyPlanToClipboard(data, copyButton);
  });

  actionRow.append(resetButton, copyButton);
  article.append(actionRow);

  showView("plan");
}

function copyPlanToClipboard(data, button) {
  let text = `✨ ${data.title || "Our Sidequest"}\n\n`;
  if (data.note) text += `${data.note}\n\n`;
  text += `THE PLAN:\n`;
  (data.plan || []).forEach((item) => {
    text += `• ${item.time ? `[${item.time}] ` : ""}${item.activity}\n  ${item.details}\n`;
    if (item.cost) text += `  Cost: ${item.cost}\n`;
  });
  if (data.tiny_extra) text += `\nTHE LITTLE EXTRA:\n${data.tiny_extra}\n`;
  if (data.bring) text += `\nBRING ALONG: ${data.bring}\n`;

  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = "✓ Copied to clipboard!";
    button.classList.add("copied");
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 2200);
  }).catch(() => {
    alert("Could not copy automatically. Please select the text on screen.");
  });
}

// Check Ollama status on backend
async function checkOllamaStatus() {
  if (!ollamaStatusEl) return;
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      if (data.ollama_connected) {
        ollamaStatusEl.className = "ollama-status ready";
        ollamaStatusEl.querySelector(".status-text").textContent = `Local AI ready (${data.model || "qwen2.5:3b"})`;
        ollamaStatusEl.title = "Ollama is running smoothly on your computer.";
        return true;
      }
    }
  } catch (e) {
    // server might still be booting
  }
  
  ollamaStatusEl.className = "ollama-status offline";
  ollamaStatusEl.querySelector(".status-text").textContent = "Ollama offline";
  ollamaStatusEl.title = "Ollama service was not detected on localhost:11434. Click setup below for instructions.";
  return false;
}

// Form submit handler
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showView("loading");
  submitButton.disabled = true;

  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    const response = await fetch("/api/sidequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong. Try again.");
    }

    displayPlan(data);
  } catch (error) {
    const errorMsg = document.querySelector("#error-message");
    if (errorMsg) {
      errorMsg.textContent = error.message || "Could not make a plan. Please ensure Ollama is running and try again.";
    }
    showView("error");
  } finally {
    submitButton.disabled = false;
  }
});

// Demo button pre-fill
if (demoButton) {
  demoButton.addEventListener("click", () => {
    document.querySelector("#name").value = SAMPLE_INPUTS.name;
    document.querySelector("#interests").value = SAMPLE_INPUTS.interests;
    document.querySelector("#place").value = SAMPLE_INPUTS.place;
    document.querySelector("#mood").value = SAMPLE_INPUTS.mood;
    document.querySelector("#budget").value = SAMPLE_INPUTS.budget;
    durationInput.value = SAMPLE_INPUTS.duration;
    
    document.querySelectorAll(".time-chip").forEach((chip) => {
      chip.classList.toggle("selected", chip.dataset.value === SAMPLE_INPUTS.duration);
    });
  });
}

// Try sample plan directly
if (trySampleButton) {
  trySampleButton.addEventListener("click", () => {
    displayPlan(SAMPLE_PLAN);
  });
}

// Retry button
if (retryButton) {
  retryButton.addEventListener("click", () => {
    showView("empty");
  });
}

// Init health check
checkOllamaStatus();
