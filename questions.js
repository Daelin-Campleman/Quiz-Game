/**
 * See https://the-trivia-api.com/docs/v2/#tag/Questions/operation/getRandomQuestions for explanation of each param.
 * 
 */

function getQuestions(
        amount=50,
        categories="science,film_and_tv,music,history,geography,art_and_literature,sport_and_leisure,general_knowledge,science,food_and_drink",
        difficulties="easy,medium,hard",
    ) {
        // Default return for now, same form as API response though
        return [
            {
               "category":"food_and_drink",
               "id":"622a1c367cc59eab6f950248",
               "correctAnswer":"Apple ",
               "incorrectAnswers":[
                  "Blackberry",
                  "Strawberry",
                  "Banana"
               ],
               "question":{
                  "text":"Which fruit is traditionally covered with toffee at a fairground?"
               },
               "tags":[
                  "food"
               ],
               "type":"text_choice",
               "difficulty":"easy",
               "regions":[
                  
               ],
               "isNiche":false
            }
         ]
    }

export { getQuestions };