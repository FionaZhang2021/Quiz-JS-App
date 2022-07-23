const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const progressBarFull = document.getElementById("progressBarFull")
const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {}; 
let acceptingAnswers = false; //　ここでは　let acceptingAnswers; に書き換えてもいい？
let score = 0;
let questionCounter = 0;
let availableQuestions = []; 

let questions = [];

fetch("https://opentdb.com/api.php?amount=20&category=9&difficulty=easy&type=multiple")
  .then(res => {
    return res.json();
  })
  .then(loadedQuestions => {
    questions = loadedQuestions.results.map( loadedQuestion =>{
      const formattedQuestion = {
        question: loadedQuestion.question, 
        answer: Math.floor(Math.random() * 3) + 1,
      };
      
      const answerChoices = [...loadedQuestion.incorrect_answers];
      answerChoices.splice(formattedQuestion.answer-1, 0, 
        loadedQuestion.correct_answer);

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice
        choice.replace(/&.*;/, "'");
      });   
      return formattedQuestion;
    });
    startGame();
  })
  .catch( err => {
    console.error(err);
  });
 
//Constants
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

startGame = () => {
  questionCounter = 0;
  score = 0;   //Line 6,7 すでに定義したので、なぜ Line43, 44 で同じvalueを入れる必要がある？Can we delete line 43,44?
  availableQuestions = [...questions]
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden")
}

//After fetched data will repeat below function

getNewQuestion = () => {
  if (availableQuestions.length ===0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem('mostRecentScore', score);
    //GO TO THEEND PAGE
    return window.location.assign("/end.html");
  }

  questionCounter++; 
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  //Update Progress Bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  //question.innerText = currentQuestion.question;
  question.innerText = currentQuestion.question
  .replace(/&.*9;/, "'")
  .replace(/&.*t;/ || /&.*o;/,`"`);

  choices.forEach( choice => {
    const number = choice.dataset['number'];
    choice.innerText = currentQuestion['choice' + number];
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true; //
};

choices.forEach(choice => {

  choice.addEventListener("click", e => {
    if(acceptingAnswers == false) return;

    acceptingAnswers = false; //なぜsetting false?? 
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if(classToApply=== "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    },1500);
  });
});

incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};






