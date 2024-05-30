const Questions = {
  topic: 'Javascript',
  level: 'Beginner',
  totalQuestions: 4,
  perQuestionScore: 5,
  questions: [
    {
      question: "How are you feeling today?",
      choices: ['Happy', 'Calm', 'Energetic', 'Sad', 'stressed'],
      type: 'MCQs',
      correctAnswer: 'stringify()',
    },
    {
      question: "What are you doing right now?",
      choices: ['Working', 'Exercising', 'Relaxing', 'Commuting'],
      type: 'MCQs',
      correctAnswer: 'var and let',
    },
    {
      question:
      "What's a song you're currently listening to a lot?",
      choices: [],
      type: 'Written',
      correctAnswer: 'All of the above',
    },
    {
      question: "Are you in a quiet or noisy environment?",
      choices: ['quiet', 'noisy'],
      type: 'MCQs',
      correctAnswer: 'const',
    },
  ],
}

export default Questions