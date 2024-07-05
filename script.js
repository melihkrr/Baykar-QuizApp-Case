const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 30;
const LOCK_TIME = 10;

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let usedQuestionIndexes = [];
let timer, unlockTimer, nextTimer;

document.addEventListener('DOMContentLoaded', () => {
  fetchQuestions();
});

async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    while (questions.length < TOTAL_QUESTIONS) {
      const randomIndex = Math.floor(Math.random() * data.length);
      if (!usedQuestionIndexes.includes(randomIndex)) {
        usedQuestionIndexes.push(randomIndex);
        const item = data[randomIndex];
        questions.push({
          id: questions.length + 1,
          text: item.title,
          choices: splitBodyIntoChoices(item.body)
        });
      }
    }
    showQuestion();
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

function splitBodyIntoChoices(body) {
  const lines = body.split('\n');
  return {
    A: lines[0] || 'A',
    B: lines[1] || 'B',
    C: lines[2] || 'C',
    D: lines[3] || 'D'
  };
}

function showQuestion() {
  if (currentQuestionIndex >= TOTAL_QUESTIONS) {
    return showResults();
  }

  const question = questions[currentQuestionIndex];
  document.getElementById('question').innerText = `${question.id}. ${question.text}`;
  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';

  Object.keys(question.choices).forEach(choiceKey => {
    const choiceButton = document.createElement('button');
    choiceButton.classList.add('choice');
    choiceButton.dataset.choice = choiceKey;
    choiceButton.innerText = `${choiceKey}: ${question.choices[choiceKey]}`;
    choiceButton.disabled = true;
    choiceButton.addEventListener('click', handleChoice);
    choicesContainer.appendChild(choiceButton);
  });

  unlockCountdown(LOCK_TIME);
  nextCountdown(TIME_LIMIT);

  timer = setTimeout(nextQuestion, TIME_LIMIT * 1000);
}

function unlockCountdown(seconds) {
  const timerUnlock = document.getElementById('timer-unlock');
  timerUnlock.innerText = `${seconds} saniye sonra soru işaretlemesi yapabilirsiniz.`;
  timerUnlock.style.color = ' #dc3545';
  unlockTimer = setInterval(() => {
    seconds--;
    timerUnlock.innerText = `${seconds} saniye sonra soru işaretlemesi yapabilirsiniz.`;
    if (seconds <= 0) {
      clearInterval(unlockTimer);
      document.querySelectorAll('.choice').forEach(button => button.disabled = false);
      timerUnlock.innerText = 'Soruyu işaretleyebilirsiniz.';
      timerUnlock.style.color = '#28a745';
    }
  }, 1000);
}

function nextCountdown(seconds) {
  const timerNext = document.getElementById('timer-next');
  timerNext.innerText = `${seconds} saniye sonra diğer soruya geçilecektir.`;
  nextTimer = setInterval(() => {
    seconds--;
    timerNext.innerText = `${seconds} saniye sonra diğer soruya geçilecektir.`;
    if (seconds <= 0) {
      clearInterval(nextTimer);
    }
  }, 1000);
}

function handleChoice(event) {
  clearTimeout(timer);
  clearInterval(unlockTimer);
  clearInterval(nextTimer);

  const userChoice = event.target.dataset.choice;
  userAnswers.push({
    question: questions[currentQuestionIndex].text,
    answer: userChoice
  });
  nextQuestion();
}

function nextQuestion() {
  if (!userAnswers[currentQuestionIndex]) {
    userAnswers.push({
      question: questions[currentQuestionIndex].text,
      answer: 'Boş'
    });
  }
  currentQuestionIndex++;
  showQuestion();
}

function showResults() {
  document.getElementById('question-container').classList.add('hidden');
  document.getElementById('result-container').classList.remove('hidden');

  const resultTableBody = document.querySelector('#result-table tbody');
  resultTableBody.innerHTML = '';
  userAnswers.forEach((answer, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}. ${answer.question}</td><td>${answer.answer}</td>`;
    resultTableBody.appendChild(row);
  });
}
