export const SAMPLE_IMPORT_TEMPLATE = [
  {
    grade_id: "01KW48J8Z5VYAV485G6YFBST0G",
    category_id: "01KW48J8Z5VYAV485G6YFBST1W",
    question_type: "MCQ",
    difficulty_level: "EASY",
    question_text_en: "What is the capital of France?",
    question_text_kh: "តើរដ្ឋធានីបារាំងគឺជាអ្វី?",
    explanation_en: "Paris is the capital of France.",
    explanation_kh: "ប៉ារីសគឺជារដ្ឋធានីបារាំង។",
    xp_value: 10,
    content: {
      options: [
        { id: "opt-1", text_en: "Paris", text_kh: "ប៉ារីស" },
        { id: "opt-2", text_en: "London", text_kh: "ឡុងដ៍" }
      ]
    },
    validation: {
      correct_option_id: "opt-1"
    }
  },
  {
    question_type: "TRUE_FALSE",
    difficulty_level: "EASY",
    question_text_en: "The sun rises in the east.",
    question_text_kh: "ព្រះអាទិត្យរះនៅទិសខាងកើត។",
    explanation_en: "This is a basic astronomical fact.",
    explanation_kh: "នេះជាការកត់សម្គាល់ខាងតារាសាស្ត្រ។",
    xp_value: 10,
    content: {},
    validation: {
      correct_answer: true
    }
  }
]
