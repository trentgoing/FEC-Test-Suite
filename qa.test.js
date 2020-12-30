const request = require('supertest')
require('dotenv').config();


const api_url = process.env.URL;

/**
 * Testing post qa, add question endpoint
 */

describe('Testing post qa add a question endpoint', () => {
    const req = request(api_url)
    const products_id = 111
    let data = {
        "body": "Do the shoes fit true to size?",
        "name": "Paul Peterson",
        "email": "ppeterson923@gmail.com",
        "product_id": products_id
    }

    test('Should post a question and respond with a 201 created', async (done) => {
        const response = await req.post('/qa/questions').send(data);
        expect(response.status).toBe(201)

        //confirm the question has been posted
        const newReviews = await request(api_url)
            .get('/qa/questions')
            .query(`product_id=${products_id}`)
        const { results } = newReviews.body
        const lastReview = results[results.length - 1]
        expect(data.body).toEqual(lastReview.question_body)
        expect(data.name).toEqual(lastReview.asker_name)
        done()
    }) 
});

/**
 * Testing post qa, add answer endpoint
 */

describe('Testing post qa add a answer endpoint', () => {
    const req = request(api_url)
    let question_id = 35468
    let data = {
        "body": "Yes it does fit true to size, I love it!",
        "name": "jenn Martinez",
        "email": "jmartinez@gmail.com",
        "photos": []
    }
    
    test('Should post an answer and respond with a 201 created', async (done) => {
        //post new answer to question id
        const response = await req.post(`/qa/questions/${question_id}/answers`).send(data);
        expect(response.status).toBe(201)

        // confirm that the answer has been posted
        const answers = await request(api_url).get(`/qa/questions/${question_id}/answers`)
        const { results } = answers.body
        const lastAnswer = results[results.length - 1]
        answerId = lastAnswer.answer_id
        expect(data.body).toEqual(lastAnswer.body)
        expect(data.name).toEqual(lastAnswer.answerer_name)
        expect(Array.isArray(lastAnswer.photos)).toBe(true);
        done()
    })

})

/**
 * Testing put qa, mark question helpful endpoint
 */

describe('Testing put qa mark a question helpful endpoint', () => {
    const req = request(api_url)

    const product_ids = [1139]
    let responses;
    beforeAll(() => {
    //before test make a get request to get all the questions for product 111
        const req = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/qa/questions').query(`product_id=${id}`)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should mark the question helpful and confirm that it has been updated', async (done) => {
        const questions_obj = JSON.parse(responses[0].text)
        const firstQuestion = questions_obj.results[0]

        //Mark the first question helpful in the list of questions for product 111
        const response = await req.put(`/qa/questions/${firstQuestion.question_id}/helpful`);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the question has been marked helpful, and the helpfullness has increased.
        const newQuestions = await request(api_url).get('/qa/questions').query(`product_id=${product_ids[0]}`)
        const { results } = newQuestions.body
        const updatedQuestion = results[0]

    
        expect(firstQuestion.question_id).toEqual(updatedQuestion.question_id)
        expect(updatedQuestion.question_helpfulness).toEqual(firstQuestion.question_helpfulness + 1)
        done()
        
    })
    
})

/**
 * Testing put qa, report question endpoint
 */

describe('Testing put qa report a question endpoint', () => {
    const req = request(api_url)

    const product_ids = [1139]
    let responses;
    beforeAll(() => {
     //before test make a get request to get all the questions for product 221
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/qa/questions').query(`product_id=${id}`)
            )
        })
      
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should report question and confirm that it has been reported', async (done) => {
        const questions_obj = JSON.parse(responses[0].text)
        const firstQuestion = questions_obj.results[0]

        //report the first question in the list of questions for product 121
        const response = await req.put(`/qa/questions/${firstQuestion.question_id}/report`);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the question has been reported and is no longer in questions list.
        const newQuestions = await request(api_url).get('/qa/questions').query(`product_id=${product_ids[0]}`)
        const { results } = newQuestions.body

        expect(results.length).toEqual(questions_obj.results.length - 1)
        done()
        
    })
    
})

/**
 * Testing put qa, mark answer helpful endpoint
 */

describe('Testing put qa mark an answer helpful endpoint', () => {
    const req = request(api_url)
    const question_ids = [3315]
    let responses;
    //before test make a get request to get all the answers for question 448
    beforeAll(() => {
        const req = request(api_url);
        const requests = question_ids.map((id) => {
            return Promise.resolve(
                req.get(`/qa/questions/${id}/answers`)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should mark the answer helpful and confirm that it has been updated', async (done) => {
        const answers_obj = JSON.parse(responses[0].text)
        const firstAnswer = answers_obj.results[0]

        //Mark the first answer helpful in the list of answers for question 448
        const response = await req.put(`/qa/answers/${firstAnswer.answer_id}/helpful`);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the answer has been marked helpful, and the helpfullness has increased.
        const updatedAnswers = await request(api_url).get(`/qa/questions${question_ids}/answers`)
        const { results } = updatedAnswers.body
        const updatedAnswer = results[0]
        expect(firstAnswer.answer_id).toEqual(updatedAnswer.answer_id)
        expect(firstAnswer.helpfulness).toEqual(updatedAnswer.helpfulness + 1)
        done()
        
    })
    
})

/**
 * Testing put qa, report an answer endpoint
 */

describe('Testing put qa report an answer endpoint', () => {
    const req = request(api_url)
    const question_ids = [3315]
    let responses;
    beforeAll(() => {
    //before test make a get request to get all the answers for question 448
        const req = request(api_url);
        const requests = question_ids.map((id) => {
            return Promise.resolve(
                req.get(`/qa/questions/${id}/answers`)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should mark the answer helpful and confirm that it has been updated', async (done) => {
        const answers_obj = JSON.parse(responses[0].text)
        const firstAnswer = answers_obj.results[0]

        //report the first answer in the list of answers for question 448
        const response = await req.put(`/qa/answers/${firstAnswer.answer_id}/report`);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the answer has been reported and is no longer in answers list.
        const updatedAnswers = await request(api_url).get(`/qa/questions${question_ids}/answers`)
        const { results } = updatedAnswers.body

        expect(results.length).toEqual(answers_obj.results.length - 1)
        done()
        
    })
    
})