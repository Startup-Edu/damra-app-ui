export const SAMPLE_IMPORT_TEMPLATE = [
  {
    question_type: "MCQ",
    difficulty_level: "EASY",
    question_text_en: "What is the capital of France?",
    question_text_kh: "តើរដ្ឋធានីបារាំងគឺជាអ្វី?",
    explanation_en: "Paris is the capital of France.",
    explanation_kh: "ប៉ារីសគឺជារដ្ឋធានីបារាំង។",
    xp_value: 10,
    time_limit_seconds: 30,
    content: {
      options: [
        { id: "opt-1", text_en: "Paris", text_kh: "ប៉ារីស" },
        { id: "opt-2", text_en: "London", text_kh: "ឡុងដ៍" },
        { id: "opt-3", text_en: "Berlin", text_kh: "ប៊ែរឡាំង" },
        { id: "opt-4", text_en: "Madrid", text_kh: "ម៉ាឌ្រីដ" }
      ]
    },
    validation: {
      correct_option_id: "opt-1"
    }
  },
  {
    question_type: "MULTI_SELECT",
    difficulty_level: "MEDIUM",
    question_text_en: "Which of the following are prime numbers?",
    question_text_kh: "តើចំនួនខាងក្រោមណាខ្លះជាចំនួនបឋម?",
    explanation_en: "2 and 3 are prime numbers; 4 and 6 are composite numbers.",
    explanation_kh: "២ និង ៣ គឺជាចំនួនបឋម ហើយ ៤ និង ៦ ជាចំនួនផ្សំ។",
    xp_value: 15,
    time_limit_seconds: 45,
    content: {
      options: [
        { id: "opt-1", text_en: "2", text_kh: "២" },
        { id: "opt-2", text_en: "3", text_kh: "៣" },
        { id: "opt-3", text_en: "4", text_kh: "៤" },
        { id: "opt-4", text_en: "6", text_kh: "៦" }
      ]
    },
    validation: {
      correct_option_ids: ["opt-1", "opt-2"]
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
    time_limit_seconds: 20,
    content: {},
    validation: {
      correct_answer: true
    }
  },
  {
    question_type: "FILL_BLANK",
    difficulty_level: "MEDIUM",
    question_text_en: "Water consists of hydrogen and [blank-1].",
    question_text_kh: "ទឹកផ្សំឡើងពីអ៊ីដ្រូសែន និង [blank-1]។",
    explanation_en: "Water chemical formula is H2O.",
    explanation_kh: "រូបមន្តគីមីនៃទឹកគឺ H2O។",
    xp_value: 15,
    time_limit_seconds: 30,
    content: {
      blanks_count: 1
    },
    validation: {
      correct_blanks: [
        {
          id: "blank-1",
          is_case_sensitive: false,
          accepted_answers: ["oxygen", "Oxygen", "អុកស៊ីសែន"]
        }
      ]
    }
  },
  {
    question_type: "MATCHING",
    difficulty_level: "MEDIUM",
    question_text_en: "Match each country with its capital city.",
    question_text_kh: "ផ្គូផ្គងប្រទេសនីមួយៗជាមួយរាជធានីរបស់វា។",
    explanation_en: "Matching countries to capitals.",
    explanation_kh: "ផ្គូផ្គងប្រទេសជាមួយរាជធានី។",
    xp_value: 20,
    time_limit_seconds: 60,
    content: {
      left_side: [
        { id: "left-1", text_en: "Cambodia", text_kh: "កម្ពុជា" },
        { id: "left-2", text_en: "France", text_kh: "បារាំង" }
      ],
      right_side: [
        { id: "right-1", text_en: "Phnom Penh", text_kh: "ភ្នំពេញ" },
        { id: "right-2", text_en: "Paris", text_kh: "ប៉ារីស" }
      ]
    },
    validation: {
      correct_pairs: [
        { left_id: "left-1", right_id: "right-1" },
        { left_id: "left-2", right_id: "right-2" }
      ]
    }
  },
  {
    question_type: "ORDER",
    difficulty_level: "MEDIUM",
    question_text_en: "Arrange the lifecycle stages of a butterfly in correct sequence.",
    question_text_kh: "រៀបចំដំណាក់កាលវដ្តជីវិតរបស់មេអំបៅតាមលំដាប់លំដោយត្រឹមត្រូវ។",
    explanation_en: "Egg -> Caterpillar -> Chrysalis -> Butterfly.",
    explanation_kh: "ពង -> ដង្កូវ -> ដឹកឌឿ -> មេអំបៅ។",
    xp_value: 20,
    time_limit_seconds: 60,
    content: {
      items: [
        { id: "item-1", text_en: "Egg", text_kh: "ពង" },
        { id: "item-2", text_en: "Caterpillar", text_kh: "ដង្កូវ" },
        { id: "item-3", text_en: "Chrysalis", text_kh: "ដឹកឌឿ" },
        { id: "item-4", text_en: "Butterfly", text_kh: "មេអំបៅ" }
      ]
    },
    validation: {
      correct_order: ["item-1", "item-2", "item-3", "item-4"]
    }
  }
]
