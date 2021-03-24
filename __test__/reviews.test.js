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

/**
 * Testing put review, mark review helpful endpoint
 */


describe('Testing put review, add mark a review helpful endpoint', () => {
    // const idToRun = await getStuff()
    // console.log('PRODUCT ID AGAIN', idToRun)
    const req = request(api_url)
    // const product_ids = [11013]
    let responses;
    beforeAll(async () => {
        const idToRun = await getCurIds()
        const product_ids = [idToRun]
        // const req = request(api_url)
        // let responses;
        // const req = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req.get('/reviews').query(`product_id=${id}`).set('Authorization', api_key)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });
    
    
    test('Should update a reviews helpfullness to show it was helpful, and respond with a 204 no content',  async (done) => {
        const reviews_obj = JSON.parse(responses[0].text)
        const firstReview = reviews_obj.results[0]
        const put = await req.put(`/reviews/${firstReview.review_id}/helpful`).set('Authorization',api_key)
        expect(put.status).toBe(204)
        

        // confirm helpfullness is updated
        const idToRun = await getCurIds()
        const product_ids = [idToRun]

        const newReviews = await request(api_url)
            .get('/reviews')
            .query(`product_id=${product_ids[0]}`)
            .set('Authorization', api_key)
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
    const req1 = request(api_url)
    // const product_ids = [11013]
    let responses;
    beforeAll( async() => {
        const idToRun = await getCurIds()
        const product_ids = [idToRun]
        // const req1 = request(api_url);
        const requests = product_ids.map((id) => {
            return Promise.resolve(
                req1.get('/reviews').query(`product_id=${id}`).set('Authorization',api_key)
            )
        })
        return Promise.all(requests).then((res) => (responses = res))
    });
    
    
    test('Should report a review and confirm that it has been reported',  async (done) => {
        const req = request(api_url)
        const reviews_obj = JSON.parse(responses[0].text)
        const firstReview = reviews_obj.results[0]
        const put = await req.put(`/reviews/${firstReview.review_id}/report`).set('Authorization', api_key)
        expect(put.status).toBe(204)
        done()

        //confirm the request has been reported and no longer exists
        const newReviews = await request(api_url)
            .get('/reviews')
            .query(`product_id=${product_ids[0]}`)
            .set('Authorization', api_key)
        const { results } = newReviews.body
        expect(results.length).toEqual(reviews_obj.results.length - 1)
        done()
   })
       
});