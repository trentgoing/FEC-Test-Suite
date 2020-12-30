const request = require('supertest')
require('dotenv').config();


const api_url = process.env.URL;

/**
 * Testing put review, mark review helpful endpoint
 */

describe('Testing put review, add mark a review helpful endpoint', () => {
    const req = request(api_url)
    const product_ids = [13]
    let responses;
    beforeAll(() => {
        const req = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/reviews').query(`product_id=${id}`)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });
    
    
    test('Should update a reviews helpfullness to show it was helpful, and respond with a 204 no content',  async (done) => {
        const reviews_obj = JSON.parse(responses[0].text)
        const firstReview = reviews_obj.results[0]
        const put = await req.put(`/reviews/${firstReview.review_id}/helpful`) 
        expect(put.status).toBe(204)
        

        // confirm helpfullness is updated
        const newReviews = await request(api_url)
            .get('/reviews')
            .query(`product_id=${product_ids[0]}`)
        const { results } = newReviews.body
        const newReview = results[0]
        expect(firstReview.review_id).toEqual(newReview.review_id)
        expect(newReview.helpfulness).toEqual(firstReview.helpfulness + 1)
        done()
   })
        
});

/**
 * Testing put review, report a review endpoint
 */

describe('Testing put review, report a review endpoint', () => {
    const req = request(api_url)
    const product_ids = [13]
    let responses;
    beforeAll(() => {
        const req = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/reviews').query(`product_id=${id}`)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });
    
    
    test('Should report a review and confirm that it has been reported',  async (done) => {
        const reviews_obj = JSON.parse(responses[0].text)
        const firstReview = reviews_obj.results[0]
        const put = await req.put(`/reviews/${firstReview.review_id}/report`) 
        expect(put.status).toBe(204)
        done()

        //confirm the request has been reported and no longer exists
        const newReviews = await request(api_url)
            .get('/reviews')
            .query(`product_id=${product_ids[0]}`)
        const { results } = newReviews.body
        expect(results.length).toEqual(reviews_obj.results.length - 1)
        done()
   })
       
});