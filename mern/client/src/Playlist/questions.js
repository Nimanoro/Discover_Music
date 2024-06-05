const Questions = {
  totalQuestions: 5,
  questions: [
    {
      question: "Do you want the premium experience?",
      choices: ['Yes', 'No'],
      type: 'MCQs',
      correctAnswer: 'stringify()',
    },
    {
      question: "How are you feeling today?",
      choices: ['Happy', 'Calm', 'Energetic', 'Sad', 'Stressed'],
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
      choices: ['Quiet', 'Noisy'],
      type: 'MCQs',
      correctAnswer: 'const',
    },
  ],
}

export default Questions