const Questions = {
  totalQuestions: 5,
  questions: [
    {
      question:
      "What is a song you would like to listen to now?",
      choices: [],
      type: 'Written',
      correctAnswer: 'All of the above',
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
      question: "Are you in a quiet or noisy environment?",
      choices: ['Quiet', 'Noisy'],
      type: 'MCQs',
      correctAnswer: 'const',
    },

    
  ],
}

export default Questions