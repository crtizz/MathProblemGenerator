let correctAnswer = 0;
let streak = 0;
let username = localStorage.getItem("username") || "";

async function promptUsername() {
  while (!username) {
    username = prompt("Enter your username:");
    if (username) {
      username = username.trim();
      if (username.length === 0) username = "";
    }
  }
  localStorage.setItem("username", username);
}

function generateEasyProblem() {
  let num1 = Math.floor(Math.random() * 20) + 1;
  let num2 = Math.floor(Math.random() * 20) + 1;
  let isAdd = Math.random() > 0.5;
  let problemText = "";
  if (isAdd) {
    problemText = num1 + " + " + num2;
    correctAnswer = num1 + num2;
  } else {
    problemText = Math.max(num1, num2) + " - " + Math.min(num1, num2);
    correctAnswer = Math.abs(num1 - num2);
  }
  document.getElementById("problem").textContent = problemText;
}

function generateNormalProblem() {
  let num1 = Math.floor(Math.random() * 50) + 1;
  let num2 = Math.floor(Math.random() * 50) + 1;
  let isAdd = Math.random() > 0.5;
  let problemText = "";
  if (isAdd) {
    problemText = num1 + " + " + num2;
    correctAnswer = num1 + num2;
  } else {
    problemText = Math.max(num1, num2) + " - " + Math.min(num1, num2);
    correctAnswer = Math.abs(num1 - num2);
  }
  document.getElementById("problem").textContent = problemText;
}

function generateHardProblem() {
  let num1 = Math.floor(Math.random() * 500) + 100;
  let num2 = Math.floor(Math.random() * 300) + 50; 
  let rand = Math.random();
  let problemText = "";

  if (rand < 0.4) {
    problemText = num1 + " + " + num2;
    correctAnswer = num1 + num2;
  } else if (rand < 0.8) {
    let mul = Math.floor(Math.random() * 20) + 5;
    problemText = mul + " * " + mul;
    correctAnswer = mul * mul;
  } else {
    let max = Math.max(num1, num2);
    let min = Math.min(num1, num2);
    problemText = max + " - " + min;
    correctAnswer = max - min;
  }

  document.getElementById("problem").textContent = problemText;
}

function generateExtremeProblem() {
  let op = Math.floor(Math.random() * 4);
  let problemText = "";

  if (op === 0) {
    let num1 = Math.floor(Math.random() * 1000) + 500;
    let num2 = Math.floor(Math.random() * 500) + 250;
    problemText = num1 + " + " + num2;
    correctAnswer = num1 + num2;
  } else if (op === 1) {
    let num1 = Math.floor(Math.random() * 1000) + 500;
    let num2 = Math.floor(Math.random() * 500) + 250;
    let max = Math.max(num1, num2);
    let min = Math.min(num1, num2);
    problemText = max + " - " + min;
    correctAnswer = max - min;
  } else if (op === 2) {
    let num1 = Math.floor(Math.random() * 20) + 10;
    let num2 = Math.floor(Math.random() * 20) + 10;
    problemText = num1 + " * " + num2;
    correctAnswer = num1 * num2;
  } else {
    let divisor = Math.floor(Math.random() * 20) + 2;
    let quotient = Math.floor(Math.random() * 20) + 2;
    let dividend = divisor * quotient;
    problemText = dividend + " / " + divisor;
    correctAnswer = quotient;
  }

  document.getElementById("problem").textContent = problemText;
}


async function sendScore() {
  try {
    let res = await fetch("https://kool.krister.ee/chat/MathProblemGenerator");
    let data = await res.json();

    let existingEntry = data.find(entry => entry.username === username);

    if (!existingEntry || streak > existingEntry.streak) {
      await fetch("https://kool.krister.ee/chat/MathProblemGenerator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, streak: streak }),
      });
    }
  } catch (e) {
    console.log("Failed to send score", e);
  }
}

async function getLeaderboard() {
  try {
    let res = await fetch("https://kool.krister.ee/chat/MathProblemGenerator");
    let data = await res.json();

    data.sort((a, b) => b.streak - a.streak);
    data = data.slice(0, 10);

    let board = document.getElementById("leaderboard");
    board.innerHTML = "<h3>Leaderboard</h3>";

    data.forEach((entry, i) => {
      let el = document.createElement("p");
      el.textContent = `${i + 1}. ${entry.username}: ${entry.streak}`;
      board.appendChild(el);
    });
  } catch (e) {
    console.log("Failed to fetch leaderboard", e);
  }
}

async function submitAnswer() {
  let userAnswer = parseInt(document.getElementById("answer").value);
  let feedback = document.getElementById("feedback");
  let streakEl = document.getElementById("streak");

  if (isNaN(userAnswer)) {
    feedback.textContent = "Please enter a number.";
    feedback.style.color = "orange";
    return;
  }

  if (userAnswer === correctAnswer) {
    streak++;
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "Incorrect. Try again!";
    feedback.style.color = "red";

    await sendScore();
    streak = 0;
  }

  streakEl.textContent = "Current streak: " + streak + "🔥";

  setTimeout(() => {
    document.getElementById("answer").value = "";
    feedback.textContent = "";
    startProblem();
    getLeaderboard();
  }, 1500);
}

function startProblem() {
  let path = window.location.pathname.toLowerCase();
  if (path.includes("easy")) {
    generateEasyProblem();
  } else if (path.includes("normal")) {
    generateNormalProblem();
  } else if (path.includes("hard")) {
    generateHardProblem();
  } else if (path.includes("extreme")) {
    generateExtremeProblem();
  } else {
    generateEasyProblem();
  }
}

window.onload = async () => {
  await promptUsername();
  startProblem();
  getLeaderboard();
};