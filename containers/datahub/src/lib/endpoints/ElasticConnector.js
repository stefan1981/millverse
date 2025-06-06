import { Client } from '@elastic/elasticsearch';

export class ElasticConnector {
    client = undefined
    constructor() {
        this.connectToElastic()
    }

    connectToElastic() {
        const url = `${process.env.ELASTIC_URL}`

        //console.log(process.env)

        this.client = new Client({
            node: url,
            auth: {
                username: process.env.ELASTIC_USER,
                password: process.env.ELASTIC_PASSWORD
            }
        })        
    }

    getClient() {
        return this.client
    }
}
