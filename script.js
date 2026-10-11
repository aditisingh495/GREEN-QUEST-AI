
const $ = (id) => document.getElementById(id);

let points = Number(localStorage.getItem("gq-points") || 0);
let savedQuests = JSON.parse(localStorage.getItem("gq-saved") || "[]");
let journal = JSON.parse(localStorage.getItem("gq-journal") || "[]");
let currentQuest = null;
let toastTimer;

$("points").textContent = points;

const quests = {
  Nature: {
    title: "Find Five Different Leaves",
    icon: "🌳",
    description: "Explore a green space and notice five different leaf shapes, colors, and textures. Take photos instead of picking leaves.",
    tips: [
      "Look for different leaf shapes.",
      "Notice colors and patterns.",
      "Leave plants where they grow."
    ]
  },
  Photography: {
    title: "Capture Nature's Colors",
    icon: "📸",
    description: "Find three beautiful colors outdoors. Photograph interesting patterns, flowers, clouds, or shadows.",
    tips: [
      "Try different camera angles.",
      "Look for patterns and textures.",
      "Respect other people's privacy."
    ]
  },
  Fitness: {
    title: "The Fresh-Air Walk",
    icon: "👟",
    description: "Take a comfortable walk in a familiar outdoor area. Move at your own pace and enjoy the surroundings.",
    tips: [
      "Wear comfortable footwear.",
      "Choose a safe walking route.",
      "Carry water when needed."
    ]
  },
  Learning: {
    title: "Become a Nature Detective",
    icon: "🔎",
    description: "Observe a plant, bird, or insect from a respectful distance. Notice its colors, patterns, and behavior.",
    tips: [
      "Observe without disturbing wildlife.",
      "Notice three interesting details.",
      "Write down one question to explore."
    ]
  }
};

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function saveData() {
  localStorage.setItem("gq-points", String(points));
  localStorage.setItem("gq-saved", JSON.stringify(savedQuests));
  localStorage.setItem("gq-journal", JSON.stringify(journal));
}

function generateQuest(event) {
  event.preventDefault();

  const interest = $("interest").value;
  const time = Number($("time").value);
  const energy = $("energy").value;
  const place = $("place").value;

  currentQuest = {
    ...quests[interest],
    interest,
    time,
    energy,
    place
  };

  if (energy === "low") {
    currentQuest.description +=
      " Keep it gentle and take breaks whenever you want.";
  } else if (energy === "high") {
    currentQuest.description +=
      " If you feel comfortable, explore a little more.";
  }

  $("quest-icon").textContent = currentQuest.icon;
  $("quest-title").textContent = currentQuest.title;
  $("quest-meta").textContent =
    `${time} minutes · ${interest}`;

  $("quest-description").textContent =
    currentQuest.description;

  $("quest-tips").replaceChildren();

  currentQuest.tips.forEach(tip => {
    const li = document.createElement("li");
    li.textContent = tip;
    $("quest-tips").appendChild(li);
  });

  showToast(`Your quest is ready! Explore a safe ${place.toLowerCase()}.`);

  $("quest-result").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

$("quest-form").addEventListener("submit", generateQuest);

$("complete-quest").addEventListener("click", () => {
  if (!currentQuest) {
    showToast("Generate a quest before completing it.");
    return;
  }

  points += 10;
  $("points").textContent = points;
  saveData();

  showToast("🌿 Quest completed! You earned 10 Green Points.");

  $("complete-quest").disabled = true;
  $("complete-quest").textContent = "✓ Quest Completed!";
});

$("save-quest").addEventListener("click", () => {
  if (!currentQuest) {
    showToast("Generate a quest before saving it.");
    return;
  }

  const exists = savedQuests.some(
    quest => quest.title === currentQuest.title
  );

  if (exists) {
    showToast("This quest is already saved.");
    return;
  }

  savedQuests.push(currentQuest);
  saveData();
  showToast("♡ Quest saved on your device!");
});

$("open-map").addEventListener("click", () => {
  const query = encodeURIComponent($("place").value);
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}`,
    "_blank",
    "noopener,noreferrer"
  );
});

// Nature journal

function renderJournal() {
  const list = $("journal-list");
  list.replaceChildren();

  if (journal.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your nature stories will appear here.";
    empty.className = "map-note";
    list.appendChild(empty);
    return;
  }

  [...journal].reverse().forEach((entry) => {
    const article = document.createElement("article");
    article.className = "journal-entry";

    const title = document.createElement("h3");
    title.textContent = "🌿 " + entry.title;

    const date = document.createElement("small");
    date.textContent = entry.date;

    const note = document.createElement("p");
    note.textContent = entry.note;

    const mood = document.createElement("p");
    mood.textContent = "Mood: " + entry.mood;

    const remove = document.createElement("button");
    remove.className = "delete-entry";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + entry.title);

    remove.addEventListener("click", () => {
      journal = journal.filter(item => item.id !== entry.id);
      saveData();
      renderJournal();
      showToast("Journal entry deleted.");
    });

    article.append(title, date, note, mood, remove);
    list.appendChild(article);
  });
}

$("journal-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("entry-title").value.trim();
  const note = $("entry-note").value.trim();

  if (!title || !note) {
    showToast("Please complete both journal fields.");
    return;
  }

  journal.push({
    id: Date.now(),
    title,
    note,
    mood: "Refreshed",
    date: new Date().toLocaleDateString()
  });

  saveData();
  renderJournal();

  $("journal-form").reset();
  showToast("📖 Your outdoor memory has been saved!");
});

renderJournal();

// Start with a quest based on the default selections.

$("quest-form").dispatchEvent(
  new Event("submit", { cancelable: true })
);
$("complete-quest").disabled = false;
$("complete-quest").textContent = "✓ Complete Quest (+10 points)";

// A completed quest cannot be counted twice in the same selection.
// Generate a new quest to enable the completion button again.

$("quest-form").addEventListener("submit", () => {
  $("complete-quest").disabled = false;
  $("complete-quest").textContent = "✓ Complete Quest (+10 points)";
});
