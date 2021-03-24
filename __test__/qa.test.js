const request = require('supertest')
require('dotenv').config();


const api_url = process.env.URL;
const api_key = process.env.KEY

// Grabbing products to be used in tests

async function getCurIds() {
    const reqq = request(api_url)
    const getProds = await reqq.get(`/products`).set('Authorization',api_key)
    const prodId = getProds.body[0].id
    return prodId
}

async function getQuestions(number) {
    const reqq = request(api_url)
    const getQuest = await reqq.get(`/qa/questions?product_id=${number}&count=10000`).set('Authorization',api_key)
    return getQuest.body.results[0].question_id
}

/**
 * Testing post qa, add question endpoint
 */

describe('Testing post qa add a question endpoint', () => {
    const req = request(api_url)

    test('Should post a question and respond with a 201 created', async (done) => {
        const products_id = await getCurIds()
        let data = {
            "body": "Do the shoes fit true to size?",
            "name": "Paul Peterson",
            "email": "ppeterson923@gmail.com",
            "product_id": products_id
        }
        const response = await req.post('/qa/questions').send(data).set('Authorization', api_key);
        expect(response.status).toBe(201)

        //confirm the question has been posted
        const newReviews = await request(api_url)
            .get('/qa/questions')
            .query(`product_id=${products_id}&count=10000`)
            .set('Authorization', api_key)
        const { results } = newReviews.body
        for (var i = 0; i < results.length; i++) {
            if (results[i].asker_name === data.name) {
                lastReview = results[i]
            }
        }
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
    let data = {
        "body": "Yes it does fit true to size, I love it!",
        "name": "jenn Martinez",
        "email": "jmartinez@gmail.com",
        "photos": []
    }
    
    test('Should post an answer and respond with a 201 created', async (done) => {
        //post new answer to question id
        const prodId = await getCurIds()
        const tester = await getQuestions(prodId)
        const question_id = tester
        const response = await req.post(`/qa/questions/${question_id}/answers`).send(data).set('Authorization', api_key);
        expect(response.status).toBe(201)

        // confirm that the answer has been posted
        const answers = await request(api_url).get(`/qa/questions/${question_id}/answers`).set('Authorization', api_key)
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
    let responses;
    beforeAll(async () => {
    //before test make a get request to get all the questions for product 111
        const theId = await getCurIds()
        const product_ids = [theId]
        const req = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/qa/questions').query(`product_id=${id}&count=10000`).set('Authorization', api_key)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should mark the question helpful and confirm that it has been updated', async (done) => {
        const questions_obj = JSON.parse(responses[0].text)
        const firstQuestion = questions_obj.results[0]

        //Mark the first question helpful in the list of questions for product 111
        const response = await req.put(`/qa/questions/${firstQuestion.question_id}/helpful`).set('Authorization', api_key);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the question has been marked helpful, and the helpfullness has increased.
        const newQuestions = await request(api_url).get('/qa/questions').query(`product_id=${product_ids[0]}&count=10000`).set('Authorization', api_key)
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
    let responses;
    beforeAll(async () => {
     //before test make a get request to get all the questions for product 221
        const theId = await getCurIds()
        const product_ids = [theId]
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/qa/questions').query(`product_id=${id}&count=10000`).set('Authorization', api_key)
            )
        })
      
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should report question and confirm that it has been reported', async (done) => {
        const questions_obj = JSON.parse(responses[0].text)
        const firstQuestion = questions_obj.results[0]

        //report the first question in the list of questions for product 121
        const response = await req.put(`/qa/questions/${firstQuestion.question_id}/report`).set('Authorization', api_key);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the question has been reported and is no longer in questions list.
        const newQuestions = await request(api_url).get('/qa/questions').query(`product_id=${product_ids[0]}&count=10000`).set('Authorization', api_key)
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
    let responses;
    //before test make a get request to get all the answers for question 448
    beforeAll(async () => {
        const prodId = await getCurIds()
        const tester = await getQuestions(prodId)
        const question_ids = [tester]
        const req = request(api_url);
        const requests = question_ids.map((id) => {
            return Promise.resolve(
                req.get(`/qa/questions/${id}/answers`).set('Authorization', api_key)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });


    test('Should mark the answer helpful and confirm that it has been updated', async (done) => {
        let data = {
            "body": "Yes it does fit true to size, I love it!",
            "name": "jenn Martinez",
            "email": "jmartinez@gmail.com",
            "photos": []
        }
        const prodId = await getCurIds()
        const tester = await getQuestions(prodId)
        const postAnswer = await req.post(`/qa/questions/${tester}/answers`).send(data).set('Authorization', api_key)
        const answers_obj = JSON.parse(responses[0].text)
        const firstAnswer = answers_obj.results[0]

        //Mark the first answer helpful in the list of answers for question 448
        const response = await req.put(`/qa/answers/${firstAnswer.answer_id}/helpful`).set('Authorization', api_key);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the answer has been marked helpful, and the helpfullness has increased.
        const updatedAnswers = await request(api_url).get(`/qa/questions${question_ids}/answers`).set('Authorization', api_key)
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
    let responses;
    beforeAll(async () => {
    //before test make a get request to get all the answers for question 448
        const req = request(api_url);
        const prodId = await getCurIds()
        const tester = await getQuestions(prodId)
        const question_ids = [tester]
        const requests = question_ids.map((id) => {
            return Promise.resolve(
                req.get(`/qa/questions/${id}/answers`).set('Authorization', api_key)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });

    test('Should mark the answer helpful and confirm that it has been updated', async (done) => {
        const answers_obj = JSON.parse(responses[0].text)
        const firstAnswer = answers_obj.results[0]

        //report the first answer in the list of answers for question 448
        const response = await req.put(`/qa/answers/${firstAnswer.answer_id}/report`).set('Authorization', api_key);
        expect(response.status).toBe(204)
        done()

        //make another get request to confirm that the answer has been reported and is no longer in answers list.
        const updatedAnswers = await request(api_url).get(`/qa/questions${question_ids}/answers`).set('Authorization', api_key)
        const { results } = updatedAnswers.body

        expect(results.length).toEqual(answers_obj.results.length - 1)
        done()
        
    })
    
})