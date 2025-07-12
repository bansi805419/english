let allQuestions = [];
let questions = [];
let wrongQuestions = [];
let currentIndex = 0;
let score = 0;
let isRetrying = false;

const inputScreen = document.getElementById('inputScreen');
const quizScreen = document.getElementById('quizScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const resultEl = document.getElementById('result');
const nextBtn = document.getElementById('nextBtn');
const totalQuestionsEl = document.getElementById('totalQuestions');
const progressBar = document.getElementById('progressBar');

// Enhanced fetch with loading animation
fetch('questions.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    allQuestions = data;
    totalQuestionsEl.innerHTML = `<span class="animate__animated animate__fadeIn">Total Available Questions: ${allQuestions.length}</span>`;
  })
  .catch(error => {
    inputScreen.innerHTML = '<p class="error-message animate__animated animate__shakeX">Failed to load questions. Please try again later.</p>';
    console.error('Error loading questions:', error);
  });

function startQuiz() {
  const from = parseInt(document.getElementById('fromQuestion').value);
  const to = parseInt(document.getElementById('toQuestion').value);
  const shuffle = document.getElementById('shuffleCheckbox').checked;

  if (isNaN(from) || isNaN(to) || from < 1 || to > allQuestions.length || from > to) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message animate__animated animate__shakeX';
    errorElement.textContent = "Please enter a valid range within the available questions.";
    document.querySelector('.input-field').appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
    return;
  }

  questions = allQuestions.slice(from - 1, to);
  if (shuffle) {
    questions = shuffleArray(questions);
  }

  currentIndex = 0;
  score = 0;
  wrongQuestions = [];
  progressBar.style.width = '0%';

  // Transition animation
  inputScreen.classList.remove('active');
  setTimeout(() => {
    quizScreen.classList.add('active');
    loadQuestion(currentIndex);
  }, 500);
}

function loadQuestion(index) {
  // Update progress bar with animation
  const progress = ((index + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  
  const q = questions[index];
  questionEl.textContent = `Q${index + 1}: ${q.question}`;
  questionEl.className = 'question animate__animated animate__fadeInDown';
  optionsEl.innerHTML = '';
  resultEl.textContent = '';
  nextBtn.style.display = 'none';

  // Create options with staggered animations
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = `animate__animated animate__fadeInUp`;
    btn.style.animationDelay = `${i * 0.1}s`;
    btn.onclick = () => checkAnswer(btn, i);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(selectedBtn, index) {
  const correctIndex = questions[currentIndex].answer.charCodeAt(0) - 65;
  const buttons = optionsEl.querySelectorAll('button');

  // Disable all buttons and show correct/wrong states with animations
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) {
      btn.classList.add('correct', 'animate__animated', 'animate__pulse');
    } else if (btn === selectedBtn) {
      btn.classList.add('wrong', 'animate__animated', 'animate__shakeX');
    }
  });

  if (index === correctIndex) {
    // Correct answer animation
    selectedBtn.classList.add('animate__animated', 'animate__tada');
    score++;
    
    // Delay before next question or summary
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questions.length) {
        loadQuestion(currentIndex);
      } else {
        showSummary();
      }
    }, 1000);
  } else {
    // Wrong answer handling
    resultEl.textContent = `❌ Wrong! Correct answer is: ${questions[currentIndex].options[correctIndex]}`;
    resultEl.className = 'result animate__animated animate__fadeIn';
    wrongQuestions.push(questions[currentIndex]);
    
    // Show next button with animation
    setTimeout(() => {
      nextBtn.style.display = 'block';
      nextBtn.className = 'next-btn animate__animated animate__bounceIn';
    }, 500);
  }
}

nextBtn.onclick = () => {
  nextBtn.classList.remove('animate__bounceIn');
  nextBtn.classList.add('animate__fadeOut');
  
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < questions.length) {
      loadQuestion(currentIndex);
    } else {
      showSummary();
    }
  }, 300);
};

function showSummary() {
  // Create confetti effect
  createConfetti();
  
  questionEl.textContent = 'Quiz Completed!';
  questionEl.className = 'question animate__animated animate__rubberBand';
  optionsEl.innerHTML = '';
  resultEl.innerHTML = `<span class="animate__animated animate__flipInX">Your Score: ${score} / ${questions.length}</span>`;

  if (wrongQuestions.length === 0) {
    const done = document.createElement('div');
    done.className = 'animate__animated animate__fadeIn';
    done.innerHTML = `<p>🎉 Perfect Score! You're a Quiz Master!</p>`;
    optionsEl.appendChild(done);

    const homeBtn = document.createElement('button');
    homeBtn.className = 'animate__animated animate__bounceIn';
    homeBtn.textContent = '🏠 Back to Home';
    homeBtn.onclick = goToHome;
    optionsEl.appendChild(homeBtn);
    return;
  }

  const review = document.createElement('div');
  review.className = 'animate__animated animate__fadeIn';
  review.innerHTML = `<h3>📝 Questions to Review:</h3>`;
  wrongQuestions.forEach((q, idx) => {
    const correctIndex = q.answer.charCodeAt(0) - 65;
    review.innerHTML += `
      <div class="review-item animate__animated animate__fadeIn" style="animation-delay: ${idx * 0.1}s">
        <p><strong>Q:</strong> ${q.question}</p>
        <p><strong>✅ Correct:</strong> ${q.options[correctIndex]}</p>
      </div>`;
  });
  optionsEl.appendChild(review);

  const optionContainer = document.createElement('div');
  optionContainer.className = 'animate__animated animate__fadeIn';
  optionContainer.style.marginTop = '20px';

  const retryBtn = document.createElement('button');
  retryBtn.className = 'action-btn animate__animated animate__bounceIn';
  retryBtn.innerHTML = '🔁 Retry Wrong Questions';
  retryBtn.onclick = () => {
    questions = shuffleArray(wrongQuestions);
    wrongQuestions = [];
    currentIndex = 0;
    score = 0;
    isRetrying = true;
    progressBar.style.width = '0%';
    loadQuestion(currentIndex);
  };

  const homeBtn = document.createElement('button');
  homeBtn.className = 'action-btn animate__animated animate__bounceIn';
  homeBtn.style.animationDelay = '0.2s';
  homeBtn.innerHTML = '🚪 Exit to Start';
  homeBtn.onclick = goToHome;

  optionContainer.appendChild(retryBtn);
  optionContainer.appendChild(homeBtn);
  optionsEl.appendChild(optionContainer);
}

function goToHome() {
  quizScreen.classList.remove('active');
  setTimeout(() => {
    inputScreen.classList.add('active');
    document.getElementById('fromQuestion').value = '';
    document.getElementById('toQuestion').value = '';
    document.getElementById('shuffleCheckbox').checked = false;
  }, 500);
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Confetti effect function
function createConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.backgroundColor = getRandomColor();
    confettiContainer.appendChild(confetti);
  }
  
  document.body.appendChild(confettiContainer);
  setTimeout(() => confettiContainer.remove(), 5000);
}

function getRandomColor() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9ff3', '#48dbfb'];
  return colors[Math.floor(Math.random() * colors.length)];
}





// let allQuestions = [];
// let questions = [];
// let wrongQuestions = [];
// let currentIndex = 0;
// let score = 0;
// let isRetrying = false;

// const inputScreen = document.getElementById('inputScreen');
// const quizScreen = document.getElementById('quizScreen');
// const questionEl = document.getElementById('question');
// const optionsEl = document.getElementById('options');
// const resultEl = document.getElementById('result');
// const nextBtn = document.getElementById('nextBtn');
// const totalQuestionsEl = document.getElementById('totalQuestions');

// fetch('questions.json')
//   .then(response => response.json())
//   .then(data => {
//     allQuestions = data;
//     totalQuestionsEl.textContent = `Total Available Questions: ${allQuestions.length}`;
//   })
//   .catch(error => {
//     inputScreen.innerHTML = '<p>Failed to load questions.</p>';
//     console.error('Error loading questions:', error);
//   });

// function startQuiz() {
//   const from = parseInt(document.getElementById('fromQuestion').value);
//   const to = parseInt(document.getElementById('toQuestion').value);
//   const shuffle = document.getElementById('shuffleCheckbox').checked;

//   if (isNaN(from) || isNaN(to) || from < 1 || to > allQuestions.length || from > to) {
//     alert("Please enter a valid range within the available questions.");
//     return;
//   }

//   questions = allQuestions.slice(from - 1, to);
//   if (shuffle) {
//     questions = shuffleArray(questions);
//   }

//   currentIndex = 0;
//   score = 0;
//   wrongQuestions = [];

//   inputScreen.classList.remove('active');
//   quizScreen.classList.add('active');

//   loadQuestion(currentIndex);
// }

// function loadQuestion(index) {
//   const q = questions[index];
//   questionEl.textContent = `Q${index + 1}: ${q.question}`;
//   optionsEl.innerHTML = '';
//   resultEl.textContent = '';
//   nextBtn.style.display = 'none';

//   q.options.forEach((option, i) => {
//     const btn = document.createElement('button');
//     btn.textContent = option;
//     btn.onclick = () => checkAnswer(btn, i);
//     optionsEl.appendChild(btn);
//   });
// }

// function checkAnswer(selectedBtn, index) {
//   const correctIndex = questions[currentIndex].answer.charCodeAt(0) - 65;
//   const buttons = optionsEl.querySelectorAll('button');

//   buttons.forEach((btn, i) => {
//     btn.disabled = true;
//     if (i === correctIndex) btn.classList.add('correct');
//     else if (btn === selectedBtn) btn.classList.add('wrong');
//   });

//   if (index === correctIndex) {
//     score++;
//     currentIndex++;
//     if (currentIndex < questions.length) {
//       loadQuestion(currentIndex);
//     } else {
//       showSummary();
//     }
//   } else {
//     resultEl.textContent = `Wrong! Correct answer is: ${questions[currentIndex].options[correctIndex]}`;
//     wrongQuestions.push(questions[currentIndex]);
//     nextBtn.style.display = 'block';
//   }
// }



// nextBtn.onclick = () => {
//   currentIndex++;
//   if (currentIndex < questions.length) {
//     loadQuestion(currentIndex);
//   } else {
//     showSummary();
//   }
// };

// function showSummary() {
//   questionEl.textContent = 'Quiz Completed!';
//   optionsEl.innerHTML = '';
//   resultEl.innerHTML = `Your Score: ${score} / ${questions.length}`;

//   if (wrongQuestions.length === 0) {
//     const done = document.createElement('div');
//     done.innerHTML = `<p>🎉 All answers correct! Quiz Finished.</p>`;
//     optionsEl.appendChild(done);

//     const homeBtn = document.createElement('button');
//     homeBtn.textContent = 'Back to Home';
//     homeBtn.onclick = goToHome;
//     optionsEl.appendChild(homeBtn);
//     return;
//   }

//   const review = document.createElement('div');
//   review.innerHTML = `<h3>Incorrect Questions:</h3>`;
//   wrongQuestions.forEach((q) => {
//     const correctIndex = q.answer.charCodeAt(0) - 65;
//     review.innerHTML += `<p><strong>Q:</strong> ${q.question}<br><strong>Correct:</strong> ${q.options[correctIndex]}</p>`;
//   });
//   optionsEl.appendChild(review);

//   const optionContainer = document.createElement('div');
//   optionContainer.style.marginTop = '20px';

//   const retry = document.createElement('input');
//   retry.type = 'radio';
//   retry.name = 'summaryOption';
//   retry.id = 'retryNow';

//   const retryLabel = document.createElement('label');
//   retryLabel.htmlFor = 'retryNow';
//   retryLabel.textContent = '🔁 Reattempt Wrong Questions';

//   const exit = document.createElement('input');
//   exit.type = 'radio';
//   exit.name = 'summaryOption';
//   exit.id = 'exitNow';

//   const exitLabel = document.createElement('label');
//   exitLabel.htmlFor = 'exitNow';
//   exitLabel.textContent = '🚪 Exit to Start';

//   optionContainer.appendChild(retry);
//   optionContainer.appendChild(retryLabel);
//   optionContainer.appendChild(document.createElement('br'));
//   optionContainer.appendChild(exit);
//   optionContainer.appendChild(exitLabel);

//   optionsEl.appendChild(optionContainer);

//   retry.onclick = () => {
//     questions = shuffleArray(wrongQuestions);
//     wrongQuestions = [];
//     currentIndex = 0;
//     score = 0;
//     isRetrying = true;
//     loadQuestion(currentIndex);
//   };

//   exit.onclick = () => {
//     goToHome();
//   };
// }


// function handleRetryChoice() {
//   const retry = document.getElementById('retryOption').checked;
//   const exit = document.getElementById('exitOption').checked;

//   if (!retry && !exit) {
//     alert("Please select an option.");
//     return;
//   }

//   if (retry) {
//     questions = shuffleArray(wrongQuestions);
//     wrongQuestions = [];
//     currentIndex = 0;
//     score = 0;
//     isRetrying = true;
//     loadQuestion(currentIndex);
//   } else {
//     goToHome();
//   }
// }

// function goToHome() {
//   inputScreen.classList.add('active');
//   quizScreen.classList.remove('active');
//   document.getElementById('fromQuestion').value = '';
//   document.getElementById('toQuestion').value = '';
//   document.getElementById('shuffleCheckbox').checked = false;
// }

// function shuffleArray(arr) {
//   return [...arr].sort(() => Math.random() - 0.5);
// }
