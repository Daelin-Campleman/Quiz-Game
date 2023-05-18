import axios from "axios";

/**
 * See https://the-trivia-api.com/docs/v2/#tag/Questions/operation/getRandomQuestions for explanation of each param.
 * 
 */
async function getQuestions(gameOptions) {
    const URL = "https://the-trivia-api.com/v2/questions"
    const defaultOptions = {
        questionsPerRound: 5,
        numberOfRounds: 1,
        categories: "science,film_and_tv,music,history,geography,art_and_literature,sport_and_leisure,general_knowledge,science,food_and_drink",
        difficulties: "easy,medium,hard"
    }
    let finalGameOptions = {...defaultOptions, ...gameOptions};
    let res = await fetch(URL + `?limit=${finalGameOptions.questionsPerRound * finalGameOptions.numberOfRounds}&categories=${finalGameOptions.categories}&difficulties=${finalGameOptions.difficulties}`);
    let data = await res.json()
    return data;
}

 async function getAPIQuestions() {
   var questions = await fetch("https://the-trivia-api.com/v2/questions");
   return await questions.json();
 }

export { getQuestions, getAPIQuestions};


/**
 * return [
         {
             "category": "science",
             "id": "622a1c377cc59eab6f950487",
             "correctAnswer": "the study or exploration of caves",
             "incorrectAnswers": [
                 "how to encrypt and decrypt secret messages",
                 "methods",
                 "methods"
             ],
             "question": {
                 "text": "What is Speleology the study of?"
             },
             "tags": [
                 "science"
             ],
             "type": "text_choice",
             "difficulty": "medium",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "geography",
             "id": "623740c2cb85f7ce9e949d1f",
             "correctAnswer": "Indonesia",
             "incorrectAnswers": [
                 "Cote d'Ivoire",
                 "Cameroon",
                 "Bosnia and Herzegovina"
             ],
             "question": {
                 "text": "Jakarta is the capital city of which country?"
             },
             "tags": [
                 "geography"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "geography",
             "id": "622a1c3a7cc59eab6f950fe1",
             "correctAnswer": "Colorado",
             "incorrectAnswers": [
                 "Mississippi",
                 "Hudson",
                 "Rio Grande"
             ],
             "question": {
                 "text": "Which river made The Grand Canyon?"
             },
             "tags": [
                 "geography"
             ],
             "type": "text_choice",
             "difficulty": "medium",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "general_knowledge",
             "id": "622a1c377cc59eab6f95043d",
             "correctAnswer": "New Years Eve",
             "incorrectAnswers": [
                 "Boxing Day",
                 "Easter Monday",
                 "Shrove Tuesday"
             ],
             "question": {
                 "text": "How Is St Sylvester's Day Otherwise Known?"
             },
             "tags": [
                 "general_knowledge"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "history",
             "id": "639ae36d929b90846f2fc8d0",
             "correctAnswer": "Maize",
             "incorrectAnswers": [
                 "Rice",
                 "Wheat",
                 "Barley"
             ],
             "question": {
                 "text": "What type of food was the most important staple of the Aztec diet?"
             },
             "tags": [
                 "history",
                 "aztecs",
                 "food"
             ],
             "type": "text_choice",
             "difficulty": "medium",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "film_and_tv",
             "id": "622a1c347cc59eab6f94fb45",
             "correctAnswer": "Out of Africa",
             "incorrectAnswers": [
                 "The Color Purple",
                 "Kiss of the Spider Woman",
                 "Prizzi's Honor"
             ],
             "question": {
                 "text": "Which film won the Academy Award for Best Picture in 1985?"
             },
             "tags": [
                 "academy_awards",
                 "film",
                 "film_and_tv"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "geography",
             "id": "625e9ed4796f721e95543f6f",
             "correctAnswer": "Hungary",
             "incorrectAnswers": [
                 "Iceland",
                 "Indonesia",
                 "South Africa"
             ],
             "question": {
                 "text": "Which country's flag fits the description of 'Three equal horizontal bands of red white and green.'?"
             },
             "tags": [
                 "flags",
                 "geography"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "geography",
             "id": "623741b4cb85f7ce9e949d81",
             "correctAnswer": "Nigeria",
             "incorrectAnswers": [
                 "Oman",
                 "Uruguay",
                 "Lesotho"
             ],
             "question": {
                 "text": "Abuja is the capital city of which country?"
             },
             "tags": [
                 "geography"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "arts_and_literature",
             "id": "622a1c347cc59eab6f94fa4f",
             "correctAnswer": "Baroque",
             "incorrectAnswers": [
                 "Suprematism",
                 "Abstract expressionism",
                 "Dutch Golden Age"
             ],
             "question": {
                 "text": "The painting \"Las Meninas\" by Diego Velázquez is a part of which art movement?"
             },
             "tags": [
                 "painting",
                 "art",
                 "arts_and_literature"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         },
         {
             "category": "music",
             "id": "622a1c397cc59eab6f950d93",
             "correctAnswer": "The Who",
             "incorrectAnswers": [
                 "Deep Purple",
                 "Travis",
                 "Spandau Ballet"
             ],
             "question": {
                 "text": "Which band includes 'Pete Townshend'?"
             },
             "tags": [
                 "music"
             ],
             "type": "text_choice",
             "difficulty": "hard",
             "regions": [],
             "isNiche": false
         }
     ]
 */