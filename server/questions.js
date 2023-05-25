/**
 * See https://the-trivia-api.com/docs/v2/#tag/Questions/operation/getRandomQuestions for explanation of each param.
 * 
 */
import fetch from "node-fetch";

/**
 * 
 * @param {object} gameOptions 
 * @returns {JSON}
 * 
 * *
 * Fetches questions from external API
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

export { getQuestions};